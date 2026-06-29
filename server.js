import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { webinar, formatWebinarWhen } from "./config.js";
import {
  sendConfirmationEmail,
  sendMarketingEmail,
  hasPostalAddress,
} from "./email.js";
import {
  upsertSubscriber,
  unsubscribe,
  resubscribe,
  verifyUnsubToken,
  activeSubscribers,
  listSubscribers,
  stats,
  logCampaign,
  normalizeEmail,
} from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
app.set("trust proxy", true);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const REG_FILE = path.join(DATA_DIR, "registrations.ndjson");

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

// ── Register ────────────────────────────────────────────────────────────────
app.post("/api/register", async (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 120);
  const email = normalizeEmail(req.body?.email).slice(0, 200);

  if (!name) return res.status(400).json({ error: "Please enter your name." });
  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: "Please enter a valid email." });

  const ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim();
  const source = String(req.body?.source || "").slice(0, 80);

  const record = {
    name,
    email,
    sessionISO: webinar.startsAtISO,
    registeredAt: new Date().toISOString(),
    source,
    ip,
  };

  try {
    fs.appendFileSync(REG_FILE, JSON.stringify(record) + "\n");
    upsertSubscriber({ email, name, source, ip }); // consent + list state
  } catch (err) {
    console.error("[register] write failed:", err.message);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }

  sendConfirmationEmail({ name, email }).catch((e) =>
    console.error("[register] email error:", e?.message)
  );

  return res.json({
    ok: true,
    zoomJoinUrl: webinar.zoomJoinUrl || null,
    when: formatWebinarWhen().full,
  });
});

app.get("/api/webinar", (_req, res) => {
  res.json({
    title: webinar.title,
    promise: webinar.promise,
    startsAtISO: webinar.startsAtISO,
    when: formatWebinarWhen(),
    timezoneLabel: webinar.timezoneLabel,
    brandName: webinar.brandName,
    hostName: webinar.hostName,
    hostTitle: webinar.hostTitle,
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
  res.json({ ...stats(), registrations: readRegistrations().length, canSend: hasPostalAddress() });
});

app.get("/api/admin/subscribers", (req, res) => {
  if (!checkAdmin(req, res)) return;
  res.json({ subscribers: listSubscribers() });
});

app.get("/api/admin/export.csv", (req, res) => {
  if (!checkAdmin(req, res)) return;
  const rows = listSubscribers();
  const cols = ["name", "email", "status", "subscribedAt", "unsubscribedAt", "source"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => q(r[c])).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="subscribers.csv"');
  res.send(csv);
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

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Jenny webinar site on http://localhost:${PORT}`);
  console.log(`Data dir: ${DATA_DIR}`);
});
