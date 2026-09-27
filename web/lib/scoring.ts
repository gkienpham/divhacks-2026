// Deterministic compatibility score (docs/PROJECT.md §6): dealbreaker filter, then a weighted mean of per-habit
// similarities over the 10 quick answers. Pure TS, symmetric, no DB, no AI. The transcript never enters here.
import { BUDGETS, QUICK, type Prescreen, type QuickAnswers, type QuickKey, type SeePref } from "./questions";

export interface Person { id: number; prescreen: Prescreen | null; see: SeePref | null; quick: QuickAnswers }
export interface HabitScore { key: QuickKey; label: string; icon: string; similarity: number /* 0..1 */; weight: number; a: string; b: string /* display answers */ }
export interface PairScore { score: number /* 0..100 int */; habits: HabitScore[] /* sorted by weight desc */ }

// Relative weights; the mean renormalizes, so edit freely. Bedtime and cleaning weigh most.
export const WEIGHTS: Record<QuickKey, number> = { bedtime: 3, cleaning: 3, wake: 2, noise: 2, dishes: 1.5, guests: 1.5, overnight: 1.5, smoking: 1.5, wfh: 1, sleepNoise: 0.5 };
// A skipped answer on either side drops that key and renormalizes. Fewer common answered keys than this = not comparable (null).
export const MIN_COMMON = 5;

const NOISY = ["I snore", "I grind my teeth", "I talk or move in my sleep", "Other"];
const SLEEP_SHORT: Record<string, string> = { "I snore": "Snoring", "I grind my teeth": "Teeth grinding", "I talk or move in my sleep": "Sleep talking", "No one’s mentioned it": "None reported", "Not sure": "Not sure", Other: "Other" };
const INSIDE = 2; // smoking option index from which smoke happens indoors
const HAS_PET = ["I have a pet", "Planning to get one"];

// Option index of a single-choice answer; null when skipped or not an option.
export function optionIndex(quick: QuickAnswers, k: QuickKey): number | null {
  const v = quick[k];
  if (typeof v !== "string") return null;
  const i = (QUICK.find((q) => q.k === k)!.opts as readonly string[]).indexOf(v);
  return i < 0 ? null : i;
}
const sleepList = (quick: QuickAnswers) => { const v = quick.sleepNoise; return Array.isArray(v) ? v : typeof v === "string" ? [v] : []; };
const sleepLevel = (l: string[]) => l.filter((o) => NOISY.includes(o)).length;
export const sleepText = (l: string[]) => l.map((o, i) => { const s = SLEEP_SHORT[o] ?? o; return i ? s.charAt(0).toLowerCase() + s.slice(1) : s; }).join(", ");
const pre = (p: Person, id: "budget" | "apt" | "pets") => p.prescreen?.answers?.[id] ?? [];

// Both want opposite schedules, or one does and the other lets RoomMe decide (null = undecided).
const wantsOpposite = (a: Person, b: Person) => { const s = [a.see ?? "auto", b.see ?? "auto"]; return s.includes("opposite") && !s.includes("overlap"); };

const blocks = (a: Person, b: Person) => {
  const db = a.prescreen?.dealbreakers ?? [];
  if (db.includes("No smoking/vaping indoors") && (optionIndex(b.quick, "smoking") ?? -1) >= INSIDE) return true;
  return (db.includes("Pet allergy") || pre(a, "pets").includes("Need a pet-free home")) && pre(b, "pets").some((o) => HAS_PET.includes(o));
};
export const dealbreakerOk = (a: Person, b: Person) => !blocks(a, b) && !blocks(b, a);

export function scorePair(a: Person, b: Person): PairScore | null {
  if (!dealbreakerOk(a, b)) return null;
  const [ba, bb] = [a, b].map((p) => BUDGETS.findIndex((x) => x.label === pre(p, "budget")[0]));
  if (ba >= 0 && bb >= 0 && Math.abs(ba - bb) > 1) return null;
  const apts = [pre(a, "apt")[0], pre(b, "apt")[0]];
  if (apts.includes("2 bed (1 roommate)") && apts.includes("3+ bed")) return null;
  const opposite = wantsOpposite(a, b);
  const habits: HabitScore[] = [];
  for (const q of QUICK) {
    let similarity: number, ta: string, tb: string;
    if (q.k === "sleepNoise") {
      const la = sleepList(a.quick), lb = sleepList(b.quick);
      if (!la.length || !lb.length) continue;
      // Noisy-vs-quiet counts, not exact flags: snoring and grinding are the same problem for the wall.
      similarity = 1 - Math.min(Math.abs(sleepLevel(la) - sleepLevel(lb)), 2) / 2;
      ta = sleepText(la); tb = sleepText(lb);
    } else {
      const ia = optionIndex(a.quick, q.k), ib = optionIndex(b.quick, q.k);
      if (ia === null || ib === null) continue;
      const distance = Math.abs(ia - ib) / (q.opts.length - 1);
      similarity = opposite && (q.k === "bedtime" || q.k === "wake") ? distance : 1 - distance;
      ta = q.opts[ia]; tb = q.opts[ib];
    }
    habits.push({ key: q.k, label: q.label, icon: q.icon, similarity, weight: WEIGHTS[q.k], a: ta, b: tb });
  }
  if (habits.length < MIN_COMMON) return null;
  const total = habits.reduce((s, h) => s + h.weight, 0);
  const score = Math.round((100 * habits.reduce((s, h) => s + h.weight * h.similarity, 0)) / total);
  habits.sort((x, y) => y.weight - x.weight); // stable: ties keep QUICK order
  return { score, habits };
}

export function rank(me: Person, pool: Person[], n = 20): { person: Person; result: PairScore }[] {
  return pool
    .filter((p) => p.id !== me.id)
    .flatMap((person) => { const result = scorePair(me, person); return result ? [{ person, result }] : []; })
    .sort((x, y) => y.result.score - x.result.score || x.person.id - y.person.id)
    .slice(0, n);
}
