// Rule-based copy from the quick answers and the transcript: the AI_OFF fallback and the self-check. Pure TS, no AI.
import { QUICK, type QuickAnswers, type QuickKey } from "./questions";
import { WEIGHTS, optionIndex, type HabitScore, type PairScore, type Person } from "./scoring";

export interface Contradiction { key: QuickKey; quick: string /* chip text */; voice: string /* exact sentence from the transcript */; question: string /* a question, never an accusation */ }

const OPTS = Object.fromEntries(QUICK.map((q) => [q.k, q.opts as readonly string[]])) as Record<QuickKey, readonly string[]>;
const LABEL: Partial<Record<QuickKey, string>> = { overnight: "Overnights", wfh: "WFH" };
// Short forms by option index, for one-line copy.
const SHORT: Record<QuickKey, string[]> = {
  bedtime: ["before 22:00", "22:00–23:00", "23:00–00:00", "00:00–01:00", "after 01:00"],
  wake: ["before 06:00", "06:00–07:00", "07:00–08:00", "08:00–09:00", "after 09:00"],
  cleaning: ["0×/week", "1×/week", "2×/week", "3–4×/week", "5+×/week"],
  dishes: ["right away", "same day", "next day", "when sink is full"],
  guests: ["0/month", "1–2/month", "3–5/month", "6–10/month", "10+/month"],
  overnight: ["never", "1–2 nights/month", "about weekly", "2+ nights/week"],
  sleepNoise: [],
  noise: ["silent", "quiet talking", "music/TV low", "music/TV out loud"],
  wfh: ["0 days", "1–2 days", "3–4 days", "5+ days"],
  smoking: ["never", "outside only", "sometimes inside", "often inside"],
};
const BOTH: Record<QuickKey, (s: string, i: number) => string> = {
  bedtime: (s) => `Both in bed ${s}`,
  wake: (s) => `Both up ${s}`,
  cleaning: (s) => `Both clean ${s}`,
  dishes: (s) => `Both do dishes ${s}`,
  guests: (s) => `Both have guests ${s}`,
  overnight: (s) => `Overnight guests: both ${s}`,
  sleepNoise: (s) => (s === "none reported" || s === "not sure" ? "No sleep noise reported" : "Both make some sleep noise"),
  noise: (s) => `Weeknights: both ${s}`,
  wfh: (s, i) => (i ? `Both WFH ${s}/week` : "Neither works from home"),
  smoking: (s, i) => (i ? `Both smoke ${s}` : "Both never smoke"),
};

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const shorts = (h: HabitScore) => [h.a, h.b].map((t) => SHORT[h.key][OPTS[h.key].indexOf(t)] ?? lower(t));
// Bedtime/wake similarity was inverted for a pair that wants opposite schedules (scoring.ts): the ordinal similarity disagrees.
const inverted = (h: HabitScore) => {
  const ia = OPTS[h.key].indexOf(h.a), ib = OPTS[h.key].indexOf(h.b);
  return ia >= 0 && ib >= 0 && 1 - Math.abs(ia - ib) / (OPTS[h.key].length - 1) !== h.similarity;
};
const clickLine = (h: HabitScore) => {
  const [sa, sb] = shorts(h), label = LABEL[h.key] ?? h.label;
  if (inverted(h)) return `${label}: ${h.similarity === 1 ? "opposite" : "nearly opposite"}, as wanted`;
  if (h.similarity === 1) return BOTH[h.key](sa, OPTS[h.key].indexOf(h.a));
  return h.similarity >= 0.6 ? `${label} close: ${sa} / ${sb}` : `${label}: ${sa} / ${sb}`;
};
const clashLine = (h: HabitScore, them: string) => {
  const [sa, sb] = shorts(h), label = LABEL[h.key] ?? h.label;
  return inverted(h) ? `${label}: both near ${sa}, opposite wanted` : `${label}: you ${sa}, ${them} ${sb}`;
};
export function explain(r: PairScore, them: string): { click: string[]; clash: string[] } {
  const click = [...r.habits].sort((x, y) => y.similarity - x.similarity || y.weight - x.weight).slice(0, 3).map(clickLine);
  const clash = r.habits.filter((h) => h.similarity < 1).sort((x, y) => y.weight * (1 - y.similarity) - x.weight * (1 - x.similarity)).slice(0, 2).map((h) => clashLine(h, them));
  return { click, clash };
}

