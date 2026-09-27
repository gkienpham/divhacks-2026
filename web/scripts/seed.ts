// Seeds 150 labeled synthetic profiles (docs/PROJECT.md §6 "Seed data"), deterministically. Run from web/:
//   npx tsx --env-file=.env.local --conditions=react-server scripts/seed.ts
// One transaction drops every synthetic profile (and the matches touching one) and inserts fresh ones. People come from
// one fixed-seed PRNG and saved listings from a second, so a listings re-pull can move saved zpids (and the areas and
// lines read off them) but never the answers or transcripts.
// Exactly 20 transcripts carry a planted contradiction (the eval set, §7): the run aborts before writing unless
// lib/signals.ts flags exactly those 20 sentences and nothing else.
import assert from 'node:assert/strict';
import { getPool } from '../lib/db';
import { BUDGETS, DEALBREAKERS, PRESCREEN, QUICK, SEE_PREFS, SUBWAY_LINES, type Prescreen, type PrescreenId, type QuickAnswers, type QuickKey } from '../lib/questions';
import { contradictions } from '../lib/signals';

const mulberry32 = (a: number) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
type Rnd = () => number;
const rnd = mulberry32(20260927), lrnd = mulberry32(1380); // people; saved listings
const pick = <T>(xs: readonly T[], r: Rnd = rnd) => xs[Math.floor(r() * xs.length)];
const weighted = (ws: readonly number[], r: Rnd = rnd) => {
  let x = r() * ws.reduce((s, w) => s + w, 0);
  const i = ws.findIndex((w) => (x -= w) < 0);
  return i < 0 ? ws.length - 1 : i;
};
const shuffle = <T>(xs: readonly T[], r: Rnd = rnd) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

type Single = Exclude<QuickKey, 'sleepNoise'>;
type Idx = Record<Single, number>; // option index per single-choice quick question
const PRE = Object.fromEntries(PRESCREEN.map((g) => [g.id, g.opts])) as unknown as Record<PrescreenId, readonly string[]>;
const SLEEP = QUICK.find((q) => q.k === 'sleepNoise')!.opts;

const NAMES = [
  'Aarav', 'Abebe', 'Adaeze', 'Adriana', 'Aiko', 'Aisha', 'Alejandro', 'Alessia', 'Amara', 'Amir',
  'Anders', 'Anika', 'Arjun', 'Astrid', 'Ayla', 'Bashir', 'Beatriz', 'Bilal', 'Björn', 'Bruno',
  'Camila', 'Chidi', 'Chloé', 'Dalia', 'Daniel', 'Darius', 'Dev', 'Diego', 'Dilnoza', 'Elif',
  'Elena', 'Emeka', 'Emil', 'Esme', 'Farah', 'Fatima', 'Felix', 'Freya', 'Gabriel', 'Giulia',
  'Hamza', 'Hana', 'Hiroshi', 'Inés', 'Ingrid', 'Isaac', 'Ivan', 'Jae', 'Jamal', 'Javier',
  'Jia', 'João', 'Jonah', 'José', 'Kaito', 'Kalani', 'Kavya', 'Kemal', 'Kofi', 'Lakshmi',
  'Lars', 'Leila', 'Lena', 'Liam', 'Luca', 'Lucía', 'Mai', 'Malik', 'Mateo', 'Maya',
  'Mehmet', 'Mira', 'Nadia', 'Naveen', 'Nia', 'Niko', 'Noor', 'Olga', 'Omar', 'Oren',
  'Paolo', 'Priya', 'Rafael', 'Rania', 'Ravi', 'Rosa', 'Ruth', 'Sade', 'Samir', 'Santiago',
  'Sara', 'Selin', 'Shira', 'Sione', 'Sofia', 'Tariq', 'Thabo', 'Tomás', 'Uma', 'Valentina',
  'Victor', 'Wanjiru', 'Wei', 'Xavier', 'Yara', 'Yusuf', 'Zainab', 'Zara', 'Zhen', 'Zoë',
  'Aditi', 'Akosua', 'Andrés', 'Ari', 'Bea', 'Carmen', 'Cyrus', 'Dara', 'Eitan', 'Emre',
  'Femi', 'Gia', 'Hugo', 'Ifeoma', 'Ilya', 'Imani', 'Jun', 'Kenji', 'Keira', 'Lina',
  'Lior', 'Marco', 'Marisol', 'Minh', 'Nikhil', 'Nadim', 'Oscar', 'Pablo', 'Rhea', 'Rohan',
  'Sakura', 'Seun', 'Hyun', 'Tenzin', 'Theo', 'Tiago', 'Yasmin', 'Yuki', 'Zeynep', 'Leon',
];

