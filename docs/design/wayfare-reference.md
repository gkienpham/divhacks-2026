# Design reference: Wayfare Travels template + Claude Design

Research notes behind [claude-design-prompts.md](claude-design-prompts.md). Pulled Sep 26, 2026.

## 1. The template

**Wayfare Travels** by Modulify.
- Gallery listing: https://modulify.ai/templates (card "Wayfare Travels", tag "travel").
- Live demo: https://wayfare-travels.modulify.website/

Stack: Next.js + Tailwind v4 with shadcn-style color tokens. That's the same as ours, so tokens carry over 1:1.

Every value below was read from the live demo with `getComputedStyle` and the site's `:root` variables at 1440×900. Values marked *calc* were derived from those numbers.

### Fonts
Both are free Google Fonts (OFL), so we can load them with `next/font/google`.

| Role | Family | Weight | Size / tracking |
|---|---|---|---|
| H1 home hero | DM Sans | 500 | clamp 44–92px (92 at 1440), line-height ≈0.98, −0.035em. Wraps at ~15 characters. |
| H1 inner pages | DM Sans | 500 | 84px |
| H2 big | DM Sans | 500 | clamp 34–60px, −0.03em |
| H2 secondary / quote | DM Sans | 500 | 44px |
| H3 cards | DM Sans | 500 | 18–26px |
| Body | DM Sans | 400 | 16/24. Lead text is 15px at 1.625. Card text is 13–14px. |
| Nav, buttons | DM Sans | 400 / 500 | 14–15px, −0.01em |
| Eyebrow | DM Sans | 500 | 11px, uppercase, 0.18em tracking |
| Handwritten accent | Caveat | 400 | 26px. Used once, beside the polaroids. |

There's no serif and no italic display type. The whole look comes from one weight-500 sans with tight tracking.

### Colors (`:root`)
| Token | Hex | Use |
|---|---|---|
| `--background` | `#f5f4f1` | Warm off-white page. Also the text color on ink buttons. |
| `--foreground` | `#141211` | Body text |
| `--ink` | `#0e0c0b` | Headings, ink buttons, dark sections, footer. The scrolled header is ink at 92% with a 12px blur. |
| `--muted-foreground` | `#6e6a65` | Secondary text, eyebrows |
| `--brand` | `#3d7096` | Steel blue. Used **only** for section numbers ("01") and eyebrow dots. |
| `--sand` | `#eae7e1` | Photo placeholders and icon tiles. At 60% it's the alternate section background (≈`#eeece7`, *calc*). |
| `--muted` / `--accent` / `--secondary` | `#ebe9e6` | Neutral fills |
| `--card` | `#ffffff` | Cards, fields, filter bar |
| `--border` / `--input` | `#dddbd7` | Hairlines |
| `--destructive` | `#e40014` | Errors |

On dark areas, white text is used at these opacities:

| Opacity | Used for |
|---|---|
| 75% | Lead text |
| 70% | Nav |
| 65% | Card subtitles |
| 60% | Meta text |
| 45–55% | Footer |

### Shape, depth and layout
- **Radii:**
  - 12px base
  - 16.8px for fields and images inside cards
  - **21.6px for image cards**
  - 24px for the form card
  - **28px for CTA bands and the featured card**
- **Everything interactive is a full pill.** Buttons are 40, 44 or 48px tall. Circle icon buttons are 40–56px.
- **Buttons:**
  - Ink fill with `#f5f4f1` text and an arrow.
  - A white pill on photos.
  - An outline with a 1px border at ink 20% that darkens on hover.
  - A text link with a 1px underline at 25% and a ↗ arrow.
- **Shadows are almost absent.** Cards separate with 1px `#dddbd7` borders. The only shadows are on the polaroids: `0 18px 40px -18px rgba(20,18,14,.45)`.
- **Photos:** full-bleed with ink gradient overlays, text bottom-left, and frosted pill badges (ink 45% with blur, or white 90%).
- **Grid:**
  - 1440px max width with 48px side padding.
  - 12 columns with 48px gaps.
  - Sections have 112px vertical padding.
  - Card grids use 16px gaps.

