// Subscriber store + audit log for the webinar list / email marketing.
// Source of truth for marketing consent + opt-out state. Low volume (a weekly
// webinar list), so an in-memory map persisted to a JSON file is plenty.
// All mutations also append to an append-only events.ndjson for compliance records.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const SUBS_FILE = path.join(DATA_DIR, "subscribers.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.ndjson");
const CAMPAIGNS_FILE = path.join(DATA_DIR, "campaigns.ndjson");

// HMAC secret for unsubscribe tokens (so links can't be forged/enumerated).
const UNSUB_SECRET =
  process.env.UNSUBSCRIBE_SECRET || process.env.ADMIN_TOKEN || "dev-unsub-secret";

let subscribers = new Map();
load();

function load() {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      const arr = JSON.parse(fs.readFileSync(SUBS_FILE, "utf8"));
      subscribers = new Map(arr.map((s) => [s.email, migrate(s)]));
    }
  } catch (e) {
    console.error("[store] load failed:", e.message);
  }
}

// Bring legacy single-session records up to the recurring-series shape:
//   sessionISO + r24/r1  ->  sessions[] + reminded{ [sessionId]: {r24,r1} }
// The legacy webinar's date becomes an (archived) session id. Idempotent.
function migrate(s) {
  if (!Array.isArray(s.sessions)) {
    const legacyId = s.sessionISO ? String(s.sessionISO).slice(0, 10) : null;
    s.sessions = legacyId ? [legacyId] : [];
    if (!s.reminded) {
      s.reminded = legacyId ? { [legacyId]: { r24: !!s.r24, r1: !!s.r1 } } : {};
    }
  }
  if (!s.reminded) s.reminded = {};
  return s;
}

function persist() {
  const tmp = SUBS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify([...subscribers.values()], null, 2));
  fs.renameSync(tmp, SUBS_FILE); // atomic
}

export function logEvent(ev) {
  try {
    fs.appendFileSync(
      EVENTS_FILE,
      JSON.stringify({ ...ev, at: new Date().toISOString() }) + "\n"
    );
  } catch (e) {
    console.error("[store] event log failed:", e.message);
  }
}

export function normalizeEmail(e) {
  return String(e || "").trim().toLowerCase();
}

export function upsertSubscriber({ email, name, source, ip, sessionId }) {
  email = normalizeEmail(email);
  const now = new Date().toISOString();
  let s = subscribers.get(email);
  if (!s) {
    s = {
      email,
      name: name || "",
      status: "subscribed",
      createdAt: now,
      updatedAt: now,
      subscribedAt: now,
      unsubscribedAt: null,
      source: source || "",
      consentIp: ip || "",
      sessions: sessionId ? [sessionId] : [], // every session this person registered for
      reminded: {}, // { [sessionId]: { r24:bool, r1:bool } }
    };
    subscribers.set(email, s);
    logEvent({ type: "subscribe", email, source, ip, sessionId });
  } else {
    if (name && !s.name) s.name = name;
    if (!Array.isArray(s.sessions)) s.sessions = [];
    if (!s.reminded) s.reminded = {};
    // An explicit re-registration counts as fresh consent → re-subscribe.
    if (s.status === "unsubscribed") {
      s.status = "subscribed";
      s.subscribedAt = now;
      s.unsubscribedAt = null;
      logEvent({ type: "resubscribe", email, source, ip, via: "register" });
    }
    // Track this session (a person can be registered for several future dates).
    if (sessionId && !s.sessions.includes(sessionId)) {
      s.sessions.push(sessionId);
      logEvent({ type: "register_session", email, sessionId });
    }
    s.updatedAt = now;
  }
  persist();
  return s;
}

// Active subscribers registered for a specific session (for reminders).
export function activeForSession(sessionId) {
  return [...subscribers.values()].filter(
    (s) => s.status === "subscribed" && Array.isArray(s.sessions) && s.sessions.includes(sessionId)
  );
}

export function reminderSent(sessionId, email, which) {
  const s = subscribers.get(normalizeEmail(email));
  return Boolean(s?.reminded?.[sessionId]?.[which]);
}

