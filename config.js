// ─────────────────────────────────────────────────────────────────────────────
//  WEBINAR CONFIG — this is the ONE file you edit each week.
//  Change the date/time and (if it rotates) the Zoom join link, redeploy. Done.
// ─────────────────────────────────────────────────────────────────────────────

export const webinar = {
  // Display title + the promise (used in headline + <title> + emails)
  title: "The AI Voice Agent Masterclass",
  promise:
    "How junk removal owners are using an AI voice agent to recapture lost revenue — and finally get off the phone.",

  // ── The next session ──────────────────────────────────────────────────────
  // Set the START time in ISO 8601 WITH the timezone offset.
  // Eastern is -04:00 during daylight saving (Mar–Nov), -05:00 in winter.
  // July 7, 2026 (Tue) @ 2:30 PM ET (EDT) -> -04:00  [time tentative — may push back; notify registrants if so]
  startsAtISO: "2026-07-07T14:30:00-04:00",
  durationMinutes: 60,
  timezoneLabel: "ET", // shown to the user next to the time

  // ── Zoom ──────────────────────────────────────────────────────────────────
  // The join link registrants receive (in the success screen + confirmation email).
  // Paste your Zoom Meeting/Webinar join URL here. Leave "" to hide the link
  // and just promise it by email.
  zoomJoinUrl: "https://us02web.zoom.us/j/89089217320",

  // ── Host / brand ──────────────────────────────────────────────────────────
  brandName: "Jenny",
  hostName: "Lee Godbold",
  hostTitle: "Founder, Junk Removal Authority",
  contactEmail: "lee@junkra.com",
};

// Helper: nicely formatted date/time strings for the page + emails.
export function formatWebinarWhen() {
  const start = new Date(webinar.startsAtISO);
  const dateOpts = {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  };
  const timeOpts = {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  };
  const dateStr = new Intl.DateTimeFormat("en-US", dateOpts).format(start);
  const timeStr = new Intl.DateTimeFormat("en-US", timeOpts).format(start);
  return {
    dateStr, // "Thursday, July 2"
    timeStr, // "2:30 PM"
    full: `${dateStr} · ${timeStr} ${webinar.timezoneLabel}`,
  };
}
