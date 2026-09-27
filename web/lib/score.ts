// Deterministic match % (docs/PROJECT.md §6). The landing page's How it works section and FAQ explain this math
// and render their table from QUESTIONS, so the page can't drift from the code. No AI input: identical with AI_OFF.
//   1. Dealbreakers filter first, both ways (blocked).
//   2. Each answer becomes a real quantity; per-question agreement = max(0, 1 − gap ÷ full-clash gap), whole %.
//   3. Match % = the mean of the 10 agreements (equal weights, 10 points each), rounded.

export type Answer = string | string[];
export type Answers = Record<string, Answer>;
export type Person = { id: string; answers: Answers; pets: string; deal: string[] };
export type Part = { k: string; label: string; icon: string; v: number; you: string; them: string };

// clock: shortest way around a 24-h clock (23:30 → 00:30 is 1 h). ratio: |log2(1 + x) − log2(1 + y)|, so
// "never vs 1–2 a month" is a bigger gap than "6–10 vs 10+". linear: plain difference. same: same answer or not.
type Kind = 'clock' | 'ratio' | 'linear' | 'same';
export type Question = {
  k: string; q: string; opts: string[]; multi?: boolean;
  label: string; icon: string; same: string; suffix?: string; // bar label, bar icon, "you'll click" phrase, unit shown after bare numbers
  kind: Kind; vals: number[]; unit: string; full: number; // full: the gap at which agreement hits 0
};

// Question wording for bedtime, cleaning, guests and sleep noise is the design kit's.
export const QUESTIONS: Question[] = [
  { k: 'bedtime', q: 'What time do you actually go to bed on weeknights?', opts: ['Before 22:00', '22:00–23:00', '23:00–00:00', '00:00–01:00', 'After 01:00'],
    label: 'Bedtime', icon: 'moon', same: 'Same bedtime window', kind: 'clock', vals: [21.5, 22.5, 23.5, 0.5, 1.5], unit: 'h', full: 4 },
  { k: 'wake', q: 'What time do you usually get up on weekdays?', opts: ['Before 06:00', '06:00–07:00', '07:00–08:00', '08:00–09:00', 'After 09:00'],
    label: 'Wake time', icon: 'sunrise', same: 'Same wake-up window', kind: 'clock', vals: [5.5, 6.5, 7.5, 8.5, 9.5], unit: 'h', full: 4 },
  { k: 'cleaning', q: 'How many times a week do you clean shared spaces?', opts: ['0', '1', '2', '3–4', '5 or more'],
    label: 'Cleaning', icon: 'spray-can', same: 'Clean equally often', suffix: '/week', kind: 'ratio', vals: [0, 1, 2, 3.5, 6], unit: 'times a week', full: 2 },
  { k: 'dishes', q: 'When do your dishes usually get washed?', opts: ['Right after eating', 'The same day', 'The next day', 'When the sink is full'],
    label: 'Dishes', icon: 'utensils', same: 'Same dishes timing', kind: 'ratio', vals: [0.5, 8, 24, 72], unit: 'hours until washed', full: 6 },
  { k: 'guests', q: 'How many guests do you have per month?', opts: ['0', '1–2', '3–5', '6–10', 'More than 10'],
    label: 'Guests', icon: 'users', same: 'Same guest range', suffix: '/month', kind: 'ratio', vals: [0, 1.5, 4, 8, 14], unit: 'guests a month', full: 3 },
  { k: 'overnight', q: 'How often does someone stay the night?', opts: ['Never', '1–2 nights a month', 'About once a week', '2 or more nights a week'],
    label: 'Overnight guests', icon: 'house', same: 'Same overnight-guest range', kind: 'ratio', vals: [0, 1.5, 4.3, 10], unit: 'nights a month', full: 3 },
  // Snoring or grinding can be medical, so a mismatch costs half, never all: 100 if you both report noise or both don't, else 50.
  { k: 'sleepNoise', q: 'Has anyone told you that you make noise in your sleep?', multi: true, opts: ['I snore', 'I grind my teeth', 'I talk or move in my sleep', 'No one’s mentioned it', 'Other'],
    label: 'Sleep noise', icon: 'bed-double', same: 'Same sleep-noise answer', kind: 'same', vals: [1, 1, 1, 0, 1], unit: '', full: 0 },
  { k: 'noise', q: 'How loud is your home on a weeknight?', opts: ['Silent', 'Quiet talking', 'Music or TV, low', 'Music or TV, out loud'],
    label: 'Noise', icon: 'volume-2', same: 'Same noise level', kind: 'linear', vals: [30, 45, 55, 70], unit: 'dB', full: 40 },
  { k: 'wfh', q: 'How many days a week do you work from home?', opts: ['0', '1–2', '3–4', '5 or more'],
    label: 'Work from home', icon: 'coffee', same: 'Same days at home', suffix: ' days', kind: 'linear', vals: [0, 1.5, 3.5, 5], unit: 'days', full: 5 },
  // Crossing indoors counts double: never 0, outside only 1, sometimes inside 3, often inside 4.
  { k: 'smoking', q: 'Do you smoke or use cannabis at home?', opts: ['Never', 'Outside only', 'Sometimes inside', 'Often inside'],
    label: 'Smoking', icon: 'cigarette', same: 'Same smoking habits', kind: 'linear', vals: [0, 1, 3, 4], unit: 'steps', full: 4 },
];
const BY_KEY = Object.fromEntries(QUESTIONS.map(f => [f.k, f]));

