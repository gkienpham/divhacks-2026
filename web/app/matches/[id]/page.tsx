import { redirect } from "next/navigation";
import { aiOn } from "@/lib/ai";
import DetailScreen from "./DetailScreen";
import { MutualScreen, MeetupScreen } from "./MutualScreens";
import { loadPair, meetupSlots } from "./pair";

export const dynamic = "force-dynamic";

// Not mutual yet → match detail. Mutual → 6A, or 6B with ?step=meetup.
export default async function MatchPage({ params, searchParams }: PageProps<"/matches/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { me, m, l } = await loadPair(id, sp);
  if (!m.mutual) {
    if (sp.step) redirect(`/matches/${m.id}`);
    return <DetailScreen me={me} m={m} aiOff={!aiOn()} />;
  }
  return sp.step === "meetup" ? <MeetupScreen me={me} m={m} l={l} times={meetupSlots()} /> : <MutualScreen me={me} m={m} l={l} />;
}
