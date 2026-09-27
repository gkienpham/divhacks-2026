import { aiOn } from "@/lib/ai";
import { getTopMatches, SHORTLIST_CAP } from "@/lib/matches";
import { getMe } from "@/lib/profiles";
import TopMatchesScreen from "./TopMatchesScreen";

export const dynamic = "force-dynamic";

// No profile → start; profile without habits → finish it; else the top 20 from lib/matches (score desc).
export default async function MatchesPage() {
  const me = await getMe();
  const matches = me?.complete ? await getTopMatches(me.id) : [];
  return (
    <TopMatchesScreen
      ai={aiOn()}
      me={me && { name: me.name, initials: me.initials, complete: me.complete }}
      matches={matches}
      cap={SHORTLIST_CAP}
    />
  );
}
