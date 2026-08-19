# Jenny Facebook Ads Plan (v1, drafted 2026-08-19)

One price everywhere: **$750/mo, month to month, 30-day money back.** No founding
offer, no $195 tier.

## The funnel

    Ad -> jennycallagent.com/watch (register, watch the edited masterclass)
       -> /demo (hear Caroline answer as YOUR company)   <- opens when DEMO_PUBLIC=true
       -> checkout / talk to Lee

Until the demo is public, /watch's CTA falls back to "Email Lee" automatically.
Every ad link carries UTMs; /watch writes `watch-recording:<utm_source>` into the
subscriber record, so the export shows exactly which ads produce signups.

Ad link format: `https://jennycallagent.com/watch?utm_source=fb&utm_campaign=<name>`

## Launch gates (in order, none skippable)

1. **Lee's ear pass on the demo** (in progress in the other session)
2. **Edited recording uploaded** (unlisted YouTube), src set in watch.html
3. **Meta pixel ID** from Lee's Business Manager, wired on /watch + /demo
4. **Payment path**: today the close is text-Shane/QuickBooks. Fine for v1 volume;
   a Stripe $750/mo checkout from the demo debrief email is the v2 unlock. Do not
   scale spend past ~$100/day until this exists.

## Audiences (in priority order)

1. **Warm retarget**: site visitors (pixel), YouTube channel engagers, uploaded
   masterclass + JRA customer lists. Small but should convert first and cheapest.
2. **Lookalike 1-3%** off the uploaded lists.
3. **Cold interest**: no good "junk removal owner" interest exists. Target broad
   small-biz/home-services interests and let CREATIVE do the filtering: every ad
   opens with "If you own a junk removal company..."

## Creative concepts (Lee on camera; raw beats polished in this niche)

**A. The missed call** (problem-first)
Phone rings on a dump trailer, nobody can grab it. Cut to Lee: "That was a $500
job. It just booked with the guy who answered. If you own a junk removal company,
I built the fix, and you can hear it working on real calls, free." -> /watch

**B. Play the tape** (proof-first)
15 seconds of an actual Jenny call (price quote or reschedule), captions on.
Lee: "That's not a person. That's what answers my company's phone. Watch the
full class free, hear every call." -> /watch

**C. Your own company** (demo-first; only after DEMO_PUBLIC)
"Call this number, and about five minutes later you'll hear an AI answering as
YOUR company. Your prices, your towns. It's free and it'll spook you a little."
-> /demo directly. Likely the long-term winner; needs the demo open.

## Budget and metrics

- Start **$50/day**: $30 retarget/lookalike, $20 cold. Two creatives per set.
- Optimize to the /watch registration event once the pixel is in (fires on the
  success panel). When the demo opens, switch optimization to demo SMS-verified
  registration, which is a phone-in-hand owner and the best signal we have.
- Math to hold: LTV at $750/mo with even 6-month retention is $4,500. CAC under
  $500 is comfortable; kill creatives that can't find a $50 /watch registration.
- Review weekly, change one variable at a time.

## Not doing (on purpose)

- No countdown timers, no fake scarcity. The 10-spot language belongs to the
  masterclass bundle, not Jenny's evergreen page.
- No cold traffic straight to a checkout. The demo is the closer, not a form.
