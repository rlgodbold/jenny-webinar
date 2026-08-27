// SMS via Twilio, using the A2P-registered Messaging Service so messages actually
// deliver (an unregistered bare number is carrier-blocked with error 30034).
// No-op (logs only) if creds are not set, so local dev works without them.

const SID = process.env.TWILIO_SMS_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID || "";
const TOKEN = process.env.TWILIO_SMS_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN || "";
const MSG_SVC = process.env.TWILIO_MESSAGING_SERVICE_SID || "";
const FROM = process.env.TWILIO_SMS_FROM_NUMBER || process.env.TWILIO_FROM_NUMBER || "";

export function smsConfigured() {
  return !!(SID && TOKEN && (MSG_SVC || FROM));
}

// Send one SMS. Returns {ok, sid?, status?} or {ok:false, error}.
export async function sendSms(to, text) {
  if (!smsConfigured()) {
    console.log(`[sms] (dry-run, no Twilio creds) -> ${to}: ${String(text).slice(0, 90)}`);
    return { ok: true, dryRun: true };
  }
  const body = new URLSearchParams();
  body.set("To", to);
  if (MSG_SVC) body.set("MessagingServiceSid", MSG_SVC);
  else body.set("From", FROM);
  body.set("Body", text);
  const auth = Buffer.from(`${SID}:${TOKEN}`).toString("base64");
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, sid: j.sid, status: j.status };
    console.error(`[sms] send failed ${to}: http=${res.status} code=${j.code} msg=${j.message}`);
    return { ok: false, error: j.message || `http_${res.status}` };
  } catch (e) {
    console.error(`[sms] error ${to}:`, e.message);
    return { ok: false, error: e.message };
  }
}

// Send the same text to several recipients; never throws (a lead alert must not 500).
export async function sendSmsAll(recipients, text) {
  const list = (Array.isArray(recipients) ? recipients : String(recipients).split(","))
    .map((s) => String(s).trim())
    .filter(Boolean);
  return Promise.all(list.map(async (to) => ({ to, ...(await sendSms(to, text)) })));
}
