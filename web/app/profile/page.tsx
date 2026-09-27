import { AI_OFF } from "@/lib/flags";
import ProfileFlow from "./ProfileFlow";

export const dynamic = "force-dynamic"; // read AI_OFF per request

export default function ProfilePage() {
  return <ProfileFlow ai={!AI_OFF} />;
}
