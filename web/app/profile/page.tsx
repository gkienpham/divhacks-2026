import { redirect } from "next/navigation";
import { getMe } from "@/lib/profiles";
import { aiOn } from "@/lib/ai";
import ProfileFlow from "./ProfileFlow";

export const dynamic = "force-dynamic"; // per-request cookie and AI flag

// Steps 3–4 build on the profile /start creates. A returning user resumes with their saved answers.
export default async function ProfilePage() {
  const me = await getMe();
  if (!me) redirect("/start");
  return <ProfileFlow ai={aiOn()} see={me.see} quick={me.quick} transcript={me.transcript} />;
}
