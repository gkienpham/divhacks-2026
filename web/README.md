# RoomMe web

Next.js 16 (App Router) app for [roomme.tech](https://roomme.tech). The screens are ported from the Claude Design bundle. Listings are real and are read server-side from Tiger Data; the people screens use sample data (`lib/sample-data.js`) until seed profiles and scoring land.

```bash
npm install
npm run dev
```

**Environment:** `web/.env.local`
- `DATABASE_URL`: the Tiger service `bj9teo40nn`, the same value as the repo root `.env`. Server-only.
- `AI_OFF=1` (optional): hides AI text and shows the AI-off badge with rule-based reasons.

**Layout:**
- `components/rm/`: the design system components, verbatim from the bundle (`.jsx` + `.d.ts`). Import them through the `index.ts` client barrel.
- `lib/db.ts`: one pooled connection (`max: 1`), because Tiger has no pooler.
- `lib/listings.ts`: the listing queries, trust badge and photos. `lib/listings.check.ts` runs them against the real DB.

**Deploy:** Vercel with Root Directory `web`. The region is `iad1` (set in `vercel.json`), next to Tiger in us-east-1. Set `DATABASE_URL` as a Vercel env var and never prefix it `NEXT_PUBLIC_`.
