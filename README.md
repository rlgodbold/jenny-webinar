# Jenny — AI Voice Agent Masterclass (webinar signup)

Single-page registration site for the weekly live masterclass. Captures **name + email**,
persists every signup to an append-only list, sends a confirmation email (Resend), and
shows the Zoom join details.

## Run locally
```bash
npm install
npm start          # http://localhost:8080
```
Registrations are written to `./data/registrations.ndjson` (gitignored). Without
`RESEND_API_KEY` set, the confirmation email is a no-op (logged, not sent) so dev works offline.

## Each week (the only edit you need)
Open **`config.js`** and change:
- `startsAtISO` — next session start, with the ET offset (`-04:00` summer / `-05:00` winter)
- `zoomJoinUrl` — the Zoom join link (only if it changes per session)

Commit + push → Render redeploys. The headline date, countdown, and emails all read from this.

## Where signups go
- File: `data/registrations.ndjson` (one JSON object per line). On Render this lives on the
  mounted disk at `/var/data`.
- **Export a CSV:** `GET /api/admin/export.csv?token=YOUR_ADMIN_TOKEN`
- **Count:** `GET /api/admin/count?token=YOUR_ADMIN_TOKEN`
- Local CSV dump: `npm run export`

Set `ADMIN_TOKEN` to a long random string in prod — the export is disabled until you do.

## Deploy (Render)
`render.yaml` is a blueprint. Push this repo to GitHub, create a Render Blueprint from it,
then in the Environment tab set:
- `RESEND_API_KEY` — same key as the Jenny product stack
- `NOTIFICATION_FROM_EMAIL` — e.g. `Jenny <jenny@mailer.junkra.com>` (verified Resend domain)
- `ADMIN_TOKEN` — random string for the CSV export

Point `jennycallagent.com` at the Render service (custom domain) once it's live.

## Zoom
v1 delivers the same `zoomJoinUrl` to everyone (in the success screen + email). If you move to
per-registrant Zoom registration (unique links + Zoom's own reminder emails), we add a
Zoom API call in `server.js /api/register` — needs a Zoom Server-to-Server OAuth app.
