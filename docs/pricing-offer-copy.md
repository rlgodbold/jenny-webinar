# Pricing and offer copy (confirmed 2026-08-26)

Confirmed terms from Lee: **$750/month + $350 setup fee.** Setup fee is generally
NON refundable. Two levers given to marketing to use as it sees fit: waive the setup
fee for a limited time or a limited number of clients, and make the first month's
$750 refundable any time within 30 days.

This file is the single source for customer facing pricing wording. Use it verbatim
on /lp, watch.html, and demo-start.html. **Do not paraphrase.** The refund and waiver
sentences are the ones that either prevent a payment dispute or cause one, and a
reasonable sounding reword can flip which.

---

## THE OFFER DECISION, AND WHY

The two levers do different jobs and should not be spent on the same problem.

**The setup fee waiver removes a cash barrier at the moment of decision.** It takes
day one from $1,100 to $750. That matters to an owner deciding in a truck cab.

**The 30 day refund removes risk after the decision.** Different objection, different
moment.

Used together they produce an offer where a new client's total exposure is one month
that they can get back. That is close to the strongest honest offer available to us,
and we should say so plainly rather than dress it up.

**Decision: do NOT hide the $350.** Show it as the real price and make the waiver the
reason to act now. Three reasons:

1. Anchoring. $750 reads as a discount against $1,100, not as the asking price.
2. The fee has a job beyond revenue. It filters people who are not serious, and
   onboarding is concierge and Lee led. Waiving it silently and permanently loads the
   most expensive part of the business with people who never intended to stay.
3. It gives us an honest deadline instead of a manufactured one.

**Decision (Lee, 2026-08-26): the waiver runs THROUGH SEPTEMBER 30, 2026.**

**ALWAYS WRITE THE YEAR. Never bare "September 30, 2026."** Standing rule from legal
(Richard Petty). Two offers end September 30, 2026 a year apart and both are public at the
same time: this setup fee waiver ends **September 30, 2026**, and the cloned-voice
rollout pricing ends **September 30, 2027**. Bare "September 30, 2026" is ambiguous between
them. The failure is not legal, it is a billing and sales argument: somebody says "the
September 30, 2026 offer" meaning the other one, or a client who signed in September 2026
reads the voice clone email and believes his setup waiver runs another year, or
somebody strips the wrong line in October 2026. Applies to site copy, the sales script,
call language and internal notes.

It was originally "the next 10 companies." RBG ruled that a counted-scarcity claim
needs a real counter and an honored cutoff or it is deceptive pricing, and she was
right. My own commitment to take it down at company ten rested on me remembering.

**A date honors itself. A count rests on somebody remembering.** That is why it
changed, and it is the test to apply to any future offer.

**THE WAIVER MUST COME OFF ON OCTOBER 1.** An expired waiver still advertised is a
false price claim. Four surfaces carry it, and the fourth is easy to miss because it
does not contain the date:

    public/watch.html       price block, "waived through September 30, 2026"
    public/lp.html          "We are waiving it through September 30, 2026."
    public/demo-start.html  "waiving through September 30, 2026"
    public/watch.html       META DESCRIPTION, "currently waived". No date in it, so a
                            search for "September 30, 2026" will NOT find this one.

A scheduled task, remove-setup-fee-waiver-oct-1, fires 1 October to do this. That is
the mechanism rather than a promise, and this document is what it reads for the
replacement wording.

---

## CUSTOMER FACING COPY, VERBATIM

### Full block, for /lp and any pricing section

    What it costs

    $750 a month. Month to month, cancel any time, no contract.

    Setup is a one time $350. It covers building your Jenny before she ever takes a
    call: your prices, your items, your service area, your policies, and connecting
    her to your Workiz. It is not refundable, because that work happens whether you
    stay or not.

    We are waiving it through September 30, 2026.

    Your first month is refundable. Cancel any time in the first 30 days and we send
    the $750 back. No form, no reason required.

    So while the waiver is on, the only money at stake is your first month, and you
    get that back if you cancel in the first 30 days.

RBG's wording note, 2026-08-26: the close previously ended "if it is not working,"
which paraphrases "cancel for any reason" as a condition about whether the product
works. That is a NARROWER promise than the contract actually gives. "If you cancel in
the first 30 days" echoes the terms faithfully and is the stronger offer besides.

