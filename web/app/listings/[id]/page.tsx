import { notFound } from "next/navigation";
import { getListing, getPriceHistory } from "@/lib/listings";
import DetailScreen from "./DetailScreen";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const zpid = decodeURIComponent((await params).id);
  const [listing, history] = await Promise.all([getListing(zpid), getPriceHistory(zpid)]);
  if (!listing) notFound();
  return <DetailScreen l={listing} history={history} />;
}