export function markReminderSent(sessionId, email, which) {
  const s = subscribers.get(normalizeEmail(email));
  if (!s) return false;
  if (!s.reminded) s.reminded = {};
  if (!s.reminded[sessionId]) s.reminded[sessionId] = { r24: false, r1: false };
  s.reminded[sessionId][which] = true;
  s.updatedAt = new Date().toISOString();
  persist();
  return true;
}

// Registration counts per session id, across the whole list.
export function countsBySession() {
  const out = {};
  for (const s of subscribers.values()) {
    for (const id of s.sessions || []) out[id] = (out[id] || 0) + 1;
  }
  return out;
}

export function getSubscriber(email) {
  return subscribers.get(normalizeEmail(email)) || null;
}

export function unsubscribe(email, meta = {}) {
  email = normalizeEmail(email);
  const now = new Date().toISOString();
  let s = subscribers.get(email);
  if (!s) {
    // Suppress even an unknown address (someone forwarded the email).
    s = {
      email,
      name: "",
      status: "unsubscribed",
      createdAt: now,
      updatedAt: now,
      subscribedAt: null,
      unsubscribedAt: now,
      source: "unsub",
    };
    subscribers.set(email, s);
    persist();
    logEvent({ type: "unsubscribe", email, ...meta });
    return true;
  }
  if (s.status !== "unsubscribed") {
    s.status = "unsubscribed";
    s.unsubscribedAt = now;
    s.updatedAt = now;
    persist();
    logEvent({ type: "unsubscribe", email, ...meta });
  }
  return true;
}

export function resubscribe(email, meta = {}) {
  email = normalizeEmail(email);
  const s = subscribers.get(email);
  if (!s) return false;
  s.status = "subscribed";
  s.subscribedAt = new Date().toISOString();
  s.unsubscribedAt = null;
  s.updatedAt = s.subscribedAt;
  persist();
  logEvent({ type: "resubscribe", email, ...meta });
  return true;
}

export function listSubscribers() {
  return [...subscribers.values()];
}

export function activeSubscribers() {
  return [...subscribers.values()].filter((s) => s.status === "subscribed");
}

export function canEmailMarketing(email) {
  const s = subscribers.get(normalizeEmail(email));
  return !s || s.status === "subscribed"; // suppress only explicit unsubscribes
}

export function stats() {
  const all = [...subscribers.values()];
  return {
    total: all.length,
    subscribed: all.filter((s) => s.status === "subscribed").length,
    unsubscribed: all.filter((s) => s.status === "unsubscribed").length,
  };
}

export function logCampaign(c) {
  try {
    fs.appendFileSync(
      CAMPAIGNS_FILE,
      JSON.stringify({ ...c, at: new Date().toISOString() }) + "\n"
    );
  } catch (e) {
    console.error("[store] campaign log failed:", e.message);
  }
}

