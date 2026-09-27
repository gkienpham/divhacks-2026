// Music (SPEC FR-4): an ElevenLabs Music instrumental whose drop lands on the S03 cut -> public/audio/music.mp3.
// Run after gen:vo: the section lengths come from the final timing.json. One candidate per seed goes to
// out/music-candidates/. The one whose drop sits closest to where the plan put it is kept, and its head is cut so
// the drop lands on the S03 cut.
// The key is ELEVENLABS_API_KEY from ../web/.env.local, unless already set (node --env-file=<path> scripts/gen-music.ts). Never printed.
import {spawnSync} from 'node:child_process';
import {mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {FPS, layoutScenes, type Timing} from '../src/layout.ts';

const SEEDS = [11, 29];
const VARIANTS = ['deep round sub bass', 'bright plucky synths']; // used instead of seeds if the API rejects a seed with a plan
const POSITIVE = ['modern minimal electronic', 'tech product launch', '120 BPM', 'warm analog synth bass', 'tight kick', 'crisp hi-hats', 'cinematic', 'polished clean mix', 'instrumental'];
const NEGATIVE = ['vocals', 'singing', 'spoken word', 'choir', 'lyrics', 'lo-fi hiss', 'dubstep', 'distortion'];
// [name, positive local styles, negative local styles]. Cuts: S03 (the drop, on the logo reveal), S07, S10.
const SECTIONS: [string, string[], string[]][] = [
  ['Intro', ['tense and sparse', 'filtered pad', 'ticking hi-hats', 'low pulse', 'building'], ['kick drum']],
  ['Drop', ['the drop hits on the first beat', 'full punchy groove', 'warm analog bass', 'confident'], []],
  ['Lift', ['same groove', 'bright arpeggio lift', 'energy up'], []],
  ['Outro', ['resolve', 'drums thin out', 'warm final chord', 'clean ending'], []],
];
// The model rounds the intro up to whole 4-bar phrases: asked for 6.03 s at 120 BPM, both seeds dropped at 8.0 s.
// So the plan starts early enough to make the intro whole phrases, and that extra head is cut off afterwards.
const PHRASE = 8000; // ms, 4 bars at 120 BPM
const SPARE = 500; // ms of music past the video's end, in case the drop comes a little late

if (!process.env.ELEVENLABS_API_KEY) process.loadEnvFile('../web/.env.local');

const run = (cmd: string, ...args: string[]) => {
  const r = spawnSync(cmd, args, {encoding: 'utf8'});
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr}`);
  return r.stdout;
};

const t: Timing = JSON.parse(readFileSync('src/timing.json', 'utf8'));
if (t.placeholder) throw new Error('timing.json is still the placeholder. Run npm run gen:vo first.');
const {total, scenes} = layoutScenes(t, FPS);
const ms = (frames: number) => Math.round((frames * 1000) / FPS);
const cut = (id: string) => ms(scenes.find((sc) => sc.id === id)!.from);
const s03 = cut('S03');
const pre = Math.ceil(s03 / PHRASE) * PHRASE - s03;
const bounds = [0, ...[s03, cut('S07'), cut('S10'), ms(total) + SPARE].map((b) => b + pre)];
const durations = SECTIONS.map((_, i) => bounds[i + 1] - bounds[i]);
if (durations.some((d) => d < 3000)) throw new Error(`every section must be at least 3000 ms, got ${durations.join(', ')}`);
const planned = bounds[1] / 1000; // where the drop should sit in the generated file
const length = bounds[4] / 1000;

const post = (path: string, body: object) =>
  fetch(`https://api.elevenlabs.io${path}`, {
    method: 'POST',
    headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '', 'content-type': 'application/json'},
    body: JSON.stringify(body),
  });
function fail(path: string, status: number, body: string): never {
  console.error(`ElevenLabs ${path} ${status}: ${body}`);
  if (status === 402 || status === 403) console.error('Plan or quota limit: stop and ask the user (SPEC EC-1).');
  else if (path.startsWith('/v1/music?')) console.error('Plan rejected? SPEC EC-1: fall back to prompt + music_length_ms and offset the music in Promo.tsx so its drop lands on S03.');
  process.exit(1);
}

// Seconds where the next `span` windows are loudest compared with the `span` before (RMS per `win` s), searched in [from, to].
function biggestRise(file: string, win: number, from: number, to = Infinity, span = 5): number {
  const af = `asetnsamples=n=${Math.round(44100 * win)},astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-`;
  const db = [...run('ffmpeg', '-hide_banner', '-i', file, '-af', af, '-f', 'null', '-').matchAll(/RMS_level=(\S+)/g)].map((m) =>
    Number.isFinite(Number(m[1])) ? Number(m[1]) : -90,
  );
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  let best = -Infinity;
  let at = from;
  for (let i = Math.max(span, Math.round(from / win)); i + span <= db.length && i * win <= to; i++) {
    const rise = mean(db.slice(i, i + span)) - mean(db.slice(i - span, i));
    if (rise > best) [best, at] = [rise, i * win];
  }
  return at;
}
// The drop: the biggest 0.5 s rise after the first 2 s (a fade-in from silence can out-rise it), refined to 10 ms.
function dropAt(file: string): number {
  const coarse = biggestRise(file, 0.1, 2);
  return Math.round(biggestRise(file, 0.01, coarse - 0.15, coarse + 0.15) * 1000) / 1000;
}
const lengthOf = (file: string) => Number(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file));

