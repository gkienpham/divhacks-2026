# Roomme: Claude Design prompt pack

Eight copy-paste prompts for [Claude Design](https://claude.ai/design). They rebuild the look of the Modulify **Wayfare Travels** template (its structure, DM Sans type and warm off-white/ink palette) for **Roomme** (roomme.tech). Only the components that fit the product are kept. The measured tokens and sources are in [wayfare-reference.md](wayfare-reference.md).

Scope: desktop only (1440px). It covers the landing page and the MVP demo path in [PROJECT.md](../PROJECT.md). **Matching only:** the flow ends at the match and hand-off to the listing, with nothing after move-in.

## How to use
1. **Screenshots.** Reference screenshots of the template are in `~/Downloads/roomme-design-ref/`. They're kept out of the repo because they're third-party images. Claude Design can't reliably take another site's URL as a style reference, so attach screenshots instead.
2. **P0 goes into a new design system, not a project.** Fill in the setup form like this:

   | Field | What to put |
   |---|---|
   | Company name and blurb | The blurb below |
   | Link code from GitHub | Leave empty for now. The repo has no frontend yet; link it once the Next.js app exists. |
   | Link code from your computer | Leave empty |
   | Upload a .fig file | Leave empty |
   | Add fonts, logos and assets | All 12 screenshots from `~/Downloads/roomme-design-ref/`. No font files are needed; DM Sans and Caveat are Google Fonts. |
   | Any other notes? | The whole P0 prompt body, from "Build a design system called 'Roomme'…" to the end of its house rules. If the box has a length limit, paste the COLOR TOKENS, TYPE, SHAPE AND DEPTH and LAYOUT sections here and send the component list in the chat afterward. |

   Blurb:
   ```text
   Roomme (roomme.tech): a desktop web app that matches NYC renters (students and early-career newcomers) with compatible roommates based on daily habits like sleep, dishes, guests and noise. It flags mismatches before anyone signs a lease and ends by handing the pair off to the listing. Look and feel: based on the Wayfare Travels template (screenshots attached).
   ```

   When the component sheet passes P0's "Done when" checks, **publish** the design system. New projects then use it automatically.
3. **P1–P7 go into one new project.** Start a project called **Roomme** from the Claude Design home screen and paste these **in order, in that same project**. Claude builds each screen with the earlier ones in context.
   - For small fixes, click the element and leave an inline comment. Direct edits on the canvas don't use tokens.
   - Only move on once the current prompt's "Done when" list passes.
4. **Handoff.** P7 ends with the handoff. Use **Send to local coding agent** so Claude Code gets the bundle in this repo.
5. **Usage.** Claude Design counts against the same limits as Claude Code. Run P0 and P1 first, check them, then do the rest.

## What we kept from Wayfare, and what we cut
| Wayfare component | Roomme use |
|---|---|
| Hero with a full-bleed photo, eyebrow and 92px H1 | Landing hero (NYC stoop photo) |
| Trust strip (3 columns) | Real numbers: 1,380 listings, 24 neighborhoods, 1.41% vacancy |
| "01 Our value" portrait carousel | "01" problem section: four mismatch cards |
| Filter bar and 3-column destination grid | Neighborhoods (landing) and listings browse |
| Dark "Our expertise" with vertical tabs | "03 Why you can trust it" (AI guardrails) |
| Two-tone heading and 4:5 cards | "04 Your matchmaker in iMessage" (intro, private question, meetup) |
| 4-step "How it works" | Same, with Roomme steps |
| Full-width quote on a photo | The pitch line, as a brand statement |
| Destination detail page (key-info card, timeline) | Listing detail page, House Agreement, the locked/hand-off screen |
| Dark CTA band (28px radius) | Locked/hand-off header |
| Contact form card and FAQ accordion | Sign-in, pre-screen and FAQ |
| Polaroids and the Caveat note | Final CTA |
| Dark footer | Footer |
| **Cut** | Newsletter signup, "Plan your trip", season/price filters, team portraits, review scores, "5K+ happy travellers", testimonials, the About page stats band |

## Coverage
| Must-have or chosen extra | Prompt |
|---|---|
| Listing snapshot with the fair-price badge | P1, P4 |
| Pre-screen | P2 |
| Quick-tap profile and the voice interview | P3 |
| Deterministic top 20 with Gemini cards | P5 |
| Mutual shortlist | P5, P6 |
| Agent intro, suggested discrepancy question, meetup times | P1 (section 04), P5 (question), P6 (meetup) |
| House Agreement | P6, P7 |
| Lock and hand-off to the source listing (broker draft) | P6, P7 |
| Trust/scam badge | P0, P4 |
| .edu Verified student badge and Google sign-in | P0, P2 |
| Swipe stack with a grid toggle | P5 |
| International-student extras (currency, enrollment verified, overseas-lister video flag) | P2, P4 |
| `AI_OFF` state | P0, P5 |

## House rules
Every prompt below includes this block. Keep it if you edit a prompt.

```text
HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

---

## P0 · Design system

**Attach:** all screenshots in `~/Downloads/roomme-design-ref/` (all 12).

```text
Build a design system called "Roomme" for a desktop web app that matches NYC renters with compatible roommates. The attached screenshots are the Wayfare Travels template. Copy its visual language exactly (type, color, spacing, shape and motion), but none of its travel content.

AUDIENCE: students and early-career newcomers to NYC (interns, grad students, new grads) looking for a room at about $1.5–2.2k.

COLOR TOKENS (use these hex values exactly; keep the names so they map to CSS variables):
--background #f5f4f1 (warm off-white page; also the text color on ink buttons)
--foreground #141211 (body text)
--ink #0e0c0b (headings, ink buttons, dark sections, footer)
--muted-foreground #6e6a65 (secondary text, eyebrows)
--brand #3d7096 (steel blue, ONLY for section and rank numbers like "01" and small eyebrow dots)
--sand #eae7e1 (icon tiles and photo placeholders; at 60% opacity it's the alternate section background)
--muted #ebe9e6 (neutral fills)
--card #ffffff
--border #dddbd7 (1px hairlines)
--destructive #e40014
Roomme additions, used ONLY as small status dots, never as fills or text:
--fair #4a7c59 (muted green), --watch #b7791f (amber), and --destructive for risk.
On dark sections, white text at 75% (lead), 70% (nav), 60% (meta), 45–55% (footer).

TYPE: DM Sans only, plus Caveat for a single handwritten note.
- H1 hero: 92px, weight 500, line-height 0.98, tracking -0.035em, about 15 characters per line
- H1 inner pages: 84px/500
- H2: 60px/500, tracking -0.03em
- H2 secondary and quotes: 44px/500
- H3 cards: 18–26px/500
- Body: 16/24 at 400; lead 15px at 1.625; card text 13–14px
- Nav 14px/400; buttons 14–15px/500, tracking -0.01em
- Eyebrow: 11px/500, uppercase, 0.18em tracking, led by a 6px --brand dot
- No serif and no italic display type

SHAPE AND DEPTH:
- Radius 12px base, 16.8px for fields and images inside cards, 21.6px for image cards, 24px for form cards, 28px for CTA bands and featured cards
- Everything interactive is a full pill
- No shadows. Cards separate with 1px --border. The only shadow is on the polaroids: 0 18px 40px -18px rgba(20,18,14,.45)
- Photos are full-bleed with ink gradient overlays and text bottom-left

LAYOUT: 1440 max width, 48px side padding, 12 columns with 48px gaps, 112px vertical section padding, 16px gaps in card grids.

MOTION (document it; show it on the sheet as notes):
- Hero photo zooms out from 114% to 100% over 16s
- Hero text rises in with a stagger (0.95s; delays 0/120/260/380ms)
- Card images zoom to 104% on hover over 0.9s, and a round arrow button fades in
- Fixed header: transparent over the hero, ink at 92% with a 12px blur after scrolling

COMPONENTS KEPT FROM THE TEMPLATE (name them exactly like this):
1. Button/Ink: ink pill, off-white text, arrow; 40, 44 or 48px tall
2. Button/OnPhoto: white pill for use over photos
3. Button/Outline: 1px ink-20% border that darkens on hover
4. Link/Underline: text with a 1px underline at 25% and ↗
5. Eyebrow: dot and uppercase label
6. SectionLabel: "01" in --brand next to an eyebrow
7. ImageCard: 21.6px radius, gradient, title bottom-left, frosted pill top-left, hover arrow
8. FrostedPill: ink 45% with blur, or white 90%
9. FilterBar: white pill with 4 dropdown segments split by hairlines and an ink button at the end
10. Chip: active = ink fill; inactive = white with border and muted text
11. CircleIconButton: 40–56px outline circle
12. Field: 48px tall, 16.8px radius, --border, darker border on focus
13. FormCard: white, 24px radius
14. Accordion: rows split by ink-10% lines; a 32px circle icon that fills with ink when open
15. CTABand: ink, 28px radius, optional photo
16. Stepper: 4 steps joined by a 1px line, 56px outline icons
17. Timeline: vertical 1px line with 10px ink dots
18. SegmentedToggle: a pill with 2–5 options; the active segment is ink with off-white text
19. Footer: ink, 12 columns
20. Polaroid: white frame, tilted, soft shadow, Caveat note beside it

NEW ROOMME COMPONENTS (same visual language):
21. TrustBadge: a FrostedPill (or white pill with border) holding a status dot and a label. Three states: "Fair price" (--fair), "Above median" (--watch), "Check before paying" (--destructive). The meaning is always in the text, never the color alone.
22. MatchScore: a big 60px number with "%" and the caption "match · math, not AI", plus a Link/Underline "How it's scored".
23. HabitBar: a label, a thin 4px ink bar on a --sand track, and both people's answers ("You 23:00–00:00 · Sam 23:00–00:00").
24. HabitTag: a Chip variant for habits ("Early riser", "Cooks daily", "Quiet evenings").
25. InitialsAvatar: a --sand circle with ink initials, 36/48/72px. This replaces faces everywhere before a mutual match.
26. VerifiedBadge: a small outline pill with a check. Variants: "Verified student" (.edu email) and "Enrollment verified" (for students without an SSN).
27. ClickClashList: "You'll click" (3 rows with a check) and "You'll clash" (2 rows with a small --watch dot).
28. ContradictionCallout: a --sand card that quotes two answers word for word with their sources ("Quick-tap · Guests: 'Rarely (1–2/month)'" and "Voice interview: 'I host brunch most Sundays'"). Below them sits a suggested question as a draft, with Button/Ink "Send question" and Link "Skip". It asks; it never accuses.
29. AISummaryTag: a tiny outline pill "AI summary" on any AI-written text.
30. AIOffBadge: a pill "AI off · rule-based mode" for the fallback state.
31. ChatBubble: generic message bubbles for agent previews. Ink with off-white text for the agent, white with a border for people. Not iMessage styling.

OUTPUT: one component-sheet artboard at 1440px wide. Show every token swatch, the type scale, and every component above in all of its states, labeled with the names above.

HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

**Done when:**
- [ ] The swatches show exactly `#f5f4f1 #141211 #0e0c0b #6e6a65 #3d7096 #eae7e1 #ebe9e6 #ffffff #dddbd7 #e40014 #4a7c59 #b7791f`.
- [ ] Every text style is DM Sans; Caveat appears only on the Polaroid note.
- [ ] `--brand` blue appears only on section/rank numbers and eyebrow dots.
- [ ] All 31 components are present and labeled. The TrustBadge shows 3 states, each with a text label.
- [ ] There are no shadows except on the Polaroid.
- [ ] The design system is published as "Roomme".

---

## P1 · Landing page

**Attach:** `01-hero`, `02-value-carousel`, `03-destinations-grid`, `04-expertise-dark`, `05-signature-cards`, `06-how-it-works`, `07-story-quote`, `08-newsletter-footer`, `08b-footer`.

```text
Design the Roomme landing page (roomme.tech) as one 1440px-wide page, using the Roomme design system. Follow the attached Wayfare home page's section order and layout, but with the content below. Goal: in 60 seconds, a hackathon judge understands that Roomme matches NYC renters on how they actually live, catches mismatches before the lease, and gets a matched pair to the listing with a House Agreement already agreed.

1. NAV (fixed; transparent over the hero, ink after scrolling): the "Roomme" wordmark with a simple line icon of a house outline split into two rooms. Centered links: How it works · Neighborhoods · Safety · FAQ, with a dot under the active one. Right: Button/OnPhoto "Find my roommate →".

2. HERO (full screen, NYC photo: a brownstone stoop at dusk, with an ink gradient top→bottom 70%→20%→80%):
- Eyebrow: "DON'T SIGN ON A VIBE CHECK."
- H1 92px: "Find a roommate who lives like you do."
- Lead: "Roomme matches NYC renters on sleep, dishes, guests and noise, and flags mismatches before you sign a lease."
- Button/OnPhoto "Find my roommate", plus a CircleIconButton with the link "See how matching works".
- Right side: two small captions with thin vertical lines, "Matched on habits" and "Checked before the lease".
- Use the hero motion from the design system.

3. TRUST STRIP (3 columns, bottom border; no avatar stack, no ratings):
"1,380 NYC listings · 24 neighborhoods" | "1.41% vacancy, lowest since 1968 (NYC HPD)" | "Your match % is math, not AI".

4. SECTION 01 · THE PROBLEM:
- H2 60px across 7 columns: "A bad roommate is a daily tax on your sleep, your kitchen and your peace."
- Lead on the right: "Most roommate searches end with one DM vibe check and a 12-month lease. The mismatch shows up after move-in."
- A small side note: "[poll: X of Y DivHacks hackers have had a roommate conflict]".
- A carousel of 4 portrait 3:4 ImageCards (NYC apartment interiors, no people's faces), each with a label and caption:
  - SLEEP: "Their 6 a.m. alarm, your 2 a.m. bedtime."
  - DISHES: "The sink that's never empty."
  - GUESTS: "The partner who quietly moved in."
  - NOISE: "Calls on speaker at midnight."

5. SECTION 02 · NEIGHBORHOODS:
- H2: "Start with where you want to live."
- A FilterBar with Neighborhood / Budget per room / Move-in / Bedrooms and Button/Ink "Browse".
- A 3-column grid of 6 ImageCards (street photo of each area). Each has a FrostedPill "≈$X / room median" top-left, the name and borough, and chips for listing count and trains:
  - Bushwick, Brooklyn: ≈$1,671, 162 listings, L/M/J
  - Bed-Stuy, Brooklyn: ≈$1,750, 161 listings, A/C/G
  - Astoria, Queens: ≈$1,729, 134 listings, N/W
  - Upper West Side, Manhattan: ≈$2,436, 94 listings, 1/2/3
  - Harlem, Manhattan: ≈$1,712, 92 listings, A/B/C/D
  - Crown Heights, Brooklyn: ≈$1,733, 89 listings, 2/3/4
- Button/Outline "See all 24 neighborhoods".
- Tiny footnote: "Public listings as of Sep 26, 2026. We link back to the source."

6. SECTION 03 · WHY YOU CAN TRUST IT (dark ink section, like the template's "Our expertise"):
- H2 44px white: "Roommate matching that can explain itself."
- Vertical tabs on the right, the first one active: Math, not AI · Contradictions, quoted · Mutual opt-in · Your number stays hidden · Fair housing by design · Works with AI off.
- On the left, a wide 16:10 card per tab with a one-line explanation and a mini UI fragment from the design system:
  - Math, not AI: MatchScore and HabitBars. "Your score is a weighted comparison of your answers. AI never sets it."
  - Contradictions, quoted: ContradictionCallout. "When answers don't line up, we quote both and suggest a question. You decide whether to send it."
  - Mutual opt-in: "Chat opens only when you both say yes."
  - Your number stays hidden: ChatBubbles. "Our agent relays messages. Nobody sees your phone number."
  - Fair housing by design: InitialsAvatars and HabitTags. "We match on habits, never on who you are. Photos stay hidden until you both opt in."
  - Works with AI off: AIOffBadge. "If the AI is down, matching still works."

7. SECTION 04 · YOUR MATCHMAKER IN IMESSAGE:
- Two-tone H2: "A matchmaker in your texts," at ink 40%, then "from hello to the lease." at full ink.
- Button/Outline "See how it works".
- Three 4:5 cards, each showing a short ChatBubble exchange on a --sand background, with a white tag pill, a title and a two-line caption below:
  a. INTRO: "Introduces you, keeps numbers private." Agent: "Kien, meet Sam. You're an 87% match and you both saved the Astoria 2BR."
  b. THE QUESTION YOU'D SKIP: "Suggests the awkward question, privately." Agent to Kien only: "Sam said guests 'rarely' but mentioned brunch most Sundays. Want to ask?" [Send] [Skip]
  c. MEET IN PUBLIC: "Finds a time and a public spot." Agent: "You're both free Sat 2 PM or Sun 11 AM. There's a café 6 min from the listing. Which works?" Sam: "Sat 2 👍"

8. SECTION 05 · HOW IT WORKS: a Stepper with 4 steps.
   1. "30-second pre-screen": budget, move-in, neighborhoods, dealbreakers.
   2. "Talk for 90 seconds": a quick-tap profile plus a short voice interview.
   3. "Meet your top 5": explained matches; chat opens on mutual yes; meet in public.
   4. "Sign the House Agreement": quiet hours, guests, chores and bills, agreed before the lease.

9. BRAND STATEMENT (full-width NYC street photo, left→right ink gradient): a 44px white quote, "Every New Yorker has a roommate horror story. Roomme is how you avoid writing one." Put the Roomme wordmark under it, not a person. This is not a testimonial.

10. FAQ (--sand background, Accordion, first item open):
- "Is my match % made by AI?" No. It's a weighted comparison of your answers. AI only writes the explanation, and matching still works with AI off.
- "Who sees my phone number?" Nobody. The Roomme agent relays messages until you choose to share.
- "Why can't I see photos of people?" Photos unlock after you both opt in, so matches stay about habits.
- "Where do the listings come from?" Public listings, collected and linked back to the source with the date we saw them.
- "What if the AI gets something wrong?" It only suggests questions and quotes both answers word for word. You decide what to send.

11. FINAL CTA (light background, like the template's newsletter block but with NO email signup):
- Left: eyebrow "READY WHEN YOU ARE" and H2 56px "Don't sign on a vibe check.", with Button/Ink "Find my roommate" and Link/Underline "See how matching works".
- Right: three tilted Polaroids (-9°, 4°, -3°) of Astoria, Bushwick and Harlem street scenes, with a Caveat note: "good roommates, quieter Sundays".

12. FOOTER (ink):
- Wordmark with "roomme.tech" and a one-line tagline.
- Link columns: Product (How it works, Neighborhoods, FAQ) · Trust (Fair housing, Privacy, AI guardrails) · Team (Built at DivHacks 2026, Columbia).
- Bottom bar: "© 2026 Roomme · Listings come from public sources and link back to the original. Roomme is not a broker." and a back-to-top circle.

HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

**Done when:**
- [ ] The hero copy matches word for word: the eyebrow slogan, the H1, the lead and both button labels.
- [ ] All 12 sections are present, in order, with "01"–"05" in `--brand` blue.
- [ ] There are no review stars, "happy users" counts, testimonials or newsletter field.
- [ ] The poll number is still a `[placeholder]`.
- [ ] The six neighborhood cards show the medians and listing counts given.
- [ ] No people's faces appear anywhere on the page.
- [ ] The dark section 03 has all six tabs, and the first tab's card is fully designed.

---

## P2 · Sign-in and pre-screen

**Attach:** `10-contact-faq`, `03-destinations-grid`.

```text
Design two 1440px screens for Roomme's onboarding, using the Roomme design system. Use the template's contact page layout (intro on the left, FormCard on the right) and its chip filters.

SCREEN 2A · SIGN IN (/start)
- Solid off-white header with ink text.
- Left: eyebrow "STEP 1 OF 4", H1 84px "Let's find your people.", and the lead "Sign in, answer a few quick questions, and we'll show you who lives like you do."
- Right, a FormCard:
  - a white pill "Continue with Google" with the standard Google G mark
  - a divider "or use your school email"
  - a Field "you@school.edu"
  - Button/Ink "Continue"
- Below the card, three info rows with --sand icon tiles:
  - "Sign in with a .edu email → Verified student badge"
  - "International student without an SSN? Upload your enrollment letter → Enrollment verified"
  - "Your phone number is never shown to anyone. Our agent relays messages."
- Show the VerifiedBadge variants beside the matching rows.

SCREEN 2B · 30-SECOND PRE-SCREEN
- Top: a thin progress line labeled "Pre-screen · about 30 seconds", then H2 60px "First, the basics.".
- One wide FormCard with 10 question groups in two columns. Each group has a 14px/500 label and a row of Chips; show a realistic mix of selected (ink) and unselected chips:
  1. Where do you want to be? Near my school/work [Field: "Columbia University"] · Downtown · Quiet residential · Anywhere near transit [line chips: 1 · A · L · N/W · 7]
  2. Max commute: ≤15 min · 16–30 · 31–45 · 46–60 · 60+
  3. Budget per person: Under $1,000 · $1,000–1,500 · $1,500–2,000 · $2,000–2,800 · $2,800+
  4. Walk to subway: <5 min · 5–10 · 10–20 · Doesn't matter
  5. Apartment: 2 bed (1 roommate) · 3+ bed · Any
  6. Private bedroom/bath: Private only · OK to share · No preference
  7. Furnished: Fully · Partly · Unfurnished · Flexible
  8. Lease: Month-to-month · 6 months · 12 months · 12+
  9. Move in: ASAP · Within 1 month · 1–3 months · Flexible · Pick a date
  10. Pets: I have a pet · Planning to get one · No pets, fine if roommates do · Need a pet-free home
- A dealbreakers row: Chips "No smoking/vaping indoors" · "Pet allergy".
- A sticky footer bar inside the card: the live count "1,380 listings → 212 fit your basics", Link "Back", Button/Ink "Continue →".

HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

**Done when:**
- [ ] Both screens use the FormCard, Field and Chip components from P0, not new ones.
- [ ] Both verification paths are visible: .edu, and enrollment letter without an SSN.
- [ ] All 10 pre-screen groups and the dealbreakers fit on one screen with the sticky Continue bar.
- [ ] No question asks about a protected trait.

---

## P3 · Profile: mode, quick-tap, voice interview, review

**Attach:** `04-expertise-dark`, `10-contact-faq`.

```text
Design four 1440px screens for building a Roomme profile, using the Roomme design system. Keep the progress line from P2 at the top, labeled "Step 2 of 4 · Your habits".

SCREEN 3A · HOW MUCH DO YOU WANT TO SEE YOUR ROOMMATE?
- H2 60px: "How much do you want to actually see your roommate?"
- Muted note: "This changes how we match you."
- Three large selectable cards in a row (white, 24px radius; selected = 2px ink border and an ink check circle):
  - "I want to see them": "We'll match overlapping schedules. You're home and awake at the same hours. Good if you want a friend at home."
  - "I'd rather barely see them": "We'll match opposite schedules. When you're home, they're out. Good if you want the bathroom and kitchen to yourself."
  - "Let Roomme decide": "We'll start with overlapping schedules, the safer default."
- Button/Ink "Continue".

SCREEN 3B · QUICK-TAP QUESTION (one question per screen; design the template once, then show 4 filled variants as separate artboards):
- Top: "4 of 10" and a thin progress line; Link "Back" and Link "Skip".
- The question in H2 60px, left-aligned in 7 columns. The answers are a vertical stack of 56px-tall full-width pills (white with border; selected = ink). Tapping one moves to the next question.
- Variant 1: "What time do you actually go to bed on weeknights?" Before 22:00 · 22:00–23:00 · 23:00–00:00 · 00:00–01:00 · After 01:00
- Variant 2: "How many times a week do you clean shared spaces?" 0 · 1 · 2 · 3–4 · 5 or more
- Variant 3: "How many guests do you have per month?" 0 · 1–2 · 3–5 · 6–10 · More than 10
- Variant 4 (multi-select, helper text "Choose all that apply"): "Has anyone told you that you make noise in your sleep?" I snore · I grind my teeth · I talk or move in my sleep · No one's mentioned it · Not sure · Other [Field]

SCREEN 3C · VOICE INTERVIEW (dark ink section, like the template's "Our expertise"):
- Left: eyebrow "VOICE INTERVIEW · ABOUT 90 SECONDS", H2 44px white "Tell us how you actually live.", then a checklist of 5 prompts that tick off as they're covered:
  - A perfect Sunday at home
  - A roommate habit that drives you crazy
  - How you bring up a problem
  - Your typical weekday
  - Social hub or quiet recharge?
- Center: a 160px circular mic button with a thin progress ring counting down 90 seconds ("0:52 left"), and a subtle live waveform.
- Right: a "Live transcript" panel (white 10% border, white text at 75%) with a few lines of realistic transcript.
- Bottom: Button/Outline (white) "Type instead" and Link "End early". A small note at 60% white: "Audio isn't stored. You'll review the transcript before it's saved."

SCREEN 3D · REVIEW YOUR ANSWERS (light):
- H2 "Here's what we heard. Edit anything."
- Left: a FormCard with the editable transcript (a Field-style text area).
- Right: a card "What we'll use" with HabitTags extracted from it ("Hosts Sunday brunch", "Night owl on weekends", "Talks problems out in person"), marked with the AISummaryTag.
- Below that, a gentle self-check using the ContradictionCallout styling: "Your quick-tap says guests 1–2 per month, but you mentioned brunch most Sundays. Want to update?" with [Update answer] [Keep both].
- Note: "Voice answers never change your match %, only the explanations."
- Button/Ink "Save my profile" and Button/Outline "Re-record".

HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

**Done when:**
- [ ] There's one quick-tap template plus 4 variants, including the multi-select one.
- [ ] The voice screen shows the 90-second ring, all 5 prompts, the live transcript, "Type instead" and the audio-not-stored note.
- [ ] The review screen lets the user edit before saving, and the AI-extracted tags carry the AISummaryTag.

---

## P4 · Listings: browse and detail

**Attach:** `03-destinations-grid`, `09-destination-detail`, `11-packages`.

```text
Design two 1440px screens for Roomme listings, using the Roomme design system. Use the template's /destinations grid and destination-detail page layouts.

SCREEN 4A · BROWSE (/listings)
- Intro: H1 84px "Places worth splitting." and three 26px stats: "1,380 listings" · "24 neighborhoods" · "Seen on Sep 26".
- FilterBar: Neighborhood · Budget per room · Move-in · Bedrooms, with Button/Ink "Search".
- A chip row: All · Fair price only · 2 BR · 3+ BR · Private bath · Pet-friendly.
- On the right of the chip row, a small currency SegmentedToggle: USD · INR · CNY · KRW · EUR, with "approx." in muted text.
- A 3-column grid of 9 listing cards. Each card has:
  - a 4:3 ImageCard photo of an apartment interior
  - top-left FrostedPill "$1,725 / room"; top-right a CircleIconButton to save
  - below the photo: a TrustBadge, the title "2 BR · Astoria", meta "1 bath · 850 sq ft · Available Oct 15", and a bottom row "Seen on Sep 26 · View on Zillow ↗" with "3 groups interested" on the right
- Mix the TrustBadge states: mostly "Fair price", two "Above median", and one "Check before paying" (Bushwick 2 BR at $950/room, 43% under the ≈$1,671 median).
- Button/Outline "Load more".

SCREEN 4B · LISTING DETAIL (/listings/[id])
- Photo hero (88% of screen height, gradient) with:
  - breadcrumbs "Listings / Astoria / 2 BR"
  - eyebrow "ASTORIA · QUEENS · 2 BR"
  - H1 84px "Sunny 2 BR near the N/W"
  - meta line "$3,450/mo · $1,725 per room · Available Oct 15 · Seen on Sep 26"
- Overview, two columns:
  - Left: Chips (Laundry in building · 6 min to N/W · Pets OK) and a two-line description.
  - Right: a white "Key information" card with --sand icon-tile rows: Rent · Per room · Beds/baths · Available · Broker · Source → "View on Zillow ↗".
- TRUST PANEL (a --sand section):
  - A TrustBadge "Fair price".
  - A horizontal range bar: "$1,725 per room vs Astoria median ≈$1,729".
  - A small price-history sparkline labeled "Price history (from our snapshots)".
  - A checklist: "Price within 15% of the neighborhood median ✓", "No pay-before-viewing language ✓", "Lister is in the US ✓".
  - Beside it, a variant card showing a flagged listing: TrustBadge "Check before paying", "Lister says they're overseas → video walkthrough required before any deposit", and "43% below the neighborhood median".
- A sticky right-side card: "3 groups interested", Button/Ink "Save and find roommates for this place", and a muted note "We don't rent this unit. When you're ready, you'll apply through the source listing."

HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

**Done when:**
- [ ] Every card shows a TrustBadge, "Seen on" and "View on Zillow ↗".
- [ ] All three TrustBadge states appear, each with a text label.
- [ ] The overseas-lister video flag and the currency toggle ("approx.") are visible.
- [ ] The detail page never implies Roomme rents the unit.

---

## P5 · Top 20: swipe and grid

**Attach:** `05-signature-cards`, `03-destinations-grid`.

```text
Design the Roomme top-20 matches screen at 1440px, using the Roomme design system. It has two views of the same data: a swipe stack (the default) and a ranked grid.

HEADER (both views): H1 84px "Your top 20", and the lead "Ranked by your match score: math on your answers, not AI." On the right, a SegmentedToggle "Swipe | Grid" with Swipe active.

SCREEN 5A · SWIPE (default)
- Center: a stack of match cards. The top card is about 560px wide, white, 24px radius; two cards peek behind it.
- Top card content:
  - InitialsAvatar 72px "SK", the name "Sam", VerifiedBadge "Verified student"
  - eyebrow "ASTORIA OR BUSHWICK · $1,500–2,000 · MOVE-IN OCT"
  - MatchScore "87%" with "How it's scored"
  - "Why you matched": six HabitBars (Bedtime · Wake time · Cleaning · Guests · Noise · Smoking), each with both answers
  - A 2-line summary with the AISummaryTag: "Early-to-bed, cooks most nights, likes a quiet weekday apartment and a social Sunday."
  - ClickClashList: click = Same bedtime window · Both clean twice a week · Both cook at home; clash = Sunday brunch guests · Music while cooking
  - A ContradictionCallout: "Quick-tap · Guests: 'Rarely (1–2/month)'" vs "Voice interview: 'I host brunch most Sundays'". Suggested question (only you see it): "How often do you usually have people over on weekends?" [Send question] [Skip]
  - "You both saved 2 listings" with two small listing thumbnails
- Under the stack: a CircleIconButton "Pass" (✕) and Button/Ink "Shortlist ♥", with the hint "or drag left / right".
- Right rail: a "Shortlist 3 / 5" card with 5 slots (3 filled with InitialsAvatars and names, 2 empty dashed) and the note "Chat opens only when it's mutual."
- Left rail: a small "How your score works" card: "Dealbreakers filter first. Then a weighted comparison of your 10 answers; bedtime and cleaning count most. Voice answers add at most 15%."

SCREEN 5B · GRID
- A 3-column grid of compact match cards ranked 01–20 (the rank number in --brand, like section numbers). Each card has an InitialsAvatar, name, VerifiedBadge, MatchScore at 44px, three HabitTags, a one-line reason, and Button/Outline "Shortlist".

SCREEN 5C · AI OFF VARIANT (a copy of 5A)
- An AIOffBadge in the header.
- The card drops the AI summary and the ContradictionCallout.
- Reasons come from the score rules only ("Same bedtime window", "Both clean 2×/week").
- A muted note: "AI is off. Matching still works; explanations are rule-based."

HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

**Done when:**
- [ ] The swipe stack is the default, and the grid is one toggle away.
- [ ] There are no faces, only InitialsAvatars.
- [ ] No card shows age, gender or any other protected trait.
- [ ] The contradiction quotes both answers with their sources, and the question is a draft with Send/Skip.
- [ ] The AI-off variant exists and still shows the match % and reasons.

---

## P6 · Mutual match, meetup, House Agreement

**Attach:** `09-destination-detail`, `10-contact-faq`, `11-packages`.

```text
Design three 1440px Roomme screens, using the Roomme design system. They follow a mutual match with Sam (87%) on the Astoria 2 BR.

SCREEN 6A · IT'S MUTUAL
- A centered moment on the off-white page: eyebrow "IT'S MUTUAL", H2 60px "You and Sam both said yes."
- Two circles side by side: the InitialsAvatars have now turned into photo placeholders (grey --sand circles labeled "photo"), with a caption "Photos unlock now that you've both opted in."
- A card with a ChatBubble preview: "The Roomme agent just texted you both an intro. Your numbers stay hidden."
- Button/Ink "Plan a meetup →".

SCREEN 6B · PLAN A MEETUP
- H2 "Meet before you sign."
- Three selectable format cards: In person (a public spot) · Coffee chat · Video call.
- "Times that work for both of you": three Chips, "Sat Sep 27 · 2:00 PM", "Sun Sep 28 · 11:00 AM", "Tue Sep 30 · 6:30 PM".
- A place card: "[Café near the listing, Astoria]" with an address line and "6 min walk from the listing".
- A safety card with --sand icon rows: Meet somewhere public · Tell a friend where you'll be · Never pay a deposit before viewing · Our agent relays messages, so you don't need to share your number.
- Button/Ink "Send via Roomme agent".

SCREEN 6C · HOUSE AGREEMENT (use the destination-detail rhythm: intro, key-info card, timeline)
- Intro: eyebrow "HOUSE AGREEMENT · DRAFT", H1 84px "Sam & Kien · 2 BR Astoria", and the AISummaryTag with "Drafted from both profiles. Edit anything."
- Left column: agreement sections as white cards, each with a --sand icon tile, a title, the agreed text and an Edit link:
  - Quiet hours: "Weeknights 11 PM – 7 AM"
  - Guests: "Overnight guests up to 2 nights a week, with a heads-up by text"
  - Chores: "Weekly rotation: kitchen, bathroom, trash"
  - Bills: "Rent split 50/50 ($1,725 each). Con Ed and internet split evenly, due on the 1st"
  - Thermostat: "68°F in winter"
- Open questions: two cards with a --watch dot: "Sam wants a cat by spring. Both OK?" and "Sunday brunch guests: how many, how often?", each with [Resolve].
- Right sticky column:
  - A Timeline: Matched ✓ · Met ✓ · Agreement (current) · Lock listing · Apply via the source listing
  - Confirmation status: "You ✓ confirmed" / "Sam · waiting"
  - Button/Ink "Lock this listing" (disabled until both confirm)
  - A "Message to the broker (draft)" card with a short, polite drafted inquiry, Button/Outline "Copy", and "Open on Zillow ↗"

HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

**Done when:**
- [ ] Photos appear only after the mutual moment.
- [ ] The meetup screen has all three formats, three times, a public place and safety tips.
- [ ] Every agreement section covers quiet hours, guests, chores, bills and thermostat, and open questions are flagged with the `--watch` dot.
- [ ] "Lock this listing" is shown disabled until both confirm, and the broker draft links to the source.

---

## P7 · Hand-off screen, final pass, handoff

**Attach:** `09-destination-detail`, `10-contact-faq`.

```text
Part 1: design one more 1440px screen, then review everything and hand off. Use the Roomme design system. Roomme's job ends at this screen. There are no post-move-in features.

SCREEN 7A · LOCKED AND HANDED OFF (the last screen in the product)
- A CTABand-style ink card at the top (28px radius, NYC street photo with a gradient): eyebrow "LOCKED", H1 84px white "Sam & Kien: go get the Astoria 2 BR.", and white 75% lead "You've matched, met and agreed. The next step happens on the source listing."
- Below it, three columns:
  - The listing card from P4 (photo, TrustBadge "Fair price", "$1,725 / room", "Seen on Sep 26") with Button/Ink "Apply on Zillow ↗".
  - The broker message card: the drafted inquiry from P6, with Button/Outline "Copy message".
  - A House Agreement summary card: 5 rows (quiet hours, guests, chores, bills, thermostat), both confirmations ticked, and Button/Outline "Download PDF".
- A full-width Timeline, all ticked: Matched · Met · Agreed · Locked · Apply via the source listing.
- A muted note: "Roomme isn't a broker and doesn't hold deposits. Never pay anyone before you've seen the apartment and signed a lease."

Part 2 · FINAL PASS across every screen from P1–P7:
- Consistency: only design-system tokens and components, and component names match P0.
- Contrast: body text is at least 4.5:1, including white text on photos (strengthen the gradient where needed). Focus rings are 2px ink with a 2px offset on every interactive element.
- Empty and loading states: "No matches yet: finish your profile", "No saved listings yet", and --sand skeleton cards for the listing and match grids.
- List anything you changed.

Part 3 · HANDOFF NOTES for Claude Code (write these into the handoff bundle):
- Stack: Next.js App Router + TypeScript + Tailwind v4.
- Tokens: CSS variables with exactly these names: --background, --foreground, --ink, --muted-foreground, --brand, --sand, --muted, --card, --border, --destructive, --fair, --watch.
- Fonts: DM Sans (400/500) and Caveat (400) via next/font/google.
- Suggested routes: / · /start · /profile · /listings · /listings/[id] · /matches · /matches/[id] · /agreement/[matchId] · /locked/[matchId].
- Component names as in the P0 sheet.
- Static sample data only. Don't wire an API or database, and never put API keys in browser code.
- The match % comes from our deterministic scoring code; the UI only displays it.

HOUSE RULES (apply to every screen)
- Desktop only, 1440px frames. Use the Roomme design system; don't add colors, fonts or radii.
- Match on habits only. Never show or ask for age, gender, race, religion, national origin or any other protected trait.
- No face photos of people before a mutual match: use the Initials Avatar. Photography is for NYC places and apartments.
- The match % is deterministic math. AI only writes explanations, and AI-written text carries the "AI summary" tag.
- Every listing shows "View on Zillow ↗" and a "Seen on" date. We link back; we never call them our listings.
- No invented testimonials, ratings or user counts. Use only the numbers given here, or [bracketed placeholders].
- Scope is matching only. Roomme ends at the match and hand-off to the listing: no chore trackers, reminders or house chat after move-in. (The House Agreement can still mention chores.)
```

**Done when:**
- [ ] The hand-off screen links to the source listing, shows the broker draft and the agreement summary, and has nothing about life after move-in.
- [ ] The final pass lists its fixes, and there's no text under 4.5:1 contrast.
- [ ] Empty and loading states exist for matches and listings.
- [ ] Then click **Hand off → Send to local coding agent**, and have Claude Code review the bundle before building anything.
