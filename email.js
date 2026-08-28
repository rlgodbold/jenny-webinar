// Email sending via Resend (same provider the Jenny product stack uses).
// Two kinds of mail:
//   - transactional (registration confirmation, reminders) — tied to an action the
//     person took; always allowed, but still carries a List-Unsubscribe header.
//   - marketing (broadcasts) — only to subscribed addresses, and MUST include a
//     physical postal address + a working unsubscribe link (CAN-SPAM).
// No-op (logs only) if RESEND_API_KEY isn't set, so local dev works without creds.

import { webinar } from "./config.js";
import { formatWhen, currentSession } from "./sessions.js";
import { unsubToken } from "./store.js";

// First name for a friendly greeting; never generic if we have a name.
const firstNameOf = (name) => (String(name || "").trim().split(/\s+/)[0] || "there");

// Escape user-supplied values before they land in an HTML email body.
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL =
  process.env.NOTIFICATION_FROM_EMAIL ||
  "Lee Godbold <leegodbold@mailer.junkra.com>";
const BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const COMPANY_NAME = process.env.COMPANY_NAME || "Junk Removal Authority";
const COMPANY_POSTAL_ADDRESS = process.env.COMPANY_POSTAL_ADDRESS || "";

export function unsubscribeUrl(email) {
  const e = encodeURIComponent(email);
  const t = unsubToken(email);
  return `${BASE_URL}/unsubscribe?e=${e}&t=${t}`;
}

