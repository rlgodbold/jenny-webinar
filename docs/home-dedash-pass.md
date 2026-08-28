# Home page: the de-dash pass

Lee's standing rule is no dash punctuation in anything written for him or his brands. The
home page breaks it at scale. Not blocking anything, cosmetic, but it is his own rule on
the page he looks at most while we enforce it line by line everywhere else.

**SEQUENCE THIS AFTER THE RECORDED-CLASS MERGE.** Several dashed lines are already being
replaced by that change, and de-dashing them now would collide with Cale's staged branch
and waste the work twice. Section C lists the ones to leave alone for exactly that reason.

Swept live on 2026-08-28. Cale counted 14; a full sweep finds **20 distinct visible lines**
plus the title and og:description. Match on content, not line numbers.

**Recast, do not delete.** A dash removed and nothing put in its place gives you a comma
splice or a run on. Each replacement below picks a comma, colon or period on purpose.

---

## A. One line that is not cosmetic at all

**A0. "What we'll cover — live"**

This is a dash AND an occasion word, and it is not in the 17 surfaces I swept or, as far as
I can tell, in Cale's 23. It says the class is live, on a page that will say the class is
recorded. Please have Cale check whether it is already in her staged set.

    ANCHOR   What we'll cover — live
    REPLACE  What we'll cover

If it is not staged, it belongs in the recorded-class merge, not here, because it is a
contradiction rather than punctuation.

---

## B. The de-dash pass proper

**B1.** Hero sub tail.

    ANCHOR   books it straight into your CRM — 24/7.
    REPLACE  books it straight into your CRM, around the clock.

**B2.** The leak section opener.

    ANCHOR   You can't answer every call — and the calls you miss
    REPLACE  You can't answer every call, and the calls you miss

**B3.** Wasted ad spend.

    ANCHOR   that lead just dialed your competitor — and your ad budget paid for it.
    REPLACE  that lead just dialed your competitor, and your ad budget paid for it.

**B4.** Google ranking.

    ANCHOR   you slide down the results — fewer leads, higher cost per lead.
    REPLACE  you slide down the results: fewer leads, higher cost per lead.

**B5.** The picks-up-every-call line. A period is better than a comma here, the second half
is the whole point and deserves its own sentence.

    ANCHOR   instantly, around the clock — that's the difference between
    REPLACE  instantly, around the clock. That's the difference between

**B6.** Whole-call handling.

    ANCHOR   Jenny handles the whole call — like a seasoned office manager
    REPLACE  Jenny handles the whole call, like a seasoned office manager

**B7.** Comparison row, the other guys.

    ANCHOR   Can't give a real price — "someone will call you back"
    REPLACE  Can't give a real price, just "someone will call you back"

**B8.** Comparison row, specialty. Note this one also carries an ampersand entity.

    ANCHOR   Handles specialty calls — hot tubs, hazmat &amp; disposal, bed bugs, labor-only jobs
    REPLACE  Handles specialty calls: hot tubs, hazmat and disposal, bed bugs, labor only jobs

**B9.** Overflow. Two dashes in one sentence, and splitting reads better than three commas.

    ANCHOR   make scheduling a nightmare — plus after-hours, lunch rushes, and sick days — filling every
    REPLACE  make scheduling a nightmare. She also covers after hours, lunch rushes, and sick days, filling every

**B10.** Features agenda item. Two dashes.

    ANCHOR   for the trades — and the ones that don't — so you know what to look for.
    REPLACE  for the trades, and the ones that don't, so you know what to look for.

**B11.** Dashboard agenda item.

    ANCHOR   what gets tracked and reported — calls, bookings, revenue,
    REPLACE  what gets tracked and reported: calls, bookings, revenue,

**B12.** The proof line.

    ANCHOR   answering real junk removal calls — right now.
    REPLACE  answering real junk removal calls, right now.

**B13.** Every call answered.

    ANCHOR   Every call answered — nights, weekends, overflow
    REPLACE  Every call answered: nights, weekends, overflow

**B14.** Lee's bio. Two dashes.

    ANCHOR   He's now building Jenny — the AI voice agent answering real calls for real
    REPLACE  He's now building Jenny, the AI voice agent answering real calls for real

    ANCHOR   junk removal companies — and in this class
    REPLACE  junk removal companies, and in this class

**B15.** The `<title>` tag, which is also visible as the browser tab and in search results.

    ANCHOR   Junk Removal Companies — Recapture Lost Revenue
    REPLACE  Junk Removal Companies: Recapture Lost Revenue

---

## C. LEAVE THESE ALONE, the recorded-class merge already replaces them

Do not touch these in this pass. They are dashed, and they are already being rewritten,
and editing them twice is how a merge conflicts with itself.

    Real call scenarios — hear Jenny live          becomes "Real call scenarios, hear how she handles them"
    Save your seat — it's free.                    inside block 2
    Seats are limited ... — and live attendees     inside block 2
    <span id="dateMeta">—</span>                   deleted outright, the element goes
    og:description "... owners — see an AI ..."    already being reworded, drop the dash in that same edit

---

## Verifying it is done

A bare count of the dash character will mislead you, because the two rules overlap: some
dashes leave in this pass and others leave in the recorded-class merge. After both land:

    curl -s https://jennycallagent.com/ | grep -c '—'

Expect zero. If it is not zero, print the surrounding text rather than the count, because a
count tells you there is a problem and nothing about where. Check the live URL rather than
the branch, and confirm HTTP 200 before believing any grep result.