That last line is the one that closes, and it also answers the question a careful
reader will otherwise ask: what happens to the $350 if I cancel in week three. While
the waiver is on, that question has no teeth, because they never paid it. Say so
rather than leaving them to work it out, because a reader who has to do arithmetic to
find the catch assumes there is one.

Do not cut it for space, and do not move it above the terms it summarizes, because a
summary that arrives before the detail reads as a sales claim instead of a plain
statement of what happens.

**Post waiver version of that last line**, for October 1:

    If you cancel in the first 30 days we refund the $750. The $350 setup stays with
    us, because the work is already done.

### Short block, for the existing price displays on watch.html and demo-start.html

    $750 a month, month to month.
    One time $350 setup, waived through September 30, 2026.
    First month refundable within 30 days.

### Meta description and link previews

    Jenny answers, quotes, and books junk removal calls into your Workiz. $750 a
    month, month to month, plus a one time $350 setup fee currently waived.

**I had this wrong in the first draft** and said to leave the setup fee out of the
meta description for lack of room. Acelynn pushed back and she is right. The exposure
we are fixing is not a stale number, it is that no surface mentions setup at all, so
fixing three surfaces and skipping a fourth recreates the same problem in miniature.
It fits in the character budget if written tightly, so it goes everywhere.

The refund is what drops from the meta description instead, since a link preview is
not where somebody decides and the fee is the thing that must never surprise them.

---

## PRECISION NOTES FOR WHOEVER EDITS THESE

**Never write "risk free" or "money back guarantee" as a standalone phrase.** They are
imprecise here. The setup fee is not refundable, so "money back" without qualification
is false the moment the waiver ends. Say what is refundable and what is not, in the
same breath, every time.

**Never write "free trial."** Nothing here is free. They pay $750.

**The setup fee appears on every surface the monthly appears on. No exceptions.**

**The waiver and the refund must appear together or not at all.** Split across
different parts of a page, a prospect reads the waiver on one screen and the
non refundable clause on another and forms a wrong picture of what they are agreeing
to. That is the shape of the problem we already have on the live site today.

**When the waiver ends,** the middle sentence changes to "It is not refundable,
because that work happens whether you stay or not." with the waiver line deleted.
Nothing else changes. Do not restructure the block, because these sentences have been
checked against each other.

**This wording must match the work order.** If the work order says something different
about the setup fee or the refund window, the work order wins and this file changes,
not the other way round. Somebody should read them side by side before launch.

---

# THE DATED OFFER LINE (question a settled 2026-08-28)

**The special is the FREE VOICE CLONE**, their own voice or a region-specific actor we
hire. Not the $750 rate, not the setup waiver. The $350 setup waiver is a SEPARATE offer
with its own earlier date and stays its own sentence.

## The copy

    Sign up by September 30, 2026 and you get your own voice, free through
    September 30, 2027. Your own voice, or a local person we hire and record for
    you, so your customers hear someone who sounds like your town. After
    September 30, 2027 it is $100 a month if you keep it.

    The one time $350 setup fee is waived through September 30, 2026.

Two offers, two sentences, three explicit years, and the renewal price inside the same
sentence as the free period.

## Why "available at additional cost" cannot ship

The renewal number already exists and Lee approved it on 2026-08-26: **$100 a month**,
with $500 one time for setup. It is in `custom-voice-offer.md` under a section titled
"Disclose the renewal up front. Not negotiable," which reads:

> After the free year it is $100 a month if they keep it. That number appears in the
> same breath as the free year, every time, in every surface and on every call.

So vague wording is not a cautious choice here, it is a departure from a rule Lee already
set, on the one offer where it matters most. A client whose CUSTOMERS recognise their
voice cannot walk away at renewal. That is a retention lever if they saw the number
coming and a trap if they did not, and the trap version is the one that generates the
refund argument.

## Two things Lee still has to answer

**1. Does "free" cover the $500 voice setup, or only the $100 a month?** Those are two
separate charges. The draft above says "free," which a reader will take as both. If only
the monthly is included, the line has to say so and the number changes.

**2. The free period changed shape and the older doc is now stale.** `custom-voice-offer.md`
says free for "their first year," rolling per client, anchored to "the next 10 companies."
Both are superseded: the count-bound framing was replaced by a date after RBG ruled that
counted scarcity needs a real counter, and the period is now a FIXED end date. Under
September 30, 2027, a client signing in September 2026 gets twelve months and one signing
today gets thirteen. That is fine and simpler, but `custom-voice-offer.md` should be
updated to match or the sales script will contradict the site.