// Option index; an unknown or missing answer throws (the app has no Skip, so every answer is one of opts).
function idx(f: Question, a: Answer | undefined): number {
  const i = typeof a === 'string' ? f.opts.indexOf(a) : -1;
  if (i < 0) throw new Error(`${f.k}: unknown answer ${JSON.stringify(a)}`);
  return i;
}
// Multi-select: any noise pick counts as "reports noise", even next to "No one's mentioned it".
function noisy(f: Question, a: Answer | undefined): boolean {
  if (!Array.isArray(a) || !a.length) throw new Error(`${f.k}: expected a non-empty list, got ${JSON.stringify(a)}`);
  return a.map(x => f.vals[idx(f, x)]).some(Boolean);
}

function gap(f: Question, a: Answer, b: Answer): number {
  const x = f.vals[idx(f, a)], y = f.vals[idx(f, b)];
  if (f.kind === 'clock') { const d = Math.abs(x - y) % 24; return Math.min(d, 24 - d); }
  if (f.kind === 'ratio') return Math.abs(Math.log2(1 + x) - Math.log2(1 + y));
  return Math.abs(x - y);
}

// Agreement on one question, 0–100 (whole %).
export function agreement(k: string, a: Answer, b: Answer): number {
  const f = BY_KEY[k];
  if (f.kind === 'same') return noisy(f, a) === noisy(f, b) ? 100 : 50;
  return Math.round(100 * Math.max(0, 1 - gap(f, a, b) / f.full));
}

const show = (f: Question, a: Answer) => Array.isArray(a) ? a.join(', ') : a + (f.suffix ?? '');
export function score(me: Answers, them: Answers): { pct: number; parts: Part[] } {
  const parts = QUESTIONS.map(f => ({ k: f.k, label: f.label, icon: f.icon, v: agreement(f.k, me[f.k], them[f.k]), you: show(f, me[f.k]), them: show(f, them[f.k]) }));
  return { pct: Math.round(parts.reduce((s, p) => s + p.v, 0) / parts.length), parts };
}

// Dealbreakers from the pre-screen, checked both ways.
const INSIDE = ['Sometimes inside', 'Often inside'], HAS_PET = ['I have a pet', 'Planning to get one'];
const hits = (x: Person, y: Person) =>
  (x.deal.includes('No smoking/vaping indoors') && INSIDE.includes(y.answers.smoking as string)) ||
  ((x.deal.includes('Pet allergy') || x.pets === 'Need a pet-free home') && HAS_PET.includes(y.pets));
export const blocked = (a: Person, b: Person) => hits(a, b) || hits(b, a);

// Filter → score → sort by % (high first), ties by id.
export function rank<P extends Person>(me: Person, people: P[]): (P & { pct: number; parts: Part[] })[] {
  return people.filter(p => !blocked(me, p)).map(p => ({ ...p, ...score(me.answers, p.answers) }))
    .sort((a, b) => b.pct - a.pct || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

// Rule-based reasons (what AI-off shows): up to 3 exact matches; the 2 lowest agreements under 75%.
// Sleep noise counts in the % but is never headlined as a reason, since it can be medical.
export function clickClash(parts: Part[]) {
  const habits = parts.filter(p => p.k !== 'sleepNoise');
  return {
    click: habits.filter(p => p.v === 100).slice(0, 3).map(p => BY_KEY[p.k].same),
    clash: habits.filter(p => p.v < 75).sort((a, b) => a.v - b.v).slice(0, 2).map(p => `${p.label}: ${p.you} vs ${p.them}`),
  };
}

// Habit tags read straight off the answers (option indices, so a relabel can't silently break them).
const TAGS: [string, (i: (k: string) => number) => boolean][] = [
  ['Early riser', i => i('wake') <= 1],
  ['Late riser', i => i('wake') >= 3],
  ['Night owl', i => i('bedtime') >= 3],
  ['Tidy kitchen', i => i('dishes') === 0],
  ['Cleans often', i => i('cleaning') >= 3],
  ['Rare guests', i => i('guests') <= 1],
  ['Hosts often', i => i('guests') >= 3],
  ['Quiet weekdays', i => i('noise') <= 1],
  ['Music at home', i => i('noise') === 3],
  ['Works from home', i => i('wfh') >= 2],
  ['No smoking', i => i('smoking') === 0],
];
export const tags = (a: Answers) => TAGS.filter(([, t]) => t(k => idx(BY_KEY[k], a[k]))).map(([l]) => l).slice(0, 3);
