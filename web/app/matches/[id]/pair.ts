import "server-only";
import { notFound } from "next/navigation";
import { getListing, listListings } from "@/lib/listings";

// The pair's listing for /matches/[id] → /agreement/[id] → /locked/[id]:
// ?listing=<zpid> when given, else the first fair-priced Astoria 2 BR.
export async function pairListing(sp: Record<string, string | string[] | undefined>) {
  const raw = sp.listing;
  const zpid = Array.isArray(raw) ? raw[0] : raw;
  const l = (zpid && (await getListing(zpid))) ||
    (await listListings({ neighborhood: "Astoria", beds: "2", fairOnly: true, pageSize: 1 })).listings[0];
  if (!l) notFound();
  return l;
}
