// Self-check for the scoring engine and the rule-based signals. Pure, no DB. Run from web/:
//   npx tsx lib/scoring.check.ts
import assert from 'node:assert/strict';
import { FULL } from '../app/profile/VoiceScreens.jsx';
import { PRESCREEN, QUICK, type PrescreenId, type QuickAnswers, type SeePref } from './questions';
import { MIN_COMMON, WEIGHTS, dealbreakerOk, rank, scorePair, type Person } from './scoring';
import { contradictions, draftAgreement, explain, tags } from './signals';

// Every key answered with option 1 ("22:00–23:00", "1", "1–2", ...); sleepNoise quiet.
const Q = Object.fromEntries(QUICK.map((q) => [q.k, q.k === 'sleepNoise' ? ['No one’s mentioned it'] : q.opts[1]])) as QuickAnswers;
const pre = (over: Partial<Record<PrescreenId, string[]>> = {}, dealbreakers: string[] = []) =>
  ({ answers: { ...(Object.fromEntries(PRESCREEN.map((g) => [g.id, [...g.def]])) as Record<PrescreenId, string[]>), ...over }, dealbreakers });
const person = (id: number, quick: Partial<QuickAnswers> = {}, prescreen = pre(), see: SeePref | null = 'auto'): Person => ({ id, prescreen, see, quick: { ...Q, ...quick } });
const opt = (k: (typeof QUICK)[number]['k'], i: number) => QUICK.find((q) => q.k === k)!.opts[i];
const score = (a: Person, b: Person) => { const r = scorePair(a, b); assert.ok(r, 'filtered'); return r; };
const habit = (a: Person, b: Person, k: string) => score(a, b).habits.find((h) => h.key === k)!;
const me = person(1);

// Identical people → 100, all 10 habits, weight-sorted, display answers.
const same = score(me, person(2));
assert.equal(same.score, 100);
assert.equal(same.habits.length, 10);
assert.ok(same.habits.every((h, i) => i === 0 || same.habits[i - 1].weight >= h.weight));
assert.deepEqual(same.habits.slice(0, 2).map((h) => h.key), ['bedtime', 'cleaning']);
assert.equal(same.habits.find((h) => h.key === 'bedtime')!.a, '22:00–23:00');
assert.equal(same.habits.find((h) => h.key === 'sleepNoise')!.b, 'None reported');
assert.ok(same.habits.every((h) => h.similarity === 1 && h.weight === WEIGHTS[h.key]));

// Symmetry + determinism over a fixed pseudo-random pool.
let seed = 7;
const rnd = (n: number) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
const pool = Array.from({ length: 40 }, (_, i) => {
  const quick = Object.fromEntries(QUICK.map((q) => [q.k, q.k === 'sleepNoise' ? [q.opts[rnd(q.opts.length)]] : q.opts[rnd(q.opts.length)]])) as QuickAnswers;
  return person(10 + i, quick, pre({ budget: [PRESCREEN[2].opts[rnd(5)]], apt: [PRESCREEN[4].opts[rnd(3)]], pets: [PRESCREEN[9].opts[rnd(4)]] }, rnd(4) === 0 ? ['Pet allergy'] : []), (['overlap', 'opposite', 'auto', null] as const)[rnd(4)]);
});
for (const a of pool) for (const b of pool) {
  const ab = scorePair(a, b), ba = scorePair(b, a);
  assert.deepEqual(ab, scorePair(a, b));
  assert.equal(ab?.score, ba?.score);
  assert.equal(dealbreakerOk(a, b), dealbreakerOk(b, a));
  if (ab && ba) {
    assert.ok(Number.isInteger(ab.score) && ab.score >= 0 && ab.score <= 100);
    assert.deepEqual(ab.habits.map((h) => [h.key, h.similarity, h.a, h.b]), ba.habits.map((h) => [h.key, h.similarity, h.b, h.a]));
  }
}

// Dealbreakers: indoor smoke, pets. Symmetric.
const smoker = person(3, { smoking: 'Sometimes inside' }), outside = person(4, { smoking: 'Outside only' });
const noSmoke = person(5, {}, pre({}, ['No smoking/vaping indoors']));
assert.equal(dealbreakerOk(noSmoke, smoker), false);
assert.equal(dealbreakerOk(smoker, noSmoke), false);
assert.equal(scorePair(noSmoke, smoker), null);
assert.equal(dealbreakerOk(noSmoke, outside), true);
assert.equal(dealbreakerOk(me, smoker), true);
const catOwner = person(6, {}, pre({ pets: ['I have a pet'] })), wantsPet = person(7, {}, pre({ pets: ['Planning to get one'] }));
const allergic = person(8, {}, pre({}, ['Pet allergy'])), petFree = person(9, {}, pre({ pets: ['Need a pet-free home'] }));
for (const p of [catOwner, wantsPet]) for (const q of [allergic, petFree]) { assert.equal(dealbreakerOk(p, q), false); assert.equal(dealbreakerOk(q, p), false); }
assert.equal(dealbreakerOk(catOwner, me), true);
assert.equal(dealbreakerOk(allergic, petFree), true);
// Missing prescreen = no filter.
assert.ok(scorePair({ ...smoker, prescreen: null }, { ...noSmoke, prescreen: null }));

