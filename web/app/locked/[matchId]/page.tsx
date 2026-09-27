import { AI_OFF } from "@/lib/flags";
import { pairListing } from "@/app/matches/[id]/pair";
import LockedScreen from "./LockedScreen";

export const dynamic = "force-dynamic";

export default async function LockedPage({ params, searchParams }: PageProps<"/locked/[matchId]">) {
  const [{ matchId }, sp] = await Promise.all([params, searchParams]);
  return <LockedScreen id={decodeURIComponent(matchId)} l={await pairListing(sp)} aiOff={AI_OFF} />;
}