// Transcript phrases by option index. Kept clear of lib/signals.ts trigger words unless the answer agrees.
const WAKE = ['around 5:30', 'at 6:30', 'around 7:30', 'around 8:30', 'around ten'];
const BED = ['in bed before ten', 'in bed around 10:30', 'in bed around 11:30', 'in bed around 12:30', 'in bed around two'];
const STUDY = ["I'm on campus all day", "I'm on campus most days", 'I study at home three or four days a week', 'I study from home most days'];
const OFFICE = ["I'm in the office by eight", "I'm in the office four days a week", 'I work from home a few days a week', 'I work from home full time'];
const SOCIAL = [ // by guests
  ['Quiet recharge, definitely; home is where I decompress.', 'Quiet recharge; I see people out, and home is for resting.'],
  ['Mostly quiet recharge, though I like a chat in the kitchen.', "Quiet recharge, but I'm not a hermit."],
  ['A bit of both; someone comes by most weeks, but I need quiet nights too.', 'Somewhere in the middle, with a small dinner now and then and plenty of quiet evenings.'],
  ["Social hub, honestly; I like a full apartment and I'm usually planning the next dinner.", 'More social hub than not; friends come by a couple of times a week.'],
  ['Social hub all the way; there is almost always someone around for dinner or a game night.', 'Definitely social hub; my door is basically always open.'],
];
const PROBLEM = [
  "I'd rather bring things up early and in person than let them build.",
  'I send a quick heads-up text first, then we talk it through face to face.',
  'I bring it up the same day, calmly, and I come with a fix, not just a complaint.',
  "I'm direct but friendly; I'll knock and ask if you have five minutes.",
  "I'm a bit conflict-shy, so I write down what I want to say first.",
  'I like a short weekly check-in so small stuff never turns into a big thing.',
  'I try to raise it over dinner, when nobody feels cornered.',
];
const EXTRA: Partial<Record<Single, (string | null)[]>> = { // one optional habit sentence, true to the answer
  cleaning: ['Cleaning is not my strong suit, so I like a clear chore split.', 'I do one proper clean a week, usually on Sunday.', 'I clean the kitchen and bathroom about twice a week.', 'I tidy the shared spaces a few times a week.', 'I wipe down the kitchen every night; it helps me switch off.'],
  dishes: ['I wash my dishes right after I eat.', 'My dishes get done before bed.', 'Sometimes my dishes wait until the next morning.', 'I let dishes stack up a bit, then do them all at once.'],
  noise: ['I like the apartment really quiet in the evenings.', 'Evenings at home are pretty quiet for me.', 'I usually have a show or music on low in the evenings.', 'I play guitar most evenings and like my music loud.'],
  wfh: [null, 'I work from home on Fridays.', 'I work from home a few days a week.', "I work from home full time, so I'm around during the day."],
};

