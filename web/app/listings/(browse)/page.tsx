import { listListings, getListingsByIds, getListingStats, getNeighborhoods, type Listing, type ListingFilters } from "@/lib/listings";
import { getMe } from "@/lib/profiles";
import { BUDGETS, budgetBand } from "@/lib/questions";
import BrowseScreen from "./BrowseScreen";

export const dynamic = "force-dynamic";
const PAGE = 24;
// Cards show one photo; the other ~11 per listing would only bloat the payload as "Load more" grows.
const card = (l: Listing) => ({ ...l, images: l.images.slice(0, 1) });

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) || undefined;
  const page = Math.max(1, Math.trunc(Number(one("page"))) || 1);
  const band = budgetBand(one("budget") ?? "");
  const beds = one("beds");
  const filters: ListingFilters = {
    neighborhood: one("area"),
    beds: beds === "2" || beds === "3+" ? beds : undefined,
    minPerRoom: band?.min || undefined, maxPerRoom: band?.max ?? undefined,
    fairOnly: one("fair") === "1",
    page: 1, pageSize: PAGE * page, // "Load more" grows the list instead of paging away
  };
  const savedView = one("saved") === "1";
  const saved = (await getMe())?.saved ?? [];
  const [{ listings, total }, stats, areas] = await Promise.all([
    savedView ? getListingsByIds([...saved].reverse()).then((l) => ({ listings: l, total: l.length })) : listListings(filters),
    getListingStats(), getNeighborhoods(),
  ]);
  return (
    <BrowseScreen
      listings={listings.map(card)} total={total} stats={stats} page={page} saved={saved} savedView={savedView}
      areas={areas.map((a) => a.neighborhood)} budgets={BUDGETS.map((b) => b.label)}
      current={{ area: filters.neighborhood ?? null, beds: filters.beds ?? null, budget: band?.label ?? null, fair: !!filters.fairOnly }}
    />
  );
}
