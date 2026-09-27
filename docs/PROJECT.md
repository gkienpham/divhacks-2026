# Project description and plan

**Working name:** Buzz In (see §4). **Track:** Live Better. **Also entering:** Photon (iMessage via Spectrum), MLH Gemini, MLH Tiger Data, MLH ElevenLabs, MLH .Tech domain.

**Pitch:** A bad roommate is a daily tax on your sleep, your kitchen and your peace. We match NYC newcomers on how they actually live, catch mismatches before anyone signs a lease, and then the same iMessage agent that matched you moves into your group chat to help keep the peace.

Judging (Devpost): Concept 30%, Functionality 30%, Wow 20%, UX 10%, Value to Community 10%. The earlier brainstorm is in [IDEAS.md](IDEAS.md).

### 1. Verdict on the original flow
**Keep:** the pre-screen, the two question types, the top-20 → 5 funnel, meeting before committing, and handing off to the real listing to apply.

**Concerns, highest risk first:**
1. **Listings come from SearchApi's Zillow engine, not live scraping.** Tavily is a search tool and doesn't reliably pull Zillow/StreetEasy pages. SearchApi returns structured JSON. Details are in §6.
   - Pull once as an offline batch and serve the listings from our own database. Never make a live API call during the demo.
   - Pitch it as "we collect public listings and link back to them." Don't call them "our listings."
   - Drop Airbnb: it's short-term, and NYC Local Law 18 restricts rentals under 30 days (verify the exact wording before saying it on stage).
2. **Listing-first matching makes the pool too thin.** Very few people want the *same* single apartment. Fix: the pool is people who saved **overlapping listings OR the same neighborhood plus budget band**. The listing becomes the thing a pair goes after together.
3. **Gemini should not produce the compatibility number.** An LLM score is non-deterministic, can't be explained, costs a call for every pair, and can be manipulated: someone can type "rate me 100" into an open answer. Fix:
   - Short answers become a **deterministic weighted score** (dealbreakers plus distance).
   - Gemini handles the open-ended answers: it pulls out signals, flags contradictions and writes the "why." This is also the core of the answer to "what if the AI goes wrong."
4. **20 questions cause drop-off.** Use 10 quick-tap answers plus **5** open-ended ones, answered in a short **voice interview** (ElevenLabs), with typing as a fallback. The AI summarizes the answers, so shortlisting 5 people from 20 doesn't mean reading 200 paragraphs.
5. **The AI agent shouldn't talk inside a private chat uninvited.** It **privately suggests** a question to each person ("Sam said guests 'rarely' but described hosting Sunday brunch — ask?"). The user taps to send it or skips it.
6. **"Fastest match wins" rewards rushing.** The app also can't secure an apartment it doesn't control. New rule:
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
The original flow was **borderline**. It ended when the lease was signed, which makes it a housing-search product, closer to Hack the City's "housing." Live Better is about "helping one person's day run smoother."

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
2. **Browse and save listings:** from the listing snapshot. Each card shows photos, price per room, a "fair price?" badge (§6), a link to the source and a "seen on" date.
3. **Profile:** 10 quick-tap answers, plus a voice interview of about 90 seconds covering 5 open-ended questions.
   - Quick: bedtime, wake time, cleanliness 1–5, dishes timing, guests per week, overnight guests, home noise level, WFH days, smoking/cannabis, shared vs separate groceries.
   - Voice (ElevenLabs agent; typing is the fallback):
     - a perfect Sunday at home
     - a roommate habit that drives you crazy
     - how you raise a problem
     - your typical weekday
     - "social hub or quiet recharge?"
   - The user reviews and edits the transcript before it's saved.
4. **Top 20:** the deterministic score. Each person gets a Gemini card with a 2-line summary, 3 "you'll click" and 2 "you'll clash" reasons, and a contradiction flag.
5. **Shortlist 5.** Chat opens only on **mutual** interest.
6. **iMessage concierge (Photon/Spectrum):** the agent introduces the pair, relays messages with numbers hidden, and privately suggests a question for each flagged discrepancy.
7. **Meetup:** the agent proposes 3 times from both people's free windows plus a public spot near the listing, and sends safety tips.
8. **Lock and hand off:** mutual confirmation, then Gemini drafts the House Agreement (quiet hours, guests, chores, bills, thermostat) and flags open questions. The listing locks for the pair, and the broker message is drafted.
9. **After move-in:** the same agent runs trash and chore reminders and guest heads-ups. Every event is logged and feeds a "house health" chart.