interface Arch {
  key: string;
  n: number;
  q: Record<Single, number[]>; // weights over each question's options (low → high)
  budget: number[]; // weights over BUDGETS
  see: number[]; // weights over SEE_PREFS
  night?: number; // share on night shifts (bed and wake both last option)
  where: string[][];
  places: { school?: string; areas: string[] }[];
  sunday: string[];
  crazy: string[];
  day: (i: Idx, plant: QuickKey | null) => string; // "Your typical weekday"; drops the clause a plant contradicts
  extras: Single[];
}
const ARCH: Arch[] = [
  {
    key: 'early-cook', n: 19, budget: [0.3, 4, 5, 2, 0.3], see: [6, 1, 3],
    q: { bedtime: [5, 5, 1, 0, 0], wake: [4, 6, 1, 0, 0], cleaning: [0, 0, 2, 6, 2], dishes: [7, 2, 0, 0], guests: [1, 5, 3, 0, 0], overnight: [5, 3, 1, 0], noise: [1, 6, 2, 0], wfh: [3, 4, 2, 0], smoking: [1, 0, 0, 0] },
    where: [['Quiet residential', 'Anywhere near transit'], ['Near my school/work', 'Anywhere near transit'], ['Quiet residential']],
    places: [{ school: 'Hudson Yards', areas: ['Astoria', 'Sunnyside', 'Ridgewood'] }, { school: 'Downtown Brooklyn', areas: ['Crown Heights', 'Prospect Heights', 'Flatbush'] }, { school: 'Midtown', areas: ['Astoria', 'Sunnyside', 'Jackson Heights'] }],
    sunday: ['A perfect Sunday is the farmers market in the morning, then meal prep with a podcast on.', 'My ideal Sunday starts with a long run, then a big pot of soup and a load of laundry.', 'On a perfect Sunday I bake bread, water my plants, and read on the couch.', 'Sunday is a slow breakfast, a walk to the market, and cooking something that takes all afternoon.'],
    crazy: ['Dishes left in the sink overnight drive me crazy.', 'It drives me crazy when someone eats my meal prep without asking.', 'Crumbs all over the counter drive me up the wall.', 'Wet towels on the bathroom floor drive me crazy.'],
    day: (i, p) => `I'm up ${WAKE[i.wake]} and ${pick(['get a run in before work', 'hit the gym before work', 'make a proper breakfast before work'])}${p === 'bedtime' ? '' : `, and I'm ${BED[i.bedtime]}`}.`,
    extras: ['cleaning', 'dishes', 'wfh'],
  },
  {
    key: 'night-owl-creative', n: 16, budget: [0.5, 5, 4, 1, 0.2], see: [3, 2, 5],
    q: { bedtime: [0, 0, 1, 5, 5], wake: [0, 0, 1, 5, 4], cleaning: [1, 5, 3, 1, 0], dishes: [0, 3, 5, 2], guests: [0, 2, 5, 2, 0], overnight: [2, 4, 2, 1], noise: [0, 1, 5, 3], wfh: [1, 3, 4, 3], smoking: [6, 3, 0.5, 0] },
    where: [['Anywhere near transit', 'Downtown'], ['Anywhere near transit'], ['Near my school/work', 'Anywhere near transit']],
    places: [{ school: 'Pratt', areas: ['Bedford-Stuyvesant', 'Bushwick', 'Crown Heights'] }, { school: 'Parsons', areas: ['Bushwick', 'Ridgewood', 'Williamsburg'] }, { school: 'School of Visual Arts', areas: ['Greenpoint', 'Bushwick', 'Ridgewood'] }],
    sunday: ['A perfect Sunday is sleeping in, a late bagel, and a few hours at my drawing table.', 'My ideal Sunday is a slow start and working on a painting until the light goes.', 'Sunday means sleeping until noon, then editing photos with a big coffee.', 'On Sundays I sleep in, wander a flea market, and sketch in the afternoon.'],
    crazy: ['Passive-aggressive notes on the fridge drive me crazy.', 'It drives me crazy when someone treats the living room like a storage unit.', 'It drives me crazy when someone moves my stuff without asking.'],
    day: (i) => `I'm up ${WAKE[i.wake]}, ${pick(['I freelance from a café in the afternoon', 'I work on commissions in the afternoon', 'I teach a drawing class in the afternoon'])}, and I'm ${BED[i.bedtime]}.`,
    extras: ['noise', 'dishes', 'wfh'],
  },
  {
    key: 'social-host', n: 16, budget: [0.2, 3, 5, 3, 0.5], see: [3, 3, 4],
    q: { bedtime: [0, 1, 5, 4, 1], wake: [0, 1, 5, 3, 1], cleaning: [0, 2, 5, 3, 0], dishes: [2, 6, 2, 0], guests: [0, 0, 2, 5, 3], overnight: [1, 4, 3, 1], noise: [0, 1, 5, 4], wfh: [3, 5, 2, 0], smoking: [6, 2, 0, 0] },
    where: [['Downtown', 'Anywhere near transit'], ['Downtown'], ['Near my school/work', 'Downtown']],
    places: [{ school: 'Union Square', areas: ['East Village', 'Lower East Side', 'Williamsburg'] }, { areas: ['Bedford-Stuyvesant', 'Crown Heights'] }, { areas: ['Astoria', 'Bushwick'] }, { school: 'Flatiron', areas: ['Williamsburg', 'Greenpoint', 'East Village'] }],
    sunday: ['A perfect Sunday is a big brunch at my place and a lazy walk in the park after.', 'My ideal Sunday ends with six friends around my table and a huge pot of pasta.', "On a perfect Sunday I cook something big and whoever's free comes over."],
    crazy: ["It drives me crazy when someone leaves the kitchen a mess right after I've cleaned it.", 'Roommates who never replace the toilet paper drive me crazy.', 'It drives me crazy when the trash is overflowing and nobody takes it out.'],
    day: (i) => `I'm up ${WAKE[i.wake]}, at work by ten, and most evenings I'm out at a class or a dinner; I'm usually ${BED[i.bedtime]}.`,
    extras: ['noise', 'cleaning', 'wfh'],
  },
  {
    key: 'quiet-grad', n: 21, budget: [0.3, 5, 5, 1.5, 0.2], see: [6, 1, 3],
    q: { bedtime: [1, 5, 5, 1, 0], wake: [0, 2, 6, 3, 0], cleaning: [0, 2, 6, 2, 0], dishes: [5, 4, 1, 0], guests: [4, 5, 1, 0, 0], overnight: [7, 2, 0.5, 0], noise: [4, 5, 1, 0], wfh: [0, 2, 5, 3], smoking: [1, 0, 0, 0] },
    where: [['Near my school/work', 'Quiet residential'], ['Near my school/work'], ['Near my school/work', 'Anywhere near transit']],
    places: [
      { school: 'Columbia University', areas: ['Morningside Heights', 'Harlem', 'Upper West Side', 'Washington Heights'] },
      { school: 'Columbia University', areas: ['Harlem', 'Washington Heights', 'Upper West Side'] },
      { school: 'NYU', areas: ['East Village', 'Lower East Side', 'Williamsburg', 'Bushwick'] },
      { school: 'Fordham University', areas: ['Fordham', 'Kingsbridge'] },
      { school: 'CUNY Graduate Center', areas: ['Astoria', 'Long Island City', 'Sunnyside'] },
      { school: 'The New School', areas: ['Greenpoint', 'Williamsburg', 'Bushwick'] },
    ],
    sunday: ['A perfect Sunday is coffee, the crossword, and a few quiet hours of reading.', 'My ideal Sunday is a long walk along the river and then catching up on reading.', 'On a perfect Sunday I make pancakes, do laundry, and read in a quiet corner.', 'Sunday is the library in the morning and a slow dinner at home.'],
    crazy: ['Borrowing things without asking drives me crazy.', 'It drives me crazy when the front door gets left unlocked.', 'Lights and the AC left on all day drive me crazy.', 'It drives me crazy when someone uses the last of the coffee and says nothing.'],
    day: (i, p) => `I'm up ${WAKE[i.wake]}, ${STUDY[i.wfh]}${p === 'bedtime' ? '' : `, and I'm ${BED[i.bedtime]}`}.`,
    extras: ['noise', 'cleaning', 'dishes'],
  },
  {
    key: 'remote-worker', n: 17, budget: [0.2, 4, 5, 2.5, 0.3], see: [6, 1, 3],
    q: { bedtime: [0, 3, 6, 2, 0], wake: [0, 1, 5, 4, 1], cleaning: [0, 1, 5, 4, 1], dishes: [5, 4, 1, 0], guests: [1, 5, 3, 0, 0], overnight: [3, 4, 2, 0], noise: [2, 6, 2, 0], wfh: [0, 0, 2, 8], smoking: [1, 0, 0, 0] },
    where: [['Quiet residential', 'Anywhere near transit'], ['Quiet residential']],
    places: [{ areas: ['Ridgewood', 'Astoria', 'Sunnyside'] }, { areas: ['Crown Heights', 'Flatbush', 'Prospect Heights'] }, { areas: ['Greenpoint', 'Bushwick'] }, { areas: ['Jackson Heights', 'Sunnyside', 'Astoria'] }],
    sunday: ['A perfect Sunday is a long walk, a new recipe, and no screens at all.', "My ideal Sunday gets me out of the apartment, since I'm home most of the week, and ends with a quiet dinner.", 'On Sundays I do a big grocery run and cook for the week.'],
    crazy: ['It drives me crazy when someone cranks the heat without asking.', 'A messy kitchen in the middle of my workday drives me crazy.', "It drives me crazy when shared stuff migrates into someone's room."],
    day: (i) => `I'm up ${WAKE[i.wake]}, ${OFFICE[i.wfh]}, and I close the laptop around six.`,
    extras: ['noise', 'cleaning', 'dishes'],
  },
  {
    key: 'shift-nurse', n: 12, budget: [0.5, 4, 5, 2, 0.2], see: [7, 0.5, 2.5], night: 0.35,
    q: { bedtime: [8, 2, 0, 0, 0], wake: [9, 1, 0, 0, 0], cleaning: [0, 1, 5, 4, 1], dishes: [4, 5, 1, 0], guests: [3, 6, 1, 0, 0], overnight: [5, 3, 1, 0], noise: [5, 4, 1, 0], wfh: [1, 0, 0, 0], smoking: [1, 0, 0, 0] },
    where: [['Near my school/work', 'Anywhere near transit'], ['Near my school/work']],
    places: [{ school: 'Mount Sinai', areas: ['Harlem', 'Upper East Side', 'Astoria'] }, { school: 'NewYork-Presbyterian', areas: ['Washington Heights', 'Harlem', 'Kingsbridge'] }, { school: 'NYU Langone', areas: ['Long Island City', 'Sunnyside', 'Astoria'] }, { school: 'Kings County Hospital', areas: ['Flatbush', 'Crown Heights', 'Prospect Heights'] }],
    sunday: ['A perfect Sunday off is sleeping in, a long shower, and cooking something real for once.', 'On a perfect Sunday I do nothing at all: couch, a movie, and takeout.', 'My ideal Sunday is a slow walk in the park and an early dinner.'],
    crazy: ["It drives me crazy when someone vacuums while I'm sleeping after a shift.", 'Shared groceries disappearing without a word drive me crazy.', 'It drives me crazy when someone leaves hair in the drain.'],
    day: (i, p) => i.bedtime === 4
      ? `I work three night shifts a week, so I sleep late and I'm ${BED[4]}.`
      : `I work three twelve-hour shifts a week, so on work days I'm up ${WAKE[i.wake]}${p === 'bedtime' ? '' : ` and ${BED[i.bedtime]}`}.`,
    extras: ['cleaning', 'dishes', 'noise'],
  },
  {
    key: 'young-professional', n: 15, budget: [0, 1, 3, 6, 4], see: [5, 1, 4],
    q: { bedtime: [0, 2, 6, 3, 0], wake: [1, 6, 3, 0, 0], cleaning: [1, 4, 4, 1, 0], dishes: [2, 5, 3, 0], guests: [0, 3, 4, 1, 0], overnight: [2, 4, 3, 1], noise: [1, 5, 3, 0], wfh: [3, 6, 1, 0], smoking: [6, 1, 0, 0] },
    where: [['Near my school/work', 'Downtown'], ['Anywhere near transit', 'Downtown'], ['Near my school/work', 'Anywhere near transit']],
    places: [{ school: 'Hudson Yards', areas: ['Upper West Side', 'Long Island City', 'Astoria'] }, { school: 'Financial District', areas: ['Williamsburg', 'Lower East Side', 'East Village'] }, { school: 'Midtown East', areas: ['Upper East Side', 'Long Island City', 'Greenpoint'] }, { school: 'Flatiron', areas: ['East Village', 'Williamsburg', 'Greenpoint'] }],
    sunday: ['A perfect Sunday is a late breakfast, the gym, and getting my week organized.', 'My ideal Sunday is a long run along the river, a big breakfast, and an early night.', 'On Sundays I sleep in a little, meal prep, and plan out my week.'],
    crazy: ['It drives me crazy when someone leaves wet laundry in the machine for a day.', 'Packages piling up by the door drive me crazy.', "It drives me crazy when bills don't get paid on time."],
    day: (i, p) => `I'm up ${WAKE[i.wake]}, ${p === 'wfh' ? 'I check email over coffee' : OFFICE[i.wfh]}, and after work it's the gym or a quick dinner; I'm ${BED[i.bedtime]}.`,
    extras: ['cleaning', 'dishes'],
  },
  {
    key: 'late-shift-cook', n: 10, budget: [0.5, 6, 3, 0.5, 0], see: [4, 2, 4],
    q: { bedtime: [0, 0, 0, 2, 8], wake: [0, 0, 0, 3, 7], cleaning: [0, 2, 5, 3, 0], dishes: [3, 5, 2, 0], guests: [1, 5, 3, 0, 0], overnight: [2, 5, 2, 1], noise: [1, 5, 3, 0], wfh: [9, 1, 0, 0], smoking: [4, 5, 1, 0] },
    where: [['Anywhere near transit'], ['Anywhere near transit', 'Downtown']],
    places: [{ areas: ['Bushwick', 'Ridgewood', 'Bedford-Stuyvesant'] }, { areas: ['Harlem', 'Washington Heights'] }, { areas: ['Crown Heights', 'Bedford-Stuyvesant', 'Flatbush'] }],
    sunday: ['Sunday is my day off, so perfect is sleeping in and cooking something slow just for me.', 'A perfect Sunday is a late breakfast, a long bike ride, and cooking only for myself.'],
    crazy: ['It drives me crazy when someone puts my good knives in the dishwasher.', 'Grease left on the stove drives me crazy.', 'It drives me crazy when someone leaves the fridge door open.'],
    day: (i) => `I work dinner service, so I'm up ${WAKE[i.wake]}, at the restaurant by three, and home after midnight.`,
    extras: ['cleaning', 'noise', 'dishes'],
  },
  {
    key: 'budget-undergrad', n: 14, budget: [2, 7, 3, 0, 0], see: [4, 2, 4],
    q: { bedtime: [0, 1, 4, 5, 3], wake: [0, 1, 4, 4, 1], cleaning: [1, 5, 4, 1, 0], dishes: [1, 3, 4, 2], guests: [0, 3, 5, 2, 0], overnight: [3, 4, 2, 0], noise: [0, 3, 5, 2], wfh: [2, 5, 3, 1], smoking: [7, 2, 0, 0] },
    where: [['Near my school/work', 'Anywhere near transit'], ['Near my school/work']],
    places: [
      { school: 'City College', areas: ['Harlem', 'Washington Heights'] },
      { school: 'Hunter College', areas: ['Harlem', 'Astoria', 'Upper East Side'] },
      { school: 'Fordham University', areas: ['Fordham', 'Kingsbridge', 'Mott Haven'] },
      { school: 'Brooklyn College', areas: ['Flatbush', 'Crown Heights'] },
      { school: 'Pratt', areas: ['Bedford-Stuyvesant', 'Crown Heights', 'Bushwick'] },
      { school: 'Wagner College', areas: ['St. George'] },
      { school: 'Columbia University', areas: ['Harlem', 'Washington Heights', 'Morningside Heights'] },
    ],
    sunday: ['A perfect Sunday is sleeping in, a cheap diner breakfast, and studying at home.', 'My ideal Sunday is pickup basketball in the morning and homework in the afternoon.', 'Sunday is laundry, a long phone call, and catching up on assignments.'],
    crazy: ['It drives me crazy when someone puts an empty milk carton back in the fridge.', 'Hair in the shower drain drives me crazy.', 'It drives me crazy when people borrow my charger and never give it back.'],
    day: (i) => `I'm up ${WAKE[i.wake]}, ${STUDY[i.wfh]}, and I work a campus job two afternoons a week; I'm ${BED[i.bedtime]}.`,
    extras: ['cleaning', 'dishes', 'noise'],
  },
  {
    key: 'early-teacher', n: 10, budget: [0.5, 6, 4, 1, 0], see: [6, 1, 3],
    q: { bedtime: [6, 4, 0, 0, 0], wake: [5, 5, 0, 0, 0], cleaning: [0, 1, 5, 3, 0], dishes: [5, 4, 1, 0], guests: [2, 6, 2, 0, 0], overnight: [5, 4, 1, 0], noise: [3, 6, 1, 0], wfh: [1, 0, 0, 0], smoking: [1, 0, 0, 0] },
    where: [['Quiet residential', 'Anywhere near transit'], ['Quiet residential']],
    places: [{ areas: ['Sunset Park', 'Flatbush', 'Crown Heights'] }, { areas: ['Jackson Heights', 'Sunnyside', 'Astoria'] }, { areas: ['Washington Heights', 'Harlem', 'Kingsbridge'] }, { areas: ['Mott Haven', 'Fordham', 'Kingsbridge'] }, { areas: ['St. George'] }],
    sunday: ['A perfect Sunday is grading on the couch with coffee, then a long walk.', 'My ideal Sunday is a morning bike ride, a nap, and planning lessons for the week.'],
    crazy: ['It drives me crazy when dishes soak in the sink for days.', 'Leaving the front door unlocked drives me crazy.', 'It drives me crazy when the bathroom never gets cleaned.'],
    day: (i, p) => `I'm up ${WAKE[i.wake]}, at school by 7:45${p === 'bedtime' ? '' : `, and ${BED[i.bedtime]} most nights`}.`,
    extras: ['cleaning', 'dishes', 'noise'],
  },
];

