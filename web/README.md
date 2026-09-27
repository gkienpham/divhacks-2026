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
- `lib/score.ts`: the match % (dealbreakers both ways, per-question agreement in real units, mean of 10), the 10 questions, bars, rule-based click/clash and habit tags. Pure TS, no AI; `lib/questions.ts` re-exports its `QUESTIONS` as `QUICK`. `lib/signals.ts`: contradictions and the agreement draft.
- `lib/profiles.ts`, `lib/matches.ts`: people and pairs. Sample profiles reciprocate when the score is ≥ 70 (`LIKE_BACK`); "Simulate … confirming" exists only for them.
- `lib/ai.ts`: Gemini REST with a JSON schema, 8 s timeout, cached per viewer in `matches.reasons.ai`; null on any failure.
- API: `GET /api/me`, `POST /api/profile`, `POST /api/saved`, `GET|POST /api/matches/[id]`, `GET /api/voice/session`. Bodies are validated against `lib/questions.ts` (400 on anything unknown).

Checks, from `web/`:
```bash
npx tsx lib/score.check.ts                                                      # match-% math, no DB
npx tsx --env-file=.env.local --conditions=react-server scripts/seed.ts        # 150 synthetic profiles (is_synthetic = true)
npx tsx --env-file=.env.local --conditions=react-server lib/listings.check.ts
npx tsx --env-file=.env.local --conditions=react-server lib/matches.check.ts   # profile → top matches → like → meetup → agreement → lock
```

## Voice interview (ElevenLabs)
Turning it on takes only env vars; the client is already wired.
1. Create or sync the agent: `npx tsx --env-file=.env.local scripts/voice-agent.ts` (needs `ELEVENLABS_API_KEY` with "ElevenLabs Agents: Write"). It builds the agent from the 5 `VOICE_PROMPTS` in `lib/questions.ts` on Gemini (`gemini-3.8-flash`) with a 90 s cap, signed-URL auth and voice recording off, prints the new agent id, and checks the live config. It starts no call.
2. Set `ELEVENLABS_AGENT_ID` (and the key) in `.env.local` and on Vercel, then re-run the script to verify. `GET /api/voice/session` then returns `{ signedUrl }`; unset, it returns 200 `{ configured: false }` and `/profile` falls back to typing.
3. Client: `lib/voice-client.ts` starts the session with `@elevenlabs/client` (loaded on first use) and keeps only the user's own lines; `app/profile/VoiceScreens.jsx` stops it at 90 s. Audio is never stored; the user edits the transcript before saving, and it never changes the score.

**Deploy:** Vercel with Root Directory `web`. The region is `iad1` (set in `vercel.json`), next to Tiger in us-east-1. Set the env vars above in Vercel and never prefix one `NEXT_PUBLIC_`.
