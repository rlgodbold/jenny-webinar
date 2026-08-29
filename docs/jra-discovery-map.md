# JRA discovery map, and the plan skeleton

Status: DISCOVERY, part one of the new mandate. Verified against live sites on 2026-08-29,
not reconstructed from memory. Nothing here is a spend proposal.

Mandate from Lee (1:18 AM, 2026-08-29): get familiar with everything JRA does, build a
marketing plan, grow leads for **two targets, JRA and Specialty Truck Bodies**, and track
leads to sales to close rates honestly.

---

## THE FINDING TO READ FIRST: a product in the nav with no sales page

**"Contact Center" is in JRA's main navigation. It has no page.**

    nav link              /contact-center
    301 redirects to      /contact-center-form-submission-thank-you/
    /services/contact-center  redirects to the same thank-you page
    links from homepage to the real page   0

So a visitor who clicks Contact Center in the navigation is told:

  "Thank You for Your Interest in JRA's Contact Center. A member of the JRA team will
   reach out to you soon."

They filled in nothing. No form was submitted, no lead exists, and nobody will reach out.
The page also tells them to go subscribe on YouTube, which is the only working action on it.

This is a lead-flow hole on the primary site, on a paid product, and the mandate is
literally to increase lead flow. **Fixing this is cheaper than any ad we could buy**, and it
should be checked before we spend a dollar driving traffic into the same navigation.

Worth someone checking whether this is a broken redirect or a page that was deliberately
retired without removing the nav item. Either way the nav should not point at it.

---

## WHAT JRA ACTUALLY SELLS, verified from the live site

**Positioning, and it is strong:** "The Junk Removal Franchise Alternative. Franchise level
support without royalties and restrictions." That is a genuine wedge against a real
competitor set, and it is built on Lee's own story of nearly franchising Junk Doctors.

| Line | Page | Notes |
|---|---|---|
| Start Up Package | /start-up-package | Idea to opening day in under two months. Brand, regulatory, website, in person classroom + truck training in Raleigh. Anchors on "avoid over $100k of mistakes" |
| Google Ads management | /services/google-ads-management | |
| SEO | /services/seo | |
| Website development | /services/web-development | Claims sites convert 20% better than typical |
| Junk removal marketing | /junk-removal-marketing | Umbrella page |
| **Contact Center** | **none, see above** | **In the nav, no sales page** |
| Education | /education | Video training series, operations manuals |
| Video Job Estimator | /video-job-estimator | |
| Webinars | /webinars | |
| Jenny | jennycallagent.com | Separate property, $750/mo + $350 setup |

Supporting assets: 450+ YouTube videos, an email list, a reviews/testimonials page, and a
public Master Service Agreement PDF.

**Specialty Truck Bodies** (specialtytruckbodies.com): purpose built junk removal trucks and
trailers. Quote driven, **no prices published**. Already carries strong named testimonials
(Black Diamond, Junk Masters Minneapolis, Junk Busters Mid South).

---

## THE STRATEGIC FACT THAT SHAPES EVERYTHING

**Every JRA property sells to the same person: a junk removal business owner.**

    JRA start up package    -> owners starting out
    JRA marketing services  -> owners growing
    Contact Center          -> owners drowning in calls
    Jenny                   -> owners drowning in calls
    Specialty Truck Bodies  -> owners buying capacity
    Video Job Estimator     -> owners quoting jobs

This is not two audiences with two funnels. It is **one audience at different moments**, and
the moment determines the product. That is a better structure than two parallel campaigns,
because one content engine and one lead pool can feed all of it, and because a lead who is
not ready for one product is often ready for another.

It also creates the risk I flagged on organic: an owner who sees Lee selling six things
trusts each one less. **The segmentation should be by the owner's MOMENT, not by our product
catalogue.**

Second consequence, and it is the measurement one: if the same person can buy six things,
then lead-to-sale close rate is meaningless unless we record WHICH product a lead converted
on. A single blended close rate across JRA would hide everything worth knowing.

---

## OPEN QUESTIONS I CANNOT ANSWER FROM OUTSIDE

These gate the plan. Flagging rather than guessing.

**1. Contact Center: is it live, retired, or paused?** It changes whether Jenny competes with
it, replaces it, or upsells from it. If JRA sells both a human contact center and an AI voice
agent to the same owner, the sales conversation needs a rule for which one, and marketing
needs to stop pitching them at the same person.

**2. What does each line cost, and what is the margin?** Only Jenny's price is known to me
($750 + $350). Without price and margin per line I cannot rank where a lead is worth most,
and lead value is what decides budget allocation.