// The eval set: [question, forced option index (at most), archetypes it fits, one sentence per planted profile].
const PLANTS: [Single, number, string[], string[]][] = [
  ['guests', 1, ['quiet-grad', 'remote-worker', 'shift-nurse', 'early-teacher', 'early-cook'], ['I have friends over for brunch most weekends.', 'I have friends over for dinner almost every Friday.', 'Most Saturdays I have people over to watch the game.', "I love hosting, so there's usually a dinner at my place a few times a week."]],
  ['bedtime', 1, ['early-cook', 'early-teacher', 'quiet-grad'], ['On weeknights I usually stay up past midnight.', "I'm a night owl, even on weeknights.", 'Most nights I stay up until two, reading or gaming.', "I'm usually up late editing photos, often until 2 am."]],
  ['smoking', 0, ['early-cook', 'young-professional', 'quiet-grad', 'remote-worker'], ['I smoke on the fire escape after dinner.', 'I smoke a cigarette by the window when I get home.', 'I smoke on the fire escape most evenings.']],
  ['overnight', 0, ['quiet-grad', 'shift-nurse', 'early-teacher', 'early-cook'], ['My partner stays over a few nights a week.', 'My partner usually stays over on weekends.', 'My partner stays over most Fridays and Saturdays.']],
  ['noise', 0, ['quiet-grad', 'remote-worker', 'shift-nurse'], ['I practice guitar most evenings.', 'I practice piano for an hour most evenings.', 'I practice trumpet most evenings after work.']],
  ['wfh', 0, ['young-professional', 'early-cook'], ['I work from home most days.', 'I work from home four days a week.', "Most weeks I work from home, so I'm around during the day."]],
];
const MOVE_IN = [ // by move option, relative to 2026-09-27
  ['2026-09-30', '2026-10-01', '2026-10-03'],
  ['2026-10-01', '2026-10-10', '2026-10-15', '2026-10-24'],
  ['2026-11-01', '2026-11-15', '2026-12-01', '2026-12-15'],
  ['2026-10-15', '2026-11-01', '2026-12-01', '2027-01-01'],
  ['2026-10-18', '2026-11-07', '2026-11-20', '2026-12-12', '2027-01-02'],
];
const LEASE_MONTHS = [1, 6, 12, 24];
const LINES: Record<string, string[]> = { // SUBWAY_LINES serving each searched area; the rest have none of the five
  Astoria: ['N/W'], 'Bedford-Stuyvesant': ['A'], Bushwick: ['L'], 'Crown Heights': ['A'], 'East Village': ['L'], Greenpoint: ['L'],
  Harlem: ['A', '1'], 'Jackson Heights': ['7'], Kingsbridge: ['1'], 'Long Island City': ['7', 'N/W'], 'Morningside Heights': ['1'],
  Ridgewood: ['L'], Sunnyside: ['7'], 'Sunset Park': ['N/W'], 'Upper West Side': ['1'], 'Washington Heights': ['A', '1'], Williamsburg: ['L'],
};
const SKIPPABLE: QuickKey[] = ['sleepNoise', 'wfh', 'overnight', 'dishes', 'noise'];

