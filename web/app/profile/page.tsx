import { redirect } from "next/navigation";
import { getMe } from "@/lib/profiles";
import { aiOn } from "@/lib/ai";
import ProfileFlow from "./ProfileFlow";

export const dynamic = "force-dynamic"; // per-request cookie and AI flag

// Steps 3–4 build on the profile /start creates. A returning user resumes with their saved answers.
// From /start (?fresh) it's a new pass, so nothing is preselected; answers save over the old ones as they're given.
export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const me = await getMe();
  if (!me) redirect("/start");
  if ((await searchParams).fresh !== undefined) return <ProfileFlow ai={aiOn()} see={null} quick={{}} transcript="" />;
  return <ProfileFlow ai={aiOn()} see={me.see} quick={me.quick} transcript={me.transcript} />;
}
