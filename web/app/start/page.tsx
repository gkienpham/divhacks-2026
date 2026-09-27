import { getPrescreenRooms } from "@/lib/listings";
import { getMe } from "@/lib/profiles";
import StartScreen from "./StartScreen";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const [rooms, me] = await Promise.all([getPrescreenRooms(), getMe()]);
  // Prefill only once this form has saved; before that the name is lib/session.ts's anonymous placeholder.
  return <StartScreen rooms={rooms} me={me?.prescreen ? { name: me.name, email: me.email, prescreen: me.prescreen } : null} />;
}