assert.equal(new Set(NAMES).size, 150);
assert.equal(ARCH.reduce((s, a) => s + a.n, 0), 150);

// 1. People: archetype answers with per-person noise.
const folks = shuffle(ARCH.flatMap((a) => Array<Arch>(a.n).fill(a))).map((a, n) => {
  const i = Object.fromEntries(QUICK.filter((q) => q.k !== 'sleepNoise').map((q) => [q.k, weighted(a.q[q.k as Single])])) as Idx;
  if (a.night && rnd() < a.night) i.bedtime = i.wake = 4;
  const sleep = [[3], [4], [0], [1], [2], [0, 2], [5]][weighted([55, 12, 13, 8, 7, 3, 2])].map((k) => SLEEP[k]);
  const place = pick(a.places);
  let where = pick(a.where).filter((w) => w !== 'Near my school/work' || place.school);
  if (!where.length) where = ['Anywhere near transit'];
  const b = weighted(a.budget);
  // 2-bed rooms under $1,500 are scarce in the listings, so the cheap bands lean to 3+ bed shares; no 3+ bed rents for $2,800+.
  const apt = PRE.apt[weighted([[0, 3, 1], [4, 3, 3], [7.5, 1.2, 1.3], [7.5, 1.2, 1.3], [4, 0, 1]][b])];
  const move = weighted([1.5, 3, 4, 2, 1.5]);
  return {
    name: NAMES[n], a, i, sleep, place, where, b, apt, move, moveIn: pick(MOVE_IN[move]),
    see: SEE_PREFS[weighted(a.see)],
    answers: {
      commute: [PRE.commute[weighted(where.includes('Near my school/work') ? [3, 5, 2, 0.5, 0] : [2, 5, 4, 1, 0.3])]],
      walk: [PRE.walk[weighted([2, 5, 2, 1])]],
      private: [PRE.private[weighted([4, 4, 2])]],
      furn: [PRE.furn[weighted([1, 1, 2, 5])]],
      lease: [PRE.lease[weighted([0.5, 1.5, 7, 1.5])]],
      pets: [PRE.pets[weighted([1.6, 0.9, 6, 1.5])]],
    },
    plant: null as { key: Single; text: string } | null,
    skip: [] as QuickKey[],
    saved: [] as string[],
    areas: [] as string[],
  };
});
type Folk = (typeof folks)[number];

