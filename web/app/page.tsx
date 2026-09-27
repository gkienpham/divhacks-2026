import { getListingStats, getNeighborhoods } from "@/lib/listings";
import LandingScreen from "./LandingScreen";

export const dynamic = "force-dynamic";

// Borough and subway lines for the areas the design features (the kit's HOODS), keyed by DB name.
const FEATURED: Record<string, [string, string]> = {
  Bushwick: ["Brooklyn", "L/M/J"],
  "Bedford-Stuyvesant": ["Brooklyn", "A/C/G"],
  Astoria: ["Queens", "N/W"],
  "Upper West Side": ["Manhattan", "1/2/3"],
  Harlem: ["Manhattan", "A/B/C/D"],
  "Crown Heights": ["Brooklyn", "2/3/4"],
};

export default async function Home() {
  const [areas, stats] = await Promise.all([getNeighborhoods(), getListingStats()]);
  const hoods = areas.map((a) => ({
    name: a.neighborhood,
    count: a.count,
    median: a.medianPerRoom,
    img: a.cover?.images[0],
    borough: FEATURED[a.neighborhood]?.[0],
    lines: FEATURED[a.neighborhood]?.[1],
  }));
  // Kit's featured areas first (areas is count desc), topped up with the next biggest.
  const featured = [...hoods.filter((h) => h.borough), ...hoods.filter((h) => !h.borough)].slice(0, 6);
  return <LandingScreen stats={stats} hoods={hoods} featured={featured} />;
}
