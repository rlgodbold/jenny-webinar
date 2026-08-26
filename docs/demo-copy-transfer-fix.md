# demo.html copy: replacement lines for the transfer mismatch

Written by marketing. NOT applied. Nobody edits demo.html on this until Alston
confirms (a) the replacement behavior below is what a new tenant actually gets, and
(b) whether the tape is really sent.

## Why these lines change

The demo places a real warm transfer to the prospect's verified cell, through its own
enablement path that bypasses the production gate. A brand new tenant is not in the
transfer allowlist, so their caller who asks for a person gets a name and number taken
plus a callback promise, never a connection. The demo therefore showcases a capability
a new client will not have on day one.

We are NOT deleting the moment. We are replacing it with the true behavior, which
still demos a real win: she does not dead end a caller who wants a human. The
alternative most owners live with is voicemail, so this is a win being shown honestly,
not a consolation prize.

## Line 151, the "things to try" list item

CURRENT
    Ask for a person, she'll ring the cell you just verified

REPLACEMENT
    Ask for a person, and hear how she takes a name and a number instead of
    dropping you into voicemail

Naming voicemail is the persuasive part. It puts the honest behavior next to what the
owner lives with today, which is where it wins.

## Line 111, the phone field placeholder

CURRENT
    We text a code, then she rings this for the transfer

REPLACEMENT
    We text a verification code to this number

The old copy made transfer the stated reason we collect the number. That reason is
gone, so the copy has to go with it. Otherwise we are taking a phone number under a
premise that is no longer true, which is the same problem one level down.

## Line 116, the consent copy

CURRENT
    Calls with Caroline are recorded so we can send you the tape. We'll text a
    verification code to the number above, that's also the phone she'll ring if you
    try the transfer, so it has to be one you can answer.

REPLACEMENT (the tape is verified as a real, shipped, kept promise)
    We record this demo call so we can email you the tape afterward. We'll text a
    verification code to the number above, so use one you can get a text on.

**The scoping change is "this demo call," and it is deliberate.** The old wording,
"calls with Caroline are recorded," is ambiguous in a page whose entire framing is
"this, but for your company." A prospect can reasonably read it as: when I buy this,
my customers' calls get recorded. Recording is a separate feature that is off by
default and is not part of the base offer, so that inference is one we would have to
walk back later, on a sales call, after they have already priced it in.

Saying "this demo call" draws the line in three words and costs nothing.

One operational precondition, Alston's to verify: recording has to actually be ON
for the demo server. If it is off, the email still sends but the tape link silently
drops, and the prospect gets an email promising a recording with no recording in it.
That would turn a kept promise into a broken one at the worst possible moment.

---

# ADDENDUM 2026-08-26: the consent line, rewritten

Once the demo stops performing transfer, demo.html's SMS consent line is not merely
stale, it is the stated REASON we ask for a number the prospect can answer. Leave it
and the page argues with itself four lines apart: you need a reachable phone because
she will ring it, and also she will not ring it, she will take a message.

It cannot be deleted either, because the verification code has to go somewhere and
the number still has to be real. So the new reason has to carry the same weight the
transfer promise was carrying. It does, and it is true: **the verified cell is the
phone she recognizes when you call in.** No good number, no demo.

## The cell field placeholder

CURRENT
    We text a code, then she rings this for the transfer

REPLACEMENT
    We text a verification code to this number

## The consent line

CURRENT
    Calls with Caroline are recorded so we can send you the tape. We'll text a
    verification code to the number above. That's also the phone she'll ring if you
    try the transfer, so it has to be one you can answer.

REPLACEMENT
    We record this demo call so we can email you the tape. We'll text a verification
    code to the number above, and it's the phone she'll recognize when you call in,
    so use the one you'll be calling from.

Three things this does at once. It scopes the recording to **this demo call**, so
nobody infers their own customers get recorded on a page whose framing is "this, but
for your company." It keeps a real reason the number must be right. And it ends on an
instruction rather than a condition, which is easier to comply with than "it has to be
one you can answer."

The PIN fallback for calling from a different phone is already surfaced further down
the page, so this line does not need to carry it.
