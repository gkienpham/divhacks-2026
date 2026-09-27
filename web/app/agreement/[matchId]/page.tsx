import { redirect } from "next/navigation";
import { aiOn } from "@/lib/ai";
import { loadPair } from "@/app/matches/[id]/pair";
import AgreementScreen from "./AgreementScreen";

export const dynamic = "force-dynamic";

export default async function AgreementPage({ params, searchParams }: PageProps<"/agreement/[matchId]">) {
  const [{ matchId }, sp] = await Promise.all([params, searchParams]);
  const { me, m, l } = await loadPair(matchId, sp);
  if (!m.mutual) redirect(`/matches/${m.id}`);
  if (m.status === "locked") redirect(`/locked/${m.id}`);
  return <AgreementScreen me={me} m={m} l={l} aiOff={!aiOn()} />;
}
