# RoomMe promo video (Remotion) · spec + build plan

**Status:** Approved · **Author:** Claude (main loop) · **Reviewer:** Kien · **Date:** 2026-09-27

## Context

Judges at DivHacks 2026 watch a ~30 s promo, and then the team's recorded live demo is appended right after it. The video must say what problem RoomMe solves and show every shipped feature, with no filler and no em dashes, in RoomMe's look, with enough motion (3D tilts, camera moves, light) to stand out. We render at 1920x1080 for iteration; the final is 2K or 4K from the same code (`--scale`).

Decisions made with the user:
- **Audio:** ElevenLabs music, an ElevenLabs voiceover, *and* on-screen text, so the video still works on bad room audio.
- **Look:** "Brand + light." The base is ink `#0e0c0b`, off-white `#f5f4f1` and sand `#eae7e1`, with DM Sans 500 (Caveat for one handwritten note). Steel blue `#3d7096` becomes the *light source*: soft glows, rim light, and sheen sweeping across tilted cards. The only other gradients are the app's ink photo overlays. We invent no new palette.
- **Ending:** end card, then the camera flies into a browser showing the roomme.tech landing page until it fills 1920x1080. The demo recording (starting on the landing page) continues seamlessly.

Facts the explorers confirmed that shape the content:
- **Built, and shown:** the pre-screen, 10 quick-tap questions, the 90 s ElevenLabs voice interview, contradiction flags, the deterministic match %, a swipe stack of the top 20, shortlist up to 5 with mutual opt-in, the meetup planner, 1,380 real listings with fair-price badges (Tiger Data medians), the House Agreement with PDF, and hand-off to Zillow.
- **Not built, so never shown:** the Photon iMessage agent, "3 groups interested", and eval/poll numbers.
- **The demo pair is Kien and Sam at 87%** (`web/lib/sample-data.js`, pinned by `web/lib/score.check.ts`). Stat: "1.41% vacancy, lowest since 1968 (NYC HPD)".

## Functional Requirements
- FR-1: The composition `RoomMePromo` MUST be 1920x1080 at 30 fps, and MUST render at 2K/4K with `--scale` without code changes. All timing MUST be in seconds (a `s()` helper), never raw frame literals.
- FR-2: The video MUST follow the 10-scene script below. Scene boundaries MUST come from the voiceover's timestamps (`timing.json`), not hand-typed frame counts.
  - Scenes tile the timeline with hard cuts in a plain `<Series>`: scene *i* starts at VO line *i* start minus a 0.12 s lead, rounded to whole frames.
  - Transitions are the scenes' own enter/exit motion plus a flash/light-sweep overlay `<Sequence>` centered on each cut. Nothing overlaps, so there's no duration math.
- FR-3: The voiceover MUST be ElevenLabs TTS `with-timestamps`, one continuous read of the script. It produces `vo.mp3` and `timing.json`.
  - Model: `eleven_multilingual_v2`, which supports `<break time="0.3s" />` between lines, at speed ≤1.15.
  - Line starts come from searching `alignment` (not `normalized_alignment`) for each line's text, not from fixed character offsets.
  - If a probe shows `eleven_v3` sounds clearly better and supports timestamps, use it (no break tags). Its fallback for timings is `POST /v1/forced-alignment`.
- FR-4: The music MUST be an ElevenLabs Music instrumental.
  - It uses `POST /v1/music` with `model_id: music_v1`, a `composition_plan` and `respect_sections_durations: true`.
  - Sections map to the scene groups: tense intro S01-S02, riser into the drop at S03, groove S04-S09, and a resolve that folds S10 in, since every section must be ≥3 s.
  - Every section has `lines: []`, and `negative_global_styles` includes "vocals" and "singing". `force_instrumental` only works with `prompt`.
  - Get the skeleton from the free `POST /v1/music/plan`, then overwrite `duration_ms`. Generate 2 seeds and keep the better one.
