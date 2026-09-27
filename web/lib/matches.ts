import 'server-only';
import { query } from './db';
import { aiOn, matchCard, type AiCard } from './ai';
import { usd } from './format';
import { getListingsByIds, listListings, type Listing } from './listings';
import { initials, type Signals } from './profiles';
import { BUDGETS, type Prescreen, type QuickAnswers, type SeePref } from './questions';
import { rank, scorePair, type HabitScore, type Person } from './scoring';
import { contradictions, draftAgreement, explain, tags, type Contradiction } from './signals';

export type Status = 'suggested' | 'shortlisted' | 'mutual' | 'met' | 'locked' | 'closed';
export type Action = 'like' | 'unlike' | 'pass' | 'meetup' | 'agreement' | 'confirm' | 'simulate-confirm' | 'lock';
export interface Meetup { format: string; time: string; at: string }
export interface Agreement {
  sections: { icon: string; title: string; text: string }[];
  open: { q: string; resolved: boolean }[];
  confirmed: number[];
}
export interface MatchView {
  id: number;
  score: number;
  status: Status;
  mutual: boolean;
  likedByMe: boolean;
  passedByMe: boolean;
  other: { id: number; name: string; initials: string; synthetic: boolean; meta: string; tags: string[] };
  bars: HabitScore[]; // top 6 by weight
  click: string[];
  clash: string[];
  summary: string | null;
  ai: boolean; // click/clash/summary written by Gemini
  contradiction: Contradiction | null; // on the other person
  saved: Listing[]; // other's saved, overlaps first, ≤ 4
  savedOverlap: number;
  listing: Listing | null; // the pair's listing
  meetup: Meetup | null;
  agreement: Agreement | null; // the draft once mutual, until it's saved
}

export class MatchError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// Sample profiles reciprocate deterministically: a synthetic partner likes you back when the score is ≥ LIKE_BACK.
export const LIKE_BACK = 70;
export const SHORTLIST_CAP = 5;
const MUTUAL = new Set<Status>(['mutual', 'met', 'locked']);
const AI_IN_LIST = 4; // ponytail: Gemini only for the first cards of the list; the rest wait for their own page

interface P {
  id: number; name: string; synthetic: boolean; prescreen: Prescreen | null; see: SeePref | null; quick: QuickAnswers;
  transcript: string | null; saved: string[]; signals: Partial<Signals> | null; neighborhoods: string[]; budget_max: number | null; move_in: string | null;
}
interface M {
  id: number; a: number; b: number; score: number; reasons: { habits?: HabitScore[]; ai?: Record<string, AiCard> }; status: Status;
  listing: string | null; liked_by: number[]; passed_by: number[]; meetup: Meetup | null; agreement: Agreement | null;
}
// Never selects phone.
const P_SQL = `select id::int as id, name, is_synthetic as synthetic, prescreen, see_pref as see, quick_answers as quick, open_transcript as transcript,
  saved_listings as saved, signals, neighborhoods, budget_max, move_in::text as move_in from profiles`;
const M_COLS = `id::int as id, profile_a::int as a, profile_b::int as b, score::int as score, reasons, status, listing,
  liked_by::int[] as liked_by, passed_by::int[] as passed_by, meetup, agreement`;

const person = (p: P): Person => ({ id: p.id, prescreen: p.prescreen && 'answers' in p.prescreen ? p.prescreen : null, see: p.see, quick: p.quick ?? {} });
const other = (m: M, me: number) => (m.a === me ? m.b : m.a);
const hasQuick = (p: P) => Object.keys(p.quick ?? {}).length > 0;

