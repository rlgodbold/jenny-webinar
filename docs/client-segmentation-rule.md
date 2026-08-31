# Who gets the missed call sequence, and who does not

Written before the pull rather than after, so the pull can be checked against what the rule
actually needs. Thresholds below are **starting points to calibrate against the real
distribution**, not values I can justify precisely without seeing it.

---

## THE PRINCIPLE

The sequence tells an owner he has a missed call problem. That is only worth sending if three
things are true at once, and **all three have to be true, not one of them**:

    1. He HAS one                    the misses are real and not a one month blip
    2. Jenny FIXES it                the misses are addressable, not instant abandons
    3. It is worth $500 a month      the volume clears the arithmetic

Fail any one and the email is wrong about his business, using his own data, in the first
sentence. There is no recovering that with a client.

---

## THE THREE GATES

### GATE 1: is there a problem, and is it persistent?

Use the **addressable** miss rate, never the headline never-reached rate. The headline number
includes sub-15-second abandons that Jenny cannot catch, so pitching against it promises
movement that will not happen.

    include   addressable miss rate at or above roughly 10%
    exclude   below that

**Reference points from the prospecting work:** live Jenny tenants sit at 2.1 to 9.0% never
reached, the best answered half of the network runs about 32% addressable, and the worst
decile runs 79% addressable. So a client under 10% addressable is performing like a company
that already has Jenny. **Telling him he has a problem is a stretch he will notice.**

**Persistence: require the elevated rate across at least two consecutive months.** A single
bad month is a vacation, a receptionist's notice period, a phone system change, or a data
artifact. Being wrong about a stranger's month is embarrassing; being wrong about a client's
month is worse, because he knows exactly what happened in it and we are supposed to be the
people who watch his numbers.

### GATE 2: is the problem the kind Jenny fixes?

    include   addressable share at or above 50% of total misses
    exclude   below that, i.e. mostly sub-15-second abandons

Clutter Boss was dropped from the prospect list for exactly this: it looked like a leaker on
the headline rate and was 18% addressable underneath. **A client in that shape who buys will
check the number afterwards, and it will not move the way the email implied.** That is a
refund conversation we manufactured ourselves.

### GATE 3: does the arithmetic actually work for him?

This is the gate I would add that nobody has asked for, and I think it matters most.

    include   roughly 10 or more ADDRESSABLE missed calls per month
    exclude   below that

Rough basis, using conservative numbers: if a quarter of addressable misses would have been
real jobs at a $250 ticket, ten misses a month is about $625 of recovered work against $500 of
cost. Below that, Jenny does not pay for herself yet and **we would be selling a client
something that loses him money.**

**This is a retention gate as much as an honesty one.** A client who buys and cannot see the
value churns, and then tells other owners in a small industry that it did not work. In a
recurring business the churn cost of a bad-fit sale exceeds the revenue from it, so the volume
floor protects the P&L, not just the conscience.

---

## WHAT HAPPENS TO THE CLIENTS WHO DO NOT QUALIFY

Not "nothing," but **not this sequence**. Three groups, three different answers.

**Good answerers (fail gate 1).** These are the clients doing it right, often by paying
somebody to sit on the phone. **Do not send them a problem they do not have.** If there is a
message for them later it is a cost one, not a leak one: what that coverage costs in wages
versus $500. That is a different email and it should wait until we can say it honestly.

**Mostly abandon (fail gate 2).** Their issue is speed and ring time, not coverage. Jenny
answering on ring one may genuinely win some of those back, but **we do not know by how much
and we must not imply we do.** Leave them out until the Junk Doctors LSA and answer-speed work
gives us a real number. Then they get a different, better-evidenced message.

**Low volume (fail gate 3).** Nothing wrong with their operation, they are just not big
enough for this to pay yet. **Revisit as they grow**, which is a good reason to rerun this
segmentation quarterly rather than treating it as a one-off list.

---

## WHAT THE PULL NEEDS, so the rule can run

    per client, for at least the last TWO complete months:
      total inbound calls
      never reached, split into: rang out or voicemail (ADDRESSABLE)
                                 abandoned under ~15 seconds (NOT addressable)
      after hours share of the addressable misses
      their average ticket if we hold it, otherwise a per-client assumption we can defend

The after-hours split matters for the copy as well as the rule: **[AFTER_HOURS] is the most
persuasive number in the email**, because it is the one an owner cannot argue with. He knows
nobody was there.

## ONE THING TO EXPECT

**This list will be much shorter than 115**, and that is the rule working rather than failing.
If it comes back at 30 or 40 clients, those are 30 or 40 conversations where we are provably
right about their business, which converts better than 115 where we are sometimes wrong.

If it comes back at 5, the thresholds are too tight and we calibrate. If it comes back at 100,
either JRA's clients answer their phones very badly or the addressable filter is not being
applied, and I would want to check the second before believing the first.
