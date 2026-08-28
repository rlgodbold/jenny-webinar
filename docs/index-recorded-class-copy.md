# index.html replacements: recorded class, no live event

Lee confirmed 2026-08-26: the live webinar is dropped for an instant recorded class,
and /lp goes straight to the demo with the class as the second door. That makes both
held lines wrong, plus the section framing around them.

Acelynn is holding index.html:206-208 and :369-372 for exactly this.

## What changes and why

The old copy sells a scheduled event: reserve, seat, lock in your spot, come with
questions. None of that survives. There is no seat, nothing to reserve, and nothing
to be late for. Selling urgency about a thing that is always available is the fake
scarcity problem in a new costume.

What replaces it is a better promise anyway: **it starts now.** For an owner who is
underwater, "watch it whenever you have time" beats "block out Friday at 2."

The second door also needs to point at the first one. Someone who finishes the class
should land on the demo, because the demo is what closes.

## Before applying: two things verified 2026-08-28

**1. Do NOT use the line numbers below. Match on the content strings.** The line numbers
were accurate on 2026-08-26 and index.html has been touched since (privacy footer links).
The standing rule on this codebase is to match on content, never on line numbers, and this
document predates its own rule. All five anchors below were confirmed present on the live
homepage on 2026-08-28:

    "Reserve your spot for the live class."
    "Seats are limited and the replay isn't guaranteed"
    "A limited, discounted offer"
    "Live attendees get a limited-quantity discount to set Jenny up in their own business."
    "Reserve my free seat"

The old copy is all still live and unchanged, so this rewrite is still exactly the right
fix and nothing has been partially applied.

**2. Block 2's sub points at the demo, and the demo is STILL GATED.** Verified on
2026-08-28: DEMO_PUBLIC is false, /lp still serves the fallback CTA, and there is no
working demo link anywhere. If the series-ended copy ships before the demo flip, the
homepage promises a thing a visitor cannot get, which is the same class of problem as the
scarcity claim this rewrite exists to remove.

So block 2 needs both subs. **Do not pick one by hand.** index.html already runs through
`sendDemoAwareHtml` (server.js:595), the same machinery that switches the /lp CTA and
success panel, so put BOTH subs in the file inside the existing markers and the flag picks
at render. No deploy on the flip, no swap, nothing for anyone to remember. Exact markup is
under block 2.

This correction is Acelynn's and it is right. My first version of this fork was a manual
swap, which is a manual step tied to a flag, which is the precise hazard this document
exists to warn about. A fork the flag resolves cannot be forgotten. A fork a person
resolves will eventually be forgotten, on a busy week, by someone who never read this file.

Marker semantics, confirmed against live /lp on 2026-08-28 while DEMO_PUBLIC was false:
`DEMO_LINK` is the demo-is-live branch and was stripped; `DEMO_FALLBACK` is the
demo-is-gated branch and was served.

## Block 1, currently lines 206 to 208

    HEADING     Watch the class

    LEAD        Enter your name and email and it starts playing. No scheduling and
                nothing to sign up for.

"Save your seat" goes. There is no seat.

## Block 2, currently lines 369 to 372

    HEADING     Watch the class, free.

    SUB         It's free and it starts the second you enter your email. Then you
                can hear Jenny answer the phone as your own company.

    BUTTON      Watch it now

**The SUB ships as both variants, switched by the flag. Apply it literally like this,
keeping the surrounding element's own classes:**

    <!--DEMO_LINK_START-->
    <p class="sub">It's free and it starts the second you enter your email. Then you
    can hear Jenny answer the phone as your own company.</p>
    <!--DEMO_LINK_END-->
    <!--DEMO_FALLBACK_START-->
    <p class="sub">It's free and it starts the second you enter your email. It is the
    whole class, not a preview.</p>
    <!--DEMO_FALLBACK_END-->

The gated variant keeps the real improvement, which is that it starts now, and drops only
the forward pointer to something not reachable yet. Both are true sentences on their own,
which is the test: neither variant is a placeholder waiting to be corrected later.

The HEADING and BUTTON above are outside the markers. They do not vary by flag and must
not be duplicated into either block.

This is the line that carried both held problems at once, the scarcity claim and the
live attendee setup offer. Both are gone.

**On the setup offer specifically:** under the new model there is no live attendance
to reward, so there is no separate live attendee deal. The offer is the same for
everybody and it lives where the terms live. Do not replace it with a different
promotion here. One offer, stated in one voice, in the places that state terms.

The sub now ends by pointing at the demo instead, which is the two door design doing
its job: the class is a door, not a destination.

## THE DATED OFFER LINE: DRAFTED, NOT READY TO SHIP

Lee's intent, verbatim 2026-08-28: "sign up by September 30 2026 to get the special for
one year, good through September 30 2027."

The two years are right and they do resolve the ambiguity Richard Petty flagged. But this
sentence cannot be written correctly yet, because it introduces a term that does not exist
on the site today, and three things have to be true before it is safe to publish.

**What the site says right now, confirmed live 2026-08-28:**

    $750 a month. Month to month, cancel any time, no contract.
    Plus a one time $350 setup, waived through September 30.

The $750 has **no end date**. It is open ended. "Good through September 30, 2027" puts an
end date on it, which means there is a price after that date, and we do not currently say
what it is anywhere on the site or in any doc.

### The three questions, in order of how badly a wrong guess hurts

**1. What is "the special"?** Three different things could be meant and they produce three
different pages:

  a. the $750 monthly rate, locked for a year
  b. the $350 setup waiver
  c. the cloned-voice rollout pricing

(b) does not work: a one time fee has no duration, so "for one year" cannot describe it.
(c) is a separate offer that already runs 2026 to 2027 and is exactly the offer legal
warned would get confused with this one. (a) is the only reading that fits the words, but
it is an inference and this is a price.

**2. What is the price on October 1, 2027?** Whatever the special is, ending it implies a
next price. **Lee's own standing rule already answers how to handle this: the renewal price
appears in the same breath as the offer, always.** That rule exists because a client who
signs at one price and meets a different one at month thirteen is a refund argument and a
churn event, and the whole point of stating it up front is that it becomes a retention
lever instead. A one year lock with an unstated cliff is the single most dangerous sentence
we could put on this page, and it is dangerous in direct proportion to how good the deal is.

**3. How does a one year term sit beside "month to month, cancel any time, no contract"?**
These are reconcilable, the special lasts a year and the client can still leave whenever,
but only if the copy says so. Unqualified, "get the special for one year" reads to a careful
buyer like a twelve month commitment, which is the opposite of our actual terms and
undercuts the strongest thing we say.

### Draft, ready the moment those are answered

Written for reading (a), with the renewal price as an explicit blank. Do not ship with the
blank in it, and do not fill it by inference.

    Sign up by September 30, 2026 and your rate is locked at $750 a month through
    September 30, 2027. Still month to month, still cancel any time. After September
    30, 2027 it goes to $____ a month.

The $350 setup waiver stays a SEPARATE sentence and keeps its own date, because it is a
separate offer that ends a year earlier:

    The one time $350 setup fee is waived through September 30, 2026.

Keeping them as two sentences with two explicit years is what actually discharges the legal
requirement. Merging them into one dated clause would recreate the ambiguity in a new form.

## Note for whoever applies this

The old heading at :371 carries dash punctuation and the old sub carries another.
Both come out with the replacement, so nothing extra is needed.