- FR-5: The music MUST duck under the voiceover (about -10 dB while words are spoken, gain 0.316, with 0.2 s ramps), via `@remotion/media` `<Audio volume={f=>…}>`. SFX (whoosh, tap, impact, stamp, chime, riser) come from `POST /v1/sound-generation` (`eleven_text_to_sound_v2`) and land on cuts and hero beats. A final `ffmpeg -c:v copy -af loudnorm=I=-14:TP=-1.5` pass (`npm run master`) sets the loudness.
- FR-6: Every scene MUST have on-screen text carrying its line, so the video reads with the sound off.
- FR-7: UI shown in scenes MUST use the real `web/components/rm/*` components (Wordmark, HabitBar, MatchScore, InitialsAvatar, ContradictionCallout, HabitTag, ClickClashList, Chip, TrustBadge, Icon), with the app's exact copy.
  - Import them by file path, not via `index.ts`, which pulls `next/link`. Remotion hard-aliases `react`, so they resolve as-is.
  - Do not import `web/lib/sample-data.js`: it needs Next's `@/` alias. The Kien vs Sam values (the ten parts 100/75/100/100/100/64/100/75/60/100, and the quiz options) are copied into `src/script.ts`.
  - Pass `frost={false}` to frosted rm components inside animated or opacity layers, because `backdrop-filter` drops out there.
- FR-8: Listings and landing MUST use real screenshots of the public roomme.tech pages.
  - Capture with `playwright-core` using `channel:'chrome'` and `deviceScaleFactor: 2` at 1920x1080. Wait for network idle plus 1.5 s so the page isn't caught mid-`rm-rise`.
  - Render captures with `<Img src={staticFile()}>`, never CSS `background:url()`, which the renderer doesn't await.
  - Captures are regenerated by a script and gitignored, because they contain third-party Zillow photos.
- FR-9: Motion MUST include:
  - CSS 3D tilts (perspective plus rotateX/Y on a `preserve-3d` parent; fade children, never the preserve-3d element), and camera push/dolly with `@remotion/noise` drift
  - parallax depth, a steel-blue glow (radial gradients, not `filter: blur`) and sheen sweeps
  - film grain (a tiled noise PNG jittered with `random(frame)`)
  - word-mask kinetic type, a line-draw logo reveal (`@remotion/paths`), number count-up, and a swipe with a stamp
  - on whips, a speed-scaled horizontal SVG blur (`feGaussianBlur stdDeviation="v 0"`)

  `CameraMotionBlur` is allowed only *inside* a scene's own frame-driven motion, with samples ≤6.
- FR-10: The last scene MUST end on a full-frame landing-page capture in a browser frame. The final frame matches the demo's first frame.

## Non-Functional Requirements
- NFR-1: Total length: 24 to 31 s.
- NFR-2: There MUST be zero em dash (U+2014) or en dash (U+2013) characters in the VO script, on-screen copy, and `video/src`. Ranges use "to" or a hyphen ("1-2", "22:00 to 08:00").
- NFR-3: The VO and on-screen copy pass the humanizer rules: no AI vocabulary, no "not just X", no filler.
- NFR-4: Deterministic render: every animation derives from `useCurrentFrame()`. A global `* { transition: none !important; animation: none !important }` kills the rm components' CSS transitions, so there is no flicker.
- NFR-5: Mix: integrated loudness -16 to -13 LUFS and true peak ≤ -1 dBTP (ffmpeg `ebur128`). The VO stays intelligible over the music.
- NFR-6: The 1080p render takes under 10 minutes on this Mac. Motion blur stays on a few transitions only.
- NFR-7: The ElevenLabs key is read from `web/.env.local`, never printed, logged or committed. Generated audio is committed so re-renders cost zero credits.
- NFR-8: Brand fidelity: DM Sans 400/500 only (plus one Caveat note), and no colors outside the tokens. Easing is the brand curve `cubic-bezier(.22,1,.36,1)`, with overdamped springs (no bounce).

## Script (VO line → on-screen → visual)
Word count 82, spoken at ~1.1 to 1.15x speed. If the read makes the video longer than 31 s, apply these pre-approved trims in order (they keep every word the scenes key on): S07 "Shortlist five. Meet when it's mutual."; S04 "Tap ten habits, then talk for ninety seconds." This is the humanized final draft, with no em/en dashes.

