# Jenny price block copy, waiver and post waiver

Written 2026-09-02. **The scheduled task `remove-setup-fee-waiver-oct-1` points at this file
for the post waiver wording, and the file did not exist.** The approved replacement sentence
below is quoted verbatim from that task, which is where it survived. If a fuller original
version of this document turns up, prefer it over this one and say so.

---

## THE TWO SEPTEMBER 30 OFFERS, DO NOT CONFUSE THEM

    $350 setup fee waiver          ends September 30, 2026    expires, comes off
    cloned voice rollout pricing   ends September 30, 2027     still live, leave alone

Every date in customer facing copy carries its year. No bare September 30, ever.

---

## CURRENT VERSION, live until September 30, 2026

    $750 a month. Month to month, cancel any time, no contract.

    Setup is a one time $350. It covers building your Jenny before she ever takes a call:
    your prices, your items, your service area, your policies, and connecting her to your
    Workiz.

    We are waiving it through September 30, 2026.

    Cancel in the first 30 days for any reason and we refund the monthly charge. Setup fee
    is non refundable.

    So while the waiver is on, the only money at stake is your first month, and you get
    that back if you cancel in the first 30 days.

## POST WAIVER VERSION, from October 1, 2026

The waiver line is **deleted**. The last line is **deleted**, because it only makes sense
while the waiver is on. The closing line becomes, approved wording, do not improvise:

    Cancel in the first 30 days for any reason and we refund the monthly charge. The $350
    setup is not refundable, because the work is already done.

**Do not restructure the rest of the block.** Those sentences were checked against each other
and against legal review. Only the waiver line comes out and the closing line changes.

---

## EVERY SURFACE THAT CARRIES THE WAIVER

Verified against the repo on 2026-09-02. Seven references across five files.

    public/lp.html          two in visible copy
                            "We are waiving it through September 30, 2026."
                            "So while the waiver is on, the only money at stake is your
                             first month, and you get that back if you cancel in the
                             first 30 days."
    public/watch.html       two in visible copy
                            "plus a one time $350 setup, waived through September 30, 2026"
                            the same "while the waiver is on" sentence
    public/watch.html       ONE IN THE META DESCRIPTION
                            "$750 a month plus a $350 setup, currently waived."
    public/jenny.html       one, in the price table
                            "Setup fee, normally $350 / Waived through September 30, 2026"
    public/demo-start.html  one, in the body
                            "a one time $350 setup that we are waiving through
                             September 30, 2026"

### The three that a date search will not find

**The meta description on /watch** says "currently waived" with no date in it. It is what
search results and link previews display, so it can keep advertising a dead waiver from the
search listing after every visible page is clean.

**The "while the waiver is on" sentence** appears on both /lp and /watch and contains no date
either. Remove the dated line above it and this one is left behind still implying a live
waiver.

**/demo/start is behind the demo gate**, so a plain fetch of the live site cannot see it and a
sweep that only curls public URLs will report the site clean while this page still carries it.
Check the repo, not the live fetch. And note that Lee sends the gated demo link to serious
prospects, so a stale waiver there reaches exactly the people closest to buying.

### Also check

`public/index.html` carried no price and no waiver as of 2026-09-02, but a dated offer line
was expected there at one point. Sweep it rather than assume.

`docs/custom-voice-offer.md` ties a custom voice promo to the same deadline. If that promo is
live anywhere on the site it expires too.

---

## HOW TO SWEEP

    cd /Users/leegodbold/Documents/LG/jenny-webinar
    grep -rniE "waiv|setup fee|\$350|septem" public/ | grep -v node_modules

Grep the **repo**, not the rendered pages, so the gated page and the meta tags are included.
Then verify on the live URLs afterwards, because the branch is not evidence that it shipped.
