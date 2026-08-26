# Ad Landing Page + Pixel Spec (v1)

Spec owner: marketing. Build owner: Acelynn. Gate: Alston, then Lee.
Companion docs: fb-ads-plan.md (funnel), fb-ads-creative-v1.md (what the ads say).

This is what paid traffic lands on. Every dollar of the $3,000/mo hits this page
first, so its job is narrow: one decision, no wandering.

---

## PART 1: NON NEGOTIABLE COPY CONSTRAINTS

These are gates, not preferences. Anything violating them cannot ship.

**NO PRICE ON THE PAGE.** The number is in dispute and frozen until Alston confirms
and propagates. Build a price block that is easy to drop in later, and leave it out
for now. Do not put a placeholder number in, not even commented out, where it could
get uncommented by accident.

**ONLY THESE THREE CLAIMS.** She answers every call. She quotes your prices. She
books the job into your own Workiz.

**The email verb is ON HOLD as of 2026-08-25** and must not appear on the page.
"She emails you every time she books" is not automatically true for a new tenant.
Booking emails default to the JRA team, not the owner, unless onboarding seeds the
owner as a recipient with notifications live. Alston is verifying. Build the block
so a fourth line drops in without a rewrite, but do not ship a fourth line and do
not leave one commented out.

**DO NOT SAY OR IMPLY, anywhere on the page:**
- Live transfer to a human. No "she'll get you on the phone with your team."
  Verified behavior: she takes a name and callback number and alerts a manager.
- The owner email alert. On hold, see above.
- Any texting, to owners or to customers.
- Call recording as something the client gets.
- That a caller would not know it is AI. Jenny never claims to be human. This is a
  product law. Do not write clever copy that winks at it.

**Voice:** plain, no hype, no exclamation points, no dash punctuation anywhere in
user visible text. These are owners who run trucks. Write like a phone call.

---

## PART 2: THE PAGE

Mobile first and mobile mostly. Assume a phone, one thumb, and standing in a
driveway. Desktop is the minority of this traffic.

**One conversion action. No nav bar, no footer links, no "learn more" that leaves
the page.** The only exits are the CTA and the back button.

### Block order

1. **Headline.** Names the audience out loud, so the wrong reader self selects out.
   Working copy: "If you own a junk removal company, you should not have to choose
   between your family and the phone."
2. **One paragraph** of the Hiring Trap, short. The day you finally admit you cannot
   answer the phone anymore is the worst possible day to hire and train somebody.
3. **The CTA, high.** Above the fold on a phone. Not at the bottom.
4. **The verbs**, as three short lines with plain labels. This is the whole product
   description. Resist adding a fourth thing until Alston clears the email verb.
5. **Proof slot.** Empty for now. Real call audio goes here once Lee clears a client
   in writing and the two party consent check is done. Build the slot, leave it out.
6. **Who is behind it.** Lee, JRA. Photo. One or two sentences. This audience buys
   from a person they recognize, not from a brand.
7. **CTA repeated.** Same action, same words as the first one. Never a second,
   different offer.

### The CTA has to switch without a rewrite

Today `DEMO_PUBLIC` is false, so the CTA is the /watch registration.
When Lee flips it, the CTA becomes the demo, which is the far stronger close.

Please drive the CTA off the SAME flag and the same `sendDemoAwareHtml` pattern
already in server.js, so flipping the flag switches the page with no code change and
no deploy. That flag flip is expected within days and I do not want the landing page
to be a blocker on the day it happens.

### Form fields

Name and email, matching what /api/register already takes. Nothing else required.

Phone is worth a lot to us, because it is how we respond in under a minute instead of
whenever they check email. But it adds friction and it carries consent obligations, so:
make it **optional**, with explicit consent copy next to it, and do not ship the
consent wording until Alston gates it. If that is not settled tonight, ship without
the phone field rather than guess at the wording.

### Post submit

Do not send them to a thank you page that dead ends. Whatever the CTA was, the next
step happens immediately on the same screen: the video appears, or the demo starts.
Momentum is the entire asset and a "we will be in touch" page destroys it.

---

## PART 3: PIXEL

**Pixel ID comes from an env var, never hardcoded.** Lee has not provided it yet.
Absent the var, the pixel code should no op cleanly rather than throw.

