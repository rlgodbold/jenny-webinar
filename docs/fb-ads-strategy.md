# The Facebook ads plan, start to finish

Written for Lee, 2026-08-26. Read once and you know how the $3,000 a month works.

---

## THE ONE LINE VERSION

We spend $100 a day showing junk removal owners a video of you explaining why hiring a
phone person always happens at the worst possible time. The ones who click land on a
page that asks them to hear Jenny answer a call. The ones who hear her get a
conversation with you. Roughly four or five of them a month become clients.

---

## 1. THE FUNNEL

    Facebook or Instagram ad
        -> jennycallagent.com/lp
            -> hear Jenny answer a call
                -> conversation with you
                    -> signed

Four steps. Every number we watch is a rate between two of them.

**The ad's only job** is to stop the scroll and get the right person to click. Not to
sell. Not to explain the whole product. Just to make a junk removal owner think "that's
my life" and tap.

**The page's only job** is to get them to hear her. It leads with identification, then
what she does, then price, then you. One action, repeated twice, no navigation, nothing
else to click.

**Jenny's job** is to be good enough that they want to talk. This is the actual close.
Everything before it is transportation.

**Your job** is the conversation. That is where $1,100 changes hands.

## 2. TWO DOORS

Not everyone is ready to hear an AI answer their phone in the first thirty seconds.

    Door one   /lp   -> straight to the demo.        The buyer who is ready now.
    Door two   /watch -> the recorded masterclass.   The buyer who wants to understand first.

Each ad points at one door. We test which produces cheaper clients. Door one should
win on speed, door two on quality. **Door two is a door, not a toll booth.** Nobody
should have to watch a class to reach the demo.

## 3. AUDIENCES, IN THE ORDER THEY MATTER

**1. Lookalike, 1%, seeded on your 616 buyers.** This is the whole game. Meta takes
616 junk removal owners who actually paid you and finds two million Americans who
behave like them. There is no "junk removal business owner" targeting option in
Facebook, and there never has been. This is how Hormozi reaches you and it is how we
reach people like you.

**2. Your 4,392 CRM contacts, directly.** These people already know your name. Cheapest
clicks in the account and the fastest closes. Not a seed, a destination.

**3. Retargeting.** Anyone who visits the site, watches 50% of an ad, or engages with
the JRA page. Small at first, grows every week we spend.

**4. Broad, with the creative doing the filtering.** The ad opens with "If you own a
junk removal company" on screen. Everyone else scrolls past and Meta learns fast who we
want. This works better than it sounds and it is where the scale is if the lookalike
saturates.

One thing to expect: the reachable universe here is maybe 30,000 to 60,000 owners. It
is small. We win by being unavoidable to a small group, not by finding new people. That
means creative burns out fast and gets refreshed on schedule, not when it dies.

## 4. THE MONEY

    Spend                    $100/day, $3,000/month
    Cost per lead            $35 to $45 target
    Leads                    about 75/month
    Lead hears Jenny         55%
    Hears her, books a call  30%
    Booked call closes       35%
    Leads per client         about 17
    Cost per client          $600 to $800
    New clients              4 to 5 per month

Each client pays **$1,100 on day one** ($750 first month plus $350 setup). So a client
who costs $700 to acquire is roughly cash neutral on the day they sign, and everything
after month one is nearly all margin.

Four clients a month held for a year is about **$36,000 a month in recurring revenue**
before churn. That is the case for spending, and it is why I would rather scale this
than protect it.

If those rates come in soft, the fix is in the table, not in the budget. Every row is
its own experiment.

## 5. CREATIVE

Four ads, all cut from your single two minute take.

    A1   1:41   full story          retargeting and warm audiences
    B    1:03   trap plus reveal    cold traffic default
    C    1:03   same, hook 2        "You're about to hire the wrong person"
    D    1:03   same, hook 3        "The worst time to hire is when you need to"

B, C and D are identical except the on screen hook in the first 3.6 seconds. Same
everything, one variable. That is the cleanest test possible off one shoot, and the
winning hook gets rebuilt onto A1.

Captions are burned in because most views play muted. The end card says the same words
as the button on the landing page, so the click and the page agree.

**What the ads do not say:** live transfer, owner texting, emergency escalation, or any
CRM other than Workiz. Those were in your raw take and I cut them, because a claim we
cannot deliver on day one becomes a refund in week three.

## 6. HOW I MEASURE AND OPTIMIZE

Six numbers, weekly: spend, cost per lead, lead to demo rate, booked calls, closes,
cost per client.

**One experiment at a time.** No structural change to an ad set before 72 hours or 50
results, whichever comes second. The single most common way to waste this budget is
fiddling daily and never letting anything gather enough data to be true.

**Creative refresh every two to three weeks**, on schedule, because the audience is
small and frequency climbs fast.

**Fix the worst number in the table, not the loudest one.** A bad cost per lead is a
creative problem. A good cost per lead with no booked calls is a page or demo problem.
They look the same in the bank account and they need opposite fixes.

## 7. FROM YES TO FIRST RESULTS

    Day 0    You say publish. I build campaigns, ad sets, audiences and the four ads.
    Day 0    You upload the two audience files and build the 1% lookalike.
    Day 1    Ads go live at $100/day across three ad sets.
    Day 1-3  Learning phase. Numbers look bad and mean nothing. We do not touch it.
    Day 4    First real read on cost per lead. First optimization.
    Day 7    Enough leads to see whether the demo converts them.
    Day 14   First full scoreboard. Kill the losing hook, scale the winner.
    Day 30   Cost per client is real. That is when we decide about more budget.

**Nothing before day 4 means anything.** The first three days always look wrong.

## 8. WHAT IS STILL BLOCKING, AS OF TONIGHT

**The Meta pixel is not firing.** I pulled all three live pages and there is no pixel
code on any of them. The code is deployed but it is switched off behind an environment
variable on Render, deliberately, because turning tracking on for pages that take
organic visitors was your decision and not a deploy's.

That switch has to flip before we spend, and it is not cosmetic. **Without the pixel we
cannot measure a single conversion, cannot build any retargeting audience, and cannot
let Meta optimize toward people who convert.** We would be buying clicks and guessing.
It is one environment variable.

Everything else is done: page live, terms correct and consistent, domain verified,
payment on the right account, audiences prepared, creative finished, copy written.

---

## OPERATIONAL RULE: DEPLOYS WHILE ADS ARE RUNNING

On 2026-08-26 a routine deploy took jennycallagent.com to 502 for about two minutes
while Render swapped instances. Entirely normal, nothing broken, no rollback needed.

Nobody was hurt only because the ads were not live yet.

**Once spending starts, a two minute deploy window is money spent sending junk removal
owners to an error page, and a first impression we do not get a second run at.** At
$100 a day that is small in dollars and large in effect, because the people who click
during that window are exactly the ones we paid to reach and they do not come back.

So, once ads are live:

1. **Pause the campaign for the deploy.** This is the default and it is the right one.
   Two minutes of paused delivery costs nothing and we make it back the same day.
   Two minutes of 502 costs the clicks, the impression, and the people we paid to
   reach. Alston's point, and better than my first version: pausing constrains
   nobody, whereas scheduling deploys around ad hours constrains everyone who ships.
2. **Deploying outside spending hours is a fallback**, not the rule. Useful when
   pausing is awkward, but it should never be the thing that decides when we can ship.
3. **Every ship ends with a curl for a 200 on the live URL**, then the content check.
   Status first. Checking the words without checking the status certifies a page that
   may not load, which is how the 502 above nearly went unnoticed.

None of this is an argument against deploying. It is an argument for doing it when
nobody is arriving.
