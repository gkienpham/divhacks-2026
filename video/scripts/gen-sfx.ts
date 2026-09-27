// Sound effects (SPEC FR-5): ElevenLabs text-to-sound for each SFX prompt in script.ts -> public/audio/sfx/<name>.mp3.
// Each file is trimmed so its hit lands on the cue and peak-normalized to -3 dBFS. The riser instead ends on its peak and
// lasts exactly SECONDS.riser (S02 starts it that long before the S03 cut), padded with leading silence if needed.
//   npm run gen:sfx                every SFX
//   npm run gen:sfx -- tap chime   only these
// The key is ELEVENLABS_API_KEY from ../web/.env.local, unless already set (node --env-file=<path> scripts/gen-sfx.ts). Never printed.
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SFX, type SfxName} from '../src/script.ts';

const SECONDS: Record<SfxName, number> = {whoosh: 0.8, 'whoosh-soft': 0.6, tap: 0.5, pop: 0.5, type: 1.2, riser: 1.6, impact: 2.0, stamp: 0.6, chime: 1.2, paper: 0.8};
const PEAK_DB = -3;
const RISER = SECONDS.riser;
// At 0.6 the soft tap came back near-silent in 6 calls of 6 (peak -35 dBFS or lower). At 0.3, 2 of 5 calls clicked.
const INFLUENCE: Partial<Record<SfxName, number>> = {tap: 0.3};

if (!process.env.ELEVENLABS_API_KEY) process.loadEnvFile('../web/.env.local');

const run = (cmd: string, ...args: string[]) => {
  const r = spawnSync(cmd, args, {encoding: 'utf8'});
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr}`);
  return r;
};

// End of the loudest 50 ms window: where the riser peaks.
function peakEnd(file: string): number {
  const af = 'asetnsamples=n=2205,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-';
  const {stdout} = run('ffmpeg', '-hide_banner', '-i', file, '-af', af, '-f', 'null', '-');
  const rms = [...stdout.matchAll(/RMS_level=(\S+)/g)].map((m) => (Number.isFinite(Number(m[1])) ? Number(m[1]) : -120));
  return (rms.indexOf(Math.max(...rms)) + 1) * 0.05;
}

// Sample peak in dBFS after the filters in `af` (-120 for silence).
function maxDb(file: string, af = ''): number {
  const {stderr} = run('ffmpeg', '-hide_banner', '-i', file, '-af', `${af}astats=measure_perchannel=none:measure_overall=Peak_level`, '-f', 'null', '-');
  const db = Number(/Peak level dB: (\S+)/.exec(stderr)?.[1]);
  return Number.isFinite(db) ? Math.round(db * 100) / 100 : -120;
}

const names = (process.argv.length > 2 ? process.argv.slice(2) : Object.keys(SFX)) as SfxName[];
const tmp = mkdtempSync(join(tmpdir(), 'roomme-sfx-'));
mkdirSync('public/audio/sfx', {recursive: true});

// One generation into `raw`. False on an HTTP error.
async function generate(name: SfxName, raw: string): Promise<boolean> {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192', {
    method: 'POST',
    headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '', 'content-type': 'application/json'},
    body: JSON.stringify({text: SFX[name], duration_seconds: SECONDS[name], prompt_influence: INFLUENCE[name] ?? 0.6, model_id: 'eleven_text_to_sound_v2'}),
  });
  if (!res.ok) {
    console.error(`ElevenLabs SFX ${res.status}: ${await res.text()}`);
    return false;
  }
  for (const [k, v] of res.headers) if (/character|cost|credit/i.test(k)) console.log(`  ${k}: ${v}`);
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  return true;
}

for (const name of names) {
  if (!(name in SFX)) throw new Error(`unknown SFX "${name}" (see SFX in src/script.ts)`);
  console.log(`SFX ${name}: ${SECONDS[name]} s`);
  const raw = join(tmp, `${name}.mp3`);
  let ok = await generate(name, raw);
  // Short sounds sometimes come back near-silent (a 0.5 s tap peaked at -61 dBFS): generate again, 3 tries in all.
  for (let i = 1; ok && i < 3 && maxDb(raw) < -30; i++) {
    console.log(`  near-silent (${maxDb(raw)} dBFS), generating again`);
    ok = await generate(name, raw);
  }
  if (!ok) {
    process.exitCode = 1;
    break;
  }
  if (maxDb(raw) < -30) {
    console.error(`  ${name} is still near-silent after 3 tries, so it is skipped`);
    process.exitCode = 1;
    continue;
  }
  const peak = name === 'riser' ? peakEnd(raw) : 0;
  const keep = Math.min(peak, RISER);
  const trim = peak
    ? `atrim=start=${(peak - keep).toFixed(3)}:end=${peak.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=out:st=${(keep - 0.01).toFixed(3)}:d=0.01,` +
      `adelay=${Math.round((RISER - keep) * 1000)}:all=1,apad=whole_dur=${RISER},atrim=end=${RISER}`
    : // Every raw SFX ends on a 10 ms blip 15 to 30 dB above its tail, so the last 50 ms fade out.
      'silenceremove=start_periods=1:start_threshold=-50dB:detection=peak,areverse,afade=t=in:d=0.05,areverse';
  const out = `public/audio/sfx/${name}.tmp.mp3`; // renamed into place when done, so renders never see a half-made file
  const encode = (gain: number) =>
    run('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-af', `${trim},volume=${gain.toFixed(2)}dB`, '-c:a', 'libmp3lame', '-b:a', '192k', out);
  // MP3 encoding moves a short hit's peak by up to 0.8 dB, erratically with the gain (a tap: +26.6 dB -> -2.98 dBFS,
  // +26.7 dB -> -3.36 dBFS). So step half the miss each time and keep the closest of up to 8 encodes.
  let gain = PEAK_DB - maxDb(raw, `${trim},`);
  let best = {gain, miss: Infinity};
  for (let i = 0; i < 8 && Math.abs(best.miss) > 0.05; i++) {
    encode(gain);
    const miss = PEAK_DB - maxDb(out);
    if (Math.abs(miss) < Math.abs(best.miss)) best = {gain, miss};
    gain += miss / 2;
  }
  encode(best.gain);
  const len = run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out).stdout.trim();
  const db = maxDb(out);
  renameSync(out, `public/audio/sfx/${name}.mp3`);
  console.log(`  -> public/audio/sfx/${name}.mp3: ${Number(len).toFixed(2)} s, peak ${db} dBFS${peak ? `, cut at its peak ${peak.toFixed(2)} s` : ''}`);
}

const sfx = Object.keys(SFX).filter((n) => existsSync(`public/audio/sfx/${n}.mp3`));
writeFileSync('src/audio.json.tmp', JSON.stringify({...JSON.parse(readFileSync('src/audio.json', 'utf8')), sfx}, null, 1) + '\n');
renameSync('src/audio.json.tmp', 'src/audio.json');
console.log(`audio.json sfx: ${sfx.join(', ') || 'none'}`);
