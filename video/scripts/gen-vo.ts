// Voiceover (SPEC FR-3): one continuous ElevenLabs read of LINES -> public/audio/vo.mp3 + src/timing.json.
//   npm run gen:vo                  full read with VOICE_ID. Keeps the first of TAKES that lands the video in 26 to 30.5 s
//                                   with every scene >= 1.2 s. Nothing is written otherwise.
//   npm run gen:vo -- --audition    S01 + S06 read by each SHORTLIST voice -> out/auditions/<name>.mp3, with measured pacing
// The key is ELEVENLABS_API_KEY from ../web/.env.local, unless already set (node --env-file=<path> scripts/gen-vo.ts). Never printed.
import {mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {LINES} from '../src/script.ts';
import {END_TAIL, FPS, VO_OFFSET, layoutScenes, type Line, type Timing} from '../src/layout.ts';

// Switch voices with this one line (any voice ID from the ElevenLabs library).
const VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Brian: warm, confident narrator (picked on labels; confirm with --audition)
const MODEL_ID = 'eleven_multilingual_v2';
const VOICE_SETTINGS = {stability: 0.45, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true};
// Tried in order until one fits: speed (max 1.15) and the pause between lines in seconds (0.2 to 0.3).
// Sep 27: take 1 read long (video 30.60 s), take 2 fit (27.83 s) and is the committed vo.mp3.
const TAKES = [
  {speed: 1.1, pause: 0.25},
  {speed: 1.15, pause: 0.2},
];

// Premade American narrators, by their ElevenLabs catalog labels (hardcoded: the current key lacks voices_read).
const SHORTLIST: Record<string, string> = {
  Brian: 'nPczCjzI2devNBz1zQrb', // narration: resonant, comforting, "great for narrations and advertisements"
  Liam: 'TX3LPaxmHKxFdv7VOQHJ', // narration: young, articulate, "energy and warmth", made for reels and shorts
  Matilda: 'XrExE9yKIg1WjnnlVkGX', // narration: warm, professional alto
};

type Alignment = {characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[]};
type Say = readonly {id: string; vo: string}[];
type Take = (typeof TAKES)[number];

if (!process.env.ELEVENLABS_API_KEY) process.loadEnvFile('../web/.env.local');

async function speak(voiceId: string, lines: Say, {speed, pause}: Take): Promise<{audio: Buffer; alignment: Alignment}> {
  const text = lines.map((l) => l.vo).join(` <break time="${pause}s" /> `);
  const body = {text, model_id: MODEL_ID, voice_settings: {...VOICE_SETTINGS, speed}};
  console.log(`TTS ${voiceId}: ${text.length} characters, speed ${speed}, pause ${pause} s`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST',
    headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '', 'content-type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`ElevenLabs TTS ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  for (const [k, v] of res.headers) if (/character|cost|credit/i.test(k)) console.log(`  ${k}: ${v}`);
  const j = await res.json();
  return {audio: Buffer.from(j.audio_base64, 'base64'), alignment: j.alignment};
}

// Each line and word in vo.mp3 seconds, found by searching the raw `alignment` text (break tags may or may not be in it).
function locate(a: Alignment, lines: Say): Line[] {
  const chars = a.characters.join('');
  if (chars.length !== a.characters.length) throw new Error('alignment has multi-character entries');
  const r3 = (x: number) => Math.round(x * 1000) / 1000;
  let from = 0;
  return lines.map(({id, vo}) => {
    const at = chars.indexOf(vo, from);
    if (at < 0) throw new Error(`${id} "${vo}" is not in the alignment`);
    from = at + vo.length;
    const words = [...vo.matchAll(/\S+/g)].map((m) => ({
      text: m[0],
      start: r3(a.character_start_times_seconds[at + m.index]),
      end: r3(a.character_end_times_seconds[at + m.index + m[0].length - 1]),
    }));
    return {id, text: vo, start: words[0].start, end: words.at(-1)!.end, words};
  });
}

const writeJson = (path: string, data: unknown) => {
  writeFileSync(`${path}.tmp`, JSON.stringify(data, null, 1) + '\n');
  renameSync(`${path}.tmp`, path);
};

mkdirSync('out/auditions', {recursive: true});

if (process.argv.includes('--audition')) {
  const pair = [LINES[0], LINES[5]];
  const allChars = LINES.reduce((n, l) => n + l.vo.length, 0);
  for (const [name, id] of Object.entries(SHORTLIST)) {
    const {audio, alignment} = await speak(id, pair, TAKES[0]);
    writeFileSync(`out/auditions/${name}.mp3`, audio);
    const [a, b] = locate(alignment, pair);
    const cps = (a.text.length + b.text.length) / (a.end - a.start + b.end - b.start);
    const gap = b.start - a.end;
    const vo = allChars / cps + (LINES.length - 1) * gap;
    console.log(`${name}: ${cps.toFixed(1)} chars/s, line gap ${gap.toFixed(2)} s -> full read ~${vo.toFixed(1)} s, video ~${(vo + VO_OFFSET + END_TAIL).toFixed(1)} s`);
  }
  process.exit(0);
}

for (const [i, take] of TAKES.entries()) {
  const {audio, alignment} = await speak(VOICE_ID, LINES, take);
  const lines = locate(alignment, LINES);
  const timing: Timing = {voDuration: lines.at(-1)!.end, lines};
  const {total, scenes} = layoutScenes(timing, FPS);
  scenes.forEach((sc, j) => console.log(`  ${sc.id} ${(sc.dur / FPS).toFixed(2)} s  line ${lines[j].start.toFixed(2)} to ${lines[j].end.toFixed(2)}`));
  const video = total / FPS;
  console.log(`  voDuration ${timing.voDuration} s, video ${video.toFixed(2)} s`);
  if (video >= 26 && video <= 30.5 && scenes.every((sc) => sc.dur >= 1.2 * FPS)) {
    writeFileSync('public/audio/vo.mp3', audio);
    writeJson('src/timing.json', timing);
    writeJson('src/audio.json', {...JSON.parse(readFileSync('src/audio.json', 'utf8')), vo: true});
    console.log('wrote public/audio/vo.mp3, src/timing.json, src/audio.json');
    process.exit(0);
  }
  writeFileSync(`out/auditions/rejected-take-${i + 1}.mp3`, audio);
  console.error(`  take ${i + 1} doesn't fit 26 to 30.5 s with every scene >= 1.2 s (saved as out/auditions/rejected-take-${i + 1}.mp3)`);
  if (video < 26) break; // the next takes are only faster
}
console.error('Nothing written. If every take ran long, trim a line in script.ts (SPEC EC-2, never the hook or the tagline) and re-run.');
process.exit(1);
