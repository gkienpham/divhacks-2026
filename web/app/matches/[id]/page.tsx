import { MutualScreen, MeetupScreen } from "./MutualScreens";
import { pairListing } from "./pair";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params, searchParams }: PageProps<"/matches/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const l = await pairListing(sp);
  const Screen = sp.step === "meetup" ? MeetupScreen : MutualScreen;
  return <Screen id={decodeURIComponent(id)} l={l} />;
}
