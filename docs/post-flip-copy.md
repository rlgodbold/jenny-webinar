# Copy for after DEMO_PUBLIC flips

For Cale. The flag flip is necessary and not sufficient. Two things still deliver the
wrong thing to a paid lead, and both are copy rather than logic.

---

## 1. THE DONE PANEL STILL SAYS "PRESS PLAY" AT AN EMPTY VIDEO

lp.html lines 97 to 105. The video frame is **not inside a DEMO_FALLBACK block**, so it
renders in both states. After the flip a lead who submits the form sees:

    You are in.
    Press play.
    [empty video player]
    [Start the demo]

An instruction to press play, a player that cannot play, and the real call to action
underneath it. That reads as broken, and it is the first screen a paid lead sees.

**The video frame should be hidden when the demo is live.** Wrap it in
DEMO_FALLBACK_START/END the same way the buttons are, so it only appears in the
fallback state where a video is actually the destination.

**Replacement copy for the demo state:**

    TITLE   You're in.
    SUB     Now hear her answer as your own company. Your prices, your towns.
            Takes about a minute.
    BUTTON  Start the demo        (already exists, no change)

The fallback state keeps "Press play," but only once a video is actually wired.

---

## 2. THE CONFIRMATION EMAIL INVITES PAID LEADS TO A ZOOM CLASS

Every registration today gets the webinar email: "You're registered", a date, and a
green Join the webinar button. That is wrong for a /lp lead in every state, and after
8/27 it is wrong for everyone, because it books them onto September sessions that are
not happening.

**The server already knows which door they came through.** The `source` field starts
`lp:` for landing page leads and `watch-recording:` for class registrations. Branch on
that prefix.

### Email A, for `lp:` leads. The demo.

    SUBJECT   Hear her answer your phone

    Hey {FirstName},

    You asked to hear what an AI sounds like answering a junk removal phone. Here is
    how it works.

    You tell her your company name, your city and roughly what you charge. A couple
    of minutes later you call a number and she answers as your company, quoting your
    prices, in your towns.

    Run the calls you actually get. The three bedroom cleanout, the couch on the curb,
    the price shopper. Then throw a couple of the odd ones at her.

    [ Start the demo ]      -> https://jennycallagent.com/demo

    Lee Godbold
    Junk Removal Authority

No date, no Zoom, nothing that expires.

### Email B, for `watch-recording:` leads. The class, evergreen.

    SUBJECT   Your masterclass is ready

    Hey {FirstName},

    Here is the AI Voice Agent Masterclass. Watch it whenever you have the time, all
    the way through or in pieces.

    [ Watch the class ]     -> https://jennycallagent.com/watch

    When you are done, the thing worth doing next is hearing her answer the phone as
    your own company. That takes about a minute.

    Lee Godbold
    Junk Removal Authority

Also no date and no Zoom, because the class is a recording now.

---

## 3. WHILE YOU ARE IN THERE

**Remove the test lead.** Name "TEST LEAD do not contact", email
lee+fbtest826@junkra.com. I created it deliberately to trace this path end to end. It
is a real subscriber record and it sent a real notification to Lee and Shane.

**Registration still attaches every lead to a webinar session.** My test came back with
sessionId 2026-08-27 and a Zoom URL. Once the series ends, currentSession() returns the
next date still sitting in sessions.js, so leads get booked onto classes that will not
run. Related to the 9/2 2:30pm ET sessions cleanup, and a second reason that deadline
matters.

## Constraint

No dash punctuation anywhere in customer-facing copy, including email. Standing rule
from Lee.
