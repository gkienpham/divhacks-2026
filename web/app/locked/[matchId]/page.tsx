import { notFound, redirect } from "next/navigation";
import { loadPair } from "@/app/matches/[id]/pair";
import LockedScreen from "./LockedScreen";

export const dynamic = "force-dynamic";

// The locked listing is the match's own (m.listing), so ?listing= is ignored here.
export default async function LockedPage({ params }: PageProps<"/locked/[matchId]">) {
  const { matchId } = await params;
  const { me, m, l } = await loadPair(matchId, {});
  if (m.status !== "locked") redirect(`/agreement/${m.id}`);
  if (!l || !m.agreement) notFound();
  return <LockedScreen me={me} m={m} l={l} />;
}
