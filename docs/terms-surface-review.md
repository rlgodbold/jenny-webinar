# Terms surface review: every place the site makes a money commitment

Prepared for Lee's approval. Nothing here is committed and nothing is live.
Status as of 2026-08-26. Copy by Bill, verbatim. Applied and staged on branch `ads-funnel`.
Nothing is live. Gate: Lee approves the exact terms wording, then Alston merges.

## Why this sheet exists

Confirmed terms are **$750 per month plus $350 setup, setup generally non refundable,
first month refundable within 30 days.**

The live site currently says $750 per month, mentions no setup fee anywhere, and on two
pages promises **"get your money back"** with no carve out. So today a prospect reads one
deal on the page and hears a more expensive one on the call.

The important part is what happens if only the prices get updated. Adding a non refundable
$350 next to an unqualified money back promise does not fix the page, it makes it
self contradictory. Today's problem is an omission, which is an awkward phone call. The
half fixed version is a bolded refund promise the company does not intend to honor, which
is a screenshot and a chargeback.

That is why this is one terms review across all five surfaces rather than three price edits.
Partial propagation is what produced the current mismatch. Doing it again in a smaller way
is the only outcome worth actively avoiding.

## The five surfaces

Located by matching page content, not by line number, because the ads branch shifts line
numbers in watch.html. Line numbers below are current on that branch.

### 1. watch.html:7, meta description (LIVE)
This is what Google shows and what a link preview shows, so it is read by people who never
open the page.

> The full AI Voice Agent Masterclass for junk removal owners, free. Hear real calls, see
> what missed calls cost, and how Jenny answers and books for **$750 a month**.

**NOW READS:**
> The AI Voice Agent Masterclass for junk removal owners, free. Hear how Jenny answers and
> books real calls. **$750 a month plus a $350 setup, currently waived.**

The refund line is what drops here rather than the fee, because a link preview is not where
somebody decides, and the fee is the thing that must never surprise them.

### 2. watch.html:159 to 161, the visible price block (LIVE)

> Jenny, answering your phone
> **$750**
> per month, month to month
> **Cancel any time in the first 30 days and get your money back.**

**NOW READS:**
> Jenny, answering your phone
> **$750**
> per month, month to month
> plus a one time $350 setup, waived for the next 10 companies
> Cancel in the first 30 days and we refund your first month. While the waiver is on, that
> is everything you paid.

"Month to month" stays, but the setup line now sits directly beneath it, so a reader never
sees walk away any time without the money that does not walk away with them in the same
eyeful. The old sentence is gone in full, not edited.

### 3. demo-start.html:57 to 58, the closer's price block (behind the demo gate)

> **$750**/month
> Every call answered, qualified, and booked into your schedule. Month to month.
> **Cancel any time in the first 30 days and get your money back.**

**NOW READS:**
> **$750**/month
> Every call answered, quoted, and booked into your schedule. Month to month, plus a one time
> $350 setup that we are waiving for the next 10 companies. **Cancel in the first 30 days and
> we refund your first month. While the waiver is on, that is everything you paid.**

"Qualified" became "quoted" so every surface uses the same three claim words.

### 4. index.html:371, a competing setup offer (LIVE homepage)

> Seats are limited and the replay isn't guaranteed and live attendees get a
> **limited, discounted offer to set up Jenny**. Lock in your spot now.

This is an offer claim about **setup specifically**, which is the exact fee now in play. If a
limited time setup waiver is framed on the new landing page, this line is either the same
offer or a second, different one. Two different setup offers on two live pages is the same
class of problem as the price mismatch, only newer.

### 5. index.html:208 and :371, scarcity that the funnel contradicts (LIVE homepage)

> Seats are limited and the replay **isn't guaranteed**.

Since the strategy change on 2026-08-19 the replay IS the product: /watch is a permanent
recording page. So the homepage promises scarcity that the rest of the funnel removes. Not a
money commitment, and lower priority than the other four, but it is on a live page and it
runs against the standing no fake scarcity rule.

## The question the copy has to answer

A reader who sees both a non refundable setup fee and a 30 day money back offer will ask
one question: **what happens to the $350 if I cancel in week three.**

If the copy does not answer it, the prospect asks on a call, and whatever gets said that day
becomes the terms. Answering it in writing, once, in the same words on every surface, is the
whole point of doing this as a single pass.

## The question, now answered on the page

The copy answers it directly rather than making the reader do arithmetic: while the waiver is
on they never paid the $350, so the only money at stake is the first month and that comes
back. The post waiver wording is already written down in `docs/pricing-offer-copy.md` on the
marketing branch, so nobody improvises it on the day the tenth company signs.

The waiver is COUNT bound, not date bound, so it cannot go stale on a calendar. It ends when
the tenth company is onboarded. Somebody other than marketing should also be counting.

## Approval checklist

- [x] Exact wording from Bill, verbatim, not paraphrased
- [x] The $350 appears on every surface the $750 appears on, meta description included
- [x] The refund line answers the week three question explicitly
- [x] The old "get your money back" sentence removed in full, everywhere, zero occurrences
- [x] "Month to month" never appears without the setup line adjacent
- [x] Three claim words consistent across all surfaces
- [ ] **LEE: approve the exact terms wording above.** These are binding customer commitments.
- [ ] **LEE: surface 4, the second setup offer.** See below, still untouched.
- [ ] **LEE: surface 5, the scarcity line at :371.** Blocked behind surface 4.
- [ ] Alston gates the merge after Lee signs

## Still untouched, and why

**index.html:371 has not been changed at all.** It currently reads:

> Seats are limited and the replay isn't guaranteed and live attendees get a limited,
> discounted offer to set up Jenny. Lock in your spot now.

That one line carries BOTH open questions at once: the competing setup offer, which is Lee's
call because collapsing it removes a reason to attend live, and the scarcity claim, which
marketing wants gone. The proposed replacement would delete the setup offer line, and the
instruction was to leave that line alone until Lee decides. So the whole line waits.

Lee's two options on the setup offer, from marketing: make the live attendee offer identical
to the waiver, which means attending live no longer earns anything extra on setup, or give
live attendees something that is not the setup fee.

**index.html:208 IS staged**, because it carries scarcity and no offer claim:
> was: Reserve your spot for the live class. Seats are limited and the replay isn't guaranteed.
> now: Reserve your spot for the live class. Come with questions and ask them live.

## What is already staged

Every surface is located and the edit mechanism is ready. No pricing or refund copy has been
written by me on purpose: these are binding customer commitments and they should read exactly
as Bill and Lee intend, not as an engineer's summary of a summary.