| # | VO line | On-screen text | Visual |
|---|---|---|---|
| S01 Hook | "Every New Yorker has a roommate horror story." | Same line, as kinetic type | The four landing horror lines ("Their 6 a.m. alarm, your 2 a.m. bedtime.", "The sink that's never empty.", "The partner who quietly moved in.", "Calls on speaker at midnight.") on tilted white cards floating in ink space. The camera flies through them. |
| S02 Problem | "Most start with one DM vibe check and a twelve-month lease." | "One DM vibe check." → "12-month lease." + chip "NYC vacancy 1.41%. Lowest since 1968." | DM bubbles pop in. A lease card slams down with a Caveat signature scribble and a stamp SFX. |
| S03 Reveal | "RoomMe matches you on how you actually live." | Wordmark lockup, then "Matched on habits. Checked before the lease." (the live hero's side captions), then the words Sleep, Dishes, Guests and Noise cycle. | Riser, then impact. The house icon line-draws, the wordmark resolves, a steel-blue bloom rises, and the music drops. |
| S04 Quiz + voice | "Tap ten habits. Then talk for ninety seconds." | "10 quick taps" · "90-second voice interview" | A tilted quiz card ("What time do you actually go to bed on weeknights?", "3 of 10", a pill tap with a tap SFX, the progress line fills), then a whip to the dark voice screen: the countdown ring "1:30 left", waveform bars driven by the VO audio, and the transcript typing "Most Sundays it's three or four friends and a big pan of eggs." |
| S05 Contradiction | "We flag answers that don't add up." | "Worth a second look" | The quick-tap "Guests: 1-2/month" and the voice quote "I host brunch most Sundays." slide toward each other, collide, and the ContradictionCallout snaps in with "Suggested question: How many people come over in a typical month?" |
| S06 Score | "Your match score is a metric built from your answers." | Huge "87%" + Caveat note "ten answers, averaged" + caption "match · metric" (the live app's wording since commit 7c22f36) | 87% counts up (chime). Ten HabitBars cascade-fill with Kien vs Sam values, and the formula ticker "(100 + 75 + 100 + 100 + 100 + 64 + 100 + 75 + 60 + 100) ÷ 10 = 87.4". |
| S07 Shortlist | "Shortlist up to five. Meet when it's mutual." | "Your top 20" → "It's mutual" | A 3D wall of match cards recedes. One card swipes right with a SHORTLIST stamp, then two InitialsAvatars (K, S) glide together around "87%". |
| S08 Listings | "Every listing gets a fair-price check." | "1,380 listings. 24 neighborhoods." + "$1,250 / room vs Astoria median ≈$1,998" (the listing's own trust check) | The real listings capture on a tilted plane scrolls in depth. A "Fair price" TrustBadge zooms off the page with a sheen sweep. |
| S09 Agreement | "Agree on house rules, then apply together." | "House Agreement" → "Apply on Zillow ↗" | The agreement card assembles row by row ("Weeknights 22:00 to 08:00", "Rent split 50/50"), the timeline ticks Matched ✓ Meetup ✓ Agreement ✓ Locked ✓, and a PDF page peels out. |
| S10 End | "RoomMe. Find a roommate who lives like you do." | Wordmark · "Find a roommate who lives like you do." · roomme.tech · "DivHacks 2026 · Live Better" · "Built with Tiger Data · ElevenLabs · Gemini · SearchApi" | The end card, then the camera flies into a browser frame of the roomme.tech landing capture, whose hero H1 is that same line, until it fills the frame. Ideally the tagline match-cuts into the hero H1 position. |

## Acceptance Criteria
### AC-1: (FR-1, NFR-1)
Given `timing.json`, when `npx remotion render RoomMePromo` runs, then ffprobe reports 1920x1080, an h264 video stream, an AAC audio stream, and a duration from 24 to 31 s.
### AC-2: (FR-1)
Given the same code, when it renders with `--scale=2`, then the output is 3840x2160 with no blurry captures, because the captures are @2x.
### AC-3: (NFR-2)
Given the repo, when `npm run check` runs (it scans video/src and video/scripts for U+2014 and U+2013), then there are zero hits.
### AC-4: (FR-2, FR-3)
Given `timing.json`, when `npm run check` runs, then each scene's start + 0.12 s is within 1 frame of its VO line's start, the scenes tile the timeline with no gaps, and every capture referenced by a scene exists.
### AC-5: (FR-7)
Given the S06 still at its midpoint, when it is viewed, then it shows real `HabitBar`/`MatchScore` styling (DM Sans 500, sand track, ink fill) with Kien vs Sam values that sum to 87.4.
### AC-6: (NFR-5)
Given the render, when ffmpeg ebur128 runs, then integrated loudness is -16 to -13 LUFS and true peak is ≤ -1 dBTP.
### AC-7: (FR-10)
Given the last frame, when it is rendered as a still, then it is the landing capture filling 1920x1080 edge to edge, with no browser chrome visible.
### AC-8: (NFR-4)
Given 2 frames, when each is rendered twice with `remotion still`, then the files are byte-identical (catches CSS-transition flicker).
### AC-9: (FR-6)
Given the contact sheet (2 fps) with the sound off, when a reviewer reads it, then they can name the problem and at least 6 features.

### AC-10: (FR-8)
Given roomme.tech is reachable, when `npm run capture` runs, then `public/captures/` holds the landing hero, landing sections, listings grid and a listing detail as @2x PNGs (3840px wide), no page is mid-animation, and `npm run check` finds every capture a scene references.

### AC-11: (FR-9)
Given the 2 fps contact sheet and the per-scene stills, when the reviewer ticks the FR-9 list, then every listed effect appears in at least one scene, with no 3D plane flattened by opacity/filter on a Space.

## Edge Cases
- EC-1: The ElevenLabs Music API rejects `composition_plan` (plan tier or schema): fall back to `prompt` + `music_length_ms` and align the drop by trimming/offsetting in `Promo.tsx`. If music returns 402/403, stop and ask the user.
- EC-2: The VO runs past 29 s: raise speed (≤1.15) first, then trim words in the script and re-run. Never cut the hook or the tagline.
- EC-3: roomme.tech is down or slow during capture: capture from the local dev server (`npm --prefix web run dev`, public pages only).
- EC-4: A captured page is mid-animation (`rm-rise`): wait for network idle plus 1.5 s before the shot.
- EC-5: A `../web` rm file pulls a bare import Remotion can't resolve (anything other than `react`): add `resolve.modules: [<video>/node_modules, 'node_modules']` in `overrideWebpackConfig`, using `process.cwd()`, not `__dirname`. If that fails, copy that one rm file into `video/src/rm/` verbatim.
- EC-6: Google Fonts fetch fails at render: fall back to the local DM Sans woff2 from the design zip via `@remotion/fonts`.
- EC-7: `tsc` can't type the rm `.d.ts` files (they import `react` from `web/`, which has no node_modules): set tsconfig `paths` so `react` resolves to `./node_modules/@types/react`, plus `allowJs` and `skipLibCheck`.

## Out of Scope
- OS-1: The Photon iMessage agent, "3 groups interested", eval/poll numbers, and any user counts or testimonials. None exists.
- OS-2: Sponsor logos (trademarks). Credits are text only.
- OS-3: Recording the live demo itself. The team appends it after.
- OS-4: WebGL/three.js. CSS 3D covers the tilts and renders reliably headless.
- OS-5: Any change to `web/`. The video only reads from it.

## API Contracts

The "API" here is the scaffold's module surface and the ElevenLabs endpoints the audio scripts call.

```ts
// src/timing.ts
interface LocalLine { start: number; end: number; words: {text: string; start: number; end: number}[] } // scene-local seconds
declare function lineAt(id: SceneId): LocalLine;
declare function wordAt(id: SceneId, word: string): number;   // throws if the word isn't in that line
declare function voSecAt(id: SceneId, frame: number): number;
// src/fx.tsx (props)
interface SpaceProps { perspective?: number; dolly?: number; panX?: number; panY?: number; rx?: number; ry?: number; rz?: number }
interface PlaneProps { x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; scale?: number; width?: number; height?: number; opacity?: number }
interface KineticTextProps { text?: string; words?: {text: string; start: number}[]; at?: number; stagger?: number; dur?: number }
interface SfxProps { name: SfxName; at: number; volume?: number }
```

ElevenLabs (key from `web/.env.local` `ELEVENLABS_API_KEY`, header `xi-api-key`):
- `POST /v1/text-to-speech/{voice_id}/with-timestamps`: returns `{audio_base64, alignment: {characters, character_start_times_seconds, character_end_times_seconds}}`. On error: non-2xx, so log the status + body and exit 1.
- `POST /v1/music/plan` (free) then `POST /v1/music?output_format=mp3_44100_192`: returns audio bytes. 402/403 means stop and report (EC-1).
- `POST /v1/sound-generation`: `{text, duration_seconds, prompt_influence, model_id: "eleven_text_to_sound_v2"}` returns audio bytes.

## Data Models

`src/timing.json` (written by `scripts/gen-vo.ts`; a placeholder until then):

| Field | Type | Constraints |
|---|---|---|
| placeholder | boolean? | absent or false once real |
| voDuration | number | seconds, length of vo.mp3 speech |
| lines[] | Line | exactly LINES order and text from script.ts |
| lines[].id | SceneId | S01 to S10 |
| lines[].start, end | number | seconds into vo.mp3 |
| lines[].words[] | {text, start, end} | every spoken word, in order |

`src/audio.json` (written by the gen scripts): `vo: boolean`, `music: boolean`, `sfx: SfxName[]` (only names whose mp3 exists).

`public/captures/*.png` (from `scripts/capture.ts`, gitignored): 3840x2160 or taller @2x screenshots of public roomme.tech pages.

## Scaffold API (what exists, use it)

- `src/script.ts`: every string and number (LINES, SFX names, HORROR, STAT, PAIR, PARTS, FORMULA, QUIZ, VOICE, CONTRADICTION, MATCHES, LISTINGS, AGREEMENT, END). Import copy from here. Don't retype app copy.
- `src/brand.ts`:
  - Tokens and constants: `C` (tokens), `BRAND_RGB`, `onDark(a)`, `inkA(a)`, `lightA(a)`, `FLOAT_SHADOW`, `POLAROID_SHADOW`, `TYPE` (mega/display/h1/h2/h3/body/eyebrow).
  - Easing: `EASE` (brand curve), `EASE_IN`.
  - Timing helpers: `s(sec)`, `tw(frame, atSec, durSec, from?, to?, easing?)`, `settle(frame, atSec, durSec?)` (an overdamped spring).
  - Fonts: `SANS`, `HAND`. Use `fontFamily: 'var(--font-hand)'` for the one Caveat note.
- `src/timing.ts`:
  - `lineAt(id)` gives `{start, end, words[]}` in scene-local seconds.
  - `wordAt(id, 'vibe')` gives the scene-local second when that word is spoken.
  - `voSecAt(id, frame)`. Placeholder timing is in place until the audio agent writes the real one, so always derive beats from these, never from constants.
- `src/fx.tsx`:
  - `Stage` (fonts, background, grain; already wraps every composition).
  - `Space` (3D world: perspective, dolly, panX, panY, rx, ry, rz).
  - `Plane` (x, y, z, rx, ry, rz, scale, width, height, opacity).
  - `drift(frame, seed, amp)`.
  - `KineticText` (word-mask reveal; `words` synced, or `text` + `at` + `stagger`).
  - `Glow` (steel-blue radial bloom), `Sheen` (a light band, progress 0 to 1).
  - `BrowserFrame` + `CHROME_H`.
  - `HBlur` (directional blur for whips; wrap outside a Space).
  - `useEdges(inSec, outSec)` (scene enter/exit progress).
  - `Sfx` (name, at: scene-local sec, volume). It renders nothing until the file exists.
  - `useVoLevels(id, n)` (waveform levels, from the real VO once it exists).
- rm components: import by file path from `../../../web/components/rm/<group>/<Name>.jsx` (from `src/scenes/`). Never from `index.ts`.
- A scene is `export const SNNName: React.FC = () => ...` in `src/scenes/SNNName.tsx`. Its length comes from `useVideoConfig().durationInFrames` (the slot length). Placeholder durations shift when the real VO lands, so every beat must be relative to `lineAt`/`wordAt` or to the scene duration.

## Agent rules

- **Own only your files.** Scene agents edit only their scene files, and may add private helpers inside those files. Do not edit `script.ts`, `brand.ts`, `fx.tsx`, `timing.ts`, `layout.ts`, `Promo.tsx`, `Root.tsx`, `scenes/index.ts`, `tokens.css` or `package.json`. If you need a change there, say so in your final report with the exact diff you want.
- **Motion:** every value derives from `useCurrentFrame()`. No CSS transitions or animations, no `Math.random()` (use `random(seed)` from remotion), no `setTimeout`, no `useState` for animation.
- **Images:** use `<Img src={staticFile(...)}>`, never CSS `background-image`.
- **3D:** never put opacity, filter or overflow on a `Space`. Filters (HBlur) go outside the Space.
- **Brand:**
  - Colors come only from `C` and the alpha helpers. Steel blue is light only (Glow, Sheen, rim), never text or fills.
  - DM Sans 500 for headings and numbers, 400 for body. One Caveat note at most per scene.
  - No bounce and no spring overshoot.
  - Radii come from the tokens: 12, 16.8, 21.6, 24, 28, 9999.
- **Copy:** no em or en dashes (`npm run check` fails on them), no exclamation marks, sentence case. Any new string must pass the humanizer rules (no AI vocabulary, no filler).
- **Readability:** hold each key line long enough to read, at least 0.8 s fully visible. On-screen text must stay inside 120px safe margins, with the minimum text size 22px at 1080p.
- **Verify before reporting:**
  - Run `npx tsc --noEmit` and `npm run check`.
  - Render stills of your `Scene-SNN` at 4+ frames (early, the key beat, late, and the last frame): `npx remotion still Scene-SNN out/agents/SNN-<frame>.png --frame=<n>`.
  - Read (view) every still. Fix anything clipped, overlapping, off-brand or unreadable before you report.

## Transitions (adjacent scenes must agree)

Default whip: the exiting scene moves left with `HBlur` growing to ~40px over its last 0.25 to 0.3 s (`useEdges().exit`) and places `<Sfx name="whoosh" at={durSec - 0.3} volume={0.45} />`. The entering scene comes in from the right with `HBlur` fading out over its first 0.35 s.

| Cut | Exit (outgoing scene) | Entry (incoming scene) |
|---|---|---|
| start to S01 | none | fade up from ink over 0.3 s |
| S01 to S02 | camera dollies forward through the cards and rushes past (scale up, blur) | S02 settles from scale 1.12 to 1 |
| S02 to S03 | the lease impact, then everything rushes toward camera and fades to ink in the last 0.25 s. S02 places `riser` so it ends at the cut | S03 opens on ink: `impact` at 0, the house icon line-draws |
| S03 to S04 | default whip left | from the right |
| S04 to S05 | default whip left | from the right |
| S05 to S06 | push in: the callout scales toward camera and fades | the 87 starts huge and dollies back |
| S06 to S07 | default whip left | from the right |
| S07 to S08 | default whip left | from the right |
| S08 to S09 | whip up (`HBlur dir="y"`) | from below |
| S09 to S10 | dolly back and fade to ink over the last 0.3 s | on ink, the wordmark rises |
| S10 end | fly into the roomme.tech BrowserFrame until the viewport fills the frame; hold the exact capture for the last 6+ frames | the demo recording follows |
