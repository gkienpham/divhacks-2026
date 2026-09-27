// S06 Score. "Your match score is a metric built from your answers."
// The 87 opens huge and dollies back into the left column as it counts up (chime). The ten real HabitBars fill on a
// tilted card, the formula prints out to 87.4, and "ten answers, averaged" is handwritten on "built".
// Exit: default whip left.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {BRAND_RGB, C, FLOAT_SHADOW, FPS, TYPE, onDark, s, settle, tw} from '../brand';
import {Glow, HBlur, Plane, Sfx, Sheen, Space, drift, useEdges} from '../fx';
import {wordAt} from '../timing';
import {FORMULA, PAIR, PARTS, SCORE} from '../script';
import {HabitBar} from '../../../web/components/rm/matching/HabitBar.jsx';
import {InitialsAvatar} from '../../../web/components/rm/matching/InitialsAvatar.jsx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const linear = (x: number) => x;

const TITLE = 'Where you line up'; // the match detail heading (web/app/matches/[id]/DetailScreen.jsx)
const COUNT = 0.9; // seconds for the 0 to 87 count
const FS = 360; // score size at rest
const LEFT = 150; // left column edge (screen px): with the camera creep and drift it stays inside the 120 px margin
const NUM_Y = 335; // score's vertical center at rest
const CARD = {x: 340, y: -20, w: 880}; // card center (world px from the frame center) and width
const Z = 1.7; // HabitBar zoom: the app's 13 to 14 px type at 22 px and up
const STEP = 0.05; // bar stagger
const BAR = 0.5; // one bar's fill
const NOTE_W = 500; // the note's width at 64 px: its underline spans it
const UNDERLINE = `M 4 16 C ${NOTE_W * 0.22} 9, ${NOTE_W * 0.5} 5, ${NOTE_W - 8} 11`;

// First second (scene-local) at which the rounded count shows the final score: the chime lands there.
const LAND = (() => {
  for (let f = 0; f <= s(COUNT); f++) if (Math.round(PAIR.pct * tw(f, 0, COUNT)) >= PAIR.pct) return f / FPS;
  return COUNT;
})();

