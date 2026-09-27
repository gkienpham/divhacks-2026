// Shared motion primitives. Scenes compose these; they never edit them (ask the main loop instead).
import React, {useId} from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {noise2D} from '@remotion/noise';
import {BRAND_RGB, C, EASE_IN, FPS, HAND, SANS, s, tw} from './brand';
import {voSecAt} from './timing';
import type {SceneId, SfxName} from './script';
import audio from './audio.json';
import './tokens.css';

// Root wrapper for the promo and every Scene-SNN composition: fonts, background, film grain on top.
export const Stage: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.ink}) => (
  <AbsoluteFill
    style={{
      background: bg,
      // Set the final vars here: tokens.css's :root versions point at next/font vars that don't exist in Remotion.
      ['--font-sans' as string]: `${SANS}, ui-sans-serif, system-ui, sans-serif`,
      ['--font-hand' as string]: `${HAND}, cursive`,
      fontFamily: 'var(--font-sans)',
    }}
  >
    {children}
    <Grain />
  </AbsoluteFill>
);

// Film grain: a 2400x1400 noise plate (1200x700 tile at 2x) jittered every frame. Sits above everything.
// Fades out over the last 0.5 s so the final frame is the clean landing page the demo recording starts on.
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  opacity *= interpolate(f, [durationInFrames - s(0.5), durationInFrames - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x = -Math.floor(random(`gx${f}`) * 480);
  const y = -Math.floor(random(`gy${f}`) * 320);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', mixBlendMode: 'overlay', opacity}}>
      <Img src={staticFile('fx/noise.png')} style={{position: 'absolute', left: x, top: y, width: 2400, height: 1400}} />
    </AbsoluteFill>
  );
};

// 3D world. The camera props move the whole world: dolly (px toward viewer), panX/panY, and rx/ry/rz tilt (deg).
// Put <Plane>s inside. Never set opacity/filter/overflow on a Space: that flattens the 3D.
export const Space: React.FC<{
  children: React.ReactNode;
  perspective?: number;
  dolly?: number;
  panX?: number;
  panY?: number;
  rx?: number;
  ry?: number;
  rz?: number;
}> = ({children, perspective = 1800, dolly = 0, panX = 0, panY = 0, rx = 0, ry = 0, rz = 0}) => (
  <AbsoluteFill style={{perspective, perspectiveOrigin: '50% 50%'}}>
    <AbsoluteFill
      style={{
        transformStyle: 'preserve-3d',
        transform: `translate3d(${-panX}px, ${-panY}px, ${dolly}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

// A flat element placed in a Space, centered on the frame center plus (x, y, z). Opacity on a Plane is fine
// (it only flattens Planes nested inside it).
export const Plane: React.FC<{
  children?: React.ReactNode;
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  width?: number;
  height?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({children, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1, width, height, opacity, style}) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      width,
      height,
      opacity,
      transformStyle: 'preserve-3d',
      transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
      ...style,
    }}
  >
    {children}
  </div>
);

// Handheld camera drift (smooth noise). Add to Space pan/rotation for life: {x, y} px and r deg.
export const drift = (frame: number, seed = 'cam', amp = 1) => ({
  x: noise2D(`${seed}x`, frame / 90, 0) * 10 * amp,
  y: noise2D(`${seed}y`, frame / 90, 0) * 7 * amp,
  r: noise2D(`${seed}r`, frame / 120, 0) * 0.5 * amp,
});

// Word-by-word mask reveal: each word rises out of its own clip box.
// Pass `words` with scene-local start times (lineAt(id).words, or your own) to sync to the VO,
// or `text` with `at` + `stagger` (seconds).
export const KineticText: React.FC<{
  text?: string;
  words?: {text: string; start: number}[];
  at?: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number) => React.CSSProperties | undefined;
}> = ({text = '', words, at = 0, stagger = 0.06, dur = 0.55, style, wordStyle}) => {
  const frame = useCurrentFrame();
  const list = words ?? text.split(' ').map((w, i) => ({text: w, start: at + i * stagger}));
  return (
    <div style={{fontWeight: 500, ...style}}>
      {list.map((w, i) => {
        const t = tw(frame, w.start, dur);
        return (
          <span
            key={i}
            style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', padding: '0.06em 0 0.14em', margin: '-0.06em 0.24em -0.14em 0'}}
          >
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - t) * 115}%) rotate(${(1 - t) * 7}deg)`,
                transformOrigin: '0 100%',
                ...wordStyle?.(i),
              }}
            >
              {w.text}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Steel-blue light bloom (radial gradient; cheap, no filter). Position is the bloom's center.
export const Glow: React.FC<{x?: number | string; y?: number | string; size?: number; opacity?: number; rgb?: string}> = ({
  x = '50%',
  y = '50%',
  size = 1100,
  opacity = 0.6,
  rgb = BRAND_RGB,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      opacity,
      pointerEvents: 'none',
      background: `radial-gradient(circle, rgba(${rgb},.55) 0%, rgba(${rgb},.22) 32%, rgba(${rgb},.06) 55%, rgba(${rgb},0) 70%)`,
    }}
  />
);

