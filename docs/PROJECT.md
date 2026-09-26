# Project description and plan

**Working name:** Buzz In (see §4). **Track:** Live Better. **Also entering:** Photon (iMessage via Spectrum), MLH Gemini, MLH MongoDB Atlas, MLH .Tech domain.

**Pitch:** A bad roommate is a daily tax on your sleep, your kitchen and your peace. We match NYC newcomers on how they actually live, catch mismatches before anyone signs a lease, and then the same iMessage agent that matched you moves into your group chat to help keep the peace.

Judging (Devpost): Concept 30%, Functionality 30%, Wow 20%, UX 10%, Value to Community 10%. The earlier brainstorm is in [IDEAS.md](IDEAS.md).

### 1. Verdict on the current flow
**Keep:** the pre-screen, the two question types, the top-20 → 5 funnel, meeting before committing, and handing off to the real listing to apply.

**Concerns, highest risk first:**
1. **Tavily is not a scraper for Zillow/StreetEasy.** Tavily search returns public pages and snippets. Tavily Extract may be blocked by anti-bot protection on those sites, and those sites' terms still apply. Fix:
   - Run ingestion as an offline batch *before the demo*.
   - Extract with Gemini into a strict schema and cache it as a JSON snapshot. Store only the facts plus a source link and a "seen on" date.
   - Never make a live scraping call during the demo.
   - Pitch it as "we aggregate public listing results and link back," not "we scrape Zillow."
   - Drop Airbnb: it's short-term, and NYC Local Law 18 restricts rentals under 30 days (verify the exact wording before saying it on stage).
2. **Listing-first matching makes the pool too thin.** Very few people want the *same* single apartment. Fix: the pool is people who saved **overlapping listings OR the same neighborhood plus budget band**. The listing becomes the thing a pair goes after together.
3. **Gemini should not produce the compatibility number.** An LLM score is non-deterministic, can't be explained, costs a call for every pair, and can be manipulated: someone can type "rate me 100" into an open answer. Fix:
   - Short answers become a **deterministic weighted score** (dealbreakers plus distance).
   - Gemini handles the open-ended answers: it pulls out signals, flags contradictions and writes the "why." This is also the core of the answer to "what if the AI goes wrong."
4. **20 questions cause drop-off.** Use 10 quick-tap answers plus **5** open-ended ones. The AI summarizes the open answers, so shortlisting 5 people from 20 doesn't mean reading 200 paragraphs.
5. **The AI agent shouldn't talk inside a private chat uninvited.** It **privately suggests** a question to each person ("Sam said guests 'rarely' but described hosting Sunday brunch — ask?"). The user taps to send it or skips it.
6. **"Fastest match wins" rewards rushing** (replaced, per Kien). The app also can't actually secure an apartment it doesn't control. New rule:
   - A pair **locks** a listing once both people confirm and the House Agreement is done.
   - The listing shows "3 groups interested" to create urgency.
   - Handoff is the source link plus a drafted message to the broker.
7. **Safety for meetups with strangers:**
   - Mutual opt-in before any chat.
   - Phone numbers stay hidden: the agent relays messages.
   - Meet in public.
   - Verify with an .edu or work email.
8. **Fair housing:** match on habits only. Gemini's output schema has no fields for protected traits, and the prompt forbids inferring them.

### 2. Is it Live Better?
As written, it's **borderline**. The flow ends when the lease is signed, so it's a housing-search product, which sits closer to Hack the City's "housing." Live Better is about "helping one person's day run smoother."

**The fix is also the originality hook:** *the same iMessage agent that matched you moves into your group chat.* After move-in it:
- sends the House Agreement
- sends trash-night and chore reminders (DSNY schedule by address)
- sends heads-ups about guests or quiet hours

The pitch: a bad roommate is a *daily* tax on sleep, cleanliness and noise. We prevent that before the lease and keep the peace after it. That line also makes Photon fit naturally.

