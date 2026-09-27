// Contract checks from SPEC.md (AC-3 dash ban, AC-4 timing/captures, audio manifest). Exits 1 on any failure.
// npm run check            -> checks what exists so far
// npm run check -- --final -> also requires real VO timing, vo/music/sfx audio
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {LINES} from '../src/script.ts';
import {FPS, LEAD, VO_OFFSET, layoutScenes, type Timing} from '../src/layout.ts';

const final = process.argv.includes('--final');
const fails: string[] = [];
const ok = (cond: unknown, msg: string) => {
  if (!cond) fails.push(msg);
};
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const code = [...walk('src'), ...walk('scripts')].filter((p) => /\.(tsx?|jsx?|css|json)$/.test(p));

// AC-3: no em or en dashes in any copy or code.
for (const p of code) {
  readFileSync(p, 'utf8')
    .split('\n')
    .forEach((line, i) => ok(!/[\u2014\u2013]/.test(line), `dash in ${p}:${i + 1}`));
}

// AC-4: VO timing drives a gapless timeline; every cut lands LEAD before its line (within 1 frame).
const t: Timing = JSON.parse(readFileSync('src/timing.json', 'utf8'));
ok(t.lines.map((l) => l.id).join() === LINES.map((l) => l.id).join(), 'timing.json line ids differ from script.ts');
t.lines.forEach((l, i) => ok(l.text === LINES[i]?.vo, `${l.id} timing text differs from script.ts`));
const {total, scenes} = layoutScenes(t, FPS);
scenes.forEach((sc, i) => {
  ok(sc.dur >= 1.2 * FPS, `${sc.id} is shorter than 1.2 s`);
  if (i === 0) return ok(sc.from === 0, 'first scene must start at frame 0');
  ok(scenes[i - 1].from + scenes[i - 1].dur === sc.from, `gap before ${sc.id}`);
  const line = Math.round((VO_OFFSET + t.lines[i].start) * FPS);
  ok(Math.abs(sc.from + Math.round(LEAD * FPS) - line) <= 1, `${sc.id} cut is not ${LEAD}s before its line`);
});
ok(total / FPS >= 24 && total / FPS <= 31, `total ${(total / FPS).toFixed(2)} s is outside 24 to 31 s`);
if (final) ok(!t.placeholder, 'timing.json is still the placeholder (run npm run gen:vo)');

// Audio manifest: every file it claims exists.
const a: {vo: boolean; music: boolean; sfx: string[]} = JSON.parse(readFileSync('src/audio.json', 'utf8'));
if (a.vo) ok(existsSync('public/audio/vo.mp3'), 'audio.json says vo but public/audio/vo.mp3 is missing');
if (a.music) ok(existsSync('public/audio/music.mp3'), 'audio.json says music but public/audio/music.mp3 is missing');
for (const n of a.sfx) ok(existsSync(`public/audio/sfx/${n}.mp3`), `sfx ${n}.mp3 missing`);
if (final) ok(a.vo && a.music && a.sfx.length > 0, 'final render needs vo, music and sfx');

// Captures referenced by scenes exist (they are gitignored; npm run capture regenerates them).
for (const p of code.filter((x) => x.endsWith('.tsx'))) {
  for (const m of readFileSync(p, 'utf8').matchAll(/captures\/[\w.-]+\.(?:png|jpe?g)/g)) {
    ok(existsSync(join('public', m[0])), `${p} uses ${m[0]}, which doesn't exist (npm run capture)`);
  }
}

console.log(`${scenes.length} scenes, ${(total / FPS).toFixed(2)} s${t.placeholder ? ' (placeholder timing)' : ''}`);
if (fails.length) {
  console.error(fails.map((f) => `FAIL ${f}`).join('\n'));
  process.exit(1);
}
console.log('check ok');
