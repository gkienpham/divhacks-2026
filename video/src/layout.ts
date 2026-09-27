// Scene layout math, shared by the Remotion timeline (timing.ts) and scripts/check.ts. No imports, so Node can load it.

export const FPS = 30;
export const VO_OFFSET = 0.4; // the VO starts this many seconds into the video
export const LEAD = 0.12; // each cut lands this far ahead of its line, so picture leads sound
export const END_TAIL = 2.0; // after the last word: end card hold + fly into the site

export type Word = {text: string; start: number; end: number};
export type Line = {id: string; text: string; start: number; end: number; words: Word[]};
export type Timing = {placeholder?: boolean; voDuration: number; lines: Line[]};
export type SceneSlot = {id: string; from: number; dur: number};

// Hard cuts that tile the timeline: scene i starts LEAD before VO line i (scene 0 starts at frame 0).
export function layoutScenes(t: Timing, fps: number): {total: number; scenes: SceneSlot[]} {
  const f = (sec: number) => Math.round(sec * fps);
  const starts = t.lines.map((l, i) => (i === 0 ? 0 : f(VO_OFFSET + l.start - LEAD)));
  const total = f(VO_OFFSET + t.voDuration + END_TAIL);
  return {total, scenes: t.lines.map((l, i) => ({id: l.id, from: starts[i], dur: (starts[i + 1] ?? total) - starts[i]}))};
}
