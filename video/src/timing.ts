import T from './timing.json';
import {LINES, type SceneId} from './script';
import {FPS} from './brand';
import {layoutScenes, VO_OFFSET, type Timing, type Word} from './layout';

export {VO_OFFSET};
export const TIMING = T as Timing;

if (TIMING.lines.map((l) => l.id).join() !== LINES.map((l) => l.id).join()) {
  throw new Error('timing.json lines are out of sync with script.ts LINES. Re-run npm run gen:vo.');
}

const layout = layoutScenes(TIMING, FPS);
export const TOTAL_FRAMES = layout.total;
export const SCENE_FRAMES = layout.scenes as {id: SceneId; from: number; dur: number}[];

const slot = (id: SceneId) => SCENE_FRAMES.find((sc) => sc.id === id)!;

// A scene's VO line in scene-local seconds (0 = the scene's first frame). Use it to sync type to speech.
export function lineAt(id: SceneId): {start: number; end: number; words: Word[]} {
  const line = TIMING.lines.find((l) => l.id === id)!;
  const off = VO_OFFSET - slot(id).from / FPS;
  return {
    start: line.start + off,
    end: line.end + off,
    words: line.words.map((w) => ({...w, start: w.start + off, end: w.end + off})),
  };
}

// Scene-local start (seconds) of the first spoken word that starts with `word` (case/punctuation-insensitive).
export function wordAt(id: SceneId, word: string): number {
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9']/g, '');
  const line = lineAt(id);
  const w = line.words.find((x) => norm(x.text).startsWith(norm(word)));
  if (!w) throw new Error(`"${word}" is not in the ${id} VO line`);
  return w.start;
}

// Seconds into vo.mp3 at a scene-local frame (drives waveform bars from the real voice).
export const voSecAt = (id: SceneId, frame: number) => (slot(id).from + frame) / FPS - VO_OFFSET;