### Motion
- **Hero:**
  - The photo zooms out from 114% to 100% over 16s.
  - Eyebrow, heading, text and buttons rise in one after another: 0.95s each, delays of 0 / 120 / 260 / 380ms.
- **Header:** fixed. Transparent over the hero, ink with blur once you scroll.
- **Card hover:** the image zooms to 104% over 0.9s and a round arrow button fades in.
- **Carousels:** scroll sideways with snapping and use 44px circle arrow buttons.

### Home page sections, in order
1. Nav: line icon and wordmark, centered links with a dot under the active one, a search icon, and a CTA pill.
2. Hero: full-screen photo, eyebrow, 92px H1, lead text, a white pill, and a link with a circle icon. Two small captions on the right.
3. Trust strip: 3 columns (avatar stack plus "5K+ travellers", countries, rating).
4. 01 Our value: 60px heading with lead text on the right, and a carousel of 3:4 portrait cards.
5. 02 Popular destinations: a white pill filter bar with 4 dropdowns and an ink button, a 3-column image-card grid with frosted pills, and an outline "See all" button.
6. 03 Our expertise (dark): vertical category tabs and a carousel of 16:10 cards.
7. 04 Our work: two-tone heading (only some words at full ink) and a 3-column grid of 4:5 cards with white tag pills.
8. 05 How it works: 4 steps joined by a 1px line, each with a 56px outline circle icon.
9. Real stories: full-width photo with a left-to-right gradient and a 44px white quote.
10. Newsletter: a pill email field with an ink button inside, plus 3 tilted polaroids and the Caveat note.
11. Footer (ink): logo, 3 link columns, a promo image card, and a back-to-top circle.

### Other pages
| Page | Structure |
|---|---|
| `/destinations` | Intro with an 84px H1 and 3 stats, a featured card plus 2 smaller ones, the filter bar with a grid, and a dark CTA band |
| `/destinations/[slug]` | Photo hero (88% of screen height) with breadcrumbs, a "REGION · TYPE" eyebrow and a meta line; a "Key information" card whose rows have sand icon tiles; a 2-column list with images; a vertical timeline on sand; 3 stay cards; related cards |
| `/packages` | Featured split card (28px radius), filter chips (active one ink, others white with a border), a 3-column grid, and an "included" list on sand |
| `/about` | Dark stats band with 60px numbers, values in 2 columns with top borders, team portraits, and 3 bordered quote cards |
| `/contact` | Form card with a 24px radius; fields are 48px tall with a 16.8px radius; FAQ accordion on sand with a 32px circle icon that fills with ink when open |

## 2. Claude Design: what the prompts can rely on

| Fact | Source |
|---|---|
| Launched Apr 17, 2026 (Anthropic Labs). Makes designs, prototypes, slides, one-pagers and landing pages. | https://www.anthropic.com/news/claude-design-anthropic-labs |
| Inputs: text, uploaded images, documents (DOCX/PPTX/XLSX), and a codebase. Web capture is described for **your own** site. | same |
| Upload screenshots of competitor products or inspiration; link a repo. | https://support.claude.com/en/articles/14604416-get-started-with-claude-design |
| **A third-party URL as a style reference is unconfirmed**, so attach screenshots instead. | checked both help articles |
| A design system can be built from "screenshots, web flows, and existing design files", color and type specimens, or code. Once "Published", new projects use it. | https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design |
| Walk Claude through a multi-screen journey and it generates each screen in context. | https://academy.claude.com/tutorials/using-claude-design-for-prototypes-and-ux |
| A good prompt states the goal, layout, content and audience. Refer to components by name. Ask for variations. | https://support.claude.com/en/articles/14604416-get-started-with-claude-design |
| You can refine with chat, inline comments, direct edits (these use no tokens) and custom sliders. There's no version history yet. | https://claude.com/blog/how-the-product-designer-who-built-claude-design-uses-it-to-explore-ideas-before-building-them, get-started article |
| Handoff goes to "Send to local coding agent" or "Send to Claude Code Web". The bundle carries design intent. | get-started article; prototypes tutorial |
| Usage counts toward the same limits as the rest of Claude. | get-started article |
