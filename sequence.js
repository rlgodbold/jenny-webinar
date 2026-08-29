// ── Owner-lead follow-up sequence ───────────────────────────────────────────
//
// Timed email touches from the moment a lead opts in. Built on the pieces this app
// already has rather than beside them: the lead store holds the state, the subscriber
// table holds consent, marketingFooter carries the CAN-SPAM footer, and this worker is
// the same 5-minute tick shape reminders.js uses.
//
// THREE THINGS ARE DELIBERATE AND SHOULD NOT BE "SIMPLIFIED" LATER.
//
// 1. IT RUNS DARK BY DEFAULT. LEAD_SEQUENCE_MODE must be exactly "live" to send. In dark
//    mode every due step is computed and logged with its real recipient and template and
//    nothing leaves the building. That is not a debug convenience: it is how the engine
//    gets proven against real leads and real timing before anyone accepts the risk of a
//    first send, and it makes going live one env var rather than a leap of faith.
//
// 2. CONSENT IS CHECKED TWICE, AND FAILS CLOSED. Once to enrol and again at every send,
//    because consent can be withdrawn between the two. Enrolment uses
//    canEnrolInMarketingSequence, which demands an affirmative subscribed record; an
//    address with no record is NOT consent.
//
// 3. A STEP WHOSE ASSET IS MISSING DOES NOT SEND. Several touches in the plan promise a
//    recording or a testimonial that legal has not cleared. Rather than ship a template
//    with a dead link or a placeholder, each step declares what it needs and the worker
//    skips it, loudly, until the asset exists. A promise in an email is as binding as a
//    promise on a page.
//
// SMS TOUCHES ARE NOT HERE ON PURPOSE. See the note at SMS_TOUCHES_BLOCKED below.

import {
  listLeads,
  sequenceState,
  stepSent,
  markStepSent,
  exitSequence,
  canEmailMarketing,
  canEnrolInMarketingSequence,
  mayMarketTo,
} from "./store.js";
import { sendSequenceEmail, hasPostalAddress } from "./email.js";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const TICK = 5 * MIN;

export const SEQUENCE_ID = "owner-lead-v1";
export const isLive = () => process.env.LEAD_SEQUENCE_MODE === "live";

// ── Assets ──────────────────────────────────────────────────────────────────
// An asset is present only if we have a real, cleared value for it. Empty means the
// step that needs it cannot send. Deliberately no defaults and no placeholders: a
// default here would become a dead link in a live email.
export function assets() {
  const base = (process.env.PUBLIC_BASE_URL || "https://jennycallagent.com").replace(/\/$/, "");
  return {
    bookingUrl: `${base}/book`,
    classUrl: `${base}/watch`, // Lee's own recording, already published, already cleared
    demoLine: process.env.DEMO_LINE_NUMBER || "", // lives on the demo service, not here
    realCallClip: process.env.CLEARED_CALL_CLIP_URL || "", // needs a signed marketing release
    testimonialsUrl: process.env.CLEARED_TESTIMONIALS_URL || "", // needs clearing + income-claim check
  };
}

// ── Steps ───────────────────────────────────────────────────────────────────
// Offsets are from the lead's opt-in, not from the previous send, so a delayed tick
// cannot compound into drift.
export const STEPS = [
  { id: "t2-real-call", offsetMs: 1 * HOUR, template: "realCall", needs: ["bookingUrl", "classUrl"] },
  { id: "t4-testimonials", offsetMs: 3 * DAY, template: "testimonials", needs: ["bookingUrl", "testimonialsUrl"] },
  { id: "t6-objections", offsetMs: 7 * DAY, template: "objections", needs: ["bookingUrl"] },
  { id: "t8-breakup", offsetMs: 14 * DAY, template: "breakup", needs: ["bookingUrl"] },
];

