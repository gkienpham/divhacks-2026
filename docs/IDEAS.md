# Ideas: roommate matching + renter support (Live Better)

**Track text:** "The grind of daily NYC life, optimized. Everything besides transportation. Helping one person's day run smoother."

**Positioning.** Roomi, SpareRoom, Diggz and Roomster already match roommates. Matching alone is a marketplace, and a judge will ask "how is this different?" Our answer is what happens **after** the match: the app keeps a shared NYC apartment running. Pitch line: *find someone you can live with, then actually live well with them.*

**Budget.** The prep notes put the real build window at about 23.5 h (Sat 11 AM to Sun 10:30 AM). With 4 people that is roughly 90 person-hours, minus sleep, pitch and deploy. Hour estimates below are per feature, for one person.

---

## Tier S: the demo spine (build first)

| # | Idea | What it does | Est. |
|---|------|--------------|------|
| 1 | **Lifestyle profile + dealbreakers** | Split factors into hard filters and weighted preferences (list below). | 3 h |
| 2 | **Explained compatibility score** | Hard filters, then a weighted distance. Show the top 3 "you'll click" and top 3 "you'll clash" reasons. The math is deterministic; the LLM only writes the sentence. | 3 h |
| 3 | **24-hour overlap ribbon** (signature visual) | Stacked 24 h bars per roommate: asleep, home, WFH, shower slot, guests. Collisions show in red, e.g. "You both shower 7:30–7:50 on weekdays. Suggest 7:10 for Sam." | 4 h |
| 4 | **Schedule screenshot → routine** | A vision LLM reads a class/work schedule screenshot (or an .ics) and returns time blocks as JSON. Wake time = earliest commitment − commute − getting ready. The UI says "Inferred: up 6:45 Tue/Thu. Correct?" It never sets sleep silently. | 3 h |
| 5 | **Room photo → tidiness snapshot** | A vision LLM returns clutter 1–5 plus what it saw ("clothes on chair, clear desk"), and the user can dispute it. Strip EXIF GPS before upload. The limit: one photo is one staged moment, so weight it low and label it "photo + self-report". | 2 h |
| 6 | **House Agreement generator** | After a match, draft a one-page roommate agreement from both profiles: quiet hours, guests, overnight partners, chores, bills, thermostat, how to raise issues. Where the two differ, flag it as an open question. Print or PDF. This is the bridge from matching to living. | 2 h |

**Profile factors** (hard filters marked ★):
- ★ budget, ★ move-in date, ★ lease length, ★ smoking/vaping, ★ pets and allergies
- sleep and wake time (weekday/weekend), shower time and length, WFH days
- cleanliness, dish tolerance (same day / next day / whenever), shared vs separate groceries
- guests per week, overnight guests or partners, parties
- noise tolerance, instruments or loud calls, music in common areas
- thermostat and AC preference, cooking frequency, kitchen rules (vegan, kosher, allergens)
- home as "social hub" or "quiet sanctuary", conflict style (talk now / text / house meeting)
- bill splitting style, chore style (rotation / by preference / hire a cleaner)
- commute destination (school or work), languages spoken

## Tier A: the renter support system (pick 2–3)

