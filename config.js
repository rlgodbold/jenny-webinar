// ─────────────────────────────────────────────────────────────────────────────
//  WEBINAR CONFIG — global settings shared by EVERY session in the series.
//  The recurring SCHEDULE (dates/times) lives in sessions.js. You rarely touch
//  this file — only to change branding, the standard time zone, or the Zoom link.
// ─────────────────────────────────────────────────────────────────────────────

export const webinar = {
  // Display title + the promise (used in headline + <title> + emails)
  title: "The AI Voice Agent Masterclass",
  promise:
    "How junk removal owners are using an AI voice agent to recapture lost revenue — and finally get off the phone.",

  durationMinutes: 60,
  timezoneLabel: "ET", // shown to the user next to the time

  // ── Zoom ──────────────────────────────────────────────────────────────────
  // ONE reusable join link for the whole recurring series (a Zoom recurring /
  // "No Fixed Time" meeting works perfectly — same URL every week). Registrants
  // receive it in the success screen + confirmation + reminder emails. A session
  // in sessions.js may override it, but normally they all share this one.
  zoomJoinUrl: "https://us02web.zoom.us/j/89089217320",

  // ── Host / brand ──────────────────────────────────────────────────────────
  brandName: "Jenny",
  hostName: "Lee Godbold",
  hostTitle: "Founder, Junk Removal Authority",
  contactEmail: "lee@junkra.com",
};