// SMS_TOUCHES_BLOCKED
// Touches 1, 3, 5 and 7 are SMS and are NOT implemented, not even behind a flag that
// could be flipped. Before any of them can exist we need a phone number captured under
// EXPRESS MARKETING consent, and today we have no such source:
//   - /lp and /watch collect no phone at all
//   - /demo collects a cell under live consent text reading "These are transactional
//     messages to confirm your number and set up your demo, NOT MARKETING"
//   - /demo/start collects a "Best number" under "Lee will reach out personally"
// Texting any of those numbers with this sequence would contradict a representation we
// published and legal cleared. Do not add an SMS step until a consent-capture source
// exists and legal has signed off on the wording.

const missingFor = (step, a) => step.needs.filter((k) => !a[k]);

/** Is this lead still eligible right now? Cheap checks first, consent last and loudest. */
function eligibility(lead) {
  const q = sequenceState(lead.email);
  if (!q) return { ok: false, why: "not_enrolled" };
  if (q.exited) return { ok: false, why: `exited:${q.exited.reason}` };
  if (lead.status === "booked" || lead.stage === "booked") return { ok: false, why: "booked" };
  // THE CONSENT CHECK READS THE FLAG, not the fact that we happen to hold an address.
  // mayMarketTo also refuses any contact acquired under a non-marketing representation,
  // which no later flag can override.
  const consent = mayMarketTo(lead.email, "email");
  if (!consent.ok) return { ok: false, why: consent.why };
  return { ok: true, sequence: q };
}

/** One pass. Returns what it did, so tests and the dark-run proof can assert on it. */
export async function runSequenceTick(now = Date.now()) {
  const a = assets();
  const out = { checked: 0, due: 0, sent: 0, skipped: [], darkRun: !isLive() };

  // CAN-SPAM: marketing mail does not go out without a physical mailing address. The
  // broadcast path already refuses on this; a sequence is marketing mail too, and a
  // silently footer-less send is the version of this failure nobody notices.
  if (isLive() && !hasPostalAddress()) {
    out.halted = "no_postal_address";
    return out;
  }

  for (const lead of listLeads()) {
    out.checked++;
    const el = eligibility(lead);
    if (!el.ok) continue;
    const startedAt = Date.parse(el.sequence.startedAt);
    if (!Number.isFinite(startedAt)) continue;

    for (const step of STEPS) {
      if (now < startedAt + step.offsetMs) continue;   // not due yet
      if (stepSent(lead.email, step.id)) continue;      // already sent, idempotent
      out.due++;

      const missing = missingFor(step, a);
      if (missing.length) {
        // Not an error and not a send. The step waits for its asset rather than going
        // out with a dead link.
        out.skipped.push({ email: lead.email, step: step.id, reason: "missing_asset", missing });
        continue;
      }

      if (!isLive()) {
        out.skipped.push({ email: lead.email, step: step.id, reason: "dark_mode", template: step.template });
        console.log(`[sequence:DARK] would send ${step.id} (${step.template}) to ${lead.email}`);
        // Break, not continue, so a dark tick consumes the lead exactly as a live tick
        // would. A rehearsal that paces differently from the real run is not a rehearsal,
        // and this is the pacing the gate is meant to prove.
        break;
      }

      const r = await sendSequenceEmail({ step, lead, assets: a });
      if (r?.ok !== false) {
        markStepSent(lead.email, step.id, { template: step.template });
        out.sent++;
      } else {
        out.skipped.push({ email: lead.email, step: step.id, reason: "send_failed", error: r?.error });
      }
      break; // at most one touch per lead per tick, so a backlog cannot burst
    }
  }
  return out;
}

let running = false;
export function startSequenceScheduler() {
  const t = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      const r = await runSequenceTick();
      if (r.sent || r.skipped.length) {
        console.log(`[sequence] ${isLive() ? "LIVE" : "DARK"} tick: ${r.sent} sent, ${r.skipped.length} skipped`);
      }
    } catch (e) {
      console.error("[sequence] tick error:", e?.message);
    } finally {
      running = false;
    }
  }, TICK);
  t.unref?.();
  console.log(`[sequence] scheduler started in ${isLive() ? "LIVE" : "DARK"} mode (every 5 min)`);
}

export { exitSequence, canEnrolInMarketingSequence };
