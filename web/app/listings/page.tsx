import { listListings, getListingStats, getNeighborhoods, type ListingFilters } from "@/lib/listings";
import BrowseScreen from "./BrowseScreen";

export const dynamic = "force-dynamic";
const PAGE = 24, MAX_PAGES = 4; // listListings caps pageSize at 100
const BUDGETS: Record<string, [number?, number?]> = {
  "Under $1,000": [undefined, 999], "$1,000–1,500": [1000, 1500], "$1,500–2,000": [1500, 2000],
  "$2,000–2,800": [2000, 2800], "$2,800+": [2800, undefined],
};

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) || undefined;
  const page = Math.max(1, Math.min(MAX_PAGES, Number(one("page")) || 1));
  const budget = one("budget");
  const [min, max] = (budget && BUDGETS[budget]) || [];
  const beds = one("beds");
  const filters: ListingFilters = {
    neighborhood: one("area"),
    beds: beds === "2" || beds === "3+" ? beds : undefined,
    minPerRoom: min, maxPerRoom: max,
    fairOnly: one("fair") === "1",
    page: 1, pageSize: PAGE * page, // "Load more" grows the list instead of paging away
  };
  const [{ listings, total }, stats, areas] = await Promise.all([listListings(filters), getListingStats(), getNeighborhoods()]);
  return (
    <BrowseScreen
      listings={listings} total={total} stats={stats} page={page} more={page < MAX_PAGES && listings.length < total}
      areas={areas.map((a) => a.neighborhood)} budgets={Object.keys(BUDGETS)}
      current={{ area: filters.neighborhood ?? null, beds: filters.beds ?? null, budget: budget && BUDGETS[budget] ? budget : null, fair: !!filters.fairOnly }}
    />
  );
}
