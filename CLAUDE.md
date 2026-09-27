# CLAUDE.md

DivHacks 2026 (Columbia, Sep 26–27): roommate matching and renter support for NYC, **Live Better** track. The working name is Buzz In. The source of truth is `docs/PROJECT.md`; read it before planning or building.

## Stack
- **Web:** Next.js (TypeScript) on Vercel.
- **Database:** Tiger Data (Postgres + TimescaleDB). Use one database only; don't add Supabase or Mongo. Hypertables are `listing_snapshots` and `house_events`.
- **Listings:** SearchApi Zillow engine.
  - Pull offline, store in Tiger Data, and never call it live in the demo.
  - URL-encode params (`--data-urlencode`).
  - 41 results per page; 100 free requests, about 1 used.
- **Voice:** ElevenLabs agent for the open-ended interview.
  - About 2 hours of agent time on the Creator plan.
  - Cap calls at about 90 s.
  - Test with pasted transcripts, not live calls.
- **Chat agent:** Photon Spectrum (`spectrum-ts`, Bun) iMessage agent, running as a long-lived worker.
- **AI:** Gemini for open-answer signals, contradictions, match cards and the House Agreement. Always use JSON schemas.

## Rules
- The compatibility score is **deterministic**. The LLM never produces it.
- Keep the `AI_OFF` fallback working.
- Match on habits only; never on protected traits.
- Secrets live in `.env` (gitignored). Never commit keys or put them in browser code.
- Keep raw API responses out of the public repo.
- Build window: Sat 11 AM → Sun ~10:30 AM. Feature freeze is Sun 7 AM.
