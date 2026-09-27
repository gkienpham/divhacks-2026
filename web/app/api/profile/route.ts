import { ensureProfileId } from '@/lib/session';
import { saveProfile, type ProfilePatch } from '@/lib/profiles';
import { answered, DEALBREAKERS, PRESCREEN, QUICK, SEE_PREFS, SUBWAY_LINES, type Prescreen, type QuickAnswers } from '@/lib/questions';
import { bad, body, handle, json } from '../_http';

const isStr = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max;
const strs = (v: unknown, allowed: readonly string[]): v is string[] => Array.isArray(v) && v.every((x) => allowed.includes(x));

// Every option must come from questions.ts (quick answers: lib/score.ts QUESTIONS, so no Skip or "Not sure"); returns the reason when it doesn't.
function check(b: Record<string, unknown>): string | ProfilePatch {
  const p: ProfilePatch = {};
  if ('name' in b) { if (!isStr(b.name, 40) || !b.name.trim()) return 'name: up to 40 characters'; p.name = b.name.trim(); }
  if ('email' in b) { if (!isStr(b.email, 120) || (b.email.trim() && !b.email.includes('@'))) return 'email: not an address'; p.email = b.email.trim(); } // '' clears it
  if ('see' in b) { if (!SEE_PREFS.includes(b.see as never)) return 'see: unknown option'; p.see = b.see as ProfilePatch['see']; }
  if ('transcript' in b) { if (!isStr(b.transcript, 4000)) return 'transcript: up to 4000 characters'; p.transcript = b.transcript.trim(); }
  if ('quick' in b) {
    const q = b.quick as Record<string, unknown>;
    if (!q || typeof q !== 'object') return 'quick: object expected';
    for (const [k, v] of Object.entries(q)) {
      if (k === 'sleepNoiseOther') { if (!isStr(v, 80)) return 'quick.sleepNoiseOther: up to 80 characters'; continue; }
      const def = QUICK.find((x) => x.k === k);
      if (!def) return `quick.${k}: unknown question`;
      if (!answered(def, v)) return `quick.${k}: unknown option`;
    }
    p.quick = q as QuickAnswers;
  }
  if ('prescreen' in b) {
    const s = b.prescreen as Record<string, unknown>;
    const a = s?.answers as Record<string, unknown> | undefined;
    if (!a || typeof a !== 'object') return 'prescreen.answers: object expected';
    for (const g of PRESCREEN) {
      const v = a[g.id];
      if (!strs(v, g.opts) || (!('multi' in g && g.multi) && v.length !== 1)) return `prescreen.${g.id}: ${'multi' in g && g.multi ? 'unknown option' : 'exactly one option'}`;
    }
    if (Object.keys(a).some((k) => !PRESCREEN.some((g) => g.id === k))) return 'prescreen.answers: unknown group';
    if (s.school !== undefined && !isStr(s.school, 80)) return 'prescreen.school: up to 80 characters';
    if (s.lines !== undefined && !strs(s.lines, SUBWAY_LINES)) return 'prescreen.lines: unknown line';
    if (s.moveDate !== undefined && !(isStr(s.moveDate, 10) && /^\d{4}-\d{2}-\d{2}$/.test(s.moveDate) && !Number.isNaN(Date.parse(s.moveDate)))) return 'prescreen.moveDate: YYYY-MM-DD';
    if (!strs(s.dealbreakers ?? [], DEALBREAKERS)) return 'prescreen.dealbreakers: unknown option';
    p.prescreen = { answers: a, school: s.school, lines: s.lines, moveDate: s.moveDate, dealbreakers: s.dealbreakers ?? [] } as Prescreen;
  }
  return p;
}

export const POST = (req: Request) =>
  handle(async () => {
    const b = await body(req);
    if (!b) return bad('JSON object expected');
    const patch = check(b);
    if (typeof patch === 'string') return bad(patch);
    const me = await saveProfile(await ensureProfileId(), patch);
    return json({ me, selfCheck: me.signals.contradictions });
  });
