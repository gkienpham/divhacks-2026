import 'server-only';
import { query } from './db';
import { budgetBand, type Prescreen, type QuickAnswers, type SeePref, DEALBREAKERS } from './questions';
import { currentProfileId } from './session';
import { contradictions, tags, type Contradiction } from './signals';

export interface Signals { tags: string[]; contradictions: Contradiction[]; summary?: string; ai?: boolean }
export interface Me {
  id: number;
  name: string;
  initials: string;
  prescreen: Prescreen | null;
  see: SeePref | null;
  quick: QuickAnswers;
  transcript: string;
  saved: string[];
  signals: Signals;
  complete: boolean; // has quick answers
}
export type ProfilePatch = Partial<{ name: string; email: string; prescreen: Prescreen; see: SeePref; quick: QuickAnswers; transcript: string }>;

// Never selects phone.
const ME_SQL = `select id::int as id, name, prescreen, see_pref as see, quick_answers as quick,
  coalesce(open_transcript, '') as transcript, saved_listings as saved, signals from profiles where id = $1`;
type Row = Omit<Me, 'initials' | 'complete'>;

export const initials = (name: string) =>
  name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'Y';

const shape = (r: Row): Me => ({
  ...r,
  prescreen: r.prescreen && 'answers' in r.prescreen ? r.prescreen : null,
  initials: initials(r.name),
  signals: { ...r.signals, tags: r.signals?.tags ?? [], contradictions: r.signals?.contradictions ?? [] },
  complete: Object.keys(r.quick ?? {}).length > 0,
});

// No argument = the cookie's profile (Server Components); pass an id from Route Handlers and scripts.
export async function getMe(id?: number | null): Promise<Me | null> {
  if (id === undefined) id = await currentProfileId();
  if (!id) return null;
  const [row] = await query<Row>(ME_SQL, [id]);
  return row ? shape(row) : null;
}

// Prescreen → the flat columns the seed data and match meta read.
const DAY = 86_400_000;
const ymd = (d: Date) => d.toISOString().slice(0, 10);
export function flatten(p: Prescreen) {
  const a = p.answers;
  const move = a.move?.[0];
  const offset = { ASAP: 0, 'Within 1 month': 30, '1–3 months': 60 }[move ?? ''];
  return {
    budget_max: budgetBand(a.budget?.[0] ?? '')?.max ?? null,
    move_in: move === 'Pick a date' && p.moveDate ? p.moveDate : offset != null ? ymd(new Date(Date.now() + offset * DAY)) : null,
    lease_months: { 'Month-to-month': 1, '6 months': 6, '12 months': 12, '12+': 24 }[a.lease?.[0] ?? ''] ?? null,
    dealbreakers: { smoking: p.dealbreakers.includes(DEALBREAKERS[0]), petAllergy: p.dealbreakers.includes(DEALBREAKERS[1]) },
  };
}

export async function saveProfile(id: number, patch: ProfilePatch): Promise<Me> {
  const cur = await getMe(id);
  if (!cur) throw new Error(`no profile ${id}`);
  const quick = patch.quick ?? cur.quick;
  const transcript = patch.transcript ?? cur.transcript;
  const flat = patch.prescreen ? flatten(patch.prescreen) : null;
  const signals: Signals | null =
    patch.quick || patch.transcript !== undefined
      ? { ...cur.signals, tags: tags(quick), contradictions: contradictions(quick, transcript) }
      : null;
  await query(
    `update profiles set
       name = coalesce($2, name), email = coalesce($3, email), see_pref = coalesce($4, see_pref),
       quick_answers = coalesce($5, quick_answers), open_transcript = coalesce($6, open_transcript),
       signals = coalesce($7, signals),
       prescreen = coalesce($8, prescreen), budget_max = case when $8::jsonb is null then budget_max else $9 end,
       move_in = case when $8::jsonb is null then move_in else $10::date end,
       lease_months = case when $8::jsonb is null then lease_months else $11 end,
       dealbreakers = coalesce($12, dealbreakers), updated_at = now()
     where id = $1`,
    [id, patch.name ?? null, patch.email ?? null, patch.see ?? null, patch.quick ?? null, patch.transcript ?? null,
      signals, patch.prescreen ?? null, flat?.budget_max ?? null, flat?.move_in ?? null, flat?.lease_months ?? null, flat?.dealbreakers ?? null],
  );
  return (await getMe(id))!;
}

// Saved listings double as the areas the person is looking in (profiles.neighborhoods).
export async function setSaved(id: number, zpid: string, on: boolean): Promise<string[]> {
  const [row] = await query<{ saved: string[] }>(
    `update profiles set saved_listings = case when $3 then array_append(array_remove(saved_listings, $2), $2) else array_remove(saved_listings, $2) end,
       updated_at = now() where id = $1 returning saved_listings as saved`,
    [id, zpid, on],
  );
  await query(
    `update profiles set neighborhoods = coalesce((select array_agg(distinct neighborhood) from listings where zpid = any(saved_listings)), '{}') where id = $1`,
    [id],
  );
  return row?.saved ?? [];
}

export function deleteProfile(id: number) {
  return query('with m as (delete from matches where profile_a = $1 or profile_b = $1) delete from profiles where id = $1', [id]);
}
