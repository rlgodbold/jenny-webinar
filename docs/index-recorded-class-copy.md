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

So block 2 has two variants and whoever applies it picks by the demo's actual state, not
by what is planned:

- **Demo live**: use the sub as written.
- **Demo still gated**: use the gated variant under block 2.

Do not ship the demo-pointing sub on the assumption the flip lands the same day. That is
the wrong-state trap: correct for the state we are heading toward, broken in the state
that is serving.

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

**Gated variant of the SUB, for use while the demo is not public:**

    SUB         It's free and it starts the second you enter your email. It is the
                whole class, not a preview.

That keeps the real improvement, which is that it starts now, and drops only the forward
pointer to a thing that is not reachable yet. When the demo goes public, swap in the sub
as originally written. Nothing else in the block changes.

This is the line that carried both held problems at once, the scarcity claim and the
live attendee setup offer. Both are gone.

**On the setup offer specifically:** under the new model there is no live attendance
to reward, so there is no separate live attendee deal. The offer is the same for
everybody and it lives where the terms live. Do not replace it with a different
promotion here. One offer, stated in one voice, in the places that state terms.

The sub now ends by pointing at the demo instead, which is the two door design doing
its job: the class is a door, not a destination.

## Note for whoever applies this

The old heading at :371 carries dash punctuation and the old sub carries another.
Both come out with the replacement, so nothing extra is needed.
