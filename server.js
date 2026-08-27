import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { webinar } from "./config.js";
import { currentSession, upcomingSessions, getSession, formatWhen } from "./sessions.js";
import {
  sendConfirmationEmail,
  sendMarketingEmail,
  sendReminderEmail,
  sendAttendeeNotification,
  hasPostalAddress,
  sendDemoInterestLead,
} from "./email.js";
import { startReminderScheduler } from "./reminders.js";
import { getSubscriber } from "./store.js";
import {
  upsertSubscriber,
  unsubscribe,
  resubscribe,
  verifyUnsubToken,
  activeSubscribers,
  listSubscribers,
  stats,
  countsBySession,
  logCampaign,
  normalizeEmail,
  upsertLead,
  listLeads,
  leadStats,
} from "./store.js";
import { sendSmsAll } from "./sms.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
app.set("trust proxy", true);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const REG_FILE = path.join(DATA_DIR, "registrations.ndjson");

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
// Read-only token for the attendee list (safe to share with the team / put in emails).
const ATTENDEES_TOKEN = process.env.ATTENDEES_TOKEN || "";
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
// Who gets pinged on each new signup.
const NOTIFY_EMAILS = (process.env.ATTENDEE_NOTIFY_EMAILS || "lee@junkra.com,shane@junkra.com")
  .split(",").map((s) => s.trim()).filter(Boolean);
const attendeesUrl = () =>
  `${PUBLIC_BASE_URL}/attendees${ATTENDEES_TOKEN ? "?token=" + encodeURIComponent(ATTENDEES_TOKEN) : ""}`;

// Privacy policy identity. COMPANY_POSTAL_ADDRESS is the same env the CAN-SPAM email
// footer already reads (email.js), so Lee sets ONE physical address and it flows to
// both. Until it is set, the page shows a visible placeholder so nobody ships it blank.
const COMPANY_NAME = process.env.COMPANY_NAME || "Junk Removal Authority";
const COMPANY_MAILING_ADDRESS =
  process.env.COMPANY_POSTAL_ADDRESS || "[JRA PHYSICAL MAILING ADDRESS placeholder]";
const PRIVACY_CONTACT_EMAIL = webinar.contactEmail || "lee@junkra.com";
const PRIVACY_LAST_UPDATED = "August 27, 2026";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

// Who gets a text the instant a lead comes in (Shane + Lee). Comma-separated env override.
const LEAD_SMS_RECIPIENTS = (process.env.LEAD_SMS_RECIPIENTS || "+19079828460,+19196222698")
  .split(",").map((s) => s.trim()).filter(Boolean);

// Pull UTM/source params off a lead payload so we know which ad produced them.
function pickUtm(body = {}) {
  const utm = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = String(body[k] || "").trim().slice(0, 120);
    if (v) utm[k] = v;
  }
  return utm;
}

// Text Shane + Lee about a new lead. Best-effort: never throws (a lead alert must not 500).
async function notifyLeadSms(lead, kind) {
  const who = kind === "demo" ? "completed the demo" : "new landing-page lead";
  const bits = [
    `Jenny lead (${who}):`,
    lead.name || "(no name)",
    lead.company ? "/ " + lead.company : "",
    lead.cell || "",
    lead.email || "",
    lead.fsm ? "· uses " + lead.fsm : "",
  ].filter(Boolean);
  try {
    return await sendSmsAll(LEAD_SMS_RECIPIENTS, bits.join(" "));
  } catch (e) {
    console.error("[lead] sms failed:", e?.message);
    return [];
  }
}

