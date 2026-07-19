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

// [date, offset]. Weekly on THURSDAYS at 2:30 ET. 7/16 this week, next 7/30
// (7/23 skipped), then every Thursday. Skips holiday weeks: 11/26 Thanksgiving,
// 12/24 + 12/31 Christmas/New Year.
const DATES = [
  ["2026-07-16", EDT], // this week (Thursday)
  ["2026-07-30", EDT], // then weekly Thursdays (7/23 skipped)
  ["2026-08-06", EDT], ["2026-08-13", EDT], ["2026-08-20", EDT], ["2026-08-27", EDT],
  ["2026-09-03", EDT], ["2026-09-10", EDT], ["2026-09-17", EDT], ["2026-09-24", EDT],
  ["2026-10-01", EDT], ["2026-10-08", EDT], ["2026-10-15", EDT], ["2026-10-22", EDT], ["2026-10-29", EDT],
  ["2026-11-05", EST], ["2026-11-12", EST], ["2026-11-19", EST], // skip 11/26 Thanksgiving
  ["2026-12-03", EST], ["2026-12-10", EST], ["2026-12-17", EST], // skip 12/24 + 12/31
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
