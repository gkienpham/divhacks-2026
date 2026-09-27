import { query } from "@/lib/db";
import StartScreen from "./StartScreen";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  // [perRoom, beds] per listing (same perRoom as lib/listings), so the pre-screen counts "N fit your basics" live.
  const rows = await query<{ p: number; b: number }>(
    `select round(price::float8 / greatest(beds, 1))::int as p, beds::int as b from listings`,
  );
  return <StartScreen rooms={rows.map((r) => [r.p, r.b])} />;
}
