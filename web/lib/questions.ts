// The question set, shared by the screens (client) and the server. The 10 quick-tap questions come from lib/score.ts.
import { QUESTIONS, type Question } from "./score";

// Per-person monthly rent bands. Same bounds on /start, /listings and in scoring. max null = no cap.
export const BUDGETS = [
  { label: "Under $1,000", min: 0, max: 999 },
  { label: "$1,000–1,500", min: 1000, max: 1500 },
  { label: "$1,500–2,000", min: 1500, max: 2000 },
  { label: "$2,000–2,800", min: 2000, max: 2800 },
  { label: "$2,800+", min: 2800, max: null },
] as const;
export type BudgetLabel = (typeof BUDGETS)[number]["label"];
export const budgetBand = (label: string) => BUDGETS.find((b) => b.label === label) ?? null;

// 2B pre-screen. /start preselects nothing; `def` is a typical answer, for lib/matches.check.ts's test profile.
export const PRESCREEN = [
  { id: "where", label: "Where do you want to be?", multi: true, opts: ["Near my school/work", "Downtown", "Quiet residential", "Anywhere near transit"], def: ["Near my school/work", "Anywhere near transit"] },
  { id: "commute", label: "Max commute", opts: ["≤15 min", "16–30", "31–45", "46–60", "60+"], def: ["16–30"] },
  { id: "budget", label: "Budget per person", opts: BUDGETS.map((b) => b.label), def: ["$1,500–2,000"] },
  { id: "walk", label: "Walk to subway", opts: ["<5 min", "5–10", "10–20", "Doesn’t matter"], def: ["5–10"] },
  { id: "apt", label: "Apartment", opts: ["2 bed (1 roommate)", "3+ bed", "Any"], def: ["2 bed (1 roommate)"] },
  { id: "private", label: "Private bedroom/bath", opts: ["Private only", "OK to share", "No preference"], def: ["OK to share"] },
  { id: "furn", label: "Furnished", opts: ["Fully", "Partly", "Unfurnished", "Flexible"], def: ["Flexible"] },
  { id: "lease", label: "Lease", opts: ["Month-to-month", "6 months", "12 months", "12+"], def: ["12 months"] },
  { id: "move", label: "Move in", opts: ["ASAP", "Within 1 month", "1–3 months", "Flexible", "Pick a date"], def: ["1–3 months"] },
  { id: "pets", label: "Pets", opts: ["I have a pet", "Planning to get one", "No pets, fine if roommates do", "Need a pet-free home"], def: ["No pets, fine if roommates do"] },
] as const;
export type PrescreenId = (typeof PRESCREEN)[number]["id"];
export const SUBWAY_LINES = ["1", "A", "L", "N/W", "7"] as const;
export const DEALBREAKERS = ["No smoking/vaping indoors", "Pet allergy"] as const;

export interface Prescreen {
  answers: Record<PrescreenId, string[]>; // every group, as chip labels (single-choice groups hold one)
  school?: string; // shown when "Near my school/work" is picked
  lines?: string[]; // SUBWAY_LINES, when "Anywhere near transit" is picked
  moveDate?: string; // 'YYYY-MM-DD', when move is "Pick a date"
  dealbreakers: string[]; // DEALBREAKERS
}

// 3A. Index into SEE on the profile screen: 0 overlap, 1 opposite, 2 let RoomMe decide.
export const SEE_PREFS = ["overlap", "opposite", "auto"] as const;
export type SeePref = (typeof SEE_PREFS)[number];

// 3B, the 10 quick-tap answers: lib/score.ts owns the list (question, options, bar label and icon) and scores it.
// A missing key = not answered yet. Every answer must be one of opts (score.ts throws otherwise), so there is no Skip.
export type QuickKey = 'bedtime' | 'wake' | 'cleaning' | 'dishes' | 'guests' | 'overnight' | 'sleepNoise' | 'noise' | 'wfh' | 'smoking';
export const QUICK = QUESTIONS as (Question & { k: QuickKey })[];
export type QuickAnswers = Partial<Record<QuickKey, string | string[]>> & { sleepNoiseOther?: string };
// A valid answer to one question: an option, or for a multi-select a non-empty list of options.
export const answered = (q: Question, v: unknown): boolean =>
  q.multi ? Array.isArray(v) && v.length > 0 && v.every((x) => q.opts.includes(x)) : typeof v === 'string' && q.opts.includes(v);
// All 10 answered validly: the only profiles score.ts ranks.
export const complete = (quick: QuickAnswers | null | undefined) => !!quick && QUICK.every((q) => answered(q, quick[q.k]));

// 3C, the 5 open prompts for the voice interview (or typed answers).
export const VOICE_PROMPTS = ["A perfect Sunday at home", "A roommate habit that drives you crazy", "How you bring up a problem", "Your typical weekday", "Social hub or quiet recharge?"] as const;