// Keyword rules. `when` = quick answers a hit contradicts. Sentences with a negation are skipped (false negatives beat false
// positives), and weeknight-only rules skip sentences about weekends: "up late on weekends" is not a weeknight bedtime.
const NEG = /\b(don[’']t|do not|doesn[’']t|never|not|no|quit|stopped|rarely|hate|allerg\w*)\b/i;
const WEEKEND = /\b(weekends?|fridays?|saturdays?|sundays?)\b/i;
const RULES: { key: QuickKey; when: string[]; re: RegExp; weeknight?: boolean; question: string }[] = [
  { key: "guests", when: ["0", "1–2"], re: /\b(people over|(friends|folks|someone|guests|a friend) over|host(s|ed|ing)?|brunch|dinner part(y|ies)|game nights?|part(y|ies)|hang ?outs?)\b/i, question: "How many people come over in a typical month?" },
  { key: "bedtime", when: ["Before 22:00", "22:00–23:00"], re: /\b(up late|stay(s|ed|ing)? up|night owl|past midnight|after midnight|[123] ?a\.?m\b|(one|two|three) a\.?m\b)/i, weeknight: true, question: "What time do weeknights usually end?" },
  { key: "smoking", when: ["Never"], re: /\b(smok(e|es|ed|ing)|vap(e|es|ed|ing)|weed|cannabis|joints?|cigarettes?|cigs?|edibles?|420)\b/i, question: "Smoking or cannabis at home: where, if at all?" },
  { key: "overnight", when: ["Never"], re: /\b(stay(s|ed|ing)? (over|the night)|spend(s|ing)? the night|sleep(s|ing)? over|sleepovers?|crash(es|ed|ing)? (here|at (my|our) place|on (the|my) couch))\b/i, question: "How often does someone stay the night?" },
  { key: "noise", when: ["Silent", "Quiet talking"], re: /\b(loud music|music (loud|out loud|on loud|blasting)|blast(s|ing)? (music|the speakers)|part(y|ies)|practic(e|es|ing) (the |my )?(guitar|piano|drums|violin|trumpet|sax|saxophone|cello|bass|instrument)|play(s|ing)? (the |my )?(guitar|piano|drums|violin|trumpet|sax|saxophone|cello)|drum kit|band practice|surround sound)\b/i, weeknight: true, question: "Music or TV on weeknights: how loud, until when?" },
  { key: "wfh", when: ["0"], re: /\b(work(s|ing)? from home|wfh|remote(ly)?|home office|zoom calls)\b/i, question: "Which days are you home during the workday?" },
];
// Sentences as exact substrings of the transcript, trimmed. Splits only before a capital, so "2 a.m. gaming" stays whole.
const sentences = (t: string) => t.replace(/([.!?])\s+(?=[A-Z“"'(\d])|\n+/g, "$1\u0000").split("\u0000").map((s) => s.trim()).filter(Boolean);
export function contradictions(quick: QuickAnswers, transcript: string): Contradiction[] {
  const lines = sentences(transcript), out: Contradiction[] = [];
  for (const r of RULES) {
    const chip = quick[r.key];
    if (typeof chip !== "string" || !r.when.includes(chip)) continue;
    const voice = lines.find((s) => r.re.test(s) && !NEG.test(s) && !(r.weeknight && WEEKEND.test(s)));
    if (voice) out.push({ key: r.key, quick: chip, voice, question: r.question });
  }
  return out;
}

const TAG: Record<QuickKey, string[]> = {
  bedtime: ["Early to bed", "Early to bed", "Bed by midnight", "Night owl", "Night owl"],
  wake: ["Early riser", "Early riser", "Up by 8", "Sleeps in", "Sleeps in"],
  cleaning: ["Rarely cleans", "Cleans weekly", "Cleans 2×/week", "Cleans 3–4×/week", "Cleans daily"],
  dishes: ["Dishes right away", "Dishes same day", "Dishes next day", "Dishes when sink fills"],
  guests: ["No guests", "Rare guests", "Some guests", "Hosts often", "Hosts a lot"],
  overnight: ["No overnights", "Rare overnights", "Weekly overnights", "Frequent overnights"],
  sleepNoise: [],
  noise: ["Silent weeknights", "Quiet weeknights", "Music, low", "Music out loud"],
  wfh: ["Never WFH", "WFH 1–2 days", "WFH 3–4 days", "Works from home"],
  smoking: ["Never smokes", "Smokes outside", "Smokes inside", "Smokes inside"],
};
// The 3 most distinctive answers: farthest from the middle of their scale, then by weight.
export function tags(quick: QuickAnswers): string[] {
  return QUICK.filter((q) => q.k !== "sleepNoise")
    .flatMap((q) => { const i = optionIndex(quick, q.k), mid = (q.opts.length - 1) / 2; return i === null ? [] : [{ k: q.k, i, ext: Math.abs(i - mid) / mid }]; })
    .sort((x, y) => y.ext - x.ext || WEIGHTS[y.k] - WEIGHTS[x.k])
    .slice(0, 3)
    .map((x) => TAG[x.k][x.i]);
}

const AGREE = {
  quietStart: ["22:00", "23:00", "00:00", "01:00", "01:00"], // by the earlier bedtime
  quietEnd: ["06:00", "07:00", "08:00", "09:00", "09:00"], // by the later wake time
  guests: ["No guests", "Up to 2 guests a month", "Up to 5 guests a month", "Up to 10 guests a month", "Guests any time"],
  overnight: ["No overnight guests", "Overnight guests up to 2 nights a month", "Overnight guests about once a week", "Overnight guests a few nights a week"],
  cleaning: ["as needed", "once a week", "twice a week", "3–4 times a week", "daily"],
  dishes: ["right after eating", "the same day", "by the next day", "when the sink is full"],
  noise: ["Silent weeknights", "Quiet talking on weeknights", "Music or TV kept low on weeknights", "Music or TV out loud is fine on weeknights"],
  smoking: ["No smoking or cannabis at home", "Smoking and cannabis outside only", "Smoking inside now and then is OK", "Smoking inside is OK"],
};
const ASK: Record<QuickKey, string> = {
  bedtime: "Weeknight bedtimes differ: when do quiet hours start?",
  wake: "Wake times differ: how early can mornings get loud?",
  cleaning: "Cleaning: how often, and who does what?",
  dishes: "Dishes: same day, or is overnight OK?",
  guests: "Guests: how many, how often?",
  overnight: "Overnight guests: how often, and how much notice?",
  sleepNoise: "Sleep noise: does it carry through the wall?",
  noise: "Music or TV on weeknights: how loud, until when?",
  wfh: "Working from home: which days, and what does quiet mean then?",
  smoking: "Smoking or cannabis: where, if at all?",
};
// Sections from the stricter answer of the pair (fewer guests, more cleaning, quieter, less smoke); a section is dropped
// when neither answered its keys. Open questions: the two biggest weighted gaps, plus the thermostat, which no answer covers.
export function draftAgreement(a: Person, b: Person, rentEach: string): { sections: { icon: string; title: string; text: string }[]; open: string[] } {
  const both = (k: QuickKey) => [a, b].map((p) => optionIndex(p.quick, k)).filter((i): i is number => i !== null);
  const lo = (k: QuickKey) => { const v = both(k); return v.length ? Math.min(...v) : null; };
  const hi = (k: QuickKey) => { const v = both(k); return v.length ? Math.max(...v) : null; };
  const sections: { icon: string; title: string; text: string }[] = [];
  const qs = lo("bedtime"), qe = hi("wake"), g = lo("guests"), o = lo("overnight"), c = hi("cleaning"), d = lo("dishes"), n = lo("noise");
  let s = lo("smoking");
  if ([a, b].some((p) => p.prescreen?.dealbreakers.includes("No smoking/vaping indoors"))) s = Math.min(s ?? 1, 1);
  if (qs !== null && qe !== null) sections.push({ icon: "moon", title: "Quiet hours", text: `Weeknights ${AGREE.quietStart[qs]} – ${AGREE.quietEnd[qe]}` });
  if (g !== null && o !== null) sections.push({ icon: "users", title: "Guests", text: `${AGREE.guests[g]}. ${AGREE.overnight[o]}.` });
  if (c !== null && d !== null) sections.push({ icon: "spray-can", title: "Chores", text: `Shared spaces cleaned ${AGREE.cleaning[c]}. Dishes washed ${AGREE.dishes[d]}.` });
  if (n !== null) sections.push({ icon: "volume-2", title: "Noise", text: AGREE.noise[n] });
  if (s !== null) sections.push({ icon: "cigarette", title: "Smoking", text: AGREE.smoking[s] });
  sections.push({ icon: "wallet", title: "Bills", text: `Rent split 50/50 (${rentEach}). Utilities split the same way.` });
  const open = QUICK.filter((q) => q.k !== "sleepNoise")
    .flatMap((q) => { const ia = optionIndex(a.quick, q.k), ib = optionIndex(b.quick, q.k); return ia === null || ib === null || ia === ib ? [] : [{ k: q.k, gap: (WEIGHTS[q.k] * Math.abs(ia - ib)) / (q.opts.length - 1) }]; })
    .sort((x, y) => y.gap - x.gap)
    .slice(0, 2)
    .map((x) => ASK[x.k]);
  return { sections, open: [...open, "Thermostat in winter: what temperature?"] };
}