export const S06Score: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const T = d / FPS;
  const {exit} = useEdges(0.4, 0.3);

  // Beats. Every bar is full by about half the scene (its midpoint shows the whole 87.4). The formula prints in step
  // with the bars, value by value, so "= 87.4" lands just after the last one (around "metric"). The note is written
  // on "built", early enough to hold 0.8 s before the whip.
  const bar0 = Math.min(1.0, Math.max(0.4, 0.46 * T - BAR - 9 * STEP));
  const noteAt = Math.max(bar0 + 0.6, Math.min(wordAt('S06', 'built') - 0.15, T - 1.45));

  // Camera: pulls back from the huge number and lands with it, then creeps in and breathes; whip left at the end.
  const dr = drift(frame, 's06', 1.1);
  const pull = tw(frame, 0, 1.1);
  const dolly = 240 * (1 - pull) + 30 * tw(frame, 1.1, Math.max(0.1, T - 1.4), 0, 1, linear);
  const orbit = interpolate(frame, [0, d], [-1.2, 1.2]);

  // Score: counts 0 to 87 while it shrinks from huge (frame center) into the left column.
  const count = Math.round(PAIR.pct * tw(frame, 0, COUNT));
  const back = tw(frame, 0, 0.95);
  const fs = FS * interpolate(back, [0, 1], [3, 1]);
  const ax = interpolate(back, [0, 1], [960, LEFT]);
  const ay = interpolate(back, [0, 1], [540, NUM_Y]);
  const shift = 50 * (1 - back); // % of its own width: centered at the start, left-anchored at rest
  const numIn = interpolate(frame, [0, 4], [0.4, 1], clamp);
  const pulse = frame >= s(LAND) ? 1 - tw(frame, LAND, 0.7) : 0;

  const meta = tw(frame, LAND - 0.05, 0.45);
  const write = tw(frame, noteAt, 0.35);
  const line = tw(frame, noteAt + 0.25, 0.35);

  // Card: rises from depth on the right, into the space the shrinking number has just left, tilted toward it
  // (ry -14 settling to -6).
  const cardIn = tw(frame, 0.22, 0.85);
  const tilt = settle(frame, 0.22, 1.1);

  // Formula ticker, left to right: value i (and the "+" after it) prints as bar i starts to fill, then "÷ 10 = 87.4"
  // with the average in white.
  const tokens = FORMULA.split(' ');
  const eq = tokens.lastIndexOf('=');
  const vals = 2 * PARTS.length - 1; // the ten values and the nine "+" signs between them
  const tokenAt = (j: number) => (j < vals ? bar0 + Math.floor(j / 2) * STEP : bar0 + PARTS.length * STEP + 0.04 + (j - vals) * 0.05);

  return (
    <AbsoluteFill>
      <HBlur amount={40 * exit}>
        <Space dolly={dolly} panX={dr.x + 1300 * exit} panY={dr.y} rx={dr.r * 0.7} ry={orbit + dr.r} rz={dr.r * 0.3}>
          <Plane x={LEFT + 270 - 960} y={NUM_Y - 540} z={-400}>
            <Glow x={0} y={0} size={1500} opacity={(0.42 + 0.4 * pulse) * numIn} />
          </Plane>
          <Plane x={CARD.x} y={CARD.y + 260} z={-700}>
            <Glow x={0} y={0} size={2000} opacity={0.3 * cardIn} />
          </Plane>

          <Plane
            x={CARD.x + 320 * (1 - cardIn)}
            y={CARD.y}
            z={-1300 * (1 - cardIn)}
            ry={-14 + 8 * tilt}
            opacity={interpolate(cardIn, [0, 0.3], [0, 1], clamp)}
          >
            <div style={{width: CARD.w, background: C.card, borderRadius: 24, padding: 48, boxShadow: FLOAT_SHADOW, position: 'relative', overflow: 'hidden'}}>
              <div style={{...TYPE.h3, fontWeight: 500, color: C.ink}}>{TITLE}</div>
              <div style={{zoom: Z, marginTop: 36 / Z, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 28, rowGap: 18}}>
                {PARTS.map((p, i) => (
                  <HabitBar key={p.label} label={p.label} icon={p.icon} value={Math.round(p.v * tw(frame, bar0 + i * STEP, BAR))} themName={PAIR.them.name} />
                ))}
              </div>
              <Sheen progress={tw(frame, bar0, 1.1)} rgb={BRAND_RGB} intensity={0.12} />
            </div>
          </Plane>

          {/* Left column, laid out in screen px. The layer stops short of the card so the two planes never intersect. */}
          <Plane x={-530} width={860} height={1080}>
            <div
              style={{
                position: 'absolute',
                left: ax,
                top: ay,
                transform: `translate(-${shift}%, -50%)`,
                display: 'flex',
                alignItems: 'flex-start',
                color: onDark(1),
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
                opacity: numIn,
              }}
            >
              <span style={{fontSize: fs, lineHeight: 0.8, letterSpacing: '-0.045em', marginLeft: '-0.04em'}}>{count}</span>
              <span style={{fontSize: fs * 0.45, lineHeight: 1, letterSpacing: '-0.02em', marginTop: fs * 0.01, marginLeft: fs * 0.03}}>%</span>
            </div>

            <div
              style={{
                position: 'absolute',
                left: LEFT,
                top: NUM_Y + 178,
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                opacity: meta,
                transform: `translateY(${(1 - meta) * 18}px)`,
              }}
            >
              <div style={{display: 'flex'}}>
                <InitialsAvatar initials={PAIR.you.initials} name={PAIR.you.name} size={72} onDark />
                <span style={{marginLeft: -16, borderRadius: 9999, background: C.ink, boxShadow: `0 0 0 4px ${C.ink}`}}>
                  <InitialsAvatar initials={PAIR.them.initials} name={PAIR.them.name} size={72} onDark />
                </span>
              </div>
              <div>
                <div style={{fontSize: 30, fontWeight: 500, letterSpacing: '-0.01em', color: onDark(1)}}>
                  {PAIR.you.name} · {PAIR.them.name}
                </div>
                <div style={{marginTop: 6, fontSize: 24, color: onDark(0.6)}}>{SCORE.caption}</div>
              </div>
            </div>

            <div style={{position: 'absolute', left: LEFT + 6, top: NUM_Y + 322, transform: 'rotate(-3deg)', transformOrigin: '0 50%'}}>
              <div
                style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: 64,
                  lineHeight: 1,
                  color: onDark(1),
                  whiteSpace: 'nowrap',
                  clipPath: `inset(-30% ${(1 - write) * 100}% -30% -5%)`,
                }}
              >
                {SCORE.note}
              </div>
              <svg width={NOTE_W} height={28} style={{display: 'block', marginTop: 2, overflow: 'visible'}}>
                <path d={UNDERLINE} fill="none" stroke={onDark(1)} strokeWidth={5} strokeLinecap="round" opacity={line > 0 ? 1 : 0} {...evolvePath(line, UNDERLINE)} />
              </svg>
            </div>

            <div
              style={{
                position: 'absolute',
                left: LEFT,
                top: 884,
                display: 'flex',
                gap: '0.34em',
                fontSize: 26,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
                color: onDark(0.55),
              }}
            >
              {tokens.map((tk, i) => {
                const a = tw(frame, tokenAt(i), 0.25);
                const hi = i >= eq;
                return (
                  <span key={i} style={{opacity: a, transform: `translateY(${(1 - a) * 12}px)`, color: hi ? onDark(1) : undefined, fontWeight: hi ? 500 : 400}}>
                    {tk}
                  </span>
                );
              })}
            </div>
          </Plane>
        </Space>
      </HBlur>
      <Sfx name="chime" at={LAND} volume={0.5} />
      <Sfx name="whoosh" at={T - 0.3} volume={0.45} />
    </AbsoluteFill>
  );
};
