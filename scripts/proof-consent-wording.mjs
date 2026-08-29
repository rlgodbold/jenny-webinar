// BITE-PROOF for disclosure capture on the consent record.
//
// Claim under test: a consent record carries the EXACT wording the person read, revising the
// wording produces a visibly different stored value on new grants while old records keep
// theirs, and if the wording cannot be captured the grant is REFUSED rather than recorded.
//
// It drives the REAL SERVER over HTTP rather than calling the store directly, because the
// thing most likely to be wrong is the wiring, not the storage. SMS_OPTIN_LABEL is read once
// at module scope in server.js, so a store that records perfectly and a handler that passes
// the wrong value would look identical from inside the store. Each phase therefore boots its
// own server process with its own env, which is also the only honest way to model a wording
// revision: in production that is a config change plus a restart.
//
// ONE DATA_DIR IS SHARED ACROSS PHASES ON PURPOSE. Old records surviving a wording change is
// half the claim, and a fresh directory each phase would make that untestable.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "consentproof-"));

const V1 = { label: "Text me junk removal tips and Jenny updates.", fineprint: "Consent is not required to buy anything. Msg and data rates may apply. Reply STOP to opt out." };
const V2 = { label: "Yes, text me Jenny updates and junk removal tips.", fineprint: "Consent is not required to buy anything. Reply STOP to opt out, HELP for help." };

const fail = [];
const check = (ok, msg) => { console.log(`${ok ? "  PASS" : "  FAIL"}  ${msg}`); if (!ok) fail.push(msg); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let port = 8931;
async function withServer(env, fn) {
  port++;
  const proc = spawn("node", ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR,
      RESEND_API_KEY: "",          // no key: email.js short-circuits before any network
      LEAD_SEQUENCE_MODE: "dark",  // scheduler boots idle
      DEMO_PUBLIC: "1",
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    const deadline = Date.now() + 15000;
    for (;;) {
      if (Date.now() > deadline) throw new Error(`server on ${port} never came up`);
      try { await fetch(`http://127.0.0.1:${port}/privacy`); break; } catch { await sleep(120); }
    }
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    proc.kill("SIGKILL");
    await sleep(120);
  }
}

const optin = (base, email, consent) =>
  fetch(`${base}/api/demo-optin`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, name: "Sample Owner", phone: "9195551234", bucket: "consent_shown", consent }),
  }).then((r) => r.json());

const leadOf = (email) => {
  const f = path.join(DATA_DIR, "leads.json");
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, "utf8")).find((l) => l.email === email) || null;
};
const shownOf = (email) => leadOf(email)?.consent?.sms_marketing?.shown || null;

// ── PHASE 1: wording v1 ─────────────────────────────────────────────────────
console.log("\nPHASE 1  checkbox live with wording V1");
await withServer({ SMS_OPTIN_LABEL: V1.label, SMS_OPTIN_FINEPRINT: V1.fineprint }, async (base) => {
  const r = await optin(base, "v1@example.com", true);
  check(r.consent === true, "grant accepted");
  const shown = shownOf("v1@example.com");
  check(shown?.label === V1.label, "record carries the LITERAL label the person read");
  check(shown?.fineprint === V1.fineprint, "record carries the literal fine print");
  check(typeof shown?.version === "string" && shown.version.length === 12, `record carries a version hash (${shown?.version})`);
  check(Boolean(shown?.capturedAt), "record carries when the wording was captured");
});

// ── PHASE 2: wording revised, old record must survive untouched ─────────────
console.log("\nPHASE 2  wording revised to V2, same data dir");
const v1VersionBefore = shownOf("v1@example.com")?.version;
await withServer({ SMS_OPTIN_LABEL: V2.label, SMS_OPTIN_FINEPRINT: V2.fineprint }, async (base) => {
  const r = await optin(base, "v2@example.com", true);
  check(r.consent === true, "new grant accepted under V2");
  const a = shownOf("v1@example.com"), b = shownOf("v2@example.com");
  check(b?.label === V2.label, "new record carries V2 wording");
  check(a?.label === V1.label, "OLD record still carries V1 wording, untouched by the revision");
  check(a?.version === v1VersionBefore, "old record's version hash is unchanged");
  check(a?.version !== b?.version, `revision is visible: ${a?.version} vs ${b?.version}`);
});

// ── PHASE 3: no wording configured, grant must be REFUSED ──────────────────
console.log("\nPHASE 3  no wording configured (SMS_OPTIN_LABEL empty)");
await withServer({ SMS_OPTIN_LABEL: "", SMS_OPTIN_FINEPRINT: "" }, async (base) => {
  const r = await optin(base, "nolabel@example.com", true);
  check(r.consent === false, `response reports consent NOT recorded (why: ${r.why})`);
  const lead = leadOf("nolabel@example.com");
  check(lead?.consent?.sms_marketing?.granted !== true, "no consent flag was written");
  check(lead?.contactOrigin?.sms === "demo-verification", "number kept the transactional origin, so it stays unmarketable");
});

// ── PHASE 4: the email path must not regress ───────────────────────────────
// Email consent predates this and its wording lives in version-controlled HTML, not an env
// var, so it is deliberately NOT held to the disclosure requirement. If tightening SMS had
// caught email too, every existing lead would silently stop qualifying for the sequence.
console.log("\nPHASE 4  regression: email consent still works without a disclosure");
process.env.DATA_DIR = DATA_DIR;
const store = await import(path.join(ROOT, "store.js"));
store.upsertLead({ email: "emailonly@example.com", name: "Sample Owner", source: "lp", stage: "lead" });
store.upsertSubscriber({ email: "emailonly@example.com", name: "Sample Owner", source: "lp" });
store.setContactOrigin("emailonly@example.com", "email", "lp-registration");
check(store.grantMarketingConsent("emailonly@example.com", "email", "lp") === true, "email grant succeeds with no disclosure argument");
check(store.mayMarketTo("emailonly@example.com", "email").ok === true, "lead is still marketable by email, sequence enrolment unaffected");

console.log(fail.length ? `\nFAILED (${fail.length})` : "\nALL CHECKS PASSED");
process.exit(fail.length ? 1 : 0);
