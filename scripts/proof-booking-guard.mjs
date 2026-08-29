// BITE-PROOF for the booking-page guard in sequence.js.
//
// Claim under test: if public/book.html is not in the build, NO touch sends, because every
// touch links /book and a 404 on every button is worse than silence. And the moment the page
// IS in the build, the same lead in the same state starts sending.
//
// Both directions are run against ONE lead in ONE process, with the REAL default code path.
// There is no test seam and no injected directory: the only thing that changes between the
// two phases is whether the file exists, which is exactly the condition being claimed. A
// guard proven through a seam that production does not use is not proven.
//
// It runs in LIVE mode on purpose. A send-guard exercised only in dark mode is verified on
// the wrong side of the flag: dark skips everything anyway, so the guard would "pass" even
// if it did nothing. Sending is walled off twice instead: no RESEND_API_KEY (so email.js
// short-circuits to a dry run before any network), and a capturing fetch stub that is PROVEN
// to be in control before the run starts.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const BOOK = path.join(ROOT, "public", "book.html");
const PARKED = BOOK + ".parked-by-proof";

// ── Wall 1: no API key, so email.js never reaches the network. ──────────────
delete process.env.RESEND_API_KEY;
// ── Wall 2: a fetch stub, proven in control before we trust it. ─────────────
const calls = [];
const SENTINEL = "__proof_stub__";
globalThis.fetch = async (url, opts = {}) => {
  calls.push({ url: String(url), body: opts?.body });
  return { ok: true, status: 200, json: async () => ({ id: SENTINEL }), text: async () => SENTINEL };
};
const probe = await (await fetch("https://api.resend.com/emails", { method: "POST" })).json();
if (probe.id !== SENTINEL || calls.length !== 1) {
  console.error("FATAL: fetch stub is not in control. Refusing to run."); process.exit(1);
}
calls.length = 0;

// Isolate all state: a temp DATA_DIR means real leads and subscribers are never touched.
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "seqproof-"));
process.env.LEAD_SEQUENCE_MODE = "live";      // the mode where sending is possible
process.env.PUBLIC_BASE_URL = "https://jennycallagent.com";
process.env.COMPANY_POSTAL_ADDRESS = "950 Windy Rd. Suite 200, Apex, NC 27502";
delete process.env.CLEARED_TESTIMONIALS_URL;  // t4 stays legitimately blocked

const store = await import(path.join(ROOT, "store.js"));
const seq = await import(path.join(ROOT, "sequence.js"));

const LEAD = "owner@example.com";
// ORDER MATTERS and it is the server's order (server.js registration handler): the lead
// record must exist before origin or consent can be written to it. setContactOrigin and
// grantMarketingConsent both return false rather than throwing when it does not, so getting
// this backwards produces a lead with no consent and a proof that passes vacuously.
store.upsertSubscriber({ email: LEAD, name: "Sample Owner", source: "lp" });
store.upsertLead({ email: LEAD, name: "Sample Owner", source: "lp", stage: "lead" });
if (!store.setContactOrigin(LEAD, "email", "lp-registration")) { console.error("FATAL: setContactOrigin failed"); process.exit(1); }
if (!store.grantMarketingConsent(LEAD, "email", "lp")) { console.error("FATAL: grantMarketingConsent failed"); process.exit(1); }
const consent = store.mayMarketTo(LEAD, "email");
if (!consent.ok) { console.error(`FATAL: fixture lead is not marketable (${consent.why}); the proof would pass vacuously.`); process.exit(1); }
// Enrolled 30 days ago, so every step's offset is already due.
store.enrolInSequence(LEAD, { sequenceId: seq.SEQUENCE_ID, startedAt: new Date(Date.now() - 30 * 864e5).toISOString() });

// The worker sends at most one touch per lead per tick, deliberately, so a backlog cannot
// burst. Four ticks therefore drains everything that is allowed to go.
async function drain() {
  const skipped = [];
  let bookingPagePresent = null;
  for (let i = 0; i < 4; i++) {
    const r = await seq.runSequenceTick();
    bookingPagePresent = r.bookingPagePresent;
    skipped.push(...r.skipped);
  }
  // What actually SENT is read back from the store, not from the tick's own return value.
  // The tick reporting "I sent 3" and the lead's record showing three sent steps are two
  // different claims, and the store is the one that survives a restart.
  return { skipped, bookingPagePresent };
}

const fail = [];
const check = (ok, msg) => { console.log(`${ok ? "  PASS" : "  FAIL"}  ${msg}`); if (!ok) fail.push(msg); };

try {
  // ── PHASE 1: booking page NOT in the build ───────────────────────────────
  if (!fs.existsSync(BOOK)) { console.error("FATAL: public/book.html missing before we start."); process.exit(1); }
  fs.renameSync(BOOK, PARKED);
  console.log("\nPHASE 1  public/book.html ABSENT from the build");
  const p1 = await drain();
  const sentIds1 = store.sequenceState(LEAD)?.sent || {};
  check(p1.bookingPagePresent === false, "tick reports bookingPagePresent = false");
  check(Object.keys(sentIds1).length === 0, `NOTHING was sent (sent steps: ${JSON.stringify(Object.keys(sentIds1))})`);
  const blockedOnBooking = p1.skipped.filter((s) => s.missing?.includes("bookingUrl")).map((s) => s.step);
  check(blockedOnBooking.length > 0, `touches skipped for missing bookingUrl: ${JSON.stringify([...new Set(blockedOnBooking)])}`);
  check(calls.length === 0, "zero network calls attempted");

  // ── PHASE 2: same lead, same state, page restored ────────────────────────
  fs.renameSync(PARKED, BOOK);
  console.log("\nPHASE 2  public/book.html PRESENT, same lead, nothing else changed");
  const p2 = await drain();
  const sentIds2 = Object.keys(store.sequenceState(LEAD)?.sent || {});
  check(p2.bookingPagePresent === true, "tick reports bookingPagePresent = true");
  check(sentIds2.includes("t2-real-call"), "t2-real-call SENT");
  check(sentIds2.includes("t6-objections"), "t6-objections SENT");
  check(sentIds2.includes("t8-breakup"), "t8-breakup SENT");
  check(!sentIds2.includes("t4-testimonials"), "t4-testimonials still correctly blocked on its own uncleared asset");
  check(calls.length === 0, "still zero network calls attempted");
} finally {
  // The file goes back whatever happened, including a thrown assertion or a crash.
  if (fs.existsSync(PARKED)) fs.renameSync(PARKED, BOOK);
}

const restored = fs.existsSync(BOOK) && !fs.existsSync(PARKED);
check(restored, "public/book.html restored to the working tree");

console.log(fail.length ? `\nFAILED (${fail.length})` : "\nALL CHECKS PASSED");
process.exit(fail.length ? 1 : 0);