// ── Register ────────────────────────────────────────────────────────────────
app.post("/api/register", async (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 120);
  const email = normalizeEmail(req.body?.email).slice(0, 200);

  if (!name) return res.status(400).json({ error: "Please enter your name." });
  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: "Please enter a valid email." });

  const ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim();
  const source = String(req.body?.source || "").slice(0, 80);

  // Which session are they registering for? A valid, still-open session id from
  // the form wins; otherwise default to the next upcoming session.
  const requestedId = String(req.body?.sessionId || "").slice(0, 20);
  const openIds = new Set(upcomingSessions().map((s) => s.id));
  const session =
    (requestedId && openIds.has(requestedId) && getSession(requestedId)) || currentSession();

  const record = {
    name,
    email,
    sessionId: session?.id || null,
    sessionISO: session?.startsAtISO || null,
    registeredAt: new Date().toISOString(),
    source,
    ip,
  };

  const isNew = !getSubscriber(email);
  try {
    fs.appendFileSync(REG_FILE, JSON.stringify(record) + "\n");
    upsertSubscriber({ email, name, source, ip, sessionId: session?.id || null }); // consent + list state
  } catch (err) {
    console.error("[register] write failed:", err.message);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }

  sendConfirmationEmail({ name, email, session }).catch((e) =>
    console.error("[register] email error:", e?.message)
  );

  // Notify the team on each genuinely-new attendee (not on a re-submit).
  if (isNew && NOTIFY_EMAILS.length) {
    sendAttendeeNotification({
      name,
      email,
      count: stats().total,
      recipients: NOTIFY_EMAILS,
      attendeesUrl: attendeesUrl(),
      when: session ? formatWhen(session).full : "",
    }).catch((e) => console.error("[register] notify error:", e?.message));
  }

  return res.json({
    ok: true,
    zoomJoinUrl: session?.zoomJoinUrl || webinar.zoomJoinUrl || null,
    when: session ? formatWhen(session).full : null,
    sessionId: session?.id || null,
  });
});

app.get("/api/webinar", (_req, res) => {
  const cur = currentSession();
  const upcoming = upcomingSessions().map((s) => ({
    id: s.id,
    startsAtISO: s.startsAtISO,
    when: formatWhen(s),
  }));
  res.json({
    title: webinar.title,
    promise: webinar.promise,
    timezoneLabel: webinar.timezoneLabel,
    brandName: webinar.brandName,
    hostName: webinar.hostName,
    hostTitle: webinar.hostTitle,
    zoomJoinUrl: webinar.zoomJoinUrl || null,
    // The featured (next) session + the full list of still-open sessions for the picker.
    current: cur ? { id: cur.id, startsAtISO: cur.startsAtISO, when: formatWhen(cur) } : null,
    sessions: upcoming,
  });
});

// ── Unsubscribe (CAN-SPAM / one-click) ───────────────────────────────────────
function unsubPage(title, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title></head>
  <body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0a0f1c;color:#f1f5f9;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
  <div style="max-width:440px;text-align:center;padding:40px 24px;background:#141c30;border:1px solid #243049;border-radius:16px">${bodyHtml}</div>
  </body></html>`;
}

function handleUnsub(req, res) {
  const email = normalizeEmail(req.query.e);
  const token = req.query.t;
  if (!email || !verifyUnsubToken(email, token)) {
    return res
      .status(400)
      .send(unsubPage("Invalid link", `<h2 style="font-weight:700">Invalid unsubscribe link</h2><p style="color:#94a3b8">This link looks broken. Email ${esc(webinar.contactEmail)} and we'll remove you right away.</p>`));
  }
  unsubscribe(email, { ip: req.ip, ua: String(req.headers["user-agent"] || "").slice(0, 160) });
  const reToken = req.query.t;
  return res.send(
    unsubPage(
      "Unsubscribed",
      `<div style="font-size:40px">✓</div>
       <h2 style="font-weight:700;margin:10px 0">You're unsubscribed</h2>
       <p style="color:#94a3b8">${esc(email)} won't receive any more marketing emails from us.</p>
       <form method="POST" action="/resubscribe" style="margin-top:18px">
         <input type="hidden" name="e" value="${esc(email)}"><input type="hidden" name="t" value="${esc(reToken)}">
         <button type="submit" style="background:transparent;color:#94a3b8;border:1px solid #243049;border-radius:8px;padding:9px 16px;font-size:13px;cursor:pointer">Re-subscribe me</button>
       </form>`
    )
  );
}

app.get("/unsubscribe", handleUnsub);
// One-click POST (RFC 8058) — mail clients POST here directly.
app.post("/unsubscribe", (req, res) => {
  const email = normalizeEmail(req.query.e || req.body?.e);
  const token = req.query.t || req.body?.t;
  if (email && verifyUnsubToken(email, token)) {
    unsubscribe(email, { via: "one-click", ip: req.ip });
  }
  res.status(200).send("OK");
});

app.post("/resubscribe", (req, res) => {
  const email = normalizeEmail(req.body?.e);
  const token = req.body?.t;
  if (email && verifyUnsubToken(email, token)) resubscribe(email, { ip: req.ip });
  res.send(
    unsubPage(
      "Re-subscribed",
      `<h2 style="font-weight:700">You're back on the list</h2><p style="color:#94a3b8">${esc(email)} will receive our emails again.</p>`
    )
  );
});

