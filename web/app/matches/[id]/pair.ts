import "server-only";
import { notFound, redirect } from "next/navigation";
import { getMe } from "@/lib/profiles";
import { getMatch } from "@/lib/matches";
import { getListing } from "@/lib/listings";

// Every step of the pair flow (/matches/[id] → /agreement/[id] → /locked/[id]) loads through here.
// No profile → /start; not a match of yours → 404. ?listing=<zpid> overrides the pair's listing.
export async function loadPair(id: string, sp: Record<string, string | string[] | undefined>) {
  const me = await getMe();
  if (!me) redirect("/start");
  const n = Number(id);
  const m = Number.isSafeInteger(n) && n > 0 ? await getMatch(me.id, n) : null;
  if (!m) notFound();
  const zpid = [sp.listing].flat()[0];
  const l = (zpid && (await getListing(zpid))) || m.listing;
  return { me: { id: me.id, name: me.name, initials: me.initials }, m, l };
}

// 6B: the next two weekday evenings and the next weekend morning, from today's date in New York.
export function meetupSlots(now = new Date()) {
  const today = Date.parse(now.toLocaleDateString("en-CA", { timeZone: "America/New_York" }) + "T00:00:00Z");
  const days = Array.from({ length: 7 }, (_, i) => new Date(today + (i + 1) * 86_400_000));
  const weekend = (d: Date) => d.getUTCDay() % 6 === 0;
  const picks = [...days.filter((d) => !weekend(d)).slice(0, 2), days.find(weekend)!].sort((a, b) => +a - +b);
  const label = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).replace(",", "");
  return picks.map((d) => `${label(d)} · ${weekend(d) ? "11:00 AM" : "6:30 PM"}`);
}