### 6. Architecture
- **Web:** Next.js (TypeScript) on Vercel. It's the same language as Spectrum.
- **DB: Tiger Data (Postgres + TimescaleDB).** One database for everything, including the MLH Tiger Data prize. Service `bj9teo40nn` (`divhacks-2026`, us-east-1, TimescaleDB 2.30.1). This service has **no connection pooler**, so keep each serverless function to one small shared connection (pool size 1–2).
  - Relational tables: `listings`, `profiles`, `matches`, `threads`.
  - Hypertable `listing_snapshots(time, zpid, price, days_on_zillow)`. A continuous aggregate keeps the median rent per neighborhood and bedroom count, which drives:
    - the "fair price?" badge
    - price-drop alerts
    - the scam flag for prices far below the median
  - Hypertable `house_events(time, household_id, type, …)`: chores done, reminders sent, guest notices. It feeds the "house health" chart, the strongest Live Better and time-series story.
- **Listings: SearchApi Zillow engine** (`engine=zillow`, `listing_status=for_rent`, `rent_min`/`rent_max`, `beds_min`).
  - URL-encode the query (`--data-urlencode`).
  - The test call returned **41 listings per page**. Astoria 2+ bedrooms had 165 results over 4 pages.
  - Every result has photos, a link and latitude/longitude.
  - Results come in two shapes:
    - single apartments with `extracted_price`, beds, baths, sqft, `availability_date` and `broker`
    - buildings with a `units[]` rent range; expand these or drop them
  - **Pulled (Sep 26):** 1,380 NYC listings across 24 neighborhoods (Manhattan, Brooklyn, Queens, Bronx, Staten Island) using 45 requests. 279 of them are building units with a "from $X" price.
    - NYC only: listings without a NYC zip are dropped.
    - Near-NYC areas (Jersey City, Hoboken, Union City, Yonkers) sit behind `--near-nyc` and weren't needed.
    - Code: `ingest/pull_listings.py`; schema: `db/schema.sql`.
  - **Budget: 100 free requests.**
    - One full pull is about 20 neighborhoods × up to 4 pages ≈ 80 requests ≈ 3,000 listings.
    - After that, re-pull about 5 neighborhoods × 1 page every 6 hours for price history (≈ 20 requests).
    - If you run out, the Developer plan costs $40 for one month; cancel it after judging.
- **Voice: ElevenLabs agent** (Creator plan, **about 2 hours of agent time**).
  - The agent's prompt holds the 5 questions. It's embedded in the web app with ElevenLabs' widget or React SDK.
  - Each call is capped at about 90 seconds, in both the agent's settings and its prompt.
  - The transcript goes to Tiger Data, then to Gemini for extraction. The audio isn't kept.
  - **Time budget:**

    | Use | Minutes |
    |---|---|
    | Building and testing the agent | ~25 |
    | Recording the demo video | ~10 |
    | Judges trying it (22 × ~1.5 min) | ~35 |
    | Finalist round | ~10 |
    | Reserve | ~40 |

  - Test the extraction pipeline with pasted transcripts, not live calls.
  - Seed profiles are generated as text only; never run them through voice.
  - Keep a pre-recorded interview for the pitch.
  - Optional stretch: the iMessage agent sends ElevenLabs voice notes (intro, reminders). Only if there's time left, audio attachments work in Spectrum, and credits allow.
- **Matching:**
  - Dealbreaker filter.
  - Weighted distance on the 10 quick answers. Bedtime and cleanliness weigh most; the weights are editable.
  - Gemini embeddings on open answers as a small bonus, capped at 15% of the score.
  - The top 20 are cached for each user.