const month = (ymd: string) => new Date(ymd + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
// "Astoria · $1,500–2,000 · Move-in Oct", from real fields only.
const meta = (p: P) =>
  [
    p.neighborhoods.slice(0, 2).join(' or '),
    p.prescreen?.answers?.budget?.[0] ?? (p.budget_max != null && BUDGETS.find((b) => b.max === p.budget_max)?.label),
    p.move_in && 'Move-in ' + month(p.move_in),
  ].filter(Boolean).join(' · ');

const draft = (me: P, them: P, l: Listing | null): Agreement => {
  const d = draftAgreement(person(me), person(them), l ? `${l.isBuilding ? 'from ' : ''}${usd(l.price / 2)} each` : 'split 50/50');
  return { sections: d.sections, open: d.open.map((q) => ({ q, resolved: false })), confirmed: [] };
};

async function people(ids: number[]) {
  const rows = await query<P>(`${P_SQL} where id = any($1::int[])`, [ids]);
  return new Map(rows.map((p) => [p.id, p]));
}

// Shapes match rows for one viewer. Listings come in one query; Gemini copy is cached per viewer in reasons.ai.
async function views(me: P, rows: M[], byId: Map<number, P>, aiCount: number): Promise<MatchView[]> {
  const zpids = new Set<string>(me.saved);
  for (const m of rows) { for (const z of byId.get(other(m, me.id))?.saved ?? []) zpids.add(z); if (m.listing) zpids.add(m.listing); }
  const listing = new Map((await getListingsByIds([...zpids])).map((l) => [l.zpid, l]));
  let fair: Listing[] | null = null; // real fair-priced listings, fetched once if any pair has nothing saved
  const fallback = async (p: P) => {
    fair ??= (await listListings({ fairOnly: true, pageSize: 100 })).listings;
    return fair.find((l) => (!p.neighborhoods.length || p.neighborhoods.includes(l.neighborhood)) && (p.budget_max == null || l.perRoom <= p.budget_max)) ?? null;
  };
  const out: MatchView[] = [];
  for (const [i, m] of rows.entries()) {
    const them = byId.get(other(m, me.id));
    if (!them) continue;
    const pair = scorePair(person(me), person(them));
    const habits = pair?.habits ?? m.reasons.habits ?? [];
    const rule = explain(pair ?? { score: m.score, habits }, them.name);
    let ai = m.reasons.ai?.[me.id] ?? null;
    if (!ai && aiOn() && i < aiCount) {
      ai = await matchCard({ name: me.name, quick: me.quick, transcript: me.transcript }, { name: them.name, quick: them.quick, transcript: them.transcript });
      if (ai) await query(`update matches set reasons = jsonb_set(reasons, '{ai}', coalesce(reasons->'ai', '{}'::jsonb) || $2::jsonb) where id = $1`, [m.id, JSON.stringify({ [me.id]: ai })]);
    }
    const overlap = them.saved.filter((z) => me.saved.includes(z));
    const saved = [...overlap, ...them.saved.filter((z) => !overlap.includes(z))].flatMap((z) => listing.get(z) ?? []).slice(0, 4);
    const pick = [m.listing, overlap[0], me.saved[0], them.saved[0]].flatMap((z) => (z && listing.get(z)) || [])[0] ?? (await fallback(them));
    const mutual = MUTUAL.has(m.status);
    out.push({
      id: m.id, score: m.score, status: m.status, mutual,
      likedByMe: m.liked_by.includes(me.id), passedByMe: m.passed_by.includes(me.id),
      other: { id: them.id, name: them.name, initials: initials(them.name), synthetic: them.synthetic, meta: meta(them), tags: them.signals?.tags?.length ? them.signals.tags : tags(them.quick ?? {}) },
      bars: habits.slice(0, 6),
      click: ai?.click ?? rule.click, clash: ai?.clash ?? rule.clash, summary: ai?.summary ?? null, ai: !!ai,
      contradiction: (them.signals?.contradictions ?? contradictions(them.quick ?? {}, them.transcript ?? ''))[0] ?? null,
      saved, savedOverlap: overlap.length, listing: pick,
      meetup: m.meetup, agreement: m.agreement ?? (mutual ? draft(me, them, pick) : null),
    });
  }
  return out;
}

// Scores me against everyone with quick answers, caches the top 20 pairs (status, likes, meetup and agreement survive), returns them score desc.
export async function getTopMatches(meId: number): Promise<MatchView[]> {
  const rows = await query<P>(`${P_SQL} where quick_answers <> '{}' or id = $1`, [meId]);
  const me = rows.find((p) => p.id === meId);
  if (!me || !hasQuick(me)) return [];
  const byId = new Map(rows.map((p) => [p.id, p]));
  const ranked = rank(person(me), rows.filter((p) => p.id !== meId).map(person), 20);
  if (!ranked.length) return [];
  const matches = await query<M>(
    `with up as (
       insert into matches (profile_a, profile_b, score, reasons)
       select least($1::bigint, x.id), greatest($1::bigint, x.id), x.score, x.reasons::jsonb
       from unnest($2::bigint[], $3::int[], $4::text[]) as x(id, score, reasons)
       on conflict (profile_a, profile_b) do update
         set score = excluded.score, reasons = matches.reasons || excluded.reasons, updated_at = now()
       returning *)
     select ${M_COLS} from up order by score desc, id`,
    [meId, ranked.map((r) => r.person.id), ranked.map((r) => r.result.score), ranked.map((r) => JSON.stringify({ habits: r.result.habits }))],
  );
  return views(me, matches, byId, AI_IN_LIST);
}

async function load(meId: number, matchId: number) {
  const [m] = await query<M>(`select ${M_COLS} from matches where id = $1 and $2 in (profile_a, profile_b)`, [matchId, meId]);
  if (!m) return null;
  const byId = await people([m.a, m.b]);
  const me = byId.get(meId);
  return me ? { m, me, them: byId.get(other(m, meId))!, byId } : null;
}

// null unless me is in the pair.
export async function getMatch(meId: number, matchId: number): Promise<MatchView | null> {
  const x = await load(meId, matchId);
  return x ? (await views(x.me, [x.m], x.byId, 1))[0] ?? null : null;
}

const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

// Funnel: suggested → shortlisted → mutual → met → locked. Throws MatchError (409 / 400) on a step out of order.
export async function actOnMatch(meId: number, matchId: number, action: Action, payload: Record<string, unknown> = {}): Promise<MatchView | null> {
  const x = await load(meId, matchId);
  if (!x) return null;
  const { m, me, them } = x;
  const [view] = await views(me, [m], x.byId, 0);
  const otherId = them.id;
  const mutual = () => { if (!MUTUAL.has(m.status)) throw new MatchError(409, 'Not mutual yet'); };
  const set = (fields: Record<string, unknown>) =>
    query(`update matches set ${Object.keys(fields).map((k, i) => `${k} = $${i + 2}`).join(', ')}, updated_at = now() where id = $1`, [m.id, ...Object.values(fields)]);
  const reset = (liked: number[], passed: number[]) =>
    set({ liked_by: liked, passed_by: passed, status: liked.includes(otherId) ? 'shortlisted' : 'suggested', meetup: null, agreement: null });
  const agreement = view.agreement ?? draft(me, them, view.listing);

  switch (action) {
    case 'like': {
      if (m.liked_by.includes(meId)) break;
      const [{ n }] = await query<{ n: number }>(
        `select count(*)::int as n from matches where $1 = any(liked_by) and id <> $2 and $1 in (profile_a, profile_b)`, [meId, m.id]);
      if (n >= SHORTLIST_CAP) throw new MatchError(409, `Shortlist is full (${SHORTLIST_CAP})`);
      const liked = [...m.liked_by, meId];
      if (them.synthetic && m.score >= LIKE_BACK && !liked.includes(otherId)) liked.push(otherId);
      await set({ liked_by: liked, passed_by: m.passed_by.filter((p) => p !== meId), status: liked.includes(otherId) ? 'mutual' : 'shortlisted' });
      break;
    }
    case 'unlike':
      if (m.status === 'locked') throw new MatchError(409, 'Already locked');
      await reset(m.liked_by.filter((p) => p !== meId), m.passed_by);
      break;
    case 'pass':
      if (m.status === 'locked') throw new MatchError(409, 'Already locked');
      await reset(m.liked_by.filter((p) => p !== meId), m.passed_by.includes(meId) ? m.passed_by : [...m.passed_by, meId]);
      break;
    case 'meetup': {
      mutual();
      const format = str(payload.format, 80), time = str(payload.time, 80);
      if (!format || !time) throw new MatchError(400, 'format and time are required');
      await set({ meetup: { format, time, at: new Date().toISOString() }, status: m.status === 'mutual' ? 'met' : m.status });
      break;
    }
    case 'agreement': {
      mutual();
      const next: Agreement = { ...agreement };
      if (Array.isArray(payload.sections)) {
        const sections = payload.sections.slice(0, 8).map((s: Record<string, unknown>) => ({ icon: str(s?.icon, 30), title: str(s?.title, 60), text: str(s?.text, 300) }));
        if (sections.some((s) => !s.icon || !s.title || !s.text)) throw new MatchError(400, 'bad sections');
        next.sections = sections as Agreement['sections'];
        next.confirmed = []; // edits need both confirmations again
      }
      if (Array.isArray(payload.open)) {
        const open = payload.open.slice(0, 8).map((o: Record<string, unknown>) => ({ q: str(o?.q, 200), resolved: !!o?.resolved }));
        if (open.some((o) => !o.q)) throw new MatchError(400, 'bad open questions');
        next.open = open as Agreement['open'];
      }
      await set({ agreement: next });
      break;
    }
    case 'confirm':
      mutual();
      await set({ agreement: { ...agreement, confirmed: [...new Set([...agreement.confirmed, meId])] } });
      break;
    case 'simulate-confirm':
      mutual();
      if (!them.synthetic) throw new MatchError(409, 'Only a sample profile can be simulated');
      await set({ agreement: { ...agreement, confirmed: [...new Set([...agreement.confirmed, otherId])] } });
      break;
    case 'lock':
      mutual();
      if (!m.agreement || !m.agreement.confirmed.includes(meId) || !m.agreement.confirmed.includes(otherId)) throw new MatchError(409, 'Both need to confirm first');
      if (!view.listing) throw new MatchError(409, 'No listing to lock');
      await set({ status: 'locked', listing: view.listing.zpid });
      break;
    default:
      throw new MatchError(400, 'Unknown action');
  }
  return getMatch(meId, matchId);
}