**3. Close rates and cycle length per line**, and where that data lives. Lee asked for leads
to sales to close rates. That requires a join between the lead source and the CRM. **What CRM
holds JRA sales, and can I get read access?** Without it I can measure cost per lead and
nothing after.

**4. Specialty Truck Bodies economics.** Order value, build lead time, and capacity. A truck
is a high ticket, long consideration purchase and probably capacity constrained. If STB can
only build N per month, lead generation past N is waste, and that changes the whole plan.

**5. Is the blog dormant on purpose?** Latest article is August 2023, two years stale, on a
site whose SEO is a product they sell. That is a credibility problem before it is a traffic
problem.

---

## PLAN SKELETON, for Alston to gate before it goes to Lee

Deliberately a skeleton. I am not proposing spend before the questions above are answered.

**Segment by moment, not by product.** Three entry moments, each with its own message:
starting out, drowning in calls, buying capacity. Route each to the product that fits.

**Sequence: fix the leaks before buying traffic.** In order of cost per unit of lead gained:
the Contact Center nav hole, then whatever the same audit finds on STB and the other service
pages, then the dormant blog, then paid.

**The testimonial assets.** Seven client videos (Dumpster Duo, Johnson's Junk, JP's Junk
Removal, Junk Catchers, Kitsap, KJ Haulaway, plus an edited folder). These are the strongest
asset in the whole mandate and they are currently unused in paid. Two of those names,
**Dumpster Duo and KJ Haulaway, also appear in the CallRail leaker table**, which is worth
knowing before we use their testimonial in a campaign that also targets them on a weakness.

**Paid, when it is time.** Jenny's campaign is the template and the plumbing already exists:
pixel, domain, audiences, UTM discipline. STB is the more interesting paid target because
the ticket is high and the testimonials are unusually good.

**Measurement, jointly with Alston's dashboard.** Campaign side is mine, dashboard is hers.
The non-negotiable: **close rate must be recorded per product line, not blended.**

---

## SITE AUDIT RESULT (2026-08-29, read only, no edits made)

**Every other page is healthy.** All 20 product and service pages return 200 and carry a lead
form. The Contact Center is the ONLY broken one, so this is an isolated defect, not a
systemic rot. That is worth saying plainly because it changes the size of the job.

**The Contact Center question is settled: it is a RETIRED PAGE, not a broken redirect.**
Evidence: it appears **zero times in the sitemap** (32 pages listed, including its three
sibling service pages), and the redirect is a deliberate 301.

**But the hole is bigger than a nav item.** It is still presented as a live product in two
places:

    global navigation      appears on every page of the site
    /services/ index       listed as one of FOUR core services, beside
                           Google Ads Management, Junk Removal Website, and SEO

So the page whose entire job is to list what JRA sells says the Contact Center is sold.

**Therefore it is not a fix, it is a decision, and it is Lee's:**

  a. **Still sold** -> restore a real sales page and point both routes at it.
  b. **Retired**    -> remove it from the nav AND from the /services/ index.

**Either way, a third defect stands on its own:** the redirect target is wrong in both
scenarios. Sending a visitor to "Thank you for your submission" when they submitted nothing
is never right. If the product is retired, that should redirect to /services/ or /contact-us/.

## PRODUCTS THE NAVIGATION DOES NOT SHOW

The sitemap surfaced several lines absent from the main nav. These change the map:

    /junk-removal-phone-training-course/    phone training course
    /customer-reactivation-marketing/       reactivation marketing
    /proximity-marketing/                   proximity marketing
    /services/business-package/             business package
    /affiliate/ and /affiliate-detail/      AN AFFILIATE PROGRAM ALREADY EXISTS
    /join/                                  joining (the network?)
    /franchise/                             a franchise page, on the franchise-ALTERNATIVE site
    /media-room/                            media room

**Two of these matter a lot.**

**An affiliate program already exists.** Lee's original brief to me included building agency
affiliate partnerships at 30% of MRR, which I parked behind paid ads. It should be checked
before anything new is designed, because the answer may be "extend this" rather than "build
one."

**THREE PRODUCTS SOLVE THE SAME PROBLEM: the phone.** A phone training course (train your
person), a Contact Center (outsource the person), and Jenny (replace the person). That can be
a genuine ladder, matched to an owner's moment, and sold as one. Or it can be three things
competing for the same budget and confusing the same buyer. **Which one it is has never been
decided, and it should be**, because it is the clearest instance of the segment-by-moment
principle in the whole catalogue.

## WHAT I HAVE NOT DONE

I have not opened the Drive folder of testimonials. It is Lee's Google Drive and I would be
reading his files; I would rather be told the folder is fair game than assume it.

I have not audited the other service pages the way I audited Contact Center. That sweep is
the obvious next step and it is where I expect to find more of the same.