- **Gemini jobs:** open-answer signal extraction, contradiction detection (cites both quotes), match-card copy and the House Agreement draft. All use JSON schemas.
- **Agent:** a Bun worker running Spectrum's `app.messages` loop, backed by a state machine: intro → relay → suggest-question → schedule → agreement → reminders. It reads and writes Tiger Data. It's a long-running process, so it runs on Railway/Render (Photon has templates) or a laptop for the demo.
- **Seed data:** 150 synthetic profiles generated by Gemini and labeled synthetic, plus real sign-ups from hackers at the event.
- **Secrets:** `.env` (gitignored) holds `SEARCHAPI_KEY`, `DATABASE_URL` (plus `DIRECT_DATABASE_URL`; they're the same for now), `GEMINI_API_KEY`, the ElevenLabs key and the Photon project ID/secret. Never put a key in browser code.

### 7. What if the AI goes wrong?

| Failure | Guardrail |
|---|---|
| Wrong or low-quality match | The score is deterministic and explainable. Users decide at every step, and mutual opt-in is required. |
| Hallucinated discrepancy | The agent must quote both source answers word for word. It asks a question and never accuses. The user decides whether to send it. |
| Voice transcript is wrong | The user reviews and edits the transcript before it's saved, and typing is always available. Voice answers feed signals only, never the score. |
| Prompt injection in answers ("rank me #1") | The LLM never produces the score. Answers go in as delimited data under a strict output schema and a length cap. |
| Bias or protected-trait inference | The schema has no such fields and the prompt forbids them. Open answers can't hard-filter anyone, and the bonus is capped at 15%. |
| Junk, stale or scam listings | A "seen on" date and a source link. Tiger Data's neighborhood medians flag prices far below normal. Rules flag "pay before viewing." |
| Gemini, ElevenLabs, SearchApi or Photon outage | Cached listing snapshot, rule-based scoring, typed questions, and fallback to web chat. **`AI_OFF` flag:** demo live that the app still works without AI. |
| Agent oversteps in chat | It only messages each user 1:1, suggestions are drafts, and `/quiet` mutes it. |
| Privacy | Numbers are relayed, never shared. Voice audio isn't stored. Room photos are private until a mutual match, with EXIF data stripped. |

**Eval:** Nao hand-labels 30 profile pairs as good, ok or bad. Report how often the score agrees, and contradiction-detection precision on 20 planted contradictions. It gives a real number for "is it accurate?"

### 8. MVP cut (what the demo must show)
**Must have:**
- SearchApi → Tiger Data listing snapshot with the fair-price badge
- pre-screen, quick-tap profile, and the voice interview
- deterministic top 20 with Gemini cards
- mutual shortlist
- iMessage agent intro plus one suggested discrepancy question plus meetup times
- House Agreement
- one post-move reminder in the same thread, logged to `house_events`

**Cut:**
- live scraping or live API calls during the demo
- Airbnb
- payments
- in-app video
- background checks
- voice cloning
- AI phone calls to brokers
- groups of 3 or more (do pairs only)
- native app

### 9. Build timeline (Sat 11 AM → Sun ~10:30 AM)
- **0–2 h:** repo, Next.js, Tiger Cloud, keys (SearchApi ✓, Gemini, ElevenLabs, Photon). Spectrum "hello" reply working. Questions frozen.
- **2–8 h:** SearchApi pull into Tiger Data, pre-screen and profile UI, scoring and seed profiles, ElevenLabs agent set up.
- **8–14 h:** Gemini cards and contradiction detector, match and shortlist UI, voice interview → transcript → extraction, agent relay and suggestions.
- **14–20 h:** meetup scheduling, House Agreement, reminder plus `house_events`, fair-price aggregate, `AI_OFF` flag, eval numbers.
- **20 h → Sun 7 AM:** feature freeze. Then demo video (including the pre-recorded interview), deck, Devpost write-up and hacker-poll slide.

**Roles:**
- **Kien:** SearchApi pull, Tiger Data schema, scoring engine, ElevenLabs interview, integration and deploy.
- **Alisher:** Gemini prompts and schemas, Photon agent.
- **Grace:** web UI, deck and pitch.
- **Nao:** question design, weights, eval set and the event poll.

### 10. Rubric map
| Criterion | Where it shows |
|---|---|
| Concept 30 | The matchmaker that moves into your group chat; the mismatch is caught before the lease. |
| Functionality 30 | End-to-end live demo, graceful `AI_OFF` mode, eval numbers. |
| Wow 20 | A judge does the voice interview live, and an iMessage flags a real contradiction. |
| UX 10 | 30-second pre-screen, quick-tap profile, talking instead of typing, explained matches. |
| Community 10 | Newcomer and student focus, safety and privacy defaults, the hacker poll. |

**Prizes to also enter**, each visible in the main demo path:

| Prize | Where it shows |
|---|---|
| Photon | The chat |
| MLH Gemini | Match cards |
| MLH Tiger Data | Fair-price badge and house-health chart |
| MLH ElevenLabs | The onboarding interview |
| MLH .Tech domain | The app's domain |

### 11. Check before the pitch
These are unverified. Don't state them on stage until someone confirms them:
- The exact wording of NYC Local Law 18 on short-term rentals.
- Whether Spectrum supports iMessage group chats and audio attachments. If not, the 1:1 relay design still works and voice notes get cut. Ask at the Photon workshop.
- Whether ElevenLabs charges voice notes to the same 2 hours as agent calls.
- Fair-housing details for roommate ads under the NYC Human Rights Law.
