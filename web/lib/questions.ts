// The question set, shared by the screens (client) and the scoring engine (server).
// Option order is meaningful: single-choice lists run low → high, and scoring reads the index as an ordinal scale.

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

// 2B pre-screen. `def` is the preselected answer.
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

// 3B, the 10 quick-tap answers (docs/PROJECT.md §5). `label`/`icon` feed HabitBar on the match card.
export const QUICK = [
  { k: "bedtime", label: "Bedtime", icon: "moon", q: "What time do you actually go to bed on weeknights?", opts: ["Before 22:00", "22:00–23:00", "23:00–00:00", "00:00–01:00", "After 01:00"] },
  { k: "wake", label: "Wake time", icon: "sunrise", q: "What time do you usually get up on weekdays?", opts: ["Before 06:00", "06:00–07:00", "07:00–08:00", "08:00–09:00", "After 09:00"] },
  { k: "cleaning", label: "Cleaning", icon: "spray-can", q: "How many times a week do you clean shared spaces?", opts: ["0", "1", "2", "3–4", "5 or more"] },
  { k: "dishes", label: "Dishes", icon: "utensils", q: "When do your dishes usually get washed?", opts: ["Right after eating", "The same day", "The next day", "When the sink is full"] },
  { k: "guests", label: "Guests", icon: "users", q: "How many guests do you have per month?", opts: ["0", "1–2", "3–5", "6–10", "More than 10"] },
  { k: "overnight", label: "Overnight guests", icon: "bed-double", q: "How often does someone stay the night?", opts: ["Never", "1–2 nights a month", "About once a week", "2 or more nights a week"] },
  { k: "sleepNoise", label: "Sleep noise", icon: "volume-2", q: "Has anyone told you that you make noise in your sleep?", multi: true, opts: ["I snore", "I grind my teeth", "I talk or move in my sleep", "No one’s mentioned it", "Not sure", "Other"] },
  { k: "noise", label: "Noise", icon: "music", q: "How loud is your home on a weeknight?", opts: ["Silent", "Quiet talking", "Music or TV, low", "Music or TV, out loud"] },
  { k: "wfh", label: "Work from home", icon: "house", q: "How many days a week do you work from home?", opts: ["0", "1–2", "3–4", "5 or more"] },
  { k: "smoking", label: "Smoking", icon: "cigarette", q: "Do you smoke or use cannabis at home?", opts: ["Never", "Outside only", "Sometimes inside", "Often inside"] },
] as const;
export type QuickKey = (typeof QUICK)[number]["k"];
// Single-choice keys hold one option string; sleepNoise holds a list. A missing key = skipped.
export type QuickAnswers = Partial<Record<QuickKey, string | string[]>> & { sleepNoiseOther?: string };

// 3C, the 5 open prompts for the voice interview (or typed answers).
export const VOICE_PROMPTS = ["A perfect Sunday at home", "A roommate habit that drives you crazy", "How you bring up a problem", "Your typical weekday", "Social hub or quiet recharge?"] as const;
