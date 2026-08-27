# Measuring the ads: what we track, how, and what it tells us

For Lee, 2026-08-26. Covers CAC, LTV, and everything in between.

---

## THE HARD RULE ON BUDGET

**I will never change the daily budget. Not up, not down, not temporarily.** It sits at
$100/day until Lee says otherwise, in his own words, directly.

I will recommend changes, with the reasoning and the numbers behind them. The triggers
are written down below so he knows in advance what would make me ask, rather than
getting a surprise opinion one Tuesday.

---

## THE PROBLEM WITH MEASURING ADS

Meta will tell us what a lead costs. It will never tell us what a customer costs,
because the money happens somewhere Meta cannot see: on a phone call with Lee, and then
in a bank account every month afterward.

So the job is joining four things that do not naturally talk to each other:

    1. Meta          spend, clicks, leads                      automatic
    2. The site      which AD produced which lead              built
    3. The sale      whether that lead became a customer       NOT built
    4. The revenue   what that customer is worth over time     NOT built

Steps 3 and 4 are exactly where CAC and LTV live. Everything else is diagnostics.

## THE ANSWER IS ONE SHEET, NOT AN INTEGRATION

At 75 leads and 4 or 5 customers a month, a spreadsheet beats any integration, because
an integration nobody maintains silently rots and a sheet somebody fills in does not.
When volume is ten times this, we automate it.

**One row per lead. Twelve columns.**

    date              when the lead came in
    campaign          from the UTM, which concept
    hook              from the UTM, which of B, C, D
    name / email      who
    called demo       did they actually phone Jenny        yes/no
    booked call       did they book time with Lee          yes/no
    call happened     did they show                        yes/no
    signed            did they buy                         yes/no
    signed date       when
    monthly           what they pay
    cancelled date    blank until it is not

That sheet, plus the Meta spend number, produces every figure below. Nothing else is
required to run this properly.

**The UTM already survives the click.** Acelynn's patch writes source, campaign and
content into the subscriber record, so a lead arrives stamped with the ad that made it.
Weekly export from the admin CSV, paste into the sheet.

## THE NUMBERS, IN THREE LAYERS

### Layer 1: is the ad working (Meta, daily)

    Cost per lead        target $35 to $45      THE headline number
    CTR                  above 1.5%             diagnostic, not a goal
    CPM                  $15 to $30             diagnostic
    Frequency            watch it pass 2.5      audience saturation warning

Frequency is the one people ignore. In a niche of 30,000 to 60,000 owners it climbs
fast, and rising frequency with rising cost per lead means the creative is burned and
needs replacing, not more money.

### Layer 2: is the funnel working (the sheet, weekly)

    Lead to demo         target 55%     page and offer problem if low
    Demo to booked       target 30%     Jenny problem if low
    Booked to closed     target 35%     sales problem if low

These three are why a spreadsheet matters. **A bad cost per lead and a good cost per
lead with no closes look identical in the bank account and need opposite fixes.**

### Layer 3: is the business working (monthly)

    CAC              ad spend in the month / customers signed from ads
    CAC payback      CAC / first month contribution
    Net new MRR      new monthly revenue added
    Churn            customers lost / customers at start of month
    LTV              monthly gross profit / monthly churn rate

## ON CAC

**First, exclude the test records.** Two deliberate test leads exist in the store from
tracing the lead path end to end on 2026-08-26 and 27:

    lee+fbtest826@junkra.com     name "TEST LEAD do not contact"
    lee+pixeltest827@junkra.com  name "PIXEL TEST do not contact"

Both are unsubscribed and both carry "TEST" in the name field, so they are trivially
filterable. **They are not being hard deleted on purpose**, because a data migration for
two rows is not worth the engineering time. The control is here instead: exclude them
whenever leads are counted.

This matters more than two rows sounds. At roughly 75 leads a month, two fakes is about
three percent on the number Lee steers by, and it lands hardest in week one when the
denominator is smallest and the ratio is most distorted.

    CAC = total ad spend / customers signed and attributed to ads

Target $600 to $800. Ceiling before it stops making sense: about $1,600, which is where
CAC payback passes 90 days.

Each customer pays **$1,100 on day one** ($750 first month plus $350 setup). After
delivery costs that is roughly $900 of contribution. **So a customer costing $700 to
acquire is close to cash neutral the day they sign**, which is an unusually forgiving
position and the reason this is worth funding.

**One warning about attribution.** Meta will claim more conversions than actually
happened, because it counts view-throughs and a 7 day click window. **When Meta and the
sheet disagree, the sheet is right.** Meta's number is for optimising delivery. The
sheet is for deciding about money.

## ON LTV, HONESTLY

**We cannot measure LTV yet, and anybody who gives you a number today is guessing.**

LTV is monthly gross profit divided by monthly churn rate. Nobody has churned. Zero
churn events means the denominator is unknown, and dividing by an unknown produces a
number that feels precise and is not.

So: a **planning assumption**, clearly labelled as one.

    Monthly revenue            $750
    Gross margin               about 75%
    Monthly gross profit       about $560
    Assumed churn              5% per month  <- THE ASSUMPTION
    Implied life               20 months
    Planning LTV               about $11,200
    LTV to CAC at $700 CAC     16 to 1

That ratio is absurdly good, which is itself the tell that the churn assumption is
doing all the work. At 10% monthly churn it halves. At 3% it nearly doubles.

**Revisit at whichever comes first: six months, or the third cancellation.** Until then
**CAC payback is the number to steer by**, because it is measurable today and LTV is not.

## WHEN I WILL RECOMMEND MORE BUDGET

All five, not some:

1. **At least 8 customers of data.** Below that, CAC is noise.
2. **CAC at or under target two weeks running.**
3. **Frequency under 2.5.** Room left in the audience.
4. **Delivery not limited.** Meta is spending the full budget.
5. **Lee can close more.** This is the one people skip. Doubling spend when the calendar
   is already full does not double customers, it raises CAC and annoys prospects.

## WHEN I WILL RECOMMEND LESS, OR PAUSING

1. CAC over $1,600 for two weeks. Past that, growth costs cash we do not get back fast.
2. Frequency over 4 with cost per lead climbing. That is a creative problem and more
   money makes it worse.
3. Any week where leads arrive and none convert. Something downstream is broken and
   spending into it wastes real money.

## WHAT TO BUILD NEXT, ONCE THERE ARE CUSTOMERS

**Offline conversions upload.** Take the customers who actually signed and send them
back to Meta. It then optimises toward people who buy rather than people who fill in
forms. This is the single highest leverage thing available after launch and it is
impossible before, because it needs real closed deals to learn from.

**Conversions API.** Server side event sending, better match quality, less loss to ad
blockers and browser restrictions. Needs an access token.

Both are week three or four. Neither is worth doing before there is data to feed them.
