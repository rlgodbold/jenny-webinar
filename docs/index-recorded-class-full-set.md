# index.html, recorded model: the complete set

For Acelynn. Supersedes the two-block version in `index-recorded-class-copy.md` for
application purposes; that document still holds the reasoning and the dated-offer status.

Acelynn was right that two blocks would ship a page arguing with itself. She listed 8
surfaces. I swept the live page rather than working from the list, because a hardcoded
list of where to look is exactly what stops being true, and found **about 18**. Two of
them are not on her list and one of those is the most widely seen text on the site.

All anchors below were confirmed present on the live homepage on 2026-08-28. **Match on
content, not line numbers.**

---

## The framing, which changes the job

This is not a string swap exercise. The hero is **built around a scheduled event**: a
status pill, a date, a countdown to it, a Zoom location, and a date picker to choose which
one. Rewording those leaves the scaffolding of an event standing on a page that no longer
has one.

**So some of these are deletions, not rewrites.** A countdown with nothing to count down
to cannot be reworded into sense. The test for each surface below is whether it describes
a THING or an OCCASION. Things stay. Occasions come out.

---

## A. Head. Highest reach, easiest to forget

Nobody sees these on the page, and everybody sees them in Google and in every shared link.

**A1. `meta name="description"` — NOT on the 8-item list.** This is Google's snippet.

    ANCHOR   A free live masterclass for junk removal owners:
    REPLACE  A free masterclass for junk removal owners:

Rest of that description is fine and stays.

**A2. `og:description`.** What every shared link and social preview shows.

    ANCHOR   Free live class for junk removal owners
    REPLACE  Free on demand class for junk removal owners

Note this tag also carries dash punctuation against Lee's standing rule. If the value is
being edited anyway, the dash should come out in the same pass.

**A3. `<title>`** says "Masterclass", not "live", so it is fine as copy. It also carries a
dash. Same note: fix it if you are in there, do not make a separate job of it.

---

## B. Hero. Where the event scaffolding lives

**B1. When-pill.**

    ANCHOR   Free live class · loading…
    REPLACE  Free class · watch any time

Removing "loading…" also removes a flash of loading state on a page with nothing to load.

**B2. Hero sub.**

    ANCHOR   The live class built for
    REPLACE  The class built for

**B3. Countdown. DELETE the element, do not reword.**

    ANCHOR   <div class="countdown" id="countdown" aria-label="Time until the webinar starts">

Remove the block and its four cd-box children (Days, Hours, Mins, Secs). Note the
aria-label says "Time until the webinar starts", so a screen reader user gets the event
framing even if the digits are blanked. Blanking the numbers is not enough.

**B4. Date meta. DELETE the element.**

    ANCHOR   <span id="dateMeta">

Including its calendar icon. There is no date.

**B5. "Live on Zoom". DELETE.**

    ANCHOR   Live on Zoom

Replace with nothing. Where it is watched is no longer a fact about the offer.

---

## C. Form

**C1. Block 1, already written.** Unchanged from the earlier doc:

    ANCHOR   Reserve your spot for the live class. Seats are limited and the replay isn't guaranteed.
    ANCHOR   Save your seat

    HEADING  Watch the class
    LEAD     Enter your name and email and it starts playing. No scheduling and nothing
             to sign up for.

**C2. "Pick your date" and the session picker. DELETE both.**

    ANCHOR   Pick your date
    ANCHOR   <select id="session" name="session">

**Safe to remove, verified:** the submit handler reads
`const sessionId=($('session')&&$('session').value)||''`, which is null safe, so the POST
still fires with an empty sessionId. See the dependency note at the bottom, which is the
part that is NOT safe to assume.

**C3. Submit button.**

    ANCHOR   Reserve my free seat →
    REPLACE  Watch the class →

---

## D. Agenda item 5. The offer Lee killed