Base code on every page: /, /watch, /demo, /demo/start, and the landing page.

### Events, with the exact moment each fires

| Event | Fires when | Why it matters |
|---|---|---|
| PageView | every page load | baseline, builds the retargeting audience |
| Lead | /watch registration SUCCEEDS, on the success panel, NOT on button click | this is what the ad campaign optimizes toward on day one |
| CompleteRegistration | demo start succeeds, phone in hand | best signal we have once the demo opens |
| DemoCompleted (custom) | prospect actually hears the demo through | the real intent signal, separates curious from serious |

**Fire on success, never on click.** A Lead event on button click counts failures and
network errors as conversions, and Meta will happily optimize toward people who fail
to sign up. This is the most common way a pixel quietly poisons a campaign.

### Also stub, do not build tonight

Conversions API endpoints, server side. It is a meaningful lift in match quality and
it is how we eventually feed CLOSED DEALS back to Meta so it optimizes toward buyers
instead of form fillers. Needs the pixel ID and an access token from Lee. Stub the
insertion points so it is a fill in later, not a refactor.

---

## PART 4: PRIORITY FOR TONIGHT

**MUST**
1. UTM patch applied on a branch (docs/patches/0001-watch-utm-capture.patch).
2. Landing page built to the block order above, price free, three verbs only.
3. Pixel base code plus the four event insertion points, driven by an env var,
   no ops cleanly when the var is absent.
4. CTA driven off DEMO_PUBLIC so the flag flip needs no deploy.

**NEEDS LEE OR ALSTON, DO NOT GUESS**
- The pixel ID
- The price and whether it appears on the page at all
- Consent wording for the optional phone field
- Any real call audio for the proof slot

**Do not put anything on the live registration site without Lee's review.** That repo
autodeploys to jennycallagent.com and the masterclass registration flow is live
revenue traffic. If a change would touch the existing /watch experience for people
already registering, flag it to me and Alston before it lands rather than after.

---

## PART 5: VERBATIM COPY

Use this as written. If something does not fit the layout, tell me and I will
rewrite it. Please do not edit copy to fit, because every line is checked against
the claim gate and a small rewording can put a dark feature back on the page.

**Route:** `/lp`. One route. Campaigns are distinguished by UTMs, not by separate
pages, so the pixel data stays pooled and there is one page to maintain.

**Headline**

    If you own a junk removal company, you should not have to choose between
    your family and the phone.

**Subhead**

    One of them pays for the other. That is the trap.

**Body**

    You know the day you decide to get help with the phone. It is the day you
    break. It is 97 degrees, you are on a truck, you are behind on estimates,
    and the phone will not stop.

    So in the worst week of your year, you are supposed to write a job post,
    interview six people, hire one, and train them on your own price list at ten
    at night. That is why owners wait too long, hire wrong, and do it again four
    months later.

    I built the one that shows up ready.

**CTA button**

    While DEMO_PUBLIC is false:   Hear her answer a real call
    After the flag flips:          Hear her answer as your company

**Micro copy under the button**

    No credit card. Takes about a minute.

**The verbs** (label in bold, sentence after it). THREE, not four.

    She answers.     Every call, every time, including the ones that come in
                     while you are in the back of a truck.
    She quotes.      Your prices, your items, your minimums.
    She books it.    Into your own Workiz, on your calendar.

The "She emails you" line is REMOVED as of 2026-08-25 and must not ship. See Part 1.
Build the block so a fourth line drops in later without a layout rewrite.

**Who is behind it** (with Lee's photo, lee.jpg already in public/)

    I am Lee Godbold. I run Junk Removal Authority and I have owned junk removal
    companies for years. I built this because I got tired of choosing between the
    phone and everything else.

NOTE: I deliberately did NOT write "it answers my own company's phone," which is
true and would be the strongest line on the page. It needs Lee's explicit OK to say
publicly. Alston, please ask him. If he says yes, it goes at the end of that
paragraph.

**Second CTA:** identical words and identical action to the first. Never a second,
different offer.

**Attribution:** record the source field as `lp:<source>/<campaign>/<content>` using
the same mechanism as the /watch patch, so the two entry points are distinguishable
in one field and no server change is needed.
