# Meta pixel: what is built, and the one step that is deliberately not automated

Status 2026-08-26. Code is complete and verified. The pixel is OFF and stays off until
somebody sets one environment variable.

## The ID

    Meta Pixel / dataset ID   1333360478869445
    Name                      Jenny Pixel
    Portfolio                 JRA- Social Media
    Ad account                776959367533733

The ID is public by nature, it appears in the page source of any site running it. It is
still NOT in the repo. Nothing in `public/`, `server.js` or `render.yaml` contains it.

## Why it is not in render.yaml, which is the part worth reading

Putting `META_PIXEL_ID` in `render.yaml` would look tidy and would be wrong. It would
switch the pixel on for every page the moment this branch merged, including `/watch` and
the home page.

Those two are not like the ad landing page. They already receive ORGANIC traffic, people
who arrived on their own and never clicked an ad. Turning tracking on for them is a
different decision from tracking the traffic we paid for, and it carries consent
implications that belong to Lee rather than to a deploy.

So the environment variable IS the gate. Leaving it unset is not an unfinished step, it
is the off position of a switch that Lee owns. Merging this branch does not start any
tracking.

## To turn it on

Set on the Render service, no code change and no redeploy of content:

    META_PIXEL_ID=1333360478869445

Unset it and the pages go fully inert again in the same breath.

## What happens in each state, verified against a running server

**Unset.** Every page gets a no-op `window.jpx` and nothing else. No script tag, no
request to Meta, no cookie. The event calls on the pages are all guarded, so they run and
do nothing.

**Set.** Base code plus `PageView` initialises on all five surfaces: `/`, `/lp`, `/watch`,
`/demo`, `/demo/start`. Confirmed with the real ID above, one init and one PageView each.

## One switch, and why it turned out to be the right shape (DECIDED)

**Lee ruled 2026-08-26: pixel ON for all five surfaces, home page included.** So no
per-page split is needed and none was built. The single `META_PIXEL_ID` flip on Render at
go-live covers everything. The rest of this section is kept as the record of why it was
worth asking rather than assuming.

`META_PIXEL_ID` is a single on/off for all five surfaces. The surfaces are not alike:

| Surface | Traffic | Tracking |
|---|---|---|
| `/lp` | paid only | needed. It is the ad destination. |
| `/watch` | **paid AND organic** | needed. See below. |
| `/demo`, `/demo/start` | arrived through one of the two doors | needed |
| `/` home page | **purely organic** | genuinely Lee's call |

The important line is `/watch`. It is easy to file it with the home page because it takes
organic visitors, and that was the first read here. It is wrong under the two doors model:
**`/watch` is an ad destination too**, the second door, the one a slower buyer is pointed
at. With the pixel off there we cannot see which ads produce class registrations, cannot
build a retargeting pool from them, and cannot optimise that half of the funnel at all.
Off on `/watch` does not mean collecting less, it means running blind on half the campaign.

So the real question for Lee is narrow: **tracking on the home page, where visitors arrived
on their own and never clicked an ad.** That is a genuine consent decision. It is not
linked to whether the campaign can be measured, and he should not be offered a trade
between the two, because there is not one.

He ruled to include it, so the single switch stands. Had he excluded it, the change was
small: gate the marker per page rather than globally. Recorded in case that changes.

## The events, and the rule that matters

| Event | Fires | Where |
|---|---|---|
| PageView | every page load | base code |
| Lead | registration SUCCEEDS | `lp.html:204`, `watch.html:206` |
| CompleteRegistration | demo lead SUCCEEDS | `demo-start.html:110` |
| DemoCompleted | not wired, see below | |

Every one of these fires on SUCCESS, never on button click. On click they would count
validation failures and network errors as conversions, and Meta would optimise toward
people who fail to sign up. That is the most common way a pixel quietly poisons a
campaign and it is invisible until a month of budget is gone.

`DemoCompleted` cannot be fired from this repo at all. The demo runs on the separate
`jra-voice-agents-demo` service, so nothing on these pages knows when a call ends. Wiring
it needs that service to report back. It is documented at the insertion point rather than
faked, because an event that fired on page load would tell Meta everyone completed.

## Still open

**Domain verification for jennycallagent.com.** Blocked on Lee clearing an account
security prompt in Business Manager.

**Use the DNS TXT method, not the meta tag.** Two reasons, and the second is the durable
one. It never touches `index.html`, which is under a hard hold, so nobody has to carve out
an exception under time pressure. And a meta tag lives in a page while a DNS record does
not: any future rewrite of that `<head>` can silently drop the tag, and the failure is
invisible until an ad rejects or the domain quietly unverifies weeks later. The DNS record
survives every deploy.

For whoever sets it: jennycallagent.com runs on Render, but the record goes at the
REGISTRAR holding the domain, not in the Render dashboard. That is where people get stuck.

Worth starting early either way: Meta can take up to 72 hours to verify after the record is
live, so leaving it to launch day risks launching without it.

**Conversions API.** Insertion point only, `capiEvent()` in `server.js`, a no-op without a
token. It is how closed deals eventually get fed back so Meta optimises toward buyers
rather than form fillers. Needs an access token from Lee, and it should be set up on the
Jenny dataset specifically, never across the whole portfolio.
