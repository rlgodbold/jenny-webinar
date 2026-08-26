# Patch 0001: capture full ad attribution on /watch signup

Written by the marketing agent. NOT applied. The working tree is clean.
Apply with: `git apply docs/patches/0001-watch-utm-capture.patch`

## Why

`/watch` currently records only `utm_source` into the subscriber record, as
`watch-recording:fb`. When paid traffic starts, that tells us Facebook sent a
signup and nothing about WHICH AD produced it. Creative testing is the entire
job at a $100/day budget, so testing blind wastes most of the spend.

This is a hard pre-launch gate. It has to land before the first ad runs, because
attribution gathered after the fact does not exist.

## What it does

Packs source, campaign, and content into the single `source` string the server
already stores and exports:

    watch-recording:fb/hiringtrap/C1-A

## Review notes

- **No server change and no schema change.** `server.js` line 68 caps `source` at
  80 chars and line 259 exports it as a CSV column. Both keep working untouched.
- **Length is safe under that cap.** Prefix is 16 chars, each of the three tags is
  clamped to 20, plus two separators. Worst case 78.
- **Input is sanitized** to `[A-Za-z0-9._-]` before it goes in the field, so a
  junk or hostile query string cannot inject anything into the stored value.
- **Backward compatible.** Existing `watch-recording:fb` rows still parse, and a
  visit with no UTMs still writes plain `watch-recording` exactly as it does today.
- Trailing empty segments are trimmed, so `?utm_source=fb` alone still yields
  `watch-recording:fb` rather than `watch-recording:fb//`.

## Test

1. `/watch` with no query string, sign up, confirm source is `watch-recording`.
2. `/watch?utm_source=fb`, confirm `watch-recording:fb`.
3. `/watch?utm_source=fb&utm_campaign=hiringtrap&utm_content=C1-A`, confirm
   `watch-recording:fb/hiringtrap/C1-A`.
4. Check the admin CSV export shows the full string in the source column.