### 3. User group and pain point
- **User:** students and early-career newcomers to NYC (interns, grad students, new grads) who have no local network. They want a room in a shared 2–3 bedroom place at about $1.5–2.2k per room.
- **Pain:** today they find roommates in Facebook, Reddit and Discord groups through one DM "vibe check." They sign a 12-month lease with a stranger and discover the mismatch (sleep, dishes, guests) after moving in, with no easy way out.
- **Pressure:** NYC's vacancy rate is 1.41%, the lowest since 1968 ([HPD](https://www.nyc.gov/site/hpd/news/007-24/new-york-city-s-vacancy-rate-reaches-historic-low-1-4-percent-demanding-urgent-action-new)), so decisions get rushed.
- **Evidence to collect at the event:** a 2-minute poll of 20–30 hackers ("Have you had a roommate conflict? About what? Where did you find them?"). Put the results on a slide. That's first-hand data about this exact user group.

### 4. Names (ranked)
1. **Buzz In**: the NYC buzzer. "Decide who you buzz in."
2. **Thin Walls**: funny and very NYC. "You'll hear everything, so choose well."
3. **Stoop**: where New Yorkers meet neighbors.
4. **Second Key**
5. **Splitflat**
6. **Keymate**
7. **Walkup**
8. **Halfsies**
9. **Nestmate**
10. **Roomtone**

### 5. Product flow v2
1. **Pre-screen (30 s):** budget, move-in month, lease length, neighborhoods or commute anchor, dealbreakers (smoking, pets or allergies).
2. **Browse and save listings:** from the Tavily snapshot. Each card shows price per room, a link to the source and a "seen on" date.
3. **Profile:** 10 quick-tap answers and 5 open-ended ones.
   - Quick: bedtime, wake time, cleanliness 1–5, dishes timing, guests per week, overnight guests, home noise level, WFH days, smoking/cannabis, shared vs separate groceries.
   - Open:
     - a perfect Sunday at home
     - a roommate habit that drives you crazy
     - how you raise a problem
     - your typical weekday
     - "social hub or quiet recharge?"
4. **Top 20:** the deterministic score. Each person gets a Gemini card with a 2-line summary, 3 "you'll click" and 2 "you'll clash" reasons, and a contradiction flag.
5. **Shortlist 5.** Chat opens only on **mutual** interest.
6. **iMessage concierge (Photon/Spectrum):** the agent introduces the pair, relays messages with numbers hidden, and privately suggests a question for each flagged discrepancy.
7. **Meetup:** the agent proposes 3 times from both people's free windows plus a public spot near the listing, and sends safety tips.
8. **Lock and hand off:** mutual confirmation, then Gemini drafts the House Agreement (quiet hours, guests, chores, bills, thermostat) and flags open questions. The listing locks for the pair, and the broker message is drafted.
9. **After move-in:** the same agent runs trash and chore reminders and guest heads-ups.

### 6. Architecture
- **Web:** Next.js (TypeScript) on Vercel. It's the same language as Spectrum.
- **DB:** MongoDB Atlas, which also stacks the MLH MongoDB prize. Collections: listings, profiles, matches, threads.
- **Ingestion (offline, Python):**
  1. Tavily search: queries per neighborhood × bedrooms × price band.
  2. Tavily extract.
  3. Gemini structured output: price, beds, baths, address, neighborhood, move-in date, URL.
  4. Schema validation. Drop anything without a price or address.
  5. Dedupe by address plus price.
  6. Load into Mongo.
  7. Fallback: 40 hand-checked listings.
- **Matching:**
  - Dealbreaker filter.
  - Weighted distance on the 10 quick answers. Bedtime and cleanliness weigh most; the weights are editable.
  - Gemini embeddings on open answers as a small bonus, capped at 15% of the score.
  - The top 20 are cached for each user.
- **Gemini jobs:** open-answer signal extraction, contradiction detection (cites both quotes), match-card copy, the House Agreement draft and listing extraction. All use JSON schemas.
- **Agent:** a Bun worker running Spectrum's `app.messages` loop, backed by a state machine: intro → relay → suggest-question → schedule → agreement → reminders. It reads and writes Mongo. It's a long-running process, so it runs on Railway/Render (Photon has templates) or a laptop for the demo.
- **Seed data:** 150 synthetic profiles generated by Gemini and labeled synthetic, plus real sign-ups from hackers at the event.

