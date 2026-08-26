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
security prompt in Business Manager. Once cleared it is a meta tag in the head of the home
page, which is a code change here. Worth doing early: verification can take up to 72 hours
after the tag goes live, so leaving it to launch day risks launching without it.

**Conversions API.** Insertion point only, `capiEvent()` in `server.js`, a no-op without a
token. It is how closed deals eventually get fed back so Meta optimises toward buyers
rather than form fillers. Needs an access token from Lee, and it should be set up on the
Jenny dataset specifically, never across the whole portfolio.
