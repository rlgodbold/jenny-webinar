# Go live order for the ads funnel

Written by Cale, 2026-08-27. The dependencies below accumulated across two days of
separate decisions, and getting the ORDER wrong has real consequences rather than
untidy ones. Every step is gated by Lee; this is the sequence, not permission.

## The one sentence version

Ads cannot run on /lp until DEMO_PUBLIC is true, DEMO_PUBLIC cannot go true until the
privacy policy describes the demo form, and the pixel cannot go on until the privacy
policy is live at all.

## The order

**1. Merge `lp-demo-fix` (b0b301c).**
Paid leads stop being bound to a webinar session, so they stop getting Zoom reminders
for a class they never asked about. Also fixes the /lp success panel, the email
branching, and the raw .html bypass. Clean fast-forward.
*Blocks:* the DEMO_PUBLIC flip. Flipping first shows a dead player to paid traffic.

**2. Merge `privacy-policy-preads` (d234ed6).**
Puts /privacy on the live site with footer links.
*Blocks:* the pixel. Meta's own terms require a privacy policy for pixel use, and a
cookie-setting tracker on a site with no policy is the version of this with
consequences. An ad account gets flagged rather than gently corrected.

**3. Start DNS TXT domain verification at the registrar.**
Not in Render, at the registrar holding jennycallagent.com. Do this EARLY and in
parallel: Meta can take up to 72 hours, so leaving it until launch day risks launching
without it. It touches no page, so nothing blocks it.

**4. Set `META_PIXEL_ID=1333360478869445` on Render.**
One env var, no code change, no content redeploy. Turns tracking on for all five
surfaces including the home page, which is Lee's ruling. Unsetting it turns everything
fully inert again in the same breath.
*Requires:* step 2 live.

**5. Second privacy policy update, for the demo form.**
The live forms today are /lp and /watch, name and email only, which the policy covers.
The demo pages collect **phone, company, city, state and FSM software** and are
currently unreachable behind the gate. The moment DEMO_PUBLIC flips they become live
data collection the policy does not describe.
*Blocks:* the DEMO_PUBLIC flip. This is the step most likely to be skipped, because
the flip feels like a display toggle and is actually a new data use.

**6. Flip `DEMO_PUBLIC=true`.**
*Requires:* steps 1 and 5.

**7. Only now, run ads at /lp.**

## Why ads wait for step 6 rather than starting earlier

Pre-flip, /lp's success panel correctly shows the video fallback. But no video is
wired, so a paid lead lands on an empty player. Post-flip it shows the demo, which is
what the ad promised. So the flip is a real precondition for spend and not a polish
item. Wiring the video would be the alternative unblock.

## Separate track, same week

**Before 2026-09-02, 2:30pm ET:** remove the 15 sessions after 8/27 from sessions.js,
merged AS ONE CHANGE with the home page rewrite. That timestamp is when the 9/3 class
arms its 24 hour reminders, and it is 24 hours earlier than "before the 9/3 class".
Shipping the removal alone drops the live home page into "new dates coming soon" for a
series that has ended.

## Post deploy verification, every step

Status 200 first, then the words. Pair every absence check with a positive control: an
empty grep against an error page is byte identical to a clean pass, and a check that
the old wording is GONE passes trivially on a page that never loaded.
