// Email sending via Resend (same provider the Jenny product stack uses).
// Two kinds of mail:
//   - transactional (registration confirmation, reminders) — tied to an action the
//     person took; always allowed, but still carries a List-Unsubscribe header.
//   - marketing (broadcasts) — only to subscribed addresses, and MUST include a
//     physical postal address + a working unsubscribe link (CAN-SPAM).
// No-op (logs only) if RESEND_API_KEY isn't set, so local dev works without creds.

import { webinar, formatWebinarWhen } from "./config.js";
import { unsubToken } from "./store.js";

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

function marketingFooter(email) {
  return `
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 14px" />
  <p style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8;margin:0">
    You're receiving this because you registered for a ${COMPANY_NAME} / Jenny webinar.<br>
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
export async function sendConfirmationEmail({ name, email }) {
  const when = formatWebinarWhen();
  const firstName = (name || "").trim().split(/\s+/)[0] || "there";
  const joinLine = webinar.zoomJoinUrl
    ? `<p style="margin:0 0 16px"><a href="${webinar.zoomJoinUrl}" style="background:#16a34a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600">Join the webinar</a></p>
       <p style="margin:0 0 16px;color:#475569;font-size:14px">Or use this link: <a href="${webinar.zoomJoinUrl}">${webinar.zoomJoinUrl}</a></p>`
    : `<p style="margin:0 0 16px;color:#475569">You'll get the Zoom join link by email before we go live.</p>`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <p style="margin:0 0 16px">Hey ${firstName},</p>
    <p style="margin:0 0 16px">You're in. Here are the details for <strong>${webinar.title}</strong>:</p>
    <table style="margin:0 0 20px;font-size:16px"><tr><td style="padding:2px 12px 2px 0;color:#64748b">When</td><td><strong>${when.full}</strong></td></tr></table>
    ${joinLine}
    <p style="margin:0 0 16px">We'll cover how an AI voice agent answers every call, quotes jobs, and books straight into your CRM — so you stop losing after-hours and overflow calls, and get your evenings back.</p>
    <p style="margin:0 0 4px">See you there,</p>
    <p style="margin:0 0 16px"><strong>${webinar.hostName}</strong><br>${webinar.hostTitle}</p>
    ${marketingFooter(email)}
  </div>`;

  return send({
    to: email,
    subject: `You're registered: ${webinar.title} — ${when.dateStr}`,
    html,
    headers: listUnsubHeaders(email),
  });
}

// ── Marketing: a broadcast to one recipient (caller iterates the list) ───────
export async function sendMarketingEmail({ name, email, subject, bodyHtml }) {
  const firstName = (name || "").trim().split(/\s+/)[0] || "there";
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;font-size:16px;line-height:1.6">
    <p style="margin:0 0 16px">Hi ${firstName},</p>
    ${bodyHtml}
    ${marketingFooter(email)}
  </div>`;
  return send({ to: email, subject, html, headers: listUnsubHeaders(email) });
}

// ── Reminders (24h + 1h before the webinar) ─────────────────────────────────
export async function sendReminderEmail({ name, email, kind }) {
  const when = formatWebinarWhen();
  const firstName = (name || "").trim().split(/\s+/)[0] || "there";
  const join = webinar.zoomJoinUrl;
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
      <p style="margin:0 0 16px">We go live in about an hour — the <strong>AI Voice Agent Masterclass</strong> starts at <strong>${when.timeStr} ET</strong> today.</p>
      ${button("Join the webinar →")}
      <p style="margin:16px 0">Grab a coffee and a notepad. You'll hear Jenny handle real calls — quotes, specialty items, and the everyday questions junk removal owners get — see the dashboard live, and get the limited discounted offer at the end.</p>
      <p style="margin:0 0 4px">See you soon,</p>
      <p style="margin:0 0 8px"><strong>Lee Godbold</strong><br>Founder, Junk Removal Authority</p>
      ${marketingFooter(email)}
    </div>`;
  } else {
    subject = `Tomorrow at ${when.timeStr} ET — your seat's saved 🎟️`;
    html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;font-size:16px;line-height:1.6">
      <p style="margin:0 0 16px">Hi ${firstName},</p>
      <p style="margin:0 0 14px">Quick reminder — the <strong>AI Voice Agent Masterclass for junk removal owners</strong> is <strong>tomorrow</strong>:</p>
      <p style="margin:0 0 4px"><strong>📅 ${when.full}</strong></p>
      <p style="margin:0 0 4px">📍 Live on Zoom</p>
      ${button("Join the webinar →")}
      <p style="margin:14px 0 8px">Here's what we'll get into:</p>
      <ul style="padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:7px"><strong>Real call recordings</strong> — hear Jenny handle the calls you field every day: price quotes, hot tubs, hazmat, bed bugs, and the questions owners get asked most</li>
        <li style="margin-bottom:7px">The features that make an AI voice agent actually work for the trades</li>
        <li style="margin-bottom:7px">How it plugs into your CRM / field service software (Workiz, Housecall Pro, and more)</li>
        <li style="margin-bottom:7px">A look at the <strong>live dashboard</strong> and the stats you'll get</li>
        <li style="margin-bottom:7px">A <strong>limited, discounted offer</strong> to set Jenny up in your own business — live attendees only</li>
      </ul>
      <p style="margin:0 0 16px">Block off the hour, and bring the calls you handle day to day — I'll show you how Jenny works through them.</p>
      <p style="margin:0 0 4px">See you tomorrow,</p>
      <p style="margin:0 0 8px"><strong>Lee Godbold</strong><br>Founder, Junk Removal Authority</p>
      ${marketingFooter(email)}
    </div>`;
  }
  return send({ to: email, subject, html, headers: listUnsubHeaders(email) });
}

// ── Internal: new-attendee notification to the team ─────────────────────────
export async function sendAttendeeNotification({ name, email, count, recipients, attendeesUrl }) {
  const subject = `New webinar signup: ${name || email}${count ? ` (#${count})` : ""}`;
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a;font-size:15px;line-height:1.6">
    <p style="margin:0 0 14px">New registration for the <strong>AI Voice Agent Masterclass</strong>:</p>
    <table style="font-size:15px;margin:0 0 16px">
      <tr><td style="color:#64748b;padding:2px 16px 2px 0">Name</td><td><strong>${name || "—"}</strong></td></tr>
      <tr><td style="color:#64748b;padding:2px 16px 2px 0">Email</td><td>${email}</td></tr>
    </table>
    <p style="margin:0 0 18px"><strong>${count}</strong> registered so far.</p>
    <p style="margin:0"><a href="${attendeesUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:11px 20px;border-radius:9px;display:inline-block;font-weight:600">View all attendees →</a></p>
  </div>`;
  // Internal ops email (no marketing footer / no unsubscribe — not a marketing send).
  return send({ to: recipients, subject, html });
}

export const hasPostalAddress = () => Boolean(COMPANY_POSTAL_ADDRESS);
