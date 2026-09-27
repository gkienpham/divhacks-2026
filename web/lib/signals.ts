// Rule-based copy from the quick answers and the transcript: contradictions (the self-check) and the House Agreement draft.
// Pure TS, no AI. Match %, bars, click/clash and tags live in lib/score.ts.
import { agreement } from "./score";
import { QUICK, type Prescreen, type QuickAnswers, type QuickKey } from "./questions";

export interface Contradiction { key: QuickKey; quick: string /* chip text */; voice: string /* exact sentence from the transcript */; question: string /* a question, never an accusation */ }
export interface Habits { quick: QuickAnswers; prescreen: Prescreen | null }

const OPTS = Object.fromEntries(QUICK.map((q) => [q.k, q.opts])) as Record<QuickKey, string[]>;
// Option index of a single-choice answer; null when unanswered or not an option.
const optionIndex = (quick: QuickAnswers, k: QuickKey): number | null => {
  const v = quick[k];
  const i = typeof v === "string" ? OPTS[k].indexOf(v) : -1;
  return i < 0 ? null : i;
};

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

const AGREE = {
  quietStart: ["22:00", "22:00", "23:00", "00:00", "01:00"], // when the earlier sleeper's bedtime window opens
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
// when neither answered its keys. Open questions: the two lowest score.ts agreements (copy selection, not scoring), plus the
// thermostat, which no answer covers.
export function draftAgreement(a: Habits, b: Habits, rentEach: string): { sections: { icon: string; title: string; text: string }[]; open: string[] } {
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
    .flatMap((q) => (optionIndex(a.quick, q.k) === null || optionIndex(b.quick, q.k) === null ? [] : [{ k: q.k, v: agreement(q.k, a.quick[q.k]!, b.quick[q.k]!) }]))
    .filter((x) => x.v < 100)
    .sort((x, y) => x.v - y.v)
    .slice(0, 2)
    .map((x) => ASK[x.k]);
  return { sections, open: [...open, "Thermostat in winter: what temperature?"] };
}
