// Sample people for the matching screens (profiles/matches tables are empty until seed profiles land).
// Every person here is synthetic. Answers are made up; every match %, bar, reason and tag is computed by lib/score.
import { QUESTIONS, rank, clickClash, tags } from '@/lib/score';

// Answers as option indices in QUESTIONS order:
// bedtime, wake, cleaning, dishes, guests, overnight, [sleep noise], noise, work from home, smoking.
const A = ix => Object.fromEntries(QUESTIONS.map((f, j) => [f.k, Array.isArray(ix[j]) ? ix[j].map(i => f.opts[i]) : f.opts[ix[j]]]));
const Q = [3]; // sleep noise: "No one's mentioned it"
const P = (i, n, ix) => ({ id: n.toLowerCase(), i, n, answers: A(ix), pets: 'No pets, fine if roommates do', deal: ['No smoking/vaping indoors'] });

export const ME = { ...P('KP', 'Kien', [2, 2, 2, 1, 1, 1, Q, 1, 1, 0]), id: 'you' };

// Full cards (the swipe stack) first, then the rest of the top 20.
const CARDS = [
  { ...P('SK', 'Sam', [2, 1, 2, 1, 1, 2, Q, 2, 2, 0]), pets: 'Planning to get one', meta: 'Astoria or Bushwick · $1,500–2,000 · Move-in Oct', sum: 'Early riser, cooks most nights, plays music while cooking and likes a social Sunday.', aiClick: ['Same bedtime window', 'Both clean twice a week', 'Both cook at home'], aiClash: ['Sunday brunch guests', 'Music while cooking'], flag: true, saved: [['astoria', '2 BR · Astoria', '$1,725 / room', 'Apartment: Astoria living room'], ['bushwick', '2 BR · Bushwick', '[$1,650] / room', 'Apartment: Bushwick kitchen']] },
  { ...P('JT', 'Jordan', [3, 2, 2, 0, 1, 1, Q, 1, 3, 1]), meta: 'Ridgewood · $1,400–1,800 · Move-in Nov', sum: 'Works from home, keeps a tidy kitchen, goes out on weekends.', saved: [['ridgewood', '2 BR · Ridgewood', '$1,550 / room', 'Apartment: Ridgewood bedroom']] },
  { ...P('MB', 'Morgan', [1, 0, 1, 2, 1, 1, Q, 2, 0, 0]), meta: 'Bushwick · $1,600–2,100 · Move-in Oct', sum: 'Early gym routine, cooks on Sundays, hosts a friend or two a month.', saved: [['bushwick2', '3 BR · Bushwick', '$1,480 / room', 'Apartment: Bushwick living room']] },
  { ...P('TL', 'Taylor', [3, 3, 2, 1, 2, 2, Q, 0, 0, 0]), meta: 'Astoria · $1,500–1,900 · Move-in Dec', sum: 'Night-shift nurse twice a week, quiet at home, has family visit often.', saved: [['astoria2', '2 BR · Astoria', '$1,690 / room', 'Apartment: Astoria kitchen']] },
];
const REST = [
  P('AR', 'Alex', [2, 3, 2, 1, 2, 1, [0], 1, 0, 0]),
  P('RM', 'Robin', [3, 2, 3, 1, 1, 3, Q, 1, 0, 0]),
  P('CJ', 'Casey', [2, 3, 1, 1, 2, 2, Q, 1, 1, 1]),
  P('RD', 'Riley', [1, 2, 2, 0, 1, 1, [1], 3, 0, 0]),
  { ...P('QN', 'Quinn', [4, 3, 4, 3, 1, 2, Q, 1, 1, 0]), pets: 'I have a pet' },
  P('AV', 'Avery', [2, 2, 1, 0, 2, 3, Q, 2, 1, 1]),
  P('DP', 'Drew', [3, 2, 1, 2, 0, 2, Q, 2, 0, 1]),
  P('SH', 'Sky', [1, 1, 4, 1, 1, 0, Q, 3, 0, 0]),
  P('EW', 'Emery', [1, 2, 2, 2, 3, 0, Q, 0, 3, 0]),
  P('PF', 'Parker', [3, 4, 0, 1, 0, 0, Q, 1, 0, 0]),
  P('RG', 'Reese', [0, 1, 1, 2, 4, 0, Q, 2, 1, 0]),
  P('BC', 'Blake', [1, 2, 4, 3, 1, 3, Q, 2, 0, 1]),
  P('KO', 'Kai', [3, 2, 2, 3, 3, 0, [1], 2, 2, 0]),
  P('JL', 'Jamie', [2, 3, 2, 2, 4, 0, [0], 0, 2, 0]),
  P('LS', 'Logan', [3, 2, 0, 3, 3, 1, Q, 0, 2, 1]),
  P('HM', 'Harper', [4, 3, 0, 0, 0, 2, Q, 2, 0, 0]),
];

// Ranked high → low: s = match %, parts = the 10 per-question agreements (the bars), click/clash = rule-based reasons.
/** @template {import('./score').Person} T @param {T[]} people */
const ranked = people => rank(ME, people).map(p => {
  const cc = clickClash(p.parts);
  return { ...p, s: p.pct, ...cc, tags: tags(p.answers), reason: cc.click.slice(0, 2).join(' · ') };
});
export const PEOPLE = ranked([...CARDS, ...REST]);
// The swipe stack: people with full cards (meta, summary, saved listings), in rank order.
export const QUEUE = ranked(CARDS);
export const SHORT = [['AR', 'Alex'], ['RM', 'Robin'], ['CJ', 'Casey']];
// The demo pair used by /matches/[id], /agreement/[matchId] and /locked/[matchId].
export const personById = id => PEOPLE.find(p => p.id === id) || QUEUE[0];