// 2. Plants, spread over archetypes (least-planted first; stable sort keeps the shuffle for ties), then ~10% skip one or
// two answers (never a planted one).
const planted: Record<string, number> = {};
for (const [key, max, fit, texts] of PLANTS) {
  const pool = shuffle(folks.filter((p) => !p.plant && fit.includes(p.a.key)));
  for (const text of texts) {
    const p = pool.filter((x) => !x.plant).sort((x, y) => (planted[x.a.key] ?? 0) - (planted[y.a.key] ?? 0))[0];
    p.plant = { key, text };
    p.i[key] = Math.min(p.i[key], max);
    planted[p.a.key] = (planted[p.a.key] ?? 0) + 1;
  }
}
for (const p of shuffle(folks.filter((p) => !p.plant)).slice(0, 15)) p.skip = shuffle(SKIPPABLE).slice(0, rnd() < 0.7 ? 1 : 2);

// 3. Dealbreakers (after plants, which can change smoking) and transcripts.
const people = folks.map((p) => {
  const { a, i } = p, plant = p.plant?.key ?? null;
  const dealbreakers = [
    ...(i.smoking < 2 && rnd() < 0.72 ? [DEALBREAKERS[0]] : []),
    ...(p.answers.pets[0] === 'Need a pet-free home' && rnd() < 0.5 ? [DEALBREAKERS[1]] : []),
  ];
  const lines = [pick(a.sunday), pick(a.crazy), pick(PROBLEM), a.day(i, plant), pick(SOCIAL[i.guests])];
  if (p.plant) lines.splice(plant === 'guests' || plant === 'overnight' ? 5 : 4, 0, p.plant.text);
  else {
    const extra = a.extras.flatMap((k) => EXTRA[k]?.[i[k]] ?? []);
    if (extra.length && rnd() < 0.4) lines.splice(4, 0, pick(extra));
    if (rnd() < 0.2) lines.splice(2, 1); // skipped "How you bring up a problem"
  }
  const quick: QuickAnswers = {};
  for (const q of QUICK) if (!p.skip.includes(q.k)) quick[q.k] = q.k === 'sleepNoise' ? p.sleep : q.opts[i[q.k as Single]];
  if (quick.sleepNoise?.includes('Other')) quick.sleepNoiseOther = 'I sleep with a fan on';
  return { ...p, dealbreakers, quick, transcript: lines.join(' ') };
});

