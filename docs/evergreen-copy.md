# Evergreen masterclass copy: every surface

Lee confirmed 2026-08-26: **8/27 is the last regularly scheduled live class.** The
masterclass continues as a recording people watch whenever they want. Every asset has
to stop selling a scheduled event.

**index.html stays FROZEN through tomorrow's class.** This ships after 8/27, not before.
watch.html is not frozen and its two lines can go earlier if that is easier.

## The copy problem, stated once

The old pages sell an appointment: reserve, seat, lock in your spot, seats are limited.
None of that survives, and manufacturing urgency about a thing that is always available
is the fake scarcity problem in a new costume.

What replaces it is a better promise anyway. **It starts now.** For an owner who is
underwater, "watch it whenever you have ten minutes" beats "block out Thursday at 2:30."

**The trap to avoid.** The old page has an empty-schedule state that says "new dates
coming soon." Once the 15 future sessions come out of sessions.js, that stops being a
temporary message and becomes the page's permanent state. Every visitor would be told
new dates are coming for a class that will never be scheduled again. Those strings are
not edge cases any more. They are the page.

---

## index.html

**Line 9, og:description.** This is what every shared link and social preview shows.

    Recapture lost revenue and reclaim your freedom. A free class for junk removal
    owners on the AI voice agent that answers every call, quotes the job, and books it
    into your CRM.

Dropped "live" and the dash. Dropped 24/7 as a claim since it rides alongside the
three verbs and is not one of them.

**Line 176, the when-pill.**

    Free class · watch anytime

**Line 186, the hero sub.**

    The class built for junk removal companies: see the AI voice agent that answers
    every call, quotes the job, and books it straight into your CRM. It's not about
    sounding human. It's about never missing another lead.

Kept the last two sentences exactly. They are the best lines on the page and they are
still true.

**Line 207, heading.**

    Watch the class

**Line 208, lead.**

    Enter your name and email and it starts playing. No scheduling and nothing to
    sign up for.

**Line 222, submit button.**

    Watch it now

**Line 232, success heading.**

    You're in.

Dropped the emoji and the exclamation. Nobody is celebrating, they are watching.

**Lines 370 to 372, the closing section.**

    HEADING   Watch the class, free.
    SUB       It's free and it starts the second you enter your email. Then you can
              hear Jenny answer the phone as your own company.
    BUTTON    Watch it now

The sub now points at the demo, which is the two doors design working: the class is a
door, not a destination.

**Lines 389, 390, 392, the no-schedule state. THIS IS NOW THE PERMANENT STATE.**

    389 topPill     Free class · watch anytime
    390 dateMeta    Watch anytime
    392 finalWhen   Watch anytime

**Line 447, the submitting state.**

    One second...

**Lines 452 and 458, the button reset after an error.**

    Watch it now

---

## watch.html

Two lines that promise something that will not exist. /watch is an ad destination under
the two doors model, so a broken promise here lands on paid traffic.

**Line 140.**

    CURRENT      This also saves you a seat at the next live class. Unsubscribe any
                 time.
    REPLACEMENT  We'll email you when there's something worth your time. Unsubscribe
                 any time.

**Line 155, the confirmation panel.**

    CURRENT      You're also on the list for the next live class.
    REPLACEMENT  delete the line and hide the panel.

There is nothing true to put there. The video is already playing, which is what they
came for, and a consolation sentence about a mailing list is worse than silence at the
moment they got what they wanted.

---

## For whoever does the code

Three things I can see from the copy side that are not copy:

1. **The session date picker, the countdown timer, and startCountdown()** have nothing
   left to count down to. They should come out rather than be hidden. A hidden date
   picker is one config change from reappearing and the person who flips that config
   will not know why it was hidden.
2. **Registration still has to capture the lead**, just without a session. The form
   stays a form. Email is the price of entry and it is how anyone who watches and does
   not act enters the follow up.
3. **sessions.js cleanup timing.** 15 future sessions come out before 9/2, and the
   reminder scheduler runs off those dates. Somebody should confirm nothing is armed to
   fire for a session that no longer exists, the same way tomorrow's 24 hour reminder
   was armed and nearly missed.