// RFC 8058 one-click headers — surfaces a native "Unsubscribe" button in Gmail/Apple.
function listUnsubHeaders(email) {
  return {
    "List-Unsubscribe": `<${unsubscribeUrl(email)}>, <mailto:${webinar.contactEmail}?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

function marketingFooter(email, reason = `You're receiving this because you registered for a ${COMPANY_NAME} / Jenny webinar.`) {
  return `
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 14px" />
  <p style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8;margin:0">
    ${reason}<br>
    ${COMPANY_NAME}${COMPANY_POSTAL_ADDRESS ? " · " + COMPANY_POSTAL_ADDRESS : ""}<br>
    <a href="${unsubscribeUrl(email)}" style="color:#64748b">Unsubscribe</a> from these emails.
  </p>`;
}

async function send({ to, subject, html, headers }) {
  if (!RESEND_API_KEY) {
    console.log(`[email] (dry-run, no RESEND_API_KEY) -> ${to}: ${subject}`);
    return { ok: true, dryRun: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        reply_to: webinar.contactEmail,
        subject,
        html,
        headers,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend failed ${res.status}: ${body}`);
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send error:", err.message);
    return { ok: false, error: err.message };
  }
}

// ── Transactional: registration confirmation ────────────────────────────────
// Which door did this lead come through? The server already packs it into `source`:
// `lp:<utms>` from the ad landing page, `watch-recording:<utms>` from the class page,
// and anything else (or nothing) is a plain home-page registration for a live class.
//
// This branch exists because the webinar email was going to EVERYONE, so a paid lead who
// asked to hear an AI answer a phone got a Zoom invitation to a class instead. It is also
// the thing that stops being merely wrong and starts being impossible once the Thursday
// series ends, since the email would name a date that will never happen.
export const doorOf = (source = "") => {
  const v = String(source || "");
  if (v === "lp" || v.startsWith("lp:")) return "lp";
  if (v.startsWith("watch-recording")) return "watch";
  return "webinar";
};

const shell = (firstName, bodyHtml, email, reason) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;font-size:16px;line-height:1.6">
    <p style="margin:0 0 16px">Hey ${firstName},</p>
    ${bodyHtml}
    <p style="margin:0 0 4px">Lee Godbold</p>
    <p style="margin:0 0 16px">Junk Removal Authority</p>
    ${marketingFooter(email, reason)}
  </div>`;

const btn = (href, label) =>
  `<p style="margin:0 0 16px"><a href="${href}" style="background:#16a34a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600">${label}</a></p>`;

// EMAIL A: the ad landing page. No date, no Zoom, nothing that expires.
async function sendDemoConfirmation({ name, email }) {
  const base = (process.env.PUBLIC_BASE_URL || "https://jennycallagent.com").replace(/\/$/, "");
  const body = `
    <p style="margin:0 0 16px">You asked to hear what an AI sounds like answering a junk removal phone. Here is how it works.</p>
    <p style="margin:0 0 16px">You tell her your company name, your city and roughly what you charge. A couple of minutes later you call a number and she answers as your company, quoting your prices, in your towns.</p>
    <p style="margin:0 0 16px">Run the calls you actually get. The three bedroom cleanout, the couch on the curb, the price shopper. Then throw a couple of the odd ones at her.</p>
    ${btn(base + "/demo", "Start the demo")}`;
  return send({
    to: email,
    subject: "Hear her answer your phone",
    html: shell(firstNameOf(name), body, email, `You're receiving this because you asked to hear Jenny answer the phone at ${COMPANY_NAME}.`),
    headers: listUnsubHeaders(email),
  });
}

// EMAIL B: the class, evergreen. Also no date and no Zoom, because it is a recording now.
async function sendClassConfirmation({ name, email }) {
  const base = (process.env.PUBLIC_BASE_URL || "https://jennycallagent.com").replace(/\/$/, "");
  const body = `
    <p style="margin:0 0 16px">Here is the AI Voice Agent Masterclass. Watch it whenever you have the time, all the way through or in pieces.</p>
    ${btn(base + "/watch", "Watch the class")}
    <p style="margin:0 0 16px">When you are done, the thing worth doing next is hearing her answer the phone as your own company. That takes about a minute.</p>`;
  return send({
    to: email,
    subject: "Your masterclass is ready",
    html: shell(firstNameOf(name), body, email, `You're receiving this because you asked for the AI Voice Agent Masterclass from ${COMPANY_NAME}.`),
    headers: listUnsubHeaders(email),
  });
}

export async function sendConfirmationEmail({ name, email, session, source = "" }) {
  const door = doorOf(source);
  if (door === "lp") return sendDemoConfirmation({ name, email });
  if (door === "watch") return sendClassConfirmation({ name, email });

  // NO LIVE SESSION MEANS NO WEBINAR EMAIL. With the series ended, currentSession() is
  // null, and the webinar template would send "You're registered: The AI Voice Agent
  // Masterclass, " with an empty date and a green Join the webinar button pointing at a
  // Zoom room that will never host anything. Verified by sending it in that state.
  //
  // A home page registrant under the recorded model is registering to watch the
  // recording, which is exactly what the class email already says, so this routes to
  // reviewed live copy rather than inventing any. The webinar template stays for the day
  // a real scheduled session exists again.
  session = session || currentSession();
  if (!session) return sendClassConfirmation({ name, email });
  const when = formatWhen(session);
  const firstName = firstNameOf(name);
  const joinUrl = session?.zoomJoinUrl || webinar.zoomJoinUrl;
  const joinLine = joinUrl
    ? `<p style="margin:0 0 16px"><a href="${joinUrl}" style="background:#16a34a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600">Join the webinar</a></p>
       <p style="margin:0 0 16px;color:#475569;font-size:14px">Or use this link: <a href="${joinUrl}">${joinUrl}</a></p>`
    : `<p style="margin:0 0 16px;color:#475569">You'll get the Zoom join link by email before we go live.</p>`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <p style="margin:0 0 16px">Hey ${firstName},</p>
    <p style="margin:0 0 16px">You're in. Here are the details for <strong>${webinar.title}</strong>:</p>
    <table style="margin:0 0 20px;font-size:16px"><tr><td style="padding:2px 12px 2px 0;color:#64748b">When</td><td><strong>${when.full}</strong></td></tr></table>
    ${joinLine}
    <p style="margin:0 0 16px">We'll cover how an AI voice agent answers every call, quotes jobs, and books straight into your CRM, so you stop losing after-hours and overflow calls, and get your evenings back.</p>
    <p style="margin:0 0 4px">See you there,</p>
    <p style="margin:0 0 16px"><strong>${webinar.hostName}</strong><br>${webinar.hostTitle}</p>
    ${marketingFooter(email)}
  </div>`;

  return send({
    to: email,
    subject: `You're registered: ${webinar.title}, ${when.dateStr}`,
    html,
    headers: listUnsubHeaders(email),
  });
}

// ── Marketing: a broadcast to one recipient (caller iterates the list) ───────
export async function sendMarketingEmail({ name, email, subject, bodyHtml }) {
  const firstName = firstNameOf(name);
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;font-size:16px;line-height:1.6">
    <p style="margin:0 0 16px">Hi ${firstName},</p>
    ${bodyHtml}
    ${marketingFooter(email)}
  </div>`;
  return send({ to: email, subject, html, headers: listUnsubHeaders(email) });
}

// ── Reminders (24h + 1h before the webinar) ─────────────────────────────────
export async function sendReminderEmail({ name, email, kind, session }) {
  session = session || currentSession();
  const when = formatWhen(session);
  const firstName = firstNameOf(name);
  const join = session?.zoomJoinUrl || webinar.zoomJoinUrl;
  const button = (label) =>
    join
      ? `<p style="margin:18px 0"><a href="${join}" style="background:#2563eb;color:#fff;text-decoration:none;padding:13px 24px;border-radius:10px;display:inline-block;font-weight:600">${label}</a></p>`
      : "";

  let subject, html;
  if (kind === "1h") {
    subject = `We're live in 1 hour 🔴`;
    html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;font-size:16px;line-height:1.6">
      <p style="margin:0 0 16px">Hi ${firstName},</p>
      <p style="margin:0 0 16px">We go live in about an hour. The <strong>AI Voice Agent Masterclass</strong> starts at <strong>${when.timeStr} ET</strong> today.</p>
      ${button("Join the webinar →")}
      <p style="margin:16px 0">Grab a coffee and a notepad. You'll hear Jenny handle real calls, quotes, specialty items, and the everyday questions junk removal owners get, see the dashboard live, and get the limited discounted offer at the end.</p>
      <p style="margin:0 0 4px">See you soon,</p>
      <p style="margin:0 0 8px"><strong>Lee Godbold</strong><br>Founder, Junk Removal Authority</p>
      ${marketingFooter(email)}
    </div>`;
  } else {
    subject = `Tomorrow at ${when.timeStr} ET, your seat's saved 🎟️`;
    html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;font-size:16px;line-height:1.6">
      <p style="margin:0 0 16px">Hi ${firstName},</p>
      <p style="margin:0 0 14px">Quick reminder, the <strong>AI Voice Agent Masterclass for junk removal owners</strong> is <strong>tomorrow</strong>:</p>
      <p style="margin:0 0 4px"><strong>📅 ${when.full}</strong></p>
      <p style="margin:0 0 4px">📍 Live on Zoom</p>
      ${button("Join the webinar →")}
      <p style="margin:14px 0 8px">Here's what we'll get into:</p>
      <ul style="padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:7px"><strong>Real call recordings</strong>: hear Jenny handle the calls you field every day: price quotes, hot tubs, hazmat, bed bugs, and the questions owners get asked most</li>
        <li style="margin-bottom:7px">The features that make an AI voice agent actually work for the trades</li>
        <li style="margin-bottom:7px">How it plugs into your CRM / field service software (Workiz, Housecall Pro, and more)</li>
        <li style="margin-bottom:7px">A look at the <strong>live dashboard</strong> and the stats you'll get</li>
        <li style="margin-bottom:7px">A <strong>limited, discounted offer</strong> to set Jenny up in your own business, live attendees only</li>
      </ul>
      <p style="margin:0 0 16px">Block off the hour, and bring the calls you handle day to day. I'll show you how Jenny works through them.</p>
      <p style="margin:0 0 4px">See you tomorrow,</p>
      <p style="margin:0 0 8px"><strong>Lee Godbold</strong><br>Founder, Junk Removal Authority</p>
      ${marketingFooter(email)}
    </div>`;
  }
  return send({ to: email, subject, html, headers: listUnsubHeaders(email) });
}

// ── Internal: new-attendee notification to the team ─────────────────────────
export async function sendAttendeeNotification({ name, email, count, recipients, attendeesUrl, when }) {
  const subject = `New webinar signup: ${name || email}${count ? ` (#${count})` : ""}`;
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a;font-size:15px;line-height:1.6">
    <p style="margin:0 0 14px">New registration for the <strong>AI Voice Agent Masterclass</strong>:</p>
    <table style="font-size:15px;margin:0 0 16px">
      <tr><td style="color:#64748b;padding:2px 16px 2px 0">Name</td><td><strong>${name || "—"}</strong></td></tr>
      <tr><td style="color:#64748b;padding:2px 16px 2px 0">Email</td><td>${email}</td></tr>
      ${when ? `<tr><td style="color:#64748b;padding:2px 16px 2px 0">Session</td><td><strong>${when}</strong></td></tr>` : ""}
    </table>
    <p style="margin:0 0 18px"><strong>${count}</strong> registered so far.</p>
    <p style="margin:0"><a href="${attendeesUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:11px 20px;border-radius:9px;display:inline-block;font-weight:600">View all attendees →</a></p>
  </div>`;
  // Internal ops email (no marketing footer / no unsubscribe — not a marketing send).
  return send({ to: recipients, subject, html });
}

export const hasPostalAddress = () => Boolean(COMPANY_POSTAL_ADDRESS);


/**
 * THE DEMO INTEREST LEAD — sent to Lee when someone who tested Caroline wants her for real.
 * Deliberately plain: it is a work item, not a marketing email, and it carries everything Lee
 * needs to make the call without opening anything else. The FSM answer sits near the top
 * because it is the one thing that can disqualify an otherwise perfect lead.
 */
// Who gets the sales lead alerts (Shane + Lee by default). Comma-separated env override.
const LEAD_NOTIFY_EMAILS = (
  process.env.LEAD_NOTIFY_EMAILS || process.env.DEMO_LEAD_EMAIL || "shane@junkra.com,lee@junkra.com"
).split(",").map((s) => s.trim()).filter(Boolean);

export async function sendDemoInterestLead(lead = {}) {
  const utm = lead.utm || {};
  const utmStr = Object.entries(utm).map(([k, v]) => `${k}=${v}`).join("  ") || "(none)";
  const rows = [
    ["Stage", lead.stage || "Lead"],
    ["Name", lead.name],
    ["Company", lead.company],
    ["Phone", lead.cell],
    ["Email", lead.email],
    ["Field service software", lead.fsm || "(not answered)"],
    ["Plan they picked", lead.plan || "(not answered)"],
    ["Source", lead.source || "(unknown)"],
    ["Campaign (UTM)", utmStr],
  ];
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.7;color:#0f172a">
    <h2 style="margin:0 0 12px;font-size:18px">Jenny lead — ${esc(lead.stage || "new lead")}</h2>
    <table style="border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#64748b">${k}</td><td><b>${esc(String(v || "—"))}</b></td></tr>`)
      .join("")}</table>
    <p style="margin-top:16px;color:#64748b;font-size:13px">Follow up soon while they are warm. This lead is stored in the leads list.</p>
  </div>`;
  return send({
    to: LEAD_NOTIFY_EMAILS,
    subject: `Jenny lead: ${lead.company || lead.name || "someone"}${lead.stage ? " — " + lead.stage : ""}`,
    html,
  });
}