// A light band sweeping across its parent (parent: position relative + overflow hidden). progress 0 -> 1.
// On white cards use rgb=BRAND_RGB with low intensity (reads as a rim light); on ink use white.
export const Sheen: React.FC<{progress: number; angle?: number; width?: number; intensity?: number; rgb?: string}> = ({
  progress,
  angle = 20,
  width = 18,
  intensity = 0.28,
  rgb = '255,255,255',
}) => {
  const p = -width + progress * (100 + 2 * width);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `linear-gradient(${90 + angle}deg, rgba(${rgb},0) ${p - width}%, rgba(${rgb},${intensity}) ${p}%, rgba(${rgb},0) ${p + width}%)`,
      }}
    />
  );
};

// Minimal dark browser window: CHROME_H px bar (dots + URL pill) above a 1920x1080 viewport.
// For the final fly-in, scale to 1 and translateY(-CHROME_H) so the viewport exactly fills the frame.
export const CHROME_H = 64;
export const BrowserFrame: React.FC<{children: React.ReactNode; url?: string; radius?: number; style?: React.CSSProperties}> = ({
  children,
  url = 'roomme.tech',
  radius = 18,
  style,
}) => (
  <div style={{width: 1920, height: 1080 + CHROME_H, borderRadius: radius, overflow: 'hidden', background: '#1b1918', ...style}}>
    <div
      style={{
        height: CHROME_H,
        display: 'flex',
        alignItems: 'center',
        padding: '0 26px',
        gap: 12,
        borderBottom: '1px solid rgba(255,255,255,.08)',
        position: 'relative',
      }}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} style={{width: 14, height: 14, borderRadius: 9999, background: 'rgba(255,255,255,.18)'}} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          height: 38,
          width: 560,
          borderRadius: 9999,
          background: 'rgba(255,255,255,.07)',
          color: 'rgba(255,255,255,.72)',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {url}
      </div>
    </div>
    <div style={{width: 1920, height: 1080, position: 'relative', overflow: 'hidden', background: C.ink}}>{children}</div>
  </div>
);

// Directional motion blur for whips (amount in px; 0 = off). Wrap it around a Space, not inside one:
// a filter flattens preserve-3d below it.
export const HBlur: React.FC<{amount: number; dir?: 'x' | 'y'; children: React.ReactNode; style?: React.CSSProperties}> = ({
  amount,
  dir = 'x',
  children,
  style,
}) => {
  const id = 'hb' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const dev = dir === 'x' ? `${amount} 0` : `0 ${amount}`;
  return (
    <AbsoluteFill style={{filter: amount > 0.3 ? `url(#${id})` : undefined, ...style}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={dev} />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

// Scene edges: enter goes 0 -> 1 over the first inSec (brand ease), exit 0 -> 1 over the last outSec (accelerating).
export const useEdges = (inSec = 0.4, outSec = 0.3) => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  return {
    enter: tw(frame, 0, inSec),
    exit: interpolate(frame, [d - outSec * FPS, d], [0, 1], {easing: EASE_IN, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  };
};

// Sound effect at scene-local second `at`. Renders nothing until scripts/gen-sfx.ts has produced the file.
export const Sfx: React.FC<{name: SfxName; at: number; volume?: number}> = ({name, at, volume = 0.6}) =>
  (audio.sfx as string[]).includes(name) && at >= 0 ? (
    <Sequence from={s(at)} layout="none" name={`sfx:${name}`}>
      <Audio src={staticFile(`audio/sfx/${name}.mp3`)} volume={volume} />
    </Sequence>
  ) : null;

// n bar levels (0..1) for a waveform. Driven by the real VO once vo.mp3 exists, smooth noise before that.
const useRealLevels = (id: SceneId, n: number) => {
  const frame = useCurrentFrame();
  const data = useAudioData(staticFile('audio/vo.mp3'));
  if (!data) return new Array(n).fill(0);
  const t = voSecAt(id, frame);
  if (t < 0 || t > data.durationInSeconds) return new Array(n).fill(0);
  const v = visualizeAudio({fps: FPS, frame: Math.round(t * FPS), audioData: data, numberOfSamples: 64});
  return Array.from({length: n}, (_, i) => Math.min(1, Math.sqrt(v[Math.floor((i / n) * 24)] ?? 0) * 1.6));
};
const useFakeLevels = (_id: SceneId, n: number) => {
  const frame = useCurrentFrame();
  return Array.from({length: n}, (_, i) => 0.25 + 0.75 * Math.abs(noise2D('wave', i * 0.35, frame / 6)));
};
export const useVoLevels = audio.vo ? useRealLevels : useFakeLevels;
