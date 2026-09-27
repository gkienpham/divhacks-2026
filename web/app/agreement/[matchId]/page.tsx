import { AI_OFF } from "@/lib/flags";
import { pairListing } from "@/app/matches/[id]/pair";
import AgreementScreen from "./AgreementScreen";

export const dynamic = "force-dynamic";

export default async function AgreementPage({ params, searchParams }: PageProps<"/agreement/[matchId]">) {
  const [{ matchId }, sp] = await Promise.all([params, searchParams]);
  return <AgreementScreen id={decodeURIComponent(matchId)} l={await pairListing(sp)} aiOff={AI_OFF} />;
}
