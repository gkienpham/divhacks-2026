// End-to-end check of the data layer against the real DB. Run from web/:
//   npx tsx --env-file=.env.local --conditions=react-server lib/matches.check.ts
// Creates a throwaway profile and a throwaway synthetic partner, walks the whole funnel, then deletes both.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { getPool, query } from './db';
import { listListings } from './listings';
import { actOnMatch, getMatch, getTopMatches, LIKE_BACK, MatchError } from './matches';
import { deleteProfile, getMe, saveProfile, setSaved } from './profiles';
import { PRESCREEN, QUICK, type Prescreen, type QuickAnswers } from './questions';

// All 10 answered (lib/score.ts needs a complete set): option 1 everywhere, sleep noise "No one's mentioned it".
const quick: QuickAnswers = Object.fromEntries(QUICK.map((q) => [q.k, q.multi ? [q.opts[3]] : q.opts[1]]));
const prescreen: Prescreen = { answers: Object.fromEntries(PRESCREEN.map((g) => [g.id, [...g.def]])) as Prescreen['answers'], dealbreakers: [] };
const create = (name: string, synthetic = false) =>
  query<{ id: number }>(`insert into profiles (name, session_token, is_synthetic) values ($1, $2, $3) returning id::int as id`, [name, randomUUID(), synthetic]).then((r) => r[0].id);

async function main() {
  const meId = await create('Check Me');
  const themId = await create('Check Partner', true);
  try {
    const listing = (await listListings({ fairOnly: true, pageSize: 1 })).listings[0];
    assert.ok(listing, 'need one fair listing');

    // Profile: prescreen + quick + a transcript that contradicts the quick answer on guests.
    let me = await saveProfile(meId, { name: 'Kien', prescreen, quick, see: 'auto', transcript: 'Honestly I have friends over most nights and we stay up late.' });
    assert.equal(me.initials, 'K');
    assert.ok(me.complete && me.prescreen && me.signals.tags.length > 0 && me.signals.tags.length <= 3);
    assert.equal(me.email, null);
    console.log('tags', me.signals.tags, 'contradictions', me.signals.contradictions.length);
    assert.deepEqual(await setSaved(meId, listing.zpid, true), [listing.zpid]);
    const [flat] = await query<{ budget_max: number; move_in: string; lease_months: number; neighborhoods: string[] }>(
      'select budget_max, move_in::text as move_in, lease_months, neighborhoods from profiles where id = $1', [meId]);
    assert.deepEqual(flat, { budget_max: 2000, move_in: flat.move_in, lease_months: 12, neighborhoods: [listing.neighborhood] });
    assert.match(flat.move_in, /^\d{4}-\d{2}-\d{2}$/);
    me = (await getMe(meId))!;
    assert.deepEqual(me.saved, [listing.zpid]);

    // Partner answers the same way, so the pair scores at the top and is ≥ LIKE_BACK.
    await saveProfile(themId, { prescreen, quick, see: 'auto' });
    await setSaved(themId, listing.zpid, true);

    const top = await getTopMatches(meId);
    console.log('top matches', top.length, top.slice(0, 5).map((m) => `${m.other.name} ${m.score}`));
    assert.ok(top.length >= 1 && top.length <= 20);
    assert.ok(top.every((m, i) => i === 0 || top[i - 1].score >= m.score), 'sorted by score');
    for (const m of top) {
      assert.ok(Number.isInteger(m.score) && m.score >= 0 && m.score <= 100);
      assert.ok(m.other.name && m.other.initials && typeof m.other.synthetic === 'boolean' && m.other.tags.length <= 3);
      // score.ts contract: all 10 bars in QUESTIONS order, % = the rounded mean of the bars, rule-based click/clash.
      assert.deepEqual(m.bars.map((b) => b.k), QUICK.map((q) => q.k));
      assert.equal(m.score, Math.round(m.bars.reduce((s, b) => s + b.v, 0) / 10));
      assert.ok(m.click.length <= 3 && m.clash.length <= 2 && m.ai === false && m.summary === null);
      assert.ok(m.saved.length <= 4 && m.savedOverlap <= m.saved.length);
      assert.ok(!('phone' in m.other));
    }
    const mine = top.find((m) => m.other.id === themId)!;
    assert.ok(mine, 'the identical partner is in the top 20');
    assert.ok(mine.score === 100 && mine.score >= LIKE_BACK && mine.status === 'suggested' && !mine.mutual && mine.agreement === null);
    assert.deepEqual(mine.clash, []);
    assert.equal(mine.click.length, 3);
    assert.equal(mine.savedOverlap, 1);
    assert.equal(mine.listing?.zpid, listing.zpid);
    assert.ok(mine.other.meta.includes(listing.neighborhood) && mine.other.meta.includes('$1,500–2,000') && mine.other.meta.includes('Move-in'));
    assert.equal(await getMatch(themId + 1_000_000, mine.id), null);

    // Funnel.
    await assert.rejects(actOnMatch(meId, mine.id, 'meetup', { format: 'Coffee', time: 'Sat 10 AM' }), (e: MatchError) => e.status === 409);
    let m = (await actOnMatch(meId, mine.id, 'like'))!;
    assert.ok(m.likedByMe && m.mutual && m.status === 'mutual' && m.agreement && m.agreement.confirmed.length === 0);
    console.log('draft agreement', m.agreement.sections.map((s) => s.title), m.agreement.open);
    m = (await actOnMatch(meId, mine.id, 'meetup', { format: 'Coffee', time: 'Sat 10 AM' }))!;
    assert.ok(m.status === 'met' && m.meetup?.format === 'Coffee');
    await assert.rejects(actOnMatch(meId, mine.id, 'lock'), (e: MatchError) => e.status === 409);
    m = (await actOnMatch(meId, mine.id, 'agreement', { open: m.agreement!.open.map((o) => ({ ...o, resolved: true })) }))!;
    assert.ok(m.agreement!.open.every((o) => o.resolved));
    m = (await actOnMatch(meId, mine.id, 'confirm'))!;
    assert.deepEqual(m.agreement!.confirmed, [meId]);
    m = (await actOnMatch(meId, mine.id, 'simulate-confirm'))!;
    assert.deepEqual([...m.agreement!.confirmed].sort(), [meId, themId].sort());
    m = (await actOnMatch(meId, mine.id, 'lock'))!;
    assert.ok(m.status === 'locked' && m.listing?.zpid === listing.zpid);
    await assert.rejects(actOnMatch(meId, mine.id, 'pass'), (e: MatchError) => e.status === 409);

    // Re-ranking keeps the funnel state.
    const again = (await getTopMatches(meId)).find((x) => x.id === mine.id)!;
    assert.ok(again.status === 'locked' && again.meetup && again.agreement?.confirmed.length === 2);

    // Unlike from the partner's side is not allowed once locked either; a fresh pair can be unliked.
    assert.equal(await actOnMatch(meId, 999_999_999, 'like'), null);
  } finally {
    await deleteProfile(meId);
    await deleteProfile(themId);
    assert.equal((await query('select 1 from profiles where id in ($1, $2)', [meId, themId])).length, 0);
  }
}

main().then(() => console.log('OK'), (e) => { console.error(e); process.exitCode = 1; }).finally(() => getPool().end());
