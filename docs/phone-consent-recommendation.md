# Where to capture phone and marketing consent

Recommendation for Lee. Nothing built, nothing changed on the live site.

---

## BOTTOM LINE

**Ask after the demo, not during it.** None of the three options on the table is the right
place, and the reason is the same for all three: they all tax the front of the funnel to feed
the back of it.

    NOT the /demo phone field   it is functionally required, and bundling marketing
                                consent onto a required field is the one thing TCPA
                                does not allow anyway
    NOT Meta Lead Ads           it buys phone numbers from people who never saw the demo,
                                and the demo is what sells
    NOT /lp                     highest friction, lowest trust, on the page we are paying
                                for clicks to

**Capture it on the post-demo screen**, at the moment the owner has just heard Jenny answer
as his own company. Highest trust, zero risk to demo completion, and it leaves the
just-cleared transactional consent bundle untouched.

---

## WHY NOT THE DEMO PHONE FIELD, EVEN THOUGH IT IS THE HIGHEST-INTENT MOMENT

Lee's instinct is right about the moment and wrong about the field, for a reason that is
technical rather than a matter of taste.

**Marketing consent cannot be bundled into a required field.** The cell on /demo is
functionally necessary: it is the number that receives the code and the number Jenny
recognises on the inbound call. TCPA express written consent must be a separate, affirmative,
optional act, and consent may not be a condition of receiving the service. So even if we
reworded it, we could not simply widen the existing sentence. It would have to become a
separate unchecked box sitting next to a required field.

Which means the apparent advantage evaporates. **We would not get "every demo number." We
would get the subset who tick an optional box**, exactly as we would anywhere else, but we
would have paid for it by changing the character of the ask at the single most fragile moment
in the funnel.

And that cost is real and invisible. The demo is the closer. Someone who hesitates at the
phone field does not send us a note explaining why; they just do not finish. **We would be
trading a measurable marketing list for an unmeasurable loss of the thing that actually
sells.**

There is a second cost worth naming. The current wording, which legal cleared on 28 August, is
unusually clean: "these are transactional messages to confirm your number and set up your
demo, not marketing." That sentence is doing trust work. Adding a marketing ask beside it
weakens it even if the marketing ask is separate and optional, because the reader now has to
parse two different promises about the same number.

## WHY NOT META LEAD ADS

It is a good instrument for a different job. Lead Ads reliably produce more leads at lower
cost, because the form is pre-filled and never leaves Meta. They also reliably produce lower
intent, for the same reason.

**The disqualifying problem is that it bypasses the demo.** Our entire funnel design rests on
the demo being the closer: ad, landing page, demo, close. A Lead Ad captures a phone number
from an owner who has never heard Jenny answer as his company. We would be optimising for
phone numbers instead of for demos, which is optimising for the follow-up instead of the sale.

Worth keeping on the shelf though. If we ever want top-of-funnel volume for an outbound motion
where a human does the qualifying, Lead Ads are the right tool. Just not for this.

## WHY NOT /lp

/lp was deliberately built email-only, and I would keep it that way. It is the page we pay for
every click to, the visitor has zero trust because they clicked an ad thirty seconds ago, and
every additional field costs completions. Asking a stranger for a mobile number at that moment
is the highest-friction placement available to us and it would raise our cost per lead on the
one page where cost per lead is the number we steer by.

## WHY POST-DEMO WINS

**Trust is at its maximum and the risky moment has already passed.** They have just experienced
the product doing the thing we claimed. Nothing we ask now can cost us the demo, because the
demo is done.

**The ask becomes a natural next step rather than a toll.** "Want Lee to text you about setting
this up" reads as service at that moment. The same sentence at the start of the flow reads as
a catch.

**It leaves the legal work we just finished alone.** No rewording of a consent bundle that
counsel cleared on 28 August, no fresh legal review of the demo's transactional promise, no
risk of reopening something that is currently clean.

**And it will convert better than the same ask earlier**, because opt-in rates track trust,
and trust is higher after a good experience than before an unknown one.

The one honest cost: **we only get numbers from people who complete a demo.** That is a
smaller pool than asking everyone up front. I think that is the right trade, because a number
from someone who finished a demo is worth several from people who did not, and because the
alternative risks the demo itself.

Lee's stated fallback already covers the rest: **email for everyone else**, which is Cale's
MVP and needs no changes.

---

## DRAFT CONSENT WORDING

For legal, not for shipping. An unchecked box on the post-demo screen, next to a field
pre-filled with the number they already gave.

    [ ] Text me about setting Jenny up for my company.

    Junk Removal Authority may send you marketing texts at this number. A few messages a
    month, not daily. Consent is not required to buy anything. Message and data rates may
    apply. Reply STOP to stop and HELP for help. See our Privacy Policy.

It carries every element express written consent needs: an affirmative unchecked action, the
sender named, the marketing purpose stated plainly, frequency, rates, STOP and HELP, a privacy
link, and the not-a-condition-of-purchase line.

Two deliberate choices. **"A few messages a month, not daily"** because vague frequency
language reads as evasive and a specific one reassures. And **"Consent is not required to buy
anything"** is legally required but it also does commercial work: it tells a wary owner he can
decline and still get what he came for, which raises opt-in rather than lowering it.

## THE CONSTRAINT THAT DOES NOT CHANGE

**Numbers already collected stay off limits permanently.** They were given under an explicit
"not marketing" promise, and no later opt-in retroactively covers them. If someone in that
group later opts in through the new flow, they are in from that point forward, on the strength
of the new consent, not the old number.

That should be enforced in the data rather than in anyone's memory: the consent flag lives on
the record with the date it was given, and the marketing send reads the flag, never the phone
column.