### 7. What if the AI goes wrong?

| Failure | Guardrail |
|---|---|
| Wrong or low-quality match | The score is deterministic and explainable. Users decide at every step, and mutual opt-in is required. |
| Hallucinated discrepancy | The agent must quote both source answers word for word. It asks a question and never accuses. The user decides whether to send it. |
| Prompt injection in answers ("rank me #1") | The LLM never produces the score. Answers go in as delimited data under a strict output schema and a length cap. |
| Bias or protected-trait inference | The schema has no such fields and the prompt forbids them. Open answers can't hard-filter anyone, and the bonus is capped at 15%. |
| Junk, stale or scam listings | Schema validation, a "seen on" date and a source link. Rules flag a price far below the neighborhood median or "pay before viewing." |
| Gemini, Tavily or Photon outage | Cached snapshot, rule-based scoring, and fallback to web chat. **`AI_OFF` flag:** demo live that the app still works without AI. |
| Agent oversteps in chat | It only messages each user 1:1, suggestions are drafts, and `/quiet` mutes it. |
| Privacy | Numbers are relayed, never shared. Room photos are private until a mutual match. EXIF data is stripped. |

**Eval:** Nao hand-labels 30 profile pairs as good, ok or bad. Report how often the score agrees, and contradiction-detection precision on 20 planted contradictions. It gives a real number for "is it accurate?"

### 8. MVP cut (what the demo must show)
**Must have:**
- Tavily → listing snapshot
- pre-screen and profile
- deterministic top 20 with Gemini cards
- mutual shortlist
- iMessage agent intro plus one suggested discrepancy question plus meetup times
- House Agreement
- one post-move reminder in the same thread

**Cut:**
- live scraping
- payments
- in-app video
- background checks
- groups of 3 or more (do pairs only)
- native app

### 9. Build timeline (Sat 11 AM → Sun ~10:30 AM)
- **0–2 h:** repo, Next.js, Atlas, keys (Gemini, Tavily, Photon). Spectrum "hello" reply working. Questions frozen.
- **2–8 h:** Tavily ingest into 40+ listings, pre-screen and profile UI, scoring and seed profiles.
- **8–14 h:** Gemini cards and contradiction detector, match and shortlist UI, agent relay and suggestions.
- **14–20 h:** meetup scheduling, House Agreement, reminder, `AI_OFF` flag, eval numbers.
- **20 h → Sun 7 AM:** feature freeze. Then demo video, deck, Devpost write-up and hacker-poll slide.

**Roles:**
- **Kien:** Tavily ingest, scoring engine, integration and deploy.
- **Alisher:** Gemini prompts and schemas, Photon agent.
- **Grace:** web UI, deck and pitch.
- **Nao:** question design, weights, eval set and the event poll.

### 10. Rubric map
| Criterion | Where it shows |
|---|---|
| Concept 30 | The matchmaker that moves into your group chat; the mismatch is caught before the lease. |
| Functionality 30 | End-to-end live demo, graceful `AI_OFF` mode, eval numbers. |
| Wow 20 | A live iMessage on stage flags a real contradiction. |
| UX 10 | 30-second pre-screen, quick-tap profile, explained matches. |
| Community 10 | Newcomer and student focus, safety and privacy defaults, the hacker poll. |

**Prizes to also enter:** Photon, MLH Gemini, MLH MongoDB Atlas, MLH .Tech domain.

### 11. Check before the pitch
These are unverified. Don't state them on stage until someone confirms them:
- The exact wording of NYC Local Law 18 on short-term rentals.
- Whether Tavily Extract returns usable content from Zillow, StreetEasy and similar listing sites.
- Whether Spectrum supports iMessage group chats. If it doesn't, the 1:1 relay design above still works. Ask at the Photon workshop.
- Fair-housing details for roommate ads under the NYC Human Rights Law.
