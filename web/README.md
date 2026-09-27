# RoomMe web

Next.js 16 (App Router) app for [roomme.tech](https://roomme.tech). The screens are ported from the Claude Design bundle. Everything is read server-side from Tiger Data: listings, profiles and matches.

```bash
npm install
npm run dev
```

## Environment (`web/.env.local`, all server-only, never `NEXT_PUBLIC_`)
- `DATABASE_URL`: the Tiger service `bj9teo40nn`, the same value as the repo root `.env`.
- `AI_OFF=1` (optional): no Gemini anywhere; rule-based reasons + the AI-off badge.
- `GEMINI_API_KEY`, `GEMINI_MODEL` (optional, default `gemini-3.8-flash`): match-card copy (summary / click / clash). Unset = rule-based copy. The score never comes from the model.
- `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID` (optional): the voice interview. Unset = typing only.

## Identity
Anonymous until OAuth: an httpOnly `rm_uid` cookie holds `profiles.session_token` (a uuid). `lib/session.ts` is the only place that reads it: `currentProfileId()` in Server Components, `ensureProfileId()` in Route Handlers (creates the profile on the first write). Google OAuth later swaps how that id is obtained; nothing else changes. `profiles.phone` is never selected.

## Data layer
- `lib/db.ts`: one pooled connection (`max: 1`), because Tiger has no pooler.
- `lib/listings.ts`: listing queries, trust badge, photos. `lib/questions.ts`: the frozen question set (client + server).
- `lib/scoring.ts` / `lib/signals.ts`: deterministic score, habit tags, contradictions, rule-based copy, agreement draft. Pure TS.
- `lib/profiles.ts`, `lib/matches.ts`: people and pairs. Sample profiles reciprocate when the score is ≥ 70 (`LIKE_BACK`); "Simulate … confirming" exists only for them.
- `lib/ai.ts`: Gemini REST with a JSON schema, 8 s timeout, cached per viewer in `matches.reasons.ai`; null on any failure.
- API: `GET /api/me`, `POST /api/profile`, `POST /api/saved`, `GET|POST /api/matches/[id]`, `GET /api/voice/session`. Bodies are validated against `lib/questions.ts` (400 on anything unknown).

Checks, from `web/`:
```bash
npx tsx --env-file=.env.local --conditions=react-server scripts/seed.ts        # 150 synthetic profiles (is_synthetic = true)
npx tsx --env-file=.env.local --conditions=react-server lib/listings.check.ts
npx tsx --env-file=.env.local --conditions=react-server lib/matches.check.ts   # profile → top matches → like → meetup → agreement → lock
```

## Voice interview (ElevenLabs)
1. Create an Agents Platform agent. Its prompt asks the 5 `VOICE_PROMPTS` from `lib/questions.ts`, one at a time, and wraps up at about 90 s (set the max call duration there too). Turn on authentication so the agent needs a signed URL.
2. Set `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID`. `GET /api/voice/session` then returns `{ signedUrl }` (503 `{ configured: false }` when unset).
3. Client wiring point: the `startVoiceSession({ onLine, onEnd })` prop of `VoiceScreen` in `app/profile/VoiceScreens.jsx`. Fetch the signed URL, start the conversation with the ElevenLabs client SDK, call `onLine` per transcript line and `onEnd` when the agent hangs up; return a stop function. Audio is never stored; the user edits the transcript before saving, and it never changes the score.

**Deploy:** Vercel with Root Directory `web`. The region is `iad1` (set in `vercel.json`), next to Tiger in us-east-1. Set the env vars above in Vercel and never prefix one `NEXT_PUBLIC_`.
