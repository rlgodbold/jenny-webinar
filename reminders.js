// In-process reminder scheduler. Every few minutes it checks the current webinar
// session and sends 24h / 1h reminder emails to registrants who haven't gotten
// them yet. Idempotent (flags persist on disk), so restarts never double-send.

import { webinar } from "./config.js";
import { activeForSession, markReminderSent } from "./store.js";
import { sendReminderEmail } from "./email.js";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const TICK = 5 * MIN;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let running = false;

export async function runReminderTick() {
  if (running) return;
  running = true;
  try {
    const start = +new Date(webinar.startsAtISO);
    const now = Date.now();
    if (now >= start) return; // session started or passed

    // 24h email window: from 24h out until 3h out (so last-minute signups don't
    // get a "tomorrow" email an hour before — they just get the 1h reminder).
    const send24 = now >= start - 24 * HOUR && now <= start - 3 * HOUR;
    // 1h email window: from 75 min out until start.
    const send1 = now >= start - 75 * MIN && now <= start;
    if (!send24 && !send1) return;

    const subs = activeForSession(webinar.startsAtISO);
    let sent = 0;
    for (const s of subs) {
      if (send24 && !s.r24) {
        const r = await sendReminderEmail({ name: s.name, email: s.email, kind: "24h" });
        if (r?.ok !== false) markReminderSent(s.email, "r24");
        sent++;
        await sleep(150);
      }
      if (send1 && !s.r1) {
        const r = await sendReminderEmail({ name: s.name, email: s.email, kind: "1h" });
        if (r?.ok !== false) markReminderSent(s.email, "r1");
        sent++;
        await sleep(150);
      }
    }
    if (sent) console.log(`[reminders] sent ${sent} reminder email(s)`);
  } catch (e) {
    console.error("[reminders] tick error:", e.message);
  } finally {
    running = false;
  }
}

export function startReminderScheduler() {
  runReminderTick();
  setInterval(runReminderTick, TICK);
  console.log("[reminders] scheduler started (every 5 min)");
}
