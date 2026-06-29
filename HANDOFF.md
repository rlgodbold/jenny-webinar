# Deploy handoff — jennyvoiceagent.com (Jenny webinar signup)

A small Node/Express app. It serves one landing page, captures **name + email**,
stores each signup, and sends three emails per registrant: an instant confirmation,
a 24-hour reminder, and a 1-hour reminder. No database server, no build step.

Everything below is everything you need. Ping Lee for the secret values marked 🔑.

---

## 1. Repo
- Node 20+, `npm install`, `npm start` (serves on `$PORT`, default 8080).
- Source of truth for the webinar date/time/Zoom link is **`config.js`** — one file, edited weekly.
- Registrations are written to `DATA_DIR/registrations.ndjson` (append-only, one JSON per line).
- Get the code from Lee (or push it to a GitHub repo the host can deploy from).

## 2. Host it (Render — recommended; `render.yaml` blueprint is in the repo)
1. New **Web Service** from the repo. Runtime: Node. Build: `npm install`. Start: `npm start`.
2. Attach a **Persistent Disk**, 1 GB, mount path **`/var/data`** (this holds the signup list + reminder state — without it, data is lost on every deploy).
3. Set env var `DATA_DIR=/var/data`.
4. Health check path: `/api/webinar`.
Any Node host works (Railway, Fly, a VPS with pm2) — the only requirement is **persistent disk** for `/var/data`.

## 3. Environment variables
| Var | Value | Notes |
|-----|-------|-------|
| `DATA_DIR` | `/var/data` | persistent disk mount |
| `RESEND_API_KEY` | 🔑 | Resend API key — reuse the **same one** as the Jenny product stack |
| `NOTIFICATION_FROM_EMAIL` | `Lee Godbold <leegodbold@mailer.junkra.com>` | any address on `mailer.junkra.com` (the verified Resend domain) works |
| `ADMIN_TOKEN` | 🔑 (generate a long random string) | gates the `/admin` dashboard + CSV export + broadcasts |
| `UNSUBSCRIBE_SECRET` | 🔑 (generate a long random string) | signs unsubscribe links so they can't be forged |
| `COMPANY_POSTAL_ADDRESS` | 🔑 (Lee provides) | physical mailing address — **required by law to send marketing email; broadcasts are blocked until this is set** |
| `PUBLIC_BASE_URL` | `https://jennyvoiceagent.com` | used in email + unsubscribe links |
| `COMPANY_NAME` | `Junk Removal Authority` | shown in email footer |

Email goes through **Resend** (HTTP API, no SMTP). Without `RESEND_API_KEY` the app still
runs and stores signups but only logs emails instead of sending — so set the key for prod.

## 4. Reminders (24h + 1h) — already built in, no extra service
The web service runs an in-process scheduler that, every few minutes, scans the signup list
and sends any due 24h / 1h reminder emails (idempotent — each registrant gets each reminder
once; state is tracked on the disk). **Nothing to configure beyond the env vars above and the
persistent disk.** Just keep the service always-on (Render Starter plan or higher — not free/sleep tier).

## 5. Domain — point jennyvoiceagent.com at the service
1. In Render → the service → **Settings → Custom Domains**, add `jennyvoiceagent.com` and `www.jennyvoiceagent.com`. Render shows the exact DNS records.
2. At the domain registrar's DNS:
   - Apex `jennyvoiceagent.com` → the **A record** (or ALIAS/ANAME) Render gives you.
   - `www` → **CNAME** to the `…onrender.com` hostname.
3. TLS is automatic once DNS resolves (Render issues Let's Encrypt). Allow up to an hour for propagation.

## 6. Zoom
The Zoom join link lives in `config.js` (`zoomJoinUrl`). It's a standard meeting link — the
same URL for everyone — and **our emails deliver it** (confirmation + both reminders). Zoom
itself sends nothing. If Lee later upgrades to Zoom Webinar with per-registrant registration,
that's a code change (a Zoom API call), not a config change — flag it then.

## 7. Running it each week
Edit **`config.js`** only:
- `startsAtISO` — next session start with the ET offset (`-04:00` Mar–Nov, `-05:00` winter).
- `zoomJoinUrl` — only if the meeting link changes.
- (Optional) `title` / headline copy for a themed week.
Commit + deploy. Headline date, countdown, confirmation, and both reminders all read from it.

## 8. Admin dashboard + email list
- **`https://jennyvoiceagent.com/admin`** — paste `ADMIN_TOKEN` to see subscriber/unsubscribe/signup counts, download a CSV, and send an email broadcast to the list (with a "send test to me" first).
- CSV direct: `GET /api/admin/export.csv?token=ADMIN_TOKEN`
- All admin routes are dead until `ADMIN_TOKEN` is set.

## 9. Spam compliance (already built in — don't remove)
- Every marketing email carries a **physical mailing address** (`COMPANY_POSTAL_ADDRESS`) and a **working one-click unsubscribe** link, plus `List-Unsubscribe` / `List-Unsubscribe-Post` headers (native unsubscribe button in Gmail/Apple Mail).
- Unsubscribes are **honored immediately** — suppressed from all future broadcasts. State lives in `DATA_DIR/subscribers.json`; an audit trail (who/when/IP) is in `DATA_DIR/events.ndjson`.
- The broadcast endpoint **refuses to send** if `COMPANY_POSTAL_ADDRESS` is unset — so it's impossible to send a non-compliant blast by accident.
- Sends are throttled (~8/sec) to stay within Resend limits and protect domain reputation.
