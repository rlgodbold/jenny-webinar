# Pre-flip demo privacy package (DEMO_PUBLIC)
DRAFT — legal seat (Richard Petty) drafted, needs Lee + legal sign-off before ship. No files modified yet.
Assembled by Alston 2026-08-28.

## The dependency (small, well-defined, one page + one policy line)
When DEMO_PUBLIC flips, /demo (server.js:609 -> demo.html, behind demoGate) collects a REQUIRED cell (type=tel), texts an SMS verification code, and the prospect calls in to a RECORDED line. The privacy POLICY already covers phone+SMS via a DEMO_PUBLIC-gated paragraph (server.js ~728-730) but does NOT name the demo CALL recording. The FORM point-of-collection consent is where 2-party-consent legally happens and it is thin (one buried line at demo.html:125).

## GATES before the flip
1. Place the form consent lines (below) on demo.html.  [dev, minutes]
2. Demo-service spoken recording notice: RESOLVED by David 8/28 (code-verified). The demo service jra-voice-agents-demo (srv-da08c73l550s73cshbtg) autodeploys from main, runs today's main with the disclosure at the shared render choke point (cascadeBridge:3126 withRecordedLineNotice, design comment names "the demo line" explicitly), PHONE_RECORDING_ENABLED=true, same env var that starts recording so no record-but-silent state. Caroline's interview greeting introduces her -> takes the primary "on a recorded line" form. EMPIRICAL CLOSE: Lee confirms he hears "Caroline on a recorded line" (or the fallback sentence) at the top of his next test call. If he does NOT, flag David immediately (would mean a path bypasses the choke point).
3. Fold in the policy completeness line (below). [not strictly blocking; point-of-collection carries consent]

## SHIP AGAINST origin/main (6d112c2), NOT the local tree
The local jenny-webinar working tree is on branch `stage-advideo` @ 53cfaa2, which LACKS the markers. On **origin/main (6d112c2, the merge-one commit)** the anchors exist:
- demo.html:137 = the visible consent `<p>` (`We record this demo call...`)
- demo.html:138 = `<!--CONSENT_RECORDING_SLOT-->`
- demo.html:139 = `<!--CONSENT_SMS_SLOT-->`
- demo.html:140 = `<button type="submit" id="regBtn">Text me a code</button>`
USE ANCHORS, NOT LINE NUMBERS (numbers drift). Consent must stay ABOVE the submit button (deliberate, phone-fold reason in the in-file comment). Do a phone-width (375px) check after: the added copy must not push the button below the fold.

## FORM: corrected visible line — REPLACE the visible consent `<p>` (the `We record this demo call...` paragraph, origin/main:137)
```html
<p class="consent">Use the mobile number you will be calling from. It is the phone Caroline recognizes when you call in, and it is where we text your verification code. By continuing you agree to the recording and text message notices below and to our <a href="/privacy">Privacy Policy</a>.</p>
```

## FORM: recording notice (populate the `<!--CONSENT_RECORDING_SLOT-->` marker, origin/main:138)
```html
<p class="consent">Recording notice. The demo is a phone call you place to Caroline, and that call is recorded. You are also reminded at the start of the call. We use the recording only to email you your own copy of the demo. By starting your demo and calling the number we send you, you consent to the call being recorded. We do not publish, sell, or advertise with your recording. See our <a href="/privacy">Privacy Policy</a> for how long we keep it and how to have it deleted.</p>
```

## FORM: SMS notice (populate the `<!--CONSENT_SMS_SLOT-->` marker, origin/main:139)
```html
<p class="consent">Text message notice. When you request your code, we send a one time verification text to the mobile number above. These are transactional messages to confirm your number and set up your demo, not marketing. Message frequency depends on your demo activity, typically one message per request. Message and data rates may apply. Reply STOP to opt out and HELP for help.</p>
```

## POLICY: completeness line (add to the DEMO_PUBLIC-gated demo paragraph, server.js ~729)
```
If you run a live demo, the demo is a recorded phone call and we email you the recording. We tell you it is recorded on the demo form and again at the start of the call, we use it only to send you your copy, and we keep it for [PLACEHOLDER: recording retention period, e.g. 30 days].
```
(A fuller policy expansion — retention, do-not-sell extension to the number+recording, Your Choices — was also drafted; optional completeness, in the task record.)

## NEEDED FROM LEE
- [PLACEHOLDER] recording retention period (e.g. 30 days) — demo runs on the separate demo service, value unverified here.
- [PLACEHOLDER] demo phone-number retention period.
- STOP + HELP: **RESOLVED 8/28 (verified read-only via Twilio API).** The demo verification code sends through CSPreston account (AC62ba…4268) Messaging Service MGc6c6c…, US A2P campaign **COGTX4O = VERIFIED** (registered use case "confirm their identity" = 2FA, which is exactly the demo code). opt_out_keywords include STOP + STOPALL + CANCEL/END/QUIT/UNSUBSCRIBE; help_keywords include HELP + INFO. So the SMS consent line "Reply STOP to opt out and HELP for help" is ACCURATE and ships as written — do NOT strike HELP. (Note: this is the 2FA/verification campaign; the demo code fits it, but do not push non-2FA owner alerts through the same service — separate silent-filtering risk, see A2P setup memory.)
- One vs two /privacy links (intro line always; recording-slot link optional).

## RISK (flagged, not resolved)
Prospect calls a recorded line, so in 2-party-consent states (CA, FL, WA, IL, PA...) the form + a start-of-call spoken notice TOGETHER are the consent. Both must be present and firing before the flip. Confirm the demo service speaks it.