// Budget: more than one band apart is out. Apartment: 2 bed vs 3+ bed is out, Any fits both.
const budget = (label: string) => person(20, {}, pre({ budget: [label] }));
assert.equal(scorePair(budget('Under $1,000'), budget('$1,500–2,000')), null);
assert.ok(scorePair(budget('Under $1,000'), budget('$1,000–1,500')));
assert.ok(scorePair(budget('$2,800+'), budget('$2,000–2,800')));
assert.equal(scorePair(budget('$2,800+'), budget('$1,500–2,000')), null);
const apt = (label: string) => person(21, {}, pre({ apt: [label] }));
assert.equal(scorePair(apt('2 bed (1 roommate)'), apt('3+ bed')), null);
assert.equal(scorePair(apt('3+ bed'), apt('2 bed (1 roommate)')), null);
assert.ok(scorePair(apt('Any'), apt('3+ bed')) && scorePair(apt('Any'), apt('2 bed (1 roommate)')) && scorePair(apt('3+ bed'), apt('3+ bed')));

// Bedtime and cleaning outweigh every other key: a full-scale gap on them costs more than a full-scale gap on any other key.
const gapOn = (k: (typeof QUICK)[number]['k']) => { const q = QUICK.find((x) => x.k === k)!; return score(person(30, { [k]: q.opts[0] }), person(31, { [k]: q.opts[q.opts.length - 1] })).score; };
for (const q of QUICK) if (q.k !== 'bedtime' && q.k !== 'cleaning' && q.k !== 'sleepNoise') assert.ok(gapOn(q.k) > gapOn('bedtime') && gapOn(q.k) > gapOn('cleaning'), q.k);
assert.equal(gapOn('bedtime'), gapOn('cleaning'));
const snorer = person(32, { sleepNoise: ['I snore', 'I grind my teeth'] });
assert.equal(habit(me, snorer, 'sleepNoise').similarity, 0);
assert.equal(habit(me, snorer, 'sleepNoise').b, 'Snoring, teeth grinding');
assert.equal(habit(me, person(33, { sleepNoise: ['I snore'] }), 'sleepNoise').similarity, 0.5);
assert.equal(habit(person(34, { sleepNoise: ['I snore'] }), person(35, { sleepNoise: ['I grind my teeth'] }), 'sleepNoise').similarity, 1);
// Ordinal steps.
assert.equal(habit(me, person(36, { bedtime: opt('bedtime', 2) }), 'bedtime').similarity, 0.75);
assert.equal(habit(me, person(37, { bedtime: opt('bedtime', 4) }), 'bedtime').similarity, 0.25);

// Opposite schedules: both 'opposite', or one 'opposite' + one 'auto'/undecided, inverts bedtime and wake. 'overlap' wins otherwise.
const early = (see: SeePref | null) => person(40, { bedtime: 'Before 22:00', wake: 'Before 06:00' }, pre(), see);
const late = (see: SeePref | null) => person(41, { bedtime: 'After 01:00', wake: 'After 09:00' }, pre(), see);
for (const [x, y] of [['opposite', 'opposite'], ['opposite', 'auto'], ['auto', 'opposite'], ['opposite', null], [null, 'opposite']] as const) {
  assert.equal(habit(early(x), late(y), 'bedtime').similarity, 1, `${x}/${y}`);
  assert.equal(habit(early(x), late(y), 'wake').similarity, 1);
  assert.equal(habit(late(y), early(x), 'bedtime').similarity, 1);
  assert.equal(habit(early(x), early(y), 'bedtime').similarity, 0);
  assert.equal(habit(early(x), late(y), 'cleaning').similarity, 1); // other keys untouched
}
for (const [x, y] of [['overlap', 'opposite'], ['opposite', 'overlap'], ['auto', 'auto'], ['overlap', 'overlap'], [null, null]] as const) {
  assert.equal(habit(early(x), late(y), 'bedtime').similarity, 0, `${x}/${y}`);
  assert.equal(habit(early(x), early(y), 'bedtime').similarity, 1);
}
assert.equal(score(early('opposite'), late('opposite')).score, 100);

