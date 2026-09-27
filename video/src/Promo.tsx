import React from 'react';
import {Sequence, Series, interpolate, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {Stage} from './fx';
import {FPS, s} from './brand';
import {SCENES} from './scenes';
import {SCENE_FRAMES, TIMING, TOTAL_FRAMES, VO_OFFSET} from './timing';
import audio from './audio.json';

// Measured: vo.mp3 is -23.7 LUFS, music.mp3 -13.4 LUFS. Under speech the bed sits ~10 LU below the voice
// (0.5 x 0.2 = 0.1 -> -33.4 LUFS); in the open (intro, end tail) it plays at 0.5. npm run master sets final loudness.
const MUSIC = 0.5;
const DUCK = 0.2;
const RAMP = 0.2; // seconds

// Spoken stretches (video seconds): words merged across gaps shorter than 0.35 s.
const speech = TIMING.lines
  .flatMap((l) => l.words.map((w) => [VO_OFFSET + w.start, VO_OFFSET + w.end]))
  .reduce<number[][]>((acc, [a, b]) => {
    const last = acc.at(-1);
    if (last && a - last[1] < 0.35) last[1] = Math.max(last[1], b);
    else acc.push([a, b]);
    return acc;
  }, []);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const musicGain = (f: number) => {
  const t = f / FPS;
  const k = Math.max(0, ...speech.map(([a, b]) => interpolate(t, [a - RAMP, a, b, b + RAMP], [0, 1, 1, 0], clamp)));
  const fadeOut = interpolate(f, [TOTAL_FRAMES - s(0.6), TOTAL_FRAMES], [1, 0], clamp);
  return MUSIC * (1 - k * (1 - DUCK)) * fadeOut;
};

export const Promo: React.FC = () => (
  <Stage>
    <Series>
      {SCENE_FRAMES.map(({id, dur}) => {
        const Scene = SCENES[id];
        return (
          <Series.Sequence key={id} name={id} durationInFrames={dur}>
            <Scene />
          </Series.Sequence>
        );
      })}
    </Series>
    {audio.music && <Audio src={staticFile('audio/music.mp3')} volume={musicGain} />}
    {audio.vo && (
      <Sequence from={s(VO_OFFSET)} name="voiceover" layout="none">
        <Audio src={staticFile('audio/vo.mp3')} />
      </Sequence>
    )}
  </Stage>
);
