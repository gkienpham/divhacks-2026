import type { Metadata } from "next";
import { getListingStats, getNeighborhoods } from "@/lib/listings";
import { street } from "@/lib/format";
import type { QuickAnswers } from "@/lib/questions";
import { personById } from "@/lib/sample-data";
import { contradictions } from "@/lib/signals";
import LandingScreen from "./LandingScreen";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "RoomMe · Find a roommate who lives like you do" };

// "Contradictions, quoted": Sam's sample quick-tap answers against one voice line, run through the real keyword rules.
// (The page's match numbers come from lib/score in LandingScreen.)
const FLAG = contradictions(personById("sam").answers as QuickAnswers, "I host brunch most Sundays.")[0] ?? null;

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
  const hoods = areas.map(({ neighborhood: name, count, medianPerRoom, cover }) => ({
    name,
    count,
    median: medianPerRoom,
    img: cover?.images[0],
    img2: cover?.images[1] ?? cover?.images[0], // the closing polaroids, so no photo shows twice
    alt: cover ? `${name} listing, ${street(cover.address)}` : "",
    borough: FEATURED[name]?.[0],
    lines: FEATURED[name]?.[1],
  }));
  // Kit's featured areas first (areas is count desc), topped up with the next biggest.
  const featured = [...hoods.filter((h) => h.borough), ...hoods.filter((h) => !h.borough)].slice(0, 6);
  return <LandingScreen stats={stats} hoods={hoods} featured={featured} flag={FLAG} />;
}
