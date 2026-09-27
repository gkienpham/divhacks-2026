import { notFound } from "next/navigation";
import { getListing, getPriceHistory } from "@/lib/listings";
import { getMe } from "@/lib/profiles";
import DetailScreen from "./DetailScreen";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const zpid = decodeURIComponent((await params).id);
  const [listing, history, me] = await Promise.all([getListing(zpid), getPriceHistory(zpid), getMe()]);
  if (!listing) notFound();
  return <DetailScreen l={listing} history={history} saved={me?.saved ?? []} />;
}
