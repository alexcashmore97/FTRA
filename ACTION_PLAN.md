# FTRA — Action Plan

**Launch: 15 May 2026.** Today: 1 May. **14 days.**

This plan reflects your priorities, not a generic strategy. Top 3 are the spine. The supporting stack is everything else you named — fleshed out, not expanded with new ideas.

---

## The Top 3

### 1. Fighter Access — Instagram Spotlight + Sponsor Matchmaking

The flagship monthly post. A cinematic 30–60 second clip of a ranked fighter (rotating through #5–15 across all 24 divisions, not just champs). Brand-styled, FTRA-locked. Caption signals the fighter is open to partnerships and routes the conversation to FTRA, not to the fighter.

**The brokerage:**
- Brand DMs FTRA (or hits the partnership form). Fighter is not contacted directly until terms align.
- FTRA negotiates: one-off, multi-month, gear-in-kind, or cash.
- **Cut: 15% on first deal, 10% on renewals.**
- Fighter can decline anything. Never auto-routed.

**Cadence:** ~one drop per week, rotating across divisions. ~48 fighters covered per year. Deep roster gets surfaced, not just the top tier.

**Pricing reference (so brands get a clear answer):** $500–$3,000 per fighter per month for ongoing placement; $150–$500 for one-off post inclusion; gear-only deals from zero up.

**This week:**
- Design the IG post template — locked brand layout, name plate, ranking, division, sponsor-CTA strip.
- Pick the first 4 fighters for the May rotation. Get usable footage (existing or quick shoot) + written consent.
- Draft the 1-pager "FTRA Brand Partnerships" PDF brands receive on enquiry — what's included, rates, who they reach.
- Stand up an enquiry inbox: Tally form on the site → partnerships@ inbox + Calendly link.

---

### 2. Email Capture — "Stay Informed"

Soft modal on first visit, easy to close. Single field, single CTA: **"Stay informed — rankings movement, fight cards, the wrap each Sunday."** Easy opt-out, transparent expectation.

**Year 1:** owned audience build. Nothing sold to them. Goal: 5,000 subscribers by year-end.
**Year 2–3 commercial use:** sponsor slots in the newsletter, partner-offer drops, paid product launches (merch, featured fundraiser campaigns) sent to list.

**Tooling:** Beehiiv (free up to 2,500 subs, clean templates) or ConvertKit. Avoid Substack — its branding overshadows yours.

**This week:**
- Pick ESP, create account, build welcome email + first Sunday Wrap template.
- Build the modal: shows once per visitor (cookie), dismissible (X, ESC, click outside).
- Build /unsubscribe + preferences page.
- Mobile QA — modal must not break the experience.
- Draft 4 weeks of Sunday Wrap outlines so the post-launch cadence is locked.

---

### 3. Stable / Promoter Sign-Up + Match Suggestions

Fighters set their **readiness status** — `Available`, `In camp`, `Post-fight rest`, `Long-term out`. The system uses it to surface potential matchups.

**Fighter view (loud):** profile shows suggested potential opponents at compatible weight (±2kg) and ranking (±3 positions) with similar last-fight recency. Fighter can flag interest.

**Stable / Promoter view (quieter):** dashboard browses opt-in available fighters by weight, ranking, region. See system-suggested matchups across the roster they have access to. No aggressive notifications.

**All suggestions are suggestions only.** Nothing auto-booked. Fighter consent always required.

**Pricing:**
- Fighter: free.
- Stable / Promoter Pro: $39/month.
- Stable / Promoter Elite: $99/month (multi-fighter management, priority listings, lead capture).

**This week (scope + ship the toggle, defer the dashboard):**
- Spec data model: `readiness_status` on fighter, `linked_fighters[]` on stable, `account_type` on user.
- Pseudocode the match-suggestion algorithm (weight + rank + recency + opt-in).
- Ship the **readiness toggle** on the fighter profile in time for launch.
- Defer the full match dashboard to a v1.1 sprint end of May.

---

## The Supporting Stack

### Rotating Brand Banner — Stock-Ticker + Photo Premium

Two tiers of inventory, deliberately different price points so the small AU brands can play and the bigger ones can stand out.

**Ticker (text-only):** CSS marquee strip, persistent footer or thin top band. Rotates 6–10 brand mentions. Editorial feel, not disruptive.
> Example flow: *FightHQ — 20% off Engage shorts | OPRO — sponsored mouthguards for top-10 fighters | Recover Co — physio bookings open | Mouthguard Man — fight-night fittings ...*

**Photo banner:** square/rect placements on homepage, top of division page, side rail of fighter profiles. Visible, branded, clickable.

**Rates:**
- Ticker slot: **$100–$250/month** per slot.
- Photo banner: **$400–$800/month** per slot.
- Bundle (ticker + photo): 15% off combined.

**This week:**
- Build the ticker component — HTML/CSS marquee + admin entry to rotate copy.
- Spec photo banner placements in code.
- Build a 1-page rate card.
- Email 5 first-call brands: FightHQ, OPRO/SISU, a physio/massage business, Engage AU, a labour-hire firm contact.

---

### Podcast Sponsorship & Shoutouts

**Outbound (this week):** book yourself onto 2 existing AU combat-sports podcasts during launch week. Free promo, high-trust audience.

**Inbound (post-launch):** sell shoutout slots in the Friday card-preview reel and the Sunday Wrap. *"This week's card brought to you by [Brand]."* Rate: $250–$500 per shoutout.

**This week:**
- Email 3 AU combat-sports podcast hosts requesting a launch-week appearance.
- Draft a 1-page sponsor shoutout rate card.

---

### Visa / Letter of Recommendation — Free, Not Sold

Free service. Ranked fighter requests a verification letter for travel/visa support to international camps or events. FTRA generates a templated, signed letter — current ranking, division, active status, recent fight record.

**Why free:** goodwill, fighter loyalty, positions FTRA as the credibility layer internationally. Near-zero cost. Quietly builds the international bridge for Year 2 without ever charging fighters for it.

**This week:**
- Build the 1-page Word/PDF template (header, ranking, signature block).
- Add a "Request a verification letter" link in the fighter dashboard (placeholder pre-launch, live shortly after).

---

### Event Security Partnership — Jesse Maio / The Door List (NZ)

Introduce The Door List as FTRA-recommended event security across AU + NZ Muay Thai cards. Promoters running FTRA-sanctioned events get a vetted security option; The Door List gets a referral stream; FTRA gets a credibility uplift and a small co-marketing slot or revenue share.

**This week:**
- Send Jesse an intro email — concept only, no formal ask. Keep it short.
- If positive, schedule a 30-minute call within 7 days to scope the partnership.
- Don't formalise pre-launch. Land as a partnership announcement after launch.

---

### Booking Seminars (Low-Tier)

Ranked fighter + gym co-list a 1–2 hour seminar (technique, sparring, kicks, clinch). Bookable through the fighter profile. **Fighter sets the price** ($150–$500 per session typical). **FTRA takes 10–15%.**

Realistic for rising contenders, recent retirees, and well-known names not in active camp. Less likely for top-3 mid-camp fighters — still surfaced as an option for any fighter who wants the income.

**This week:**
- Spec the "Book a seminar" block on fighter profile.
- Defer shipping to v1.1 (post-launch). Don't overload the launch sprint.

---

### Fight-Week Newsletter — Auto-Create From Posts (No Double-Handling)

Every post created in the FTRA admin gets a tickbox: **`Include in Sunday Wrap`**. Ticked items go into a queue. Sunday morning a script assembles the queue into a newsletter draft using the Wrap template. Editor reviews → sends. **One piece of content created once, two channels served.**

**This week:**
- Add the tickbox to the post-creation admin form.
- Build the queue + Sunday assembly script.
- Confirm the ESP's API supports template injection from a JSON payload.

---

## Launch — 15 May

### Pre-Launch Email Capture (1–14 May)

- Pre-launch landing page live by **3 May** at the latest. Single value prop: *"FTRA's new rankings drop 15 May. Be first."*
- Daily countdown post on IG — one ranked fighter per day rotation — driving traffic to the landing page.
- The list captured here is the launch-day blast list.

### Launch-Day Email Blast (15 May)

- **At the top of the hour:** site goes live → email goes out simultaneously.
- Subject: short, urgent, brand. *"FTRA is live."*
- Body: 60-second launch video embed + "see your division" CTA + footer ticker.
- **Personal-feeling version** sent same morning to your warm-relationship list — every promoter, stable, fighter you know.
- **Press kit** issued same morning to AU combat-sports media.

---

## 14-Day Checklist

### Week 1 — May 1–7

- [ ] Pre-launch landing page + email capture modal live (3 May target).
- [ ] ESP picked, account set up, welcome email + Sunday Wrap template drafted.
- [ ] IG fighter-spotlight post template designed.
- [ ] First 4 May spotlight fighters selected. Footage + consent secured.
- [ ] "FTRA Brand Partnerships" 1-pager PDF drafted.
- [ ] Partnerships inbox + Tally form + Calendly link live.
- [ ] Ticker component built. Photo banner placements specced. Rate card 1-pager done.
- [ ] Outbound emails: 5 first-call brands (FightHQ, OPRO/SISU, physio/massage, Engage AU, labour hire).
- [ ] Outbound emails: 3 AU combat-sports podcasts for launch-week appearance.
- [ ] Outbound email: Jesse Maio / The Door List intro.
- [ ] Fighter readiness toggle: data model specced + UI built.
- [ ] Press kit drafted.
- [ ] Daily countdown spotlight posts queued through 7 May.
- [ ] Visa / verification letter template drafted (Word + PDF).

### Week 2 — May 8–14

- [ ] First fighter spotlight clip cut, approved, queued.
- [ ] Fighter readiness toggle live on profile.
- [ ] Sunday Wrap newsletter template built and tested.
- [ ] Auto-create-from-posts tickbox + Sunday assembly script shipped.
- [ ] Test send launch-day email to a small list (yourself + 2 trusted readers).
- [ ] Press kit issued to media.
- [ ] 2 podcast appearances confirmed.
- [ ] Full QA pass on new site: mobile, modal, banner, data load, fighter profiles.
- [ ] Personal pre-warning emails to top 30 promoters / stables / fighters: *"we go live Friday."*
- [ ] Launch-day email built and approved.
- [ ] Daily countdown spotlight posts queued through 14 May.

### Launch Day — May 15

- [ ] Site live at the top of the hour.
- [ ] First fighter spotlight goes live same hour.
- [ ] Email blast to pre-launch list.
- [ ] Personal-feeling email to warm-relationship list.
- [ ] Press kit re-issued to media.
- [ ] Live monitoring: site uptime, modal capture rate, banner load, data integrity, IG traction.
- [ ] **Sunday 17 May:** first Sunday Wrap newsletter goes out, marking the launch and reinforcing the cadence.

---

## What's Off This Plan (Deliberately)

These exist in the broader strategy but are **not** in the 14-day sprint:

- Insurance partnership (separate sales motion — pursue in parallel, not blocking launch).
- Sanctioning fees from promoters (post-launch revenue line, needs the live site as proof).
- Women's / junior lane sponsors (Q3 expansion, not launch).
- Hall of Fame, fundraiser platform, international bridge, coaching marketplace (later quarters).

These aren't dropped — they're sequenced.

---

## Assumptions & Uncertainties

- Pricing ranges (sponsor packs $500–$3k/mo, ticker $100–$250/mo, photo $400–$800/mo, seminars $150–$500) are starting frames. Validate with the first 2–3 real conversations and adjust before publishing the rate card publicly.
- Beehiiv vs ConvertKit — pick based on what feels better in 30 minutes of trial. Both work.
- The match-suggestion algorithm assumes you have weight class, ranking, and last-fight date in the dataset. If last-fight recency is patchy, v1 falls back to weight + rank only.
- The 4-fighter May rotation assumes you can secure footage and consent in 7 days. If fighters slip, drop to 3 and add the missing one in June.
- Jesse Maio / The Door List partnership is contact-warm but unverified — the intro email is the test.
- 15 May launch assumes the site rebuild is on track. If a critical issue surfaces in week 2, push the public launch by 7 days rather than ship broken — the pre-launch email list and IG cadence keep the momentum either way.
