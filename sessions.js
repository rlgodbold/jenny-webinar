// ─────────────────────────────────────────────────────────────────────────────
//  WEBINAR SCHEDULE — the recurring series lives here.
//
//  The site AUTO-FEATURES the soonest session that hasn't ended yet and archives
//  the ones that have. Add or remove a line to change the schedule — no weekly
//  edits, no redeploys between sessions.
//
//  All sessions run at 2:30 PM ET. Eastern is -04:00 (EDT) through Nov 1, 2026,
//  then -05:00 (EST) — that offset is baked into each row below. Each session's
//  id is simply its date (YYYY-MM-DD).
// ─────────────────────────────────────────────────────────────────────────────

import { webinar } from "./config.js";

const AT = "T14:30:00"; // 2:30 PM local (Eastern)
const EDT = "-04:00"; // daylight time, through Nov 1 2026
const EST = "-05:00"; // standard time, Nov 2 2026 onward

// [date, offset]. Weekly on THURSDAYS at 2:30 ET. 7/30 was pushed to 8/6 to
// present the newest Jenny release, then every Thursday. Skips holiday weeks:
// 11/26 Thanksgiving, 12/24 + 12/31 Christmas/New Year.
const DATES = [
  ["2026-07-16", EDT], // ran
  ["2026-08-06", EDT], // next (7/30 moved here — big Jenny update)
  ["2026-08-13", EDT],
  // 8/20 cancelled: Lee recording an episode of The Future of Junk (Greg Workman, Load Up).
  // 8/27 cancelled: no live class this week; sent the recording + voice-clone update instead.
  // Removing a date stops its 1-hour reminders and stops the site advertising a class
  // that is not happening; registrants keep their place on the list.
  // SERIES ENDED (Lee, 2026-08-28): no more live webinars, the recorded class plays on
  // demand at registration. The 15 remaining Thursdays through 12/17 were removed here
  // rather than left to expire, because each one would have armed its own 24 hour
  // reminder and told registrants to attend a class that will not happen. Zero
  // registrants held any of those dates, verified before removal.
  // PAST dates stay. Subscriber records carry sessions[] and reminded{} keyed by id, and
  // the attendees view and CSV export filter by id, so deleting a past date orphans the
  // records that reference it.
];

export const sessions = DATES.map(([date, off]) => ({
  id: date,
  startsAtISO: `${date}${AT}${off}`,
  zoomJoinUrl: webinar.zoomJoinUrl, // one reusable link for the whole series
}));

export const DURATION_MS = (webinar.durationMinutes || 60) * 60 * 1000;

export function sessionEnd(s) {
  return +new Date(s.startsAtISO) + DURATION_MS;
}

// The featured session = the soonest one that hasn't ended yet (null once the
// series is over).
export function currentSession(now = Date.now()) {
  return sessions.find((s) => sessionEnd(s) > now) || null;
}

// Every session still open for registration (not yet ended), soonest first.
export function upcomingSessions(now = Date.now()) {
  return sessions.filter((s) => sessionEnd(s) > now);
}

export function getSession(id) {
  return sessions.find((s) => s.id === id) || null;
}

// The date portion of a stored ISO start is the session id.
export function idFromISO(iso) {
  return String(iso || "").slice(0, 10) || null;
}

// Formatted date/time for a session (or a raw ISO). Always Eastern.
// e.g. { dateStr:"Tuesday, July 14", timeStr:"2:30 PM", full:"… · 2:30 PM ET" }
export function formatWhen(isoOrSession) {
  const iso = typeof isoOrSession === "string" ? isoOrSession : isoOrSession?.startsAtISO;
  if (!iso) return { dateStr: "", timeStr: "", full: "" };
  const start = new Date(iso);
  const dateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York",
  }).format(start);
  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
  }).format(start);
  return { dateStr, timeStr, full: `${dateStr} · ${timeStr} ${webinar.timezoneLabel}` };
}
