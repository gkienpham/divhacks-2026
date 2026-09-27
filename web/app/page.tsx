import type { Metadata } from "next";
import { getListingStats, getNeighborhoods } from "@/lib/listings";
import { street } from "@/lib/format";
import type { QuickAnswers } from "@/lib/questions";
import { scorePair } from "@/lib/scoring";
import { contradictions, explain, tags } from "@/lib/signals";
import LandingScreen from "./LandingScreen";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "RoomMe · Find a roommate who lives like you do" };

// One example pair for the "Why you can trust it" fragments, run through the real engine so they can't drift from it.
const KIEN: QuickAnswers = { bedtime: "23:00–00:00", wake: "06:00–07:00", cleaning: "2", dishes: "Right after eating", guests: "1–2", overnight: "Never", sleepNoise: ["No one’s mentioned it"], noise: "Quiet talking", wfh: "1–2", smoking: "Never" };
const SAM: QuickAnswers = { ...KIEN, wake: "08:00–09:00", dishes: "The same day", overnight: "About once a week", wfh: "5 or more" };
const pair = scorePair({ id: 1, prescreen: null, see: null, quick: KIEN }, { id: 2, prescreen: null, see: null, quick: SAM });
const EXAMPLE = {
  score: pair?.score ?? null,
  ...(pair ? explain(pair, "Sam") : { click: [], clash: [] }),
  tags: [tags(KIEN), tags(SAM)],
  flag: contradictions(KIEN, "My partner stays over most weekends.")[0] ?? null,
};

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
  return <LandingScreen stats={stats} hoods={hoods} featured={featured} example={EXAMPLE} />;
}