// ── Admin (token-gated) ───────────────────────────────────────────────────────
function checkAdmin(req, res) {
  if (!ADMIN_TOKEN) {
    res.status(403).json({ error: "Admin disabled: set ADMIN_TOKEN." });
    return false;
  }
  const token = req.query.token || req.headers["x-admin-token"] || req.body?.token;
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

function readRegistrations() {
  if (!fs.existsSync(REG_FILE)) return [];
  return fs
    .readFileSync(REG_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

app.get("/api/admin/stats", (req, res) => {
  if (!checkAdmin(req, res)) return;
  const counts = countsBySession();
  // Registrant count per session, newest sessions first, with a friendly label.
  const bySession = Object.keys(counts)
    .sort((a, b) => b.localeCompare(a))
    .map((id) => {
      const s = getSession(id);
      return {
        id,
        count: counts[id],
        label: s ? formatWhen(s).full : `${id} (archived)`,
        upcoming: Boolean(s),
      };
    });
  res.json({
    ...stats(),
    registrations: readRegistrations().length,
    canSend: hasPostalAddress(),
    bySession,
  });
});

app.get("/api/admin/subscribers", (req, res) => {
  if (!checkAdmin(req, res)) return;
  res.json({ subscribers: listSubscribers() });
});

// Sales leads (demo + landing-page) for the team and the follow-up funnel.
app.get("/api/admin/leads", (req, res) => {
  if (!checkAdmin(req, res)) return;
  res.json({ stats: leadStats(), leads: listLeads() });
});

app.get("/api/admin/leads.csv", (req, res) => {
  if (!checkAdmin(req, res)) return;
  const cols = ["createdAt", "updatedAt", "status", "stage", "name", "company", "cell", "email", "fsm", "plan", "source"];
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = listLeads().map((l) => cols.map((c) => cell(l[c])).join(","));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="jenny-leads.csv"');
  res.send([cols.join(","), ...rows].join("\n"));
});

// Build a subscriber CSV, optionally filtered to one session id (?session=YYYY-MM-DD).
function subscribersCsv(sessionId) {
  let rows = listSubscribers();
  if (sessionId) rows = rows.filter((r) => (r.sessions || []).includes(sessionId));
  const cols = ["name", "email", "status", "subscribedAt", "unsubscribedAt", "source", "sessions"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const cell = (r, c) => (c === "sessions" ? (r.sessions || []).join(" | ") : r[c]);
  return [cols.join(","), ...rows.map((r) => cols.map((c) => q(cell(r, c))).join(","))].join("\n");
}

app.get("/api/admin/export.csv", (req, res) => {
  if (!checkAdmin(req, res)) return;
  const session = String(req.query.session || "").slice(0, 20) || null;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="subscribers${session ? "-" + session : ""}.csv"`);
  res.send(subscribersCsv(session));
});

// Broadcast to the active (subscribed) list. Refuses without a postal address.
app.post("/api/admin/broadcast", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const subject = String(req.body?.subject || "").trim();
  const bodyHtml = String(req.body?.bodyHtml || "").trim();
  const testEmail = req.body?.testEmail ? normalizeEmail(req.body.testEmail) : "";

  if (!subject || !bodyHtml)
    return res.status(400).json({ error: "Subject and body are required." });
  if (!hasPostalAddress())
    return res.status(400).json({
      error:
        "Set COMPANY_POSTAL_ADDRESS (a physical mailing address) before sending — it's legally required in marketing email.",
    });

  if (testEmail) {
    await sendMarketingEmail({ name: "", email: testEmail, subject, bodyHtml });
    return res.json({ ok: true, test: true, sentTo: testEmail });
  }

  const recipients = activeSubscribers();
  let sent = 0,
    failed = 0;
  for (const s of recipients) {
    const r = await sendMarketingEmail({ name: s.name, email: s.email, subject, bodyHtml });
    r?.ok ? sent++ : failed++;
    await new Promise((res2) => setTimeout(res2, 120)); // gentle rate-limit
  }
  logCampaign({ subject, recipients: recipients.length, sent, failed });
  res.json({ ok: true, recipients: recipients.length, sent, failed });
});

// Send a one-off test of any email template to a single address (for previewing).
app.post("/api/admin/test-email", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const email = normalizeEmail(req.body?.email);
  const kind = String(req.body?.kind || "confirmation");
  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: "A valid email is required." });
  const session = currentSession() || null;
  let result;
  if (kind === "confirmation") {
    result = await sendConfirmationEmail({ name: req.body?.name || "there", email, session });
  } else if (kind === "24h" || kind === "1h") {
    result = await sendReminderEmail({ name: req.body?.name || "there", email, kind, session });
  } else {
    return res.status(400).json({ error: "kind must be confirmation, 24h, or 1h." });
  }
  res.json({ ok: result?.ok !== false, kind, sentTo: email, result });
});

// Read-only access for the attendee list (separate token, safe to share/email).
function checkReadToken(req, res) {
  const token = req.query.token || req.headers["x-admin-token"];
  if (token && (token === ATTENDEES_TOKEN || token === ADMIN_TOKEN)) return true;
  res.status(401).send("Unauthorized — invalid or missing token.");
  return false;
}

app.get("/api/attendees.csv", (req, res) => {
  if (!checkReadToken(req, res)) return;
  const session = String(req.query.session || "").slice(0, 20) || null;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="attendees${session ? "-" + session : ""}.csv"`);
  res.send(subscribersCsv(session));
});

app.get("/attendees", (req, res) => {
  if (!checkReadToken(req, res)) return;
  const filterId = String(req.query.session || "").slice(0, 20) || null;
  let rows = listSubscribers().sort((a, b) =>
    String(a.createdAt || "").localeCompare(String(b.createdAt || ""))
  );
  if (filterId) rows = rows.filter((r) => (r.sessions || []).includes(filterId));
  const active = rows.filter((r) => r.status === "subscribed").length;
  // Per-session breakdown (every session anyone has registered for), as filter pills.
  const counts = countsBySession();
  const tokEnc = req.query.token ? encodeURIComponent(req.query.token) : "";
  const tokQ = tokEnc ? "&token=" + tokEnc : "";
  const pill = (href, label, on) =>
    `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:6px 11px;border-radius:20px;font-size:12px;text-decoration:none;border:1px solid ${on ? "#2563eb" : "#cbd5e1"};background:${on ? "#2563eb" : "#fff"};color:${on ? "#fff" : "#475569"}">${label}</a>`;
  const allHref = "/attendees" + (tokEnc ? "?token=" + tokEnc : "");
  const sessionPills =
    pill(allHref, `All · ${listSubscribers().length}`, !filterId) +
    Object.keys(counts)
      .sort((a, b) => b.localeCompare(a))
      .map((id) => {
        const s = getSession(id);
        const label = s ? formatWhen(s).full : `${id} · past`;
        return pill(`/attendees?session=${id}${tokQ}`, `${esc(label)} · ${counts[id]}`, filterId === id);
      })
      .join("");
  const cur = currentSession();
  const headWhen = filterId
    ? (getSession(filterId) ? formatWhen(getSession(filterId)).full : `${filterId} · past session`)
    : (cur ? `Next: ${formatWhen(cur).full}` : "Series complete");
  const csvHref = `/api/attendees.csv?token=${tokEnc}${filterId ? "&session=" + filterId : ""}`;
  const fmt = (iso) => {
    if (!iso) return "—";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
        timeZone: "America/New_York",
      }).format(new Date(iso));
    } catch { return iso; }
  };
  const body = rows.length
    ? rows.map((r, i) => `<tr>
        <td class="n">${i + 1}</td>
        <td>${esc(r.name) || "—"}</td>
        <td>${esc(r.email)}</td>
        <td>${fmt(r.createdAt || r.subscribedAt)}</td>
        <td>${r.status === "subscribed"
          ? '<span class="pill ok">subscribed</span>'
          : '<span class="pill no">unsubscribed</span>'}</td>
      </tr>`).join("")
    : `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:30px">No registrations yet.</td></tr>`;
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><title>Webinar attendees</title>
  <style>
    body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f1f5f9;color:#0f172a;margin:0;padding:28px 18px}
    .wrap{max-width:840px;margin:0 auto}
    .head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px}
    h1{font-size:22px;margin:0}
    .sub{color:#64748b;font-size:14px;margin-top:2px}
    .dl{background:#2563eb;color:#fff;text-decoration:none;padding:10px 16px;border-radius:9px;font-size:14px;font-weight:600}
    table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,.08)}
    th,td{text-align:left;padding:11px 14px;font-size:14px;border-bottom:1px solid #e2e8f0}
    th{background:#f8fafc;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
    td.n{color:#94a3b8;width:36px}
    tr:last-child td{border-bottom:none}
    .pill{font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px}
    .pill.ok{background:#dcfce7;color:#166534}.pill.no{background:#fee2e2;color:#991b1b}
  </style></head><body><div class="wrap">
    <div class="head">
      <div><h1>Webinar attendees</h1><div class="sub">${rows.length} ${filterId ? "for this session" : "registered"} · ${active} currently subscribed · ${esc(headWhen)}</div></div>
      <a class="dl" href="${csvHref}">Download CSV ↓</a>
    </div>
    <div style="margin:0 0 16px">${sessionPills}</div>
    <table><thead><tr><th>#</th><th>Name</th><th>Email</th><th>Registered (ET)</th><th>Status</th></tr></thead>
    <tbody>${body}</tbody></table>
  </div></body></html>`);
});

app.get("/admin", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "admin.html"))
);

// ── THE CAROLINE DEMO ──────────────────────────────────────────────────────────
// Additive and self-contained: two static pages plus one lead endpoint. Nothing here
// touches the webinar registration flow, sessions.js, or the reminder scheduler.
// ── Demo visibility gate ────────────────────────────────────────────────────
// The demo is finished but not ear-tested, and a real prospect signing up before
// Lee has heard it is the one outcome worth preventing. Fails CLOSED: with no env
// set, nobody reaches /demo, not even us.
//   DEMO_PUBLIC="true"     -> open to everyone, and the homepage link comes back
//   DEMO_PREVIEW_KEY="..." -> /demo?key=... previews it while it stays hidden
// Going live later is an env change on Render, not a code change.
const DEMO_PUBLIC = process.env.DEMO_PUBLIC === "true";

// META PIXEL. The ID comes from the environment and is never hardcoded, because we do
// not have it yet and a placeholder that ships is a placeholder that runs. With no ID
// set, pages get a no-op `window.jpx` and load nothing from Meta at all: no script tag,
// no network call, no cookie. Event calls on the pages stay identical either way, so
// dropping the real ID in later is an env change and a restart, not a code change.
const META_PIXEL_ID = (process.env.META_PIXEL_ID || "").replace(/[^0-9]/g, "");

// THE A/B VOICE PAIR GATE. Both files or nothing rendered, and the fail-closed
// direction is the whole point rather than a nicety: with only one file present, the
// surviving clip would play unlabelled as "what she sounds like", and if that survivor
// were the cloned voice we would be presenting the paid upgrade as the standard
// product. That is the exact misrepresentation the demo was rewritten to remove, so
// failing open here is not a degraded experience, it is a false claim.
const AB_STANDARD_REL = "clips/ab-standard.mp3";
const AB_CLONED_REL = "clips/ab-cloned.mp3";
const abPairReady = () =>
  fs.existsSync(path.join(__dirname, "public", AB_STANDARD_REL)) &&
  fs.existsSync(path.join(__dirname, "public", AB_CLONED_REL));

const abPlayer = (rel) =>
  `<audio controls preload="none" src="/${rel}">Your browser cannot play this recording.</audio>`;

function pixelSnippet() {
  if (!META_PIXEL_ID) return "<script>window.jpx=function(){};</script>";
  return `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');
window.jpx=function(){fbq.apply(null,arguments)};
</script>`;
}

// CONVERSIONS API — INSERTION POINT, deliberately not built tonight.
// Server-side events are how we eventually feed CLOSED DEALS back to Meta so it
// optimizes toward buyers instead of form fillers. Needs META_PIXEL_ID plus an access
// token from Lee. Wired as a no-op call at each conversion site so turning it on is
// filling this function in, not threading a new call through the routes.
const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN || "";
async function capiEvent(eventName, payload = {}) {
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) return { ok: true, skipped: true };
  return { ok: true, skipped: true, todo: eventName, payload };
}
const DEMO_PREVIEW_KEY = process.env.DEMO_PREVIEW_KEY || "";

function hasPreviewCookie(req) {
  const raw = req.headers.cookie || "";
  return raw.split(";").some((c) => c.trim() === `demo_preview=${DEMO_PREVIEW_KEY}`);
}

function demoGate(req, res, next) {
  if (DEMO_PUBLIC) return next();
  if (DEMO_PREVIEW_KEY && req.query.key === DEMO_PREVIEW_KEY) {
    // Remember it so the rest of the flow (and /demo/start) works without the key.
    res.cookie("demo_preview", DEMO_PREVIEW_KEY, {
      httpOnly: true, sameSite: "lax", secure: true, maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return next();
  }
  if (DEMO_PREVIEW_KEY && hasPreviewCookie(req)) return next();
  return res.redirect(302, "/");   // no dead end: send them back to the class page
}

// Pages that mention the demo are served through this helper: while the demo is
// hidden, DEMO_LINK blocks are stripped (nothing advertises a page that redirects)
// and DEMO_FALLBACK blocks show instead; once DEMO_PUBLIC flips, the reverse.
// Must sit ahead of express.static, which also serves index.html.
function sendDemoAwareHtml(res, next, filename) {
  const file = path.join(__dirname, "public", filename);
  fs.readFile(file, "utf8", (err, html) => {
    if (err) return next();
    if (!DEMO_PUBLIC) {
      html = html.replace(/<!--DEMO_LINK_START-->[\s\S]*?<!--DEMO_LINK_END-->/g, "");
    } else {
      html = html.replace(/<!--DEMO_FALLBACK_START-->[\s\S]*?<!--DEMO_FALLBACK_END-->/g, "");
    }
    // Pages without the marker are untouched, so adding this changed nothing about how
    // the existing pages render.
    html = html.replace("<!--META_PIXEL-->", pixelSnippet());
    if (abPairReady()) {
      html = html
        .replace("<!--AB_STANDARD-->", abPlayer(AB_STANDARD_REL))
        .replace("<!--AB_CLONED-->", abPlayer(AB_CLONED_REL));
    } else {
      html = html.replace(/<!--ABPAIR_START-->[\s\S]*?<!--ABPAIR_END-->/g, "");
    }
    res.type("html").send(html);
  });
}

app.get("/", (_req, res, next) => sendDemoAwareHtml(res, next, "index.html"));

// The on-demand recording funnel. Unlinked until the edited cut is in (set the
// iframe src in watch.html), then it becomes the front door for ads and the site.
app.get("/watch", (_req, res, next) => sendDemoAwareHtml(res, next, "watch.html"));

// The demo itself runs on its own service (jra-voice-agents-demo); /demo just talks to it.
// The paid-ad landing page. ONE route: campaigns are told apart by UTMs, not by
// separate pages, so pixel data stays pooled and there is one page to maintain.
// Served through the demo-aware sender so the CTA switches with the DEMO_PUBLIC flag
// alone, with no code change and no deploy on the day Lee flips it.
app.get("/lp", (_req, res, next) => sendDemoAwareHtml(res, next, "lp.html"));

// Through the same sender as everything else now, so the demo pages carry the pixel too.
app.get("/demo", demoGate, (_req, res, next) => sendDemoAwareHtml(res, next, "demo.html"));
app.get("/demo/start", demoGate, (_req, res, next) => sendDemoAwareHtml(res, next, "demo-start.html"));

// Demo lead: the person tested Jenny and came back through /demo/start. This is the
// hottest lead we get. Store it, email Shane + Lee, text Shane + Lee — each step is
// best-effort and independent, so no single failure loses the lead or 500s the caller.
app.post("/api/demo-lead", async (req, res) => {
  const lead = req.body || {};
  const email = normalizeEmail(lead.email);
  if (!String(lead.name || "").trim() || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim();
  const utm = pickUtm(lead);

  let stored = null;
  try {
    stored = upsertLead({
      email, name: lead.name, company: lead.company, cell: lead.cell, fsm: lead.fsm,
      plan: lead.plan, stage: "demo", source: lead.source || "demo-start", utm, ip,
    });
  } catch (e) {
    // Storage failed: log the full lead loudly so it is never silently lost.
    console.error("[demo-lead] STORE FAILED — LEAD:", JSON.stringify(lead), e?.message);
  }

  const forNotify = { ...lead, email, utm, stage: "Completed the demo", source: stored?.source || lead.source };
  sendDemoInterestLead(forNotify).catch((e) => console.error("[demo-lead] email:", e?.message));
  notifyLeadSms(forNotify, "demo").catch((e) => console.error("[demo-lead] sms:", e?.message));

  res.json({ ok: true });
});

// Front capture on the landing page: grab name + email (+ optional number) BEFORE the
// demo, so a paid click that does not finish the demo is still a captured lead.
app.post("/api/lp-lead", async (req, res) => {
  const lead = req.body || {};
  const email = normalizeEmail(lead.email);
  if (!String(lead.name || "").trim() || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim();
  const utm = pickUtm(lead);

  let stored = null;
  try {
    stored = upsertLead({
      email, name: lead.name, cell: lead.cell, stage: "lead",
      source: lead.source || "lp", utm, ip,
    });
  } catch (e) {
    console.error("[lp-lead] STORE FAILED — LEAD:", JSON.stringify(lead), e?.message);
  }

  const forNotify = { ...lead, email, utm, stage: "New lead (landing page)", source: stored?.source || lead.source };
  sendDemoInterestLead(forNotify).catch((e) => console.error("[lp-lead] email:", e?.message));
  notifyLeadSms(forNotify, "lp").catch((e) => console.error("[lp-lead] sms:", e?.message));

  // Front end can send them straight on to the demo.
  res.json({ ok: true, next: "/demo" });
});

// ── Privacy policy ──────────────────────────────────────────────────────────
// Server-rendered (not a static file) so express.static never serves it raw and so
// the mailing address + contact email come from one place. Meta's Business Tools
// Terms require an advertiser running the pixel to give this notice and keep a
// policy reachable, so /watch and /lp link here. Copy stays plain and dash-free.
function privacyPage() {
  const email = esc(PRIVACY_CONTACT_EMAIL);
  const addr = esc(COMPANY_MAILING_ADDRESS);
  const brand = esc(COMPANY_NAME);
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Privacy Policy | ${brand}</title>
<meta name="description" content="How ${brand} and Jenny collect, use, and protect your information, and how you can opt out of advertising and analytics." />
<meta name="robots" content="noindex" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{--navy:#0b1526;--paper:#f6f3ec;--card:#ffffff;--line:#e5e0d4;
        --ink:#141a24;--body:#4a5261;--muted:#8a8272;--org:#ff6320;
        --cond:'Barlow Condensed',sans-serif;--sans:'Barlow',sans-serif}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--sans);background:var(--paper);color:var(--body);line-height:1.65;-webkit-font-smoothing:antialiased}
  .wrap{max-width:760px;margin:0 auto;padding:0 22px}
  .hero{background:var(--navy);color:#b8c4d8}
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:20px 0}
  .brand{display:flex;align-items:center;gap:9px;font-family:var(--cond);font-weight:800;font-size:24px;letter-spacing:.02em;color:#fff;text-decoration:none;text-transform:uppercase}
  .brand .dot{width:12px;height:12px;border-radius:50%;background:var(--org)}
  .htitle{padding:14px 0 34px}
  h1{font-family:var(--cond);font-weight:800;font-size:clamp(34px,6vw,52px);line-height:1;letter-spacing:.01em;color:#fff;text-transform:uppercase;margin-bottom:10px}
  .updated{font-size:14px;color:#8fa0b8}
  article{background:var(--card);border:1px solid var(--line);border-top:5px solid var(--org);border-radius:4px;
          box-shadow:0 18px 40px rgba(20,26,36,.08);padding:34px 34px 30px;margin:-22px auto 40px;position:relative;z-index:2}
  article h2{font-family:var(--cond);font-weight:800;font-size:24px;letter-spacing:.01em;color:var(--ink);text-transform:uppercase;margin:30px 0 8px}
  article h2:first-of-type{margin-top:0}
  article p{font-size:16px;margin-bottom:12px}
  article ul{margin:0 0 12px 20px}
  article li{font-size:16px;margin-bottom:7px}
  article a{color:var(--org);font-weight:600}
  .addr{border-left:3px solid var(--org);background:#fffdf8;padding:12px 16px;margin:10px 0 4px;font-size:16px}
  footer{border-top:1px solid var(--line);margin-top:10px;padding:24px 0 42px;text-align:center;font-size:13px;color:var(--muted)}
  footer a{color:var(--muted)}
  @media(max-width:640px){article{padding:24px 20px}}
</style></head>
<body>
<header class="hero">
  <div class="wrap">
    <div class="topbar">
      <a class="brand" href="/"><span class="dot"></span>Jenny</a>
    </div>
    <div class="htitle">
      <h1>Privacy Policy</h1>
      <div class="updated">Last updated ${PRIVACY_LAST_UPDATED}</div>
    </div>
  </div>
</header>

<div class="wrap">
<article>
  <p>This policy explains what ${brand} collects when you visit this site or its landing pages for Jenny, our AI voice agent, why we collect it, and the choices you have. We keep it plain on purpose. If anything here is unclear, email us at <a href="mailto:${email}">${email}</a> and we will answer.</p>

  <h2>Who we are</h2>
  <p>This site is operated by ${brand}. When we say "we" or "us" we mean ${brand}. Jenny is the name of the AI voice agent we sell to junk removal companies.</p>

  <h2>What we collect and why</h2>
  <p>When you fill out a form on this site, such as the registration form on our class pages or the lead form on our landing pages, we collect the information you type in:</p>
  <ul>
    <li>Your name, so we know who we are talking to.</li>
    <li>Your email address, so we can send you the class link, reminders, and follow up about Jenny.</li>
    <li>Your phone number, when you choose to give it, so we or a member of our team can call or text you about Jenny.</li>
    <li>Anything else you type into a form, such as your company name.</li>
  </ul>
  <p>You do not have to fill out any form to read this site. If you do not submit a form, we do not collect your name, email, or phone number.</p>
  <p>We also collect a small amount of technical information automatically when any visitor loads a page, such as your IP address, the type of device and browser you use, and which pages you view. We use this to keep the site working, to understand which pages people find useful, and to measure our advertising.</p>

  <h2>Advertising and analytics tools we use</h2>
  <p>We run paid ads, and we use tools that help us measure whether those ads work and show them to the right people. These tools set cookies or similar identifiers in your browser and may receive information about your visit, including pages you view and actions such as submitting a form.</p>
  <ul>
    <li><b>Meta (Facebook) pixel and Conversions.</b> We use the Meta pixel from Meta Platforms, Inc. It tells us when a visit or a form submission came from one of our Facebook or Instagram ads, and it lets us show ads to people who visited this site. Meta may also use this data under its own policies. You can read how Meta uses this information in the <a href="https://www.facebook.com/privacy/policy/" rel="noopener" target="_blank">Meta Privacy Policy</a>.</li>
    <li><b>Other advertising and analytics tools.</b> We may use similar measurement or retargeting tools from other advertising and analytics providers for the same purposes.</li>
  </ul>
  <p>We do not sell your personal information.</p>

  <h2>How to opt out</h2>
  <p>You have several ways to limit this:</p>
  <ul>
    <li><b>Do not submit a form.</b> If you never send us a form, we never receive your name, email, or phone number.</li>
    <li><b>Control ads on Meta.</b> You can adjust which ads you see and how your activity is used inside your Facebook and Instagram Ad Settings. See <a href="https://www.facebook.com/help/568137493302217" rel="noopener" target="_blank">Meta's guidance on ad preferences</a>.</li>
    <li><b>Use your browser controls.</b> You can block or delete cookies in your browser settings, and you can turn on your browser's "Do Not Track" or tracking protection features. Blocking cookies may change how parts of the site work.</li>
    <li><b>Industry opt out pages.</b> You can opt out of interest based advertising from many companies at the <a href="https://optout.aboutads.info/" rel="noopener" target="_blank">Digital Advertising Alliance</a> and the <a href="https://optout.networkadvertising.org/" rel="noopener" target="_blank">Network Advertising Initiative</a>.</li>
    <li><b>Stop our emails.</b> Every marketing email we send has an unsubscribe link at the bottom. Click it and we stop.</li>
  </ul>

  <h2>How we share information</h2>
  <p>We share your information only with the service providers that help us run this business, such as our email provider, our scheduling and phone tools, and the advertising and analytics providers named above. They may only use it to provide their service to us. We may also share information if the law requires it.</p>

  <h2>How long we keep it</h2>
  <p>We keep the information you submit for as long as we are in contact with you about Jenny, and after that only as long as we need it for our records or to meet legal requirements. You can ask us to delete your information at any time using the contact details below.</p>

  <h2>Your choices and requests</h2>
  <p>You can ask us to see, correct, or delete the personal information we hold about you, or ask us to stop contacting you. Email <a href="mailto:${email}">${email}</a> or write to the address below and we will take care of it.</p>

  <h2>Children</h2>
  <p>This site is meant for business owners. It is not directed to children, and we do not knowingly collect information from anyone under 18.</p>

  <h2>Changes to this policy</h2>
  <p>If we change this policy we will update the date at the top of this page. Please check back from time to time.</p>

  <h2>How to contact us</h2>
  <p>Questions about your privacy, or requests about your information, can go to:</p>
  <p>Email: <a href="mailto:${email}">${email}</a></p>
  <div class="addr">${brand}<br>${addr}</div>
</article>
</div>

<footer><div class="wrap">${brand} &middot; <a href="/">Home</a></div></footer>
</body></html>`;
}

app.get(["/privacy", "/privacy-policy"], (_req, res) => {
  res.type("html").send(privacyPage());
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Jenny webinar site on http://localhost:${PORT}`);
  console.log(`Data dir: ${DATA_DIR}`);
  startReminderScheduler();
});
