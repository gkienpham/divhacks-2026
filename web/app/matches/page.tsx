import { getNeighborhoods, type Listing } from "@/lib/listings";
import { AI_OFF } from "@/lib/flags";
import { QUEUE } from "@/lib/sample-data";
import TopMatchesScreen from "./TopMatchesScreen";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  // A real photo, price and link for each sample person's saved listing, matched on the area in its title ("2 BR · Astoria").
  const wanted = new Set(QUEUE.flatMap((p) => p.saved.map((s) => s[1].split(" · ")[1])));
  const areas = await getNeighborhoods().catch(() => []); // no DB → sand panels, page still renders
  const covers: Record<string, Listing> = {};
  for (const a of areas) if (a.cover && wanted.has(a.neighborhood)) covers[a.neighborhood] = a.cover;
  return <TopMatchesScreen ai={!AI_OFF} covers={covers} />;
}