| # | Idea | What it does | Est. |
|---|------|--------------|------|
| 7 | **Building check on every listing** | Address → HPD open violations ([wvxf-dwi5](https://data.cityofnewyork.us/Housing-Development/Housing-Maintenance-Code-Violations/wvxf-dwi5)), 311 heat/hot water and noise complaints ([erm2-nwe9](https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9)), and bedbug filings. NYC data is what national apps lack. | 3 h |
| 8 | **Light-sleeper noise check** | Combine #4's sleep window with late-night 311 noise complaints near the listing: "You sleep at 10:30 PM; this block logged 38 noise complaints after 10 PM last year." It links two features and gives the pitch its best line. | 2 h (after #7) |
| 9 | **Fair rent split** | Rooms differ (private bath, window, size, closet). Envy-free rent division, Spliddit-style, built from each person's bids per room. Math-heavy, so it holds up when judges probe the rigor. | 3 h |
| 10 | **Trash night + chore rotation** | [DSNY Frequencies](https://data.cityofnewyork.us/City-Government/DSNY-Frequencies/rv63-53db) gives collection days by address. The app assigns "trash/recycling/compost out Tue night" to whoever the ribbon shows is home. Very NYC, and it reuses the schedule data. | 3 h |
| 11 | **"Say it nicer" message coach** | Type the passive-aggressive version ("WHO left the pan"). The LLM rewrites it as a clear, kind request that cites the agreement clause. Cheap, and it gets a laugh in the demo. | 1 h |
| 12 | **Guest / quiet-hours heads-up** | "3 friends over Fri 8–11 PM" shows up on everyone's ribbon. Roommates reply 👍 or "exam Sat 9 AM". | 2 h |
| 13 | **Deposit Guard** | Reuses the photo pipeline at move-in: timestamped room-by-room condition photos with LLM condition notes, compared again at move-out. | 2 h |
| 14 | **Scam shield** | Rules flag listings priced far below the area median, "Zelle/wire before viewing", or no in-person viewing. | 2 h |
| 15 | **Monthly pulse check** | A 30-second anonymous 1–5 rating by category. A dip suggests a house-meeting agenda before things blow up. | 2 h |
| 16 | **Shared bills + staples** | Rent, Con Ed and internet split, plus "who bought toilet paper last". Every competitor already has this, so build it only if there's time. | 3 h |

## Tier B: only if ahead

17. **Commute fit filter.** Travel time from the listing to each person's school or work. Keep it a filter, not a feature: commuting belongs to Move Smarter.
18. **True monthly cost.** Rent plus estimated utilities, internet and commute.
19. **Renter rights card.** Heat season starts Oct 1, four days after the demo ([HPD](https://www.nyc.gov/site/hpd/services-and-information/heat-and-hot-water-information.page)). Add the FARE Act broker-fee rule, a rent-stabilization check link, and one-tap 311. Static content, 1 h, adds credibility.
20. **Heat log.** Log apartment temperature and auto-write the 311 complaint. Reuses the Cold Shift research.
21. **Shared dinner nights.** The ribbon finds evenings when roommates are all home, then suggests a co-op grocery list. This matches the track's "groceries, meal planning" examples.
22. **Group matching for 3–4 people.** The pairwise combinations blow up fast, so demo pairs only.
23. **Move-in checklist.** Con Ed transfer, internet, renters insurance, keys, deposit photos.
24. **Laundry coordination** and **summer sublet handoff** for students. Niche.

## Cut (not in this window)
- Real payments / Venmo
- Real-time chat (use a "contact" button instead)
- ID or background checks (FCRA and legal exposure)
- Training our own cleanliness model (a vision LLM already does this)
- A native app
- A real two-sided marketplace (seed 20–30 fake profiles and listings)

## Guardrails judges will ask about
- **Fair housing.** Match on habits, not protected traits (race, religion, national origin, disability, etc.). Shared-housing roommate ads get more legal latitude than landlord ads, but check the NYC Human Rights Law details before claiming anything in the pitch. **UNVERIFIED.**
- **Photos.** Strip EXIF location. Room photos stay private until both sides match.
- **Honesty.** Label every AI-derived trait "inferred" and make it editable. "Inferred" is not "measured."
- **Safety.** .edu magic-link sign-in is cheap and stops most fake accounts.

---

## Recommended MVP (the 3-minute demo)

Persona: Maya, a Barnard junior who sleeps at 11 and has 8:40 AM classes.

1. **Onboard.** She uploads her schedule screenshot and a room photo. The profile fills itself, and she corrects one inferred field.
2. **Matches.** Top 3 with explained scores. She opens one, and the ribbon shows a shower clash with a suggested fix.
3. **Listing.** The building check, then the noise-vs-your-bedtime line.
4. **Match accepted.** The House Agreement is drafted and trash night is auto-assigned.
5. **Close.** The "Say it nicer" gag.

Scope: #1–8, #10, #11 ≈ 26 person-hours, plus about 8 for integration, deploy and pitch. That fits comfortably.

**Suggested split**
- Grace: forms and the ribbon UI
- Alisher: vision/schedule parsing, the agreement, "Say it nicer"
- Nao: compatibility math, then fair rent (#9) as the stretch goal
- Kien: NYC data (HPD, 311, DSNY), integration, deploy, demo video

**Stack (lazy default):** one web app on Vercel, plus one serverless function for LLM calls so the API key never reaches the browser. Seed data lives in JSON. Add a database only if real logins make the demo.

**Name ideas:** Overlap (for the ribbon), Nestmate, Cohab, Bunkd, RoomSync.