console.log(`sections ${durations.join(' + ')} = ${bounds[4]} ms, drop planned at ${planned.toFixed(2)} s, then ${(pre / 1000).toFixed(3)} s of head is cut`);
const planPath = '/v1/music/plan';
const prompt = `Instrumental modern minimal electronic track for a tech product launch, 120 BPM. Tense sparse intro that builds, a punchy drop at ${planned.toFixed(1)} seconds, a bright arpeggio lift, then a warm resolving ending.`;
console.log(`music plan (free): ${length} s`);
const planRes = await post(planPath, {prompt, music_length_ms: bounds[4], model_id: 'music_v1'});
if (!planRes.ok) fail(planPath, planRes.status, await planRes.text());
const skeleton = await planRes.json();
const plan = {
  ...skeleton,
  positive_global_styles: POSITIVE,
  negative_global_styles: NEGATIVE,
  sections: SECTIONS.map(([section_name, positive_local_styles, negative_local_styles], i) => ({
    section_name,
    positive_local_styles,
    negative_local_styles,
    duration_ms: durations[i],
    lines: [],
  })),
};

mkdirSync('out/music-candidates', {recursive: true});
const candidates: {file: string; len: number; drop: number}[] = [];
for (const [i, seed] of SEEDS.entries()) {
  const path = '/v1/music?output_format=mp3_44100_192';
  const body = {composition_plan: plan, model_id: 'music_v1', respect_sections_durations: true};
  console.log(`music seed ${seed}: ${length} s`);
  let res = await post(path, {...body, seed});
  let file = `out/music-candidates/seed-${seed}.mp3`;
  if (res.status === 400 || res.status === 422) {
    const why = await res.text();
    if (!/seed/i.test(why)) fail(path, res.status, why);
    console.log(`  seed rejected with a plan, so varying the styles instead (+ "${VARIANTS[i]}"): ${length} s`);
    res = await post(path, {...body, composition_plan: {...plan, positive_global_styles: [...POSITIVE, VARIANTS[i]]}});
    file = `out/music-candidates/variant-${i + 1}.mp3`;
  }
  if (!res.ok) fail(path, res.status, await res.text());
  for (const [k, v] of res.headers) if (/character|cost|credit/i.test(k)) console.log(`  ${k}: ${v}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  const c = {file, len: lengthOf(file), drop: dropAt(file)};
  console.log(`  ${file}: ${c.len.toFixed(2)} s long, drop at ${c.drop.toFixed(3)} s (${(c.drop - planned).toFixed(3)} s from the plan)`);
  candidates.push(c);
}

const lengthOk = (c: {len: number}) => Math.abs(c.len - length) <= 0.3;
const best = candidates.sort((a, b) => Number(lengthOk(b)) - Number(lengthOk(a)) || Math.abs(a.drop - planned) - Math.abs(b.drop - planned))[0];
if (!lengthOk(best)) console.warn(`No candidate is within 0.3 s of ${length} s. Keeping the closest drop anyway.`);

// Cut the head so the drop lands on the S03 cut (or pad it, if the drop came early), fading in over the new start.
// asetnsamples re-frames the audio: libmp3lame rejects atrim's offset frames ("inadequate AVFrame plane padding").
const off = best.drop - s03 / 1000;
const shift = off >= 0 ? `atrim=start=${off.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.3` : `adelay=${Math.round(-off * 1000)}:all=1`;
run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', best.file, '-af', `${shift},asetnsamples=n=1152:p=0`, '-c:a', 'libmp3lame', '-b:a', '192k', 'public/audio/music.tmp.mp3');
renameSync('public/audio/music.tmp.mp3', 'public/audio/music.mp3');
const len = lengthOf('public/audio/music.mp3');
if (len < total / FPS) console.warn(`public/audio/music.mp3 is ${len.toFixed(2)} s, shorter than the ${(total / FPS).toFixed(2)} s video.`);
writeFileSync('src/audio.json.tmp', JSON.stringify({...JSON.parse(readFileSync('src/audio.json', 'utf8')), music: true}, null, 1) + '\n');
renameSync('src/audio.json.tmp', 'src/audio.json');
console.log(
  `kept ${best.file}, ${off >= 0 ? 'cut' : 'padded'} ${Math.abs(off).toFixed(3)} s at its head -> public/audio/music.mp3: ${len.toFixed(2)} s long, ` +
    `drop at ${dropAt('public/audio/music.mp3').toFixed(3)} s vs S03 cut ${(s03 / 1000).toFixed(3)} s`,
);
