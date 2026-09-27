// Self-check for the match-% math (no DB needed). Run from web/:
//   npx tsx lib/score.check.ts
import assert from 'node:assert/strict';
import { QUESTIONS, agreement, blocked, rank, score, type Answers, type Person } from './score';
import { ME, PEOPLE, QUEUE } from './sample-data';

const opt = (k: string, i: number) => QUESTIONS.find(f => f.k === k)!.opts[i];
const ag = (k: string, i: number, j: number) => agreement(k, opt(k, i), opt(k, j));

// FR-1: the documented table values, incl. the midnight wrap (23:00–00:00 vs 00:00–01:00 is 1 h, not 23 h).
assert.equal(ag('guests', 0, 1), 56);
assert.equal(ag('bedtime', 2, 3), 75);
assert.equal(ag('bedtime', 0, 4), 0);
assert.equal(ag('dishes', 0, 3), 7);
assert.equal(ag('noise', 0, 3), 0);
assert.equal(ag('smoking', 0, 1), 75);
assert.equal(ag('smoking', 1, 2), 50); // crossing indoors counts double

// FR-1: every question is symmetric and scores 100 on identical answers; every option label maps to a value.
for (const f of QUESTIONS) {
  assert.equal(f.vals.length, f.opts.length, f.k);
  const as = f.multi ? f.opts.map(o => [o]) : f.opts;
  for (const a of as) for (const b of as) assert.equal(agreement(f.k, a, b), agreement(f.k, b, a), `${f.k} symmetric`);
  for (const a of as) assert.equal(agreement(f.k, a, a), 100, `${f.k} identical`);
}
// Sleep noise: a mismatch costs half; any noise pick wins over "No one's mentioned it".
assert.equal(agreement('sleepNoise', ['I snore'], ['No one’s mentioned it']), 50);
assert.equal(agreement('sleepNoise', ['I snore', 'No one’s mentioned it'], ['Other']), 100);
// Unknown or missing answers fail loud.
assert.throws(() => agreement('guests', 'lots', '0'));
assert.throws(() => agreement('sleepNoise', [], ['I snore']));
assert.throws(() => score({} as Answers, ME.answers));

// FR-2: Sam is 87%, and every shown % is the rounded mean of its 10 bars.
assert.equal(QUEUE[0].n, 'Sam');
assert.equal(QUEUE[0].s, 87);
for (const p of PEOPLE) {
  assert.equal(p.parts.length, 10);
  assert.equal(p.s, Math.round(p.parts.reduce((s, x) => s + x.v, 0) / 10), p.n);
  assert.ok(p.reason, `${p.n} has a reason line`);
}

// FR-3: dealbreakers filter both ways.
const who = (id: string, over: Partial<Answers>, pets = 'No pets, fine if roommates do', deal: string[] = []): Person =>
  ({ id, answers: { ...ME.answers, ...over } as Answers, pets, deal });
const smoker = who('smoker', { smoking: 'Often inside' });
assert.ok(blocked(ME, smoker) && blocked(smoker, ME));
assert.ok(!blocked(who('a', {}), smoker)); // no one objects
assert.ok(!blocked(ME, who('outside', { smoking: 'Outside only' })));
const cat = who('cat', {}, 'I have a pet');
assert.ok(blocked(who('allergic', {}, undefined, ['Pet allergy']), cat));
assert.ok(blocked(cat, who('petfree', {}, 'Need a pet-free home')));
assert.ok(!blocked(ME, cat));

// FR-4: filtered, sorted high → low, ties by id.
const ranked = rank(ME, [who('b', {}), smoker, who('a', {}), who('c', { bedtime: 'After 01:00' })]);
assert.deepEqual(ranked.map(p => p.id), ['a', 'b', 'c']);
assert.equal(ranked[0].pct, 100);
for (let i = 1; i < PEOPLE.length; i++) assert.ok(PEOPLE[i - 1].s > PEOPLE[i].s || (PEOPLE[i - 1].s === PEOPLE[i].s && PEOPLE[i - 1].id < PEOPLE[i].id));

console.log('score.check: ok —', PEOPLE.map(p => `${p.n} ${p.s}`).join(', '));
