# Phase 1: the leak fixes, specced

Three work items. None of them is media spend. All three are changes to Lee's live
properties, so: **specced here, approved by Lee, built by whoever owns the site. None by me.**

Ordered by return per hour of work.

---

# ITEM 1: THE CONTACT CENTER

**This is a decision, not a task.** The work is trivial once Lee answers; the answer is the
whole job.

## Current state, verified 2026-08-29

    /contact-center            301 -> /contact-center-form-submission-thank-you/
    /services/contact-center   301 -> the same thank-you page
    in the sitemap             ZERO occurrences (32 pages listed, its 3 siblings included)
    in the global nav          on every page of the site
    on /services/              listed as ONE OF FOUR core services

A visitor is told "Thank You for Your Interest. A member of the JRA team will reach out to
you soon." They submitted nothing. No lead exists. Nobody reaches out.

## Branch A: the Contact Center is still sold

Follows if Lee's answer to the ladder question is that it is the middle rung.

    1. Build a real sales page at /services/contact-center/ with a lead form,
       consistent with its three siblings (Google Ads, SEO, Web Development)
    2. Point the nav item and the /services/ card at it
    3. Retire the 301 to the thank-you page

## Branch B: the Contact Center is retired

Follows if Jenny replaced it.

    1. Remove the item from the global navigation
    2. Remove the card from the /services/ index
    3. Redirect /contact-center and /services/contact-center to /services/

**Do not skip step 2 in branch B.** The /services/ index is the page whose entire job is to
list what JRA sells. Leaving it there is the same defect one layer down, and it is exactly
the kind of thing a nav-only fix misses.

## Do this regardless of the answer

**The redirect target is wrong in both branches.** Sending anyone to "thank you for your
submission" when they submitted nothing is never correct. If Lee is slow on the ladder
question, this one line can be fixed on its own and should be: point it at /services/.

---

# ITEM 2: INSTRUMENT SPECIALTY TRUCK BODIES

**Until this is done, STB cannot be advertised.** Not "should not": the spend could never be
evaluated, and none of it reconstructs afterwards. This is the pre-spend blocker.

## Current state, verified on junkremovaltrucksforsale.com (the canonical domain)

    call tracking        NONE
    analytics / gtag     NONE
    Meta pixel           NONE
    ads conversion tag   NONE
    phone number         919-342-5488, static, identical on every page

    / and /contact/                          form + phone
    /trucks/ /trailers/ /gallery/
    /financing/ /warranty/ /maintenance/     PHONE ONLY, no form

Six of eight pages, including the two where a buyer is deepest in consideration, offer no way
to enquire except a number nobody can attribute.

## In order, cheapest and highest value first

**1. Call tracking. Do this first.** On six of eight pages the phone IS the conversion, so
without it the primary path is invisible. **JRA already runs a CallRail master account with
710 companies in it**, so this is an addition to a system that already exists and already has
a contract, not a new vendor. It is also the same system that powers the prospecting engine.

**2. Analytics and a pixel.** So that on-site behaviour and form completions exist as events
at all. Whichever analytics JRA already uses, for consistency.

**3. A conversion path on the deep pages.** A form on /trucks/ and /financing/ at minimum.
Someone comparing trucks or reading financing terms is the most valuable visitor on the site
and currently has to pick up a phone or leave.

## The dependency worth stating plainly

Instrumentation must exist **before** the first STB ad, not alongside it. Week one cannot be
instrumented retroactively, and week one is exactly when a broken funnel is cheapest to
catch, because you have spent the least.

## Still blocked on Lee

**How many trucks can STB build per month?** If there is a ceiling, the campaign's job is to
generate exactly enough and stop, which is a different campaign from "grow leads." That one
number changes the shape of everything downstream of it.

---

# ITEM 3: THE BLOG

**Framing, not a task.** Latest article is August 2023. Two years dormant, on a site that
sells SEO as a paid service.

The problem is credibility before it is traffic. A prospect evaluating JRA's SEO offer who
clicks Articles sees the most recent thinking is two years old. That is an argument against
the product, made by the product's own website.

**Three honest options, Lee's call:**

    REVIVE   a real cadence, owned by someone, with a date it starts
    RETIRE   remove Articles from the nav; the archive can stay reachable but unlinked
    LEAVE    a legitimate choice if the traffic is worth more than the impression costs

I would want to see the blog's actual organic traffic before recommending between them, and I
do not have analytics access. **If those pages still pull meaningful search traffic, retiring
them would be throwing away earned ranking**, and reviving beats retiring. If they pull
nothing, the nav item is doing pure harm and should go.

That is one number away from being an easy decision, and it is a number I cannot see.

---

# WHAT NONE OF THESE ARE

None of these three items is a campaign, and none costs media budget. They are the reason I
have not proposed a budget yet: **there is meaningful lead flow to recover before any of it
depends on buying more traffic.**