// Skipped answers drop the key and renormalize; too few common keys → null.
const noBedtime = { ...Q };
delete noBedtime.bedtime;
const skipper: Person = { ...me, id: 50, quick: noBedtime };
assert.equal(score(skipper, me).habits.length, 9);
assert.equal(score(skipper, me).score, 100);
assert.equal(score(skipper, person(51, { bedtime: 'After 01:00' })).score, 100);
const few: Person = { ...me, id: 52, quick: Object.fromEntries(QUICK.slice(0, MIN_COMMON - 1).map((q) => [q.k, Q[q.k]])) };
assert.equal(scorePair(few, me), null);
assert.ok(scorePair({ ...few, quick: { ...few.quick, guests: Q.guests } }, me));
assert.equal(scorePair({ ...me, id: 53, quick: {} }, me), null);
assert.equal(scorePair({ ...me, id: 54, quick: { bedtime: 'not an option', sleepNoise: 'I snore' } }, me), null);

// rank: excludes me, filters, sorts by score desc then id asc, caps at n.
const ranked = rank(me, [me, ...pool, smoker, noSmoke, person(60), person(61)]);
assert.ok(ranked.length <= 20 && ranked.every((r) => r.person.id !== me.id));
assert.ok(ranked.every((r, i) => i === 0 || ranked[i - 1].result.score > r.result.score || (ranked[i - 1].result.score === r.result.score && ranked[i - 1].person.id < r.person.id)));
assert.deepEqual(ranked.slice(0, 3).map((r) => [r.person.id, r.result.score]), [[5, 100], [60, 100], [61, 100]]);
assert.deepEqual(rank(me, pool, 3).map((r) => r.person.id), rank(me, pool).slice(0, 3).map((r) => r.person.id));
assert.equal(rank(noSmoke, [smoker, outside]).length, 1);

// explain: 3 click + 2 clash, short and concrete, no protected traits.
const sam = person(70, { bedtime: 'After 01:00', wake: '08:00–09:00', noise: 'Music or TV, out loud', dishes: 'When the sink is full' });
const ex = explain(score(me, sam), 'Sam');
assert.equal(ex.click.length, 3);
assert.equal(ex.clash.length, 2);
assert.equal(ex.clash[0], 'Bedtime: you 22:00–23:00, Sam after 01:00');
assert.ok(ex.click.includes('Both clean 1×/week') && ex.click.includes('Both have guests 1–2/month'));
for (const s of [...ex.click, ...ex.clash]) assert.ok(s.length <= 48, s);
assert.deepEqual(explain(same, 'Sam').clash, []);
assert.deepEqual(explain(same, 'Sam').click, ['Both in bed 22:00–23:00', 'Both clean 1×/week', 'Both up 06:00–07:00']);
const opp = explain(score(early('opposite'), late('auto')), 'Sam');
assert.ok(opp.click.includes('Bedtime: opposite, as wanted') && opp.click.includes('Wake time: opposite, as wanted'));
assert.equal(explain(score(early('opposite'), early('opposite')), 'Sam').clash[0], 'Bedtime: both near before 22:00, opposite wanted');
assert.equal(explain(score(me, person(71, { bedtime: '23:00–00:00' })), 'Sam').click[0], 'Both clean 1×/week');
// One step off on everything but cleaning and sleep noise: two "Both" lines, then the heaviest near-match.
const oneOff = person(72, Object.fromEntries(QUICK.filter((q) => q.k !== 'cleaning' && q.k !== 'sleepNoise').map((q) => [q.k, q.opts[2]])));
assert.deepEqual(explain(score(me, oneOff), 'Sam').click, ['Both clean 1×/week', 'No sleep noise reported', 'Bedtime close: 22:00–23:00 / 23:00–00:00']);

// contradictions: the demo transcript flags rare guests vs Sunday brunch (an exact sentence), never the weekend late night.
const demoQuick: QuickAnswers = { ...Q, bedtime: '23:00–00:00', guests: '1–2', overnight: 'Never', noise: 'Quiet talking', smoking: 'Never', wfh: '1–2' };
const flags = contradictions(demoQuick, FULL);
assert.equal(flags.length, 1);
assert.equal(flags[0].key, 'guests');
assert.equal(flags[0].quick, '1–2');
assert.equal(flags[0].voice, 'Then I usually have people over for brunch.');
assert.ok(FULL.includes(flags[0].voice) && flags[0].voice === flags[0].voice.trim());
assert.ok(flags[0].question.endsWith('?') && !/you said|claim|lied|but you/i.test(flags[0].question));
assert.deepEqual(contradictions({ ...demoQuick, guests: '6–10' }, FULL), []);
assert.deepEqual(contradictions({ ...demoQuick, guests: '6–10', bedtime: 'Before 22:00' }, FULL), []); // weekend-only late nights
assert.deepEqual(contradictions({ ...demoQuick, guests: '6–10', wfh: '0' }, FULL), []);
const late2 = 'Weeknights I’m usually up until 2 a.m. gaming.\nI don’t smoke. My partner stays over most weeks. I practice the guitar in the evenings.  I work from home on Mondays.';
const c2 = contradictions({ ...demoQuick, guests: '6–10', bedtime: 'Before 22:00', wfh: '0', noise: 'Silent' }, late2);
assert.deepEqual(c2.map((c) => c.key), ['bedtime', 'overnight', 'noise', 'wfh']);
assert.equal(c2[0].voice, 'Weeknights I’m usually up until 2 a.m. gaming.');
assert.equal(c2[1].voice, 'My partner stays over most weeks.');
assert.equal(c2[3].voice, 'I work from home on Mondays.');
assert.ok(c2.every((c) => late2.includes(c.voice)));
assert.deepEqual(contradictions({ ...demoQuick, smoking: 'Never' }, 'I smoke on the fire escape sometimes.').map((c) => c.key), ['smoking']);
assert.deepEqual(contradictions({ ...demoQuick, smoking: 'Never' }, 'I never smoke. I hate the smell of weed.'), []);
assert.deepEqual(contradictions(demoQuick, ''), []);