// The detector must flag each planted sentence and nothing else.
for (const p of people) {
  assert.deepEqual(contradictions(p.quick, p.transcript).map((c) => `${c.key}: ${c.voice}`), p.plant ? [`${p.plant.key}: ${p.plant.text}`] : [], p.name);
}
assert.equal(people.filter((p) => p.plant).length, 20);

type Home = { zpid: string; neighborhood: string; beds: number; per_room: number };
const fits = (p: Folk, l: Home) => {
  const band = BUDGETS[p.b];
  return l.per_room >= band.min && (band.max === null || l.per_room <= band.max) && (p.apt === 'Any' || (p.apt === '3+ bed' ? l.beds >= 3 : l.beds === 2));
};

async function main() {
  const c = await getPool().connect();
  try {
    // 4. Saved listings: 2–4 with photos, per-room inside the band, from 1–2 of the person's areas; first pass keeps them apart.
    const { rows: homes } = await c.query<Home>(
      `select zpid, neighborhood, beds::int as beds, price::float8 / greatest(beds, 1) as per_room from listings
       where price > 0 and beds is not null
         and exists (select 1 from jsonb_array_elements_text(images) u where u like 'https://photos.zillowstatic.com/%')
       order by zpid`,
    );
    const byZ = new Map(homes.map((l) => [l.zpid, l]));
    const used = new Set<string>();
    const order = shuffle(people, lrnd);
    for (const p of order) {
      const open = (area: string, all = false) => homes.filter((l) => l.neighborhood === area && fits(p, l) && (all || !used.has(l.zpid)));
      // Areas with room left: the person's place first, then the archetype's other areas, then anywhere.
      const cands = [...new Set([p.place.areas, p.a.places.flatMap((pl) => pl.areas), homes.map((l) => l.neighborhood)].flatMap((xs) => shuffle([...new Set(xs)], lrnd)))]
        .filter((a) => open(a).length);
      const k = 2 + weighted([4, 4, 2], lrnd);
      let areas = cands.slice(0, lrnd() < 0.45 ? 1 : 2);
      if (areas.flatMap((a) => open(a)).length < 2) areas = cands.slice(0, 2);
      let picks = shuffle(areas.flatMap((a) => open(a)), lrnd).slice(0, k);
      if (picks.length < 2) picks = shuffle(areas.flatMap((a) => open(a, true)), lrnd).slice(0, k);
      assert.ok(picks.length >= 2, `${p.name}: no listings fit`);
      p.saved = picks.map((l) => l.zpid);
      p.areas = areas;
      for (const l of picks) used.add(l.zpid);
    }
    // Second pass: ~30 people share a saved listing with someone else ("you both saved"), in pairs and a few threes.
    const shared = new Set<Folk>();
    for (const a of order) {
      if (shared.size >= 30) break;
      if (shared.has(a)) continue;
      for (const z of a.saved) {
        const l = byZ.get(z)!;
        const bs = order.filter((b) => b !== a && !shared.has(b) && b.areas.includes(l.neighborhood) && fits(b, l) && !b.saved.includes(z));
        if (!bs.length) continue;
        for (const b of bs.slice(0, shared.size < 26 && lrnd() < 0.3 ? 2 : 1)) { b.saved[b.saved.length - 1] = z; shared.add(b); }
        shared.add(a);
        break;
      }
    }

    const rows = people.map((p, n) => {
      const areas = [...new Set(p.saved.map((z) => byZ.get(z)!.neighborhood))];
      const lines = SUBWAY_LINES.filter((l) => areas.some((a) => LINES[a]?.includes(l)));
      const answers = { where: p.where, budget: [BUDGETS[p.b].label], apt: [p.apt], move: [PRE.move[p.move]], ...p.answers };
      const prescreen: Prescreen = {
        answers: Object.fromEntries(PRESCREEN.map((g) => [g.id, answers[g.id]])) as Record<PrescreenId, string[]>,
        ...(p.where.includes('Near my school/work') ? { school: p.place.school } : {}),
        ...(p.where.includes('Anywhere near transit') && lines.length ? { lines } : {}),
        ...(PRE.move[p.move] === 'Pick a date' ? { moveDate: p.moveIn } : {}),
        dealbreakers: p.dealbreakers,
      };
      return {
        n, name: p.name, budget_max: BUDGETS[p.b].max, move_in: p.moveIn, lease_months: LEASE_MONTHS[PRE.lease.indexOf(p.answers.lease[0])],
        neighborhoods: areas, dealbreakers: { smoking: p.dealbreakers.includes(DEALBREAKERS[0]), petAllergy: p.dealbreakers.includes(DEALBREAKERS[1]) },
        quick_answers: p.quick, open_transcript: p.transcript, saved_listings: p.saved, prescreen, see_pref: p.see,
      };
    });

    await c.query('begin');
    await c.query(`delete from matches where profile_a in (select id from profiles where is_synthetic) or profile_b in (select id from profiles where is_synthetic)`);
    await c.query('delete from profiles where is_synthetic');
    await c.query(
      `insert into profiles (name, is_synthetic, budget_max, move_in, lease_months, neighborhoods, dealbreakers, quick_answers, open_transcript, saved_listings, prescreen, see_pref)
       select name, true, budget_max, move_in, lease_months, neighborhoods, dealbreakers, quick_answers, open_transcript, saved_listings, prescreen, see_pref
       from jsonb_to_recordset($1::jsonb) as t(n int, name text, budget_max int, move_in date, lease_months int, neighborhoods text[], dealbreakers jsonb,
         quick_answers jsonb, open_transcript text, saved_listings text[], prescreen jsonb, see_pref text)
       order by n`,
      [JSON.stringify(rows)],
    );
    await c.query('commit');

    const tally = (xs: string[]) => Object.fromEntries([...new Set(xs)].map((x) => [x, xs.filter((y) => y === x).length]));
    const savedBy = tally(people.flatMap((p) => p.saved));
    console.log('archetypes', tally(people.map((p) => p.a.key)));
    console.log('budget', tally(people.map((p) => BUDGETS[p.b].label)));
    console.log('apartment', tally(people.map((p) => p.apt)));
    console.log('people sharing a saved listing', people.filter((p) => p.saved.some((z) => savedBy[z] > 1)).length);
    console.log('planted contradictions');
    console.table(people.filter((p) => p.plant).map((p) => ({ name: p.name, archetype: p.a.key, rule: p.plant!.key, quick: p.quick[p.plant!.key], voice: p.plant!.text })));
  } catch (e) {
    await c.query('rollback');
    throw e;
  } finally {
    c.release();
  }
}

main().then(() => console.log(`seeded ${people.length} synthetic profiles`), (e) => { console.error(e); process.exitCode = 1; }).finally(() => getPool().end());
