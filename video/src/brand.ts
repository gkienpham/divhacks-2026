import {Easing, interpolate, spring} from 'remotion';
import {loadFont} from '@remotion/google-fonts/DMSans';
import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';

import {FPS} from './layout';
export {FPS};
export const W = 1920;
export const H = 1080;

// RoomMe tokens (web/app/globals.css). Steel blue is the video's light source: glows, rim light, sheen. Never a fill or text color.
export const C = {
  ink: '#0e0c0b',
  bg: '#f5f4f1',
  fg: '#141211',
  muted: '#6e6a65',
  brand: '#3d7096',
  sand: '#eae7e1',
  card: '#ffffff',
  border: '#dddbd7',
  fair: '#4a7c59',
  watch: '#b7791f',
  risk: '#e40014',
} as const;
export const BRAND_RGB = '61,112,150';
export const onDark = (a: number) => `rgba(255,255,255,${a})`;
export const inkA = (a: number) => `rgba(14,12,11,${a})`;
export const lightA = (a: number) => `rgba(${BRAND_RGB},${a})`;

// Depth on ink backgrounds: a soft drop plus a steel-blue rim, for cards floating in 3D.
export const FLOAT_SHADOW = `0 50px 100px -30px rgba(0,0,0,.75), 0 0 0 1px ${lightA(0.18)}, 0 0 80px -10px ${lightA(0.35)}`;
// The app's single shadow (polaroids).
export const POLAROID_SHADOW = '0 18px 40px -18px rgba(20,18,14,.45)';

// Blocks rendering until loaded. Weights: 400 body, 500 everything else (no bold in the brand).
export const SANS = loadFont('normal', {weights: ['400', '500'], subsets: ['latin']}).fontFamily;
export const HAND = loadCaveat('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;

// Video type scale (the app's scale, sized up for a 1080p frame). Headings are weight 500 with tight tracking.
export const TYPE = {
  mega: {fontSize: 200, lineHeight: 0.92, letterSpacing: '-0.045em'},
  display: {fontSize: 136, lineHeight: 0.96, letterSpacing: '-0.04em'},
  h1: {fontSize: 96, lineHeight: 0.98, letterSpacing: '-0.035em'},
  h2: {fontSize: 64, lineHeight: 1.02, letterSpacing: '-0.03em'},
  h3: {fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.02em'},
  body: {fontSize: 28, lineHeight: 1.4, letterSpacing: '-0.005em'},
  eyebrow: {fontSize: 18, lineHeight: 1, letterSpacing: '0.18em', textTransform: 'uppercase' as const},
} as const;

// The brand curve (--ease-out). No bounce, no spring overshoot anywhere.
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.8, 0.2);

// Seconds -> frames. All timing is authored in seconds so fps can change.
export const s = (sec: number) => Math.round(sec * FPS);

// Tween from -> to between atSec and atSec + durSec (brand ease, clamped).
export const tw = (frame: number, atSec: number, durSec: number, from = 0, to = 1, easing = EASE) =>
  interpolate(frame, [atSec * FPS, (atSec + durSec) * FPS], [from, to], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// Overdamped spring 0 -> 1 starting at atSec (settles without overshoot).
export const settle = (frame: number, atSec: number, durSec = 0.8) =>
  spring({frame: frame - atSec * FPS, fps: FPS, config: {damping: 200}, durationInFrames: Math.round(durSec * FPS)});