Not a delete. The slot is real and should describe what a viewer actually gets.

    ANCHOR   A limited, discounted offer
    ANCHOR   Like what you see? Live attendees get a limited-quantity discount to set Jenny up in their own business.

**Do not put an offer here.** Under the recorded model there is no live attendance to
reward, so there is no separate attendee deal. The terms live where the terms live, in one
voice, and the dated offer line is held pending Lee's answer on the 2027 price.

Two variants. **Neither one waits on Lee**, which is the point: this slot must not be what
holds the page.

**VARIANT A, RECOMMENDED, CUT THE ITEM ENTIRELY.** The agenda describes what is IN the
class. "A limited, discounted offer" was never class content, it was a reward for showing
up live. With no live attendance there is nothing to describe, so the honest move is that
the agenda goes from five items to four. Nothing is lost, because nothing real was there.
Acelynn should check whether the surrounding layout assumes five.

**VARIANT B, ONLY IF SOMEONE CONFIRMS THE RECORDING ACTUALLY COVERS PRICING:**

    HEADING  What it costs, plainly
    BODY     The real price, what is included, and how to start. No pressure and no
             sales call required to find out.

**Do not ship B on my say-so.** I have not watched the recording and nobody in this thread
has. Acelynn verified the video EMBEDS, which is not the same as knowing what is in it. An
agenda item promising a pricing segment that the recording does not contain is the same
defect as the empty player and the Zoom email: the page is fine and what the viewer
actually receives does not match. B is safe the moment one person watches it and says yes,
and not before.

Default to A. Upgrade to B on confirmation.

---

## E. Second CTA

**E1. Block 2, already written**, with the flag-driven demo subs unchanged from the earlier
doc. Anchors:

    ANCHOR   Save your seat — it's free. Seats are limited and the replay isn't guaranteed
    ANCHOR   Lock in your spot now.

**E2. The second button.** Same string as C3, appears twice in HTML.

    ANCHOR   Reserve my free seat →
    REPLACE  Watch the class →

---

## F. JavaScript. An HTML-only editor misses every one of these

**F1 and F2. Button label restores after submit or error.** Two occurrences:

    ANCHOR   btn.textContent='Reserve my free seat →'
    REPLACE  btn.textContent='Watch the class →'

Both must change or the button silently reverts to event language the moment a
registration fails validation.

**F3. The no-sessions pill. This is the permanent false state Acelynn flagged.**

    ANCHOR   $('topPill').textContent='Free live class · new dates coming soon'
    REPLACE  $('topPill').textContent='Free class · watch any time'

**F4. The no-sessions date meta.**

    ANCHOR   $('dateMeta').textContent='New dates coming soon'
    REPLACE  delete this line, the element is gone per B4

**F5 and F6. The has-sessions branch.**

    ANCHOR   $('topPill').textContent='Free live class · '+w.full
    ANCHOR   $('dateMeta').textContent=w.dateStr

Both belong to `applySession` and describe a scheduled occasion. With sessions gone the
whole branch is dead. Acelynn's call whether to delete `applySession` and the SESSIONS
wiring outright or leave it unreferenced; I would remove it, because dead event code is
how the event framing comes back in six months.

---

## Two dependency flags, both beyond copy

**1. The confirmation email is still webinar shaped.** It sends a date and a green "Join
the webinar" Zoom button. Under the recorded model a registrant gets an email inviting
them to a Zoom call that does not exist. **This is the same class of defect as the empty
video player: the page is fine and the thing the lead actually receives is wrong.** It is
not on anyone's list and it is worth more than several of the surfaces above.

**2. An empty sessionId now reaches the server on every registration.** The client is null
safe so nothing breaks in the browser, but the confirmation and reminder paths key off the
session. Someone should confirm the server tolerates an empty session and does not send a
reminder for a session that does not exist. I did not verify server behaviour, only that
the client will not throw.

---

## Not in scope, deliberately

The dated offer line is still held pending Lee's answer on the October 1, 2027 price.
Nothing in this set states a price, so this whole change can ship without it.