// ── Unsubscribe tokens (HMAC, not guessable) ────────────────────────────────
export function unsubToken(email) {
  return crypto
    .createHmac("sha256", UNSUB_SECRET)
    .update(normalizeEmail(email))
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubToken(email, token) {
  const expected = unsubToken(email);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(token || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ── Demo / ad leads ──────────────────────────────────────────────────────────
// Separate from webinar subscribers: these are paid-traffic + demo prospects that
// route to the sales team and feed the follow-up funnel. Keyed by email (dedup),
// persisted to leads.json, atomic write. `status` is the follow-up lifecycle
// (new -> contacted -> booked -> lost); `stage` is where in the funnel they entered
// (lead = landing-page capture, demo = completed the demo).
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const leads = new Map();
(function loadLeads() {
  try {
    for (const l of JSON.parse(fs.readFileSync(LEADS_FILE, "utf8"))) leads.set(l.email, l);
  } catch { /* first run: no file yet */ }
})();
function persistLeads() {
  const tmp = LEADS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify([...leads.values()], null, 2));
  fs.renameSync(tmp, LEADS_FILE); // atomic
}

export function upsertLead({ email, name, company, cell, fsm, plan, stage, source, utm, ip } = {}) {
  email = normalizeEmail(email);
  const now = new Date().toISOString();
  let l = leads.get(email);
  if (!l) {
    l = {
      email, name: name || "", company: company || "", cell: cell || "", fsm: fsm || "", plan: plan || "",
      status: "new", stage: stage || "lead", source: source || "", utm: utm || {}, ip: ip || "",
      createdAt: now, updatedAt: now, history: [],
    };
    leads.set(email, l);
    logEvent({ type: "lead_new", email, stage: l.stage, source });
  } else {
    // Fill/refresh known fields; never blank out something we already have.
    if (name) l.name = name;
    if (company) l.company = company;
    if (cell) l.cell = cell;
    if (fsm) l.fsm = fsm;
    if (plan) l.plan = plan;
    if (source) l.source = source;
    if (utm && Object.keys(utm).length) l.utm = { ...l.utm, ...utm };
    // Stage only advances forward: lead -> demo (never demo -> lead).
    if (stage === "demo") l.stage = "demo";
    l.updatedAt = now;
    logEvent({ type: "lead_update", email, stage: l.stage, source });
  }
  l.history.push({ at: now, stage: stage || l.stage, source: source || "" });
  persistLeads();
  return l;
}

// ── Consent model ───────────────────────────────────────────────────────────
//
// Four rules, enforced here in data rather than in anybody's memory.
//
// 1. Consent is a FLAG with a GRANT DATE and a SOURCE. Not a boolean, not an inference.
//    The date is the proof of when permission existed, which is the thing a complaint or
//    an audit actually asks about.
//
// 2. A SEND READS THE FLAG, NEVER THE CONTACT COLUMN. The presence of a phone number or
//    an email address is not permission to use it. This is the rule that gets broken by
//    accident, because the contact column is right there and it looks like an invitation.
//
// 3. A CONTACT COLLECTED UNDER A NON-MARKETING REPRESENTATION IS PERMANENTLY OFF LIMITS
//    FOR MARKETING, and no later flag rescues it. We told those people, in writing and in
//    live copy legal reviewed, that their number was transactional and "not marketing".
//    A flag set afterwards cannot reach back and change what they were told at the moment
//    they handed it over. To market to such a person we need a FRESH contact captured
//    under a marketing representation, not a new flag on the old one.
//
// 4. SMS MARKETING CONSENT IS ITS OWN FLAG, separate from the transactional code consent
//    on /demo, and separate from email. One channel's permission is never another's.

// Origins whose contacts can never be used for marketing, whatever any flag says later.
// Keyed to the representation the person was actually shown.
export const NON_MARKETING_ORIGINS = Object.freeze([
  "demo-verification",   // /demo cell: "transactional... NOT MARKETING", live and legal-cleared
  "demo-start-callback", // /demo/start "Best number": "Lee will reach out personally"
]);

// The origin that a future demo-form marketing opt-in must write, and the reason it has
// to be a DIFFERENT string from "demo-verification".
//
// Lee's ruling puts an optional marketing checkbox on the demo form, for the same number
// the verification code goes to. That number's origin is "demo-verification", which rule 3
// blocks forever. If the opt-in reused that origin, one of two things would happen and
// both are wrong:
//   - the new opt-ins would be blocked, making the checkbox useless, or
//   - we would loosen the block, which would retroactively unblock every number ALREADY
//     collected under "transactional... not marketing", which is precisely the population
//     rule 3 exists to protect.
//
// So the distinction is by WHAT THE PERSON WAS SHOWN AT COLLECTION TIME, not by which
// field the digits came from. A number collected while the opt-in existed AND with the box
// ticked was acquired under a marketing representation and gets this origin. A number
// collected before the checkbox shipped, or with the box left unticked, keeps
// "demo-verification" and stays blocked forever. No backfill, ever: the existing
// population was told something different and cannot be re-labelled.
export const DEMO_OPTIN_ORIGIN = "demo-form-optin";

function blankConsent() {
  return {
    email_marketing: { granted: false, at: null, source: null },
    sms_marketing: { granted: false, at: null, source: null },
  };
}

/** Record how a contact was ACQUIRED, which is what rule 3 is enforced against. */
export function setContactOrigin(email, channel, origin) {
  const l = leads.get(normalizeEmail(email));
  if (!l) return false;
  l.contactOrigin = l.contactOrigin || {};
  // First origin wins. A contact cannot be laundered by re-recording it later under a
  // friendlier label.
  if (!l.contactOrigin[channel]) l.contactOrigin[channel] = origin;
  l.updatedAt = new Date().toISOString();
  persistLeads();
  return true;
}

/** Grant marketing consent for one channel, stamping when and from where. */
/**
 * WHAT THEY AGREED TO, STORED WITH THE FACT THAT THEY AGREED.
 *
 * A consent record that says only "granted, on this date, via demo-form-optin" answers WHEN
 * somebody opted in but not WHAT THEY READ when they did. The sentence they actually saw
 * lives in an env var with no history, so revising it once would make every earlier record
 * indistinguishable from every later one. That is the exact question a TCPA dispute turns on,
 * and it cannot be repaired after the fact: numbers collected under un-captured wording are
 * permanently unreconstructable, so this is only worth anything BEFORE any consent lands.
 *
 * The literal text is stored, not just a hash. A hash proves two records share wording but
 * reconstructs nothing on its own; it needs a registry mapping hashes back to sentences, and
 * the day nobody kept that registry the hash is worthless. The record is self-contained
 * instead, with a short version hash alongside purely so records can be grouped and a
 * revision shows up as a visibly different value.
 *
 * The wording is read SERVER SIDE at grant time rather than echoed back by the browser. The
 * client could tell us anything, and consent evidence a user can forge is not evidence. The
 * accepted limitation is that a label edited between page render and submit would record the
 * newer text; that needs a process restart to happen at all, and the alternative is worse.
 */
export function grantMarketingConsent(email, channel, source, disclosure = null) {
  const l = leads.get(normalizeEmail(email));
  if (!l) return false;
  const key = `${channel}_marketing`;
  l.consent = l.consent || blankConsent();
  if (!l.consent[key]) return false;

  const shown = normalizeDisclosure(disclosure);

  // FAIL CLOSED ON SMS. If we cannot record what someone agreed to, we do not record that
  // they agreed. Refusing the grant leaves the number unmarketable, which is recoverable;
  // storing a consent we cannot evidence is not.
  //
  // Email is deliberately not held to this yet. Its consent comes from the landing page
  // registration, which predates this and whose wording is in version-controlled HTML rather
  // than an env var, so it is already reconstructable from the commit history. Tightening it
  // here would silently break sequence enrolment for every existing lead.
  if (channel === "sms" && !shown) {
    logEvent({ type: "consent_refused_no_disclosure", email: l.email, channel, source });
    console.warn(`[consent] REFUSED sms grant for ${l.email}: no disclosure text captured.`);
    return false;
  }

  l.consent[key] = { granted: true, at: new Date().toISOString(), source: source || "", shown };
  l.updatedAt = new Date().toISOString();
  persistLeads();
  logEvent({ type: "consent_granted", email: l.email, channel, source, disclosureVersion: shown?.version || null });
  return true;
}

/** The exact wording, plus a short hash of it so revisions are visible at a glance. */
function normalizeDisclosure(d) {
  const label = String(d?.label || "").trim();
  if (!label) return null;
  const fineprint = String(d?.fineprint || "").trim();
  const version = crypto.createHash("sha256").update(`${label}\n${fineprint}`).digest("hex").slice(0, 12);
  return { label, fineprint, version, capturedAt: new Date().toISOString() };
}

export function revokeMarketingConsent(email, channel, reason) {
  const l = leads.get(normalizeEmail(email));
  if (!l || !l.consent) return false;
  const key = `${channel}_marketing`;
  if (!l.consent[key]) return false;
  l.consent[key] = { granted: false, at: new Date().toISOString(), source: reason || "revoked" };
  l.updatedAt = new Date().toISOString();
  persistLeads();
  logEvent({ type: "consent_revoked", email: l.email, channel, reason });
  return true;
}

/**
 * THE ONLY QUESTION A SEND SHOULD ASK. Returns {ok, why} so a refusal is explainable
 * rather than a bare false, because "why did this lead not get the email" is the question
 * somebody will ask in three weeks.
 */
export function mayMarketTo(email, channel) {
  const l = leads.get(normalizeEmail(email));
  if (!l) return { ok: false, why: "no_lead_record" };

  const origin = l.contactOrigin?.[channel];
  if (origin && NON_MARKETING_ORIGINS.includes(origin)) {
    return { ok: false, why: `origin_forbids_marketing:${origin}` };
  }

  const c = l.consent?.[`${channel}_marketing`];
  if (!c || !c.granted) return { ok: false, why: "no_consent_flag" };
  if (!c.at) return { ok: false, why: "consent_without_grant_date" };

  // Email additionally honours the subscriber-level unsubscribe, which is the surface a
  // recipient actually clicks.
  if (channel === "email" && !canEmailMarketing(l.email)) return { ok: false, why: "unsubscribed" };

  return { ok: true, grantedAt: c.at, source: c.source };
}

// ── Marketing sequence state ────────────────────────────────────────────────
// Per-lead, per-step send state, the same shape reminders.js uses for (session,
// subscriber). Idempotent by construction: a restart, a double tick, or two workers
// cannot re-send a step, because the check and the mark are both keyed on the step id.

export function sequenceState(email) {
  const l = leads.get(normalizeEmail(email));
  return (l && l.sequence) || null;
}

/** Enrol a lead in a sequence, stamping the clock the offsets are measured from. */
export function enrolInSequence(email, { sequenceId, startedAt } = {}) {
  const l = leads.get(normalizeEmail(email));
  if (!l) return null;
  if (l.sequence) return l.sequence; // never restart someone mid-flight
  l.sequence = { id: sequenceId, startedAt: startedAt || new Date().toISOString(), sent: {}, exited: null };
  l.updatedAt = new Date().toISOString();
  persistLeads();
  logEvent({ type: "sequence_enrolled", email: l.email, sequenceId });
  return l.sequence;
}

export function stepSent(email, stepId) {
  const q = sequenceState(email);
  return Boolean(q && q.sent[stepId]);
}

export function markStepSent(email, stepId, meta = {}) {
  const l = leads.get(normalizeEmail(email));
  if (!l || !l.sequence) return false;
  l.sequence.sent[stepId] = { at: new Date().toISOString(), ...meta };
  l.updatedAt = new Date().toISOString();
  persistLeads();
  logEvent({ type: "sequence_step_sent", email: l.email, stepId, ...meta });
  return true;
}

/**
 * Leave the sequence. Reasons: booked, unsubscribed, replied, manual.
 * Recorded rather than deleted, so attribution can still see why someone stopped.
 */
export function exitSequence(email, reason) {
  const l = leads.get(normalizeEmail(email));
  if (!l || !l.sequence || l.sequence.exited) return false;
  l.sequence.exited = { reason, at: new Date().toISOString() };
  l.updatedAt = new Date().toISOString();
  persistLeads();
  logEvent({ type: "sequence_exited", email: l.email, reason });
  return true;
}

/**
 * FAIL-CLOSED marketing consent, deliberately stricter than canEmailMarketing().
 *
 * canEmailMarketing() returns true for an address with NO subscriber record, which is
 * correct for transactional mail (a confirmation must reach someone who just registered)
 * and wrong for a marketing sequence, where the absence of a record is the absence of
 * consent. Enrolment demands an affirmative subscribed row and nothing less.
 */
export function canEnrolInMarketingSequence(email) {
  const s = subscribers.get(normalizeEmail(email));
  return Boolean(s && s.status === "subscribed");
}

export function listLeads() {
  return [...leads.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function leadStats() {
  const all = [...leads.values()];
  const tally = (key) => all.reduce((m, l) => ((m[l[key]] = (m[l[key]] || 0) + 1), m), {});
  return { total: all.length, byStage: tally("stage"), byStatus: tally("status") };
}
