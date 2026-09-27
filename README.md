# Roomme

**[roomme.tech](https://roomme.tech)**

Roommate matching + renter support for NYC. DivHacks 2026, **Live Better** track.

Roomme matches NYC newcomers on how they actually live and catches mismatches before the lease. **Scope: matching only.** Roomme ends at the match and hand-off to the listing.

**Stack:**

| Layer | Tool |
|---|---|
| Web | Next.js on Vercel |
| Database | Tiger Data (Postgres + TimescaleDB) |
| Listings | SearchApi (Zillow engine) |
| AI | Gemini (signals, contradictions, match cards, House Agreement) |
| Voice | ElevenLabs voice interview |
| Chat agent | Photon Spectrum (iMessage) |

**Docs:**
- Project description, flow, architecture, AI guardrails, build plan: [docs/PROJECT.md](docs/PROJECT.md)
- Earlier ranked brainstorm: [docs/IDEAS.md](docs/IDEAS.md)

**Setup:** put your keys in a local `.env` (gitignored): `SEARCHAPI_KEY`, `DATABASE_URL`, `GEMINI_API_KEY`, the ElevenLabs key, and the Photon project ID and secret.

Team: Kien, Grace, Nao, Alisher.