// tags: 3 short habit tags.
const t = tags(Q);
assert.equal(t.length, 3);
assert.ok(t.every((x) => typeof x === 'string' && x.length > 0 && x.length <= 22));
assert.deepEqual(tags({ bedtime: 'After 01:00', wake: 'After 09:00', smoking: 'Never', cleaning: '2' }), ['Night owl', 'Sleeps in', 'Never smokes']);
assert.deepEqual(tags({ bedtime: 'Before 22:00', wake: 'Before 06:00', cleaning: '5 or more', smoking: 'Never' }), ['Early to bed', 'Cleans daily', 'Early riser']);
assert.deepEqual(tags({}), []);
assert.equal(tags({ wfh: '5 or more' })[0], 'Works from home');

// draftAgreement: every line comes from the two people's answers (stricter one wins), rentEach is quoted, thermostat stays open.
const a = person(80, { bedtime: '22:00–23:00', wake: '07:00–08:00', guests: '3–5', overnight: 'About once a week', cleaning: '1', dishes: 'The same day', noise: 'Music or TV, low', smoking: 'Outside only' });
const b = person(81, { bedtime: '23:00–00:00', wake: '06:00–07:00', guests: '1–2', overnight: 'Never', cleaning: '2', dishes: 'The next day', noise: 'Quiet talking', smoking: 'Never' });
const ag = draftAgreement(a, b, '$1,725 / mo each');
assert.deepEqual(ag.sections.map((s) => [s.icon, s.title]), [['moon', 'Quiet hours'], ['users', 'Guests'], ['spray-can', 'Chores'], ['volume-2', 'Noise'], ['cigarette', 'Smoking'], ['wallet', 'Bills']]);
const text = Object.fromEntries(ag.sections.map((s) => [s.title, s.text]));
assert.equal(text['Quiet hours'], 'Weeknights 23:00 – 08:00');
assert.equal(text.Guests, 'Up to 2 guests a month. No overnight guests.');
assert.equal(text.Chores, 'Shared spaces cleaned twice a week. Dishes washed the same day.');
assert.equal(text.Noise, 'Quiet talking on weeknights');
assert.equal(text.Smoking, 'No smoking or cannabis at home');
assert.ok(text.Bills.startsWith('Rent split 50/50 ($1,725 / mo each)'));
assert.deepEqual(draftAgreement(b, a, '$1,725 / mo each').sections, ag.sections);
assert.ok(ag.open.length >= 2 && ag.open.length <= 3 && ag.open.at(-1) === 'Thermostat in winter: what temperature?');
assert.equal(ag.open[0], 'Overnight guests: how often, and how much notice?');
assert.ok(ag.open.every((q) => q.endsWith('?')));
assert.deepEqual(draftAgreement(me, person(82), '$1,500 / mo each').open, ['Thermostat in winter: what temperature?']);
const dealbreak = draftAgreement(person(83, { smoking: 'Sometimes inside' }, pre({}, ['No smoking/vaping indoors'])), person(84, { smoking: 'Sometimes inside' }), '$1');
assert.equal(dealbreak.sections.find((s) => s.title === 'Smoking')!.text, 'Smoking and cannabis outside only');
const blank = draftAgreement({ ...me, quick: {} }, { ...me, id: 85, quick: {} }, '$1');
assert.deepEqual(blank.sections.map((s) => s.title), ['Bills']);
const banned = /\b(age|gender|race|religion|ethnic|nationality|male|female|woman|man|straight|gay)\b/i;
for (const s of [...ag.sections.map((s) => s.text), ...ag.open, ...ex.click, ...ex.clash, ...t, ...flags.map((f) => f.question)]) assert.ok(!banned.test(s), s);

console.log('OK');
