// S03 Reveal: the logo moment and the music drop. Impact on ink, the house icon line-draws out of a steel-blue burst,
// glides left while "RoomMe" rises beside it (exact Wordmark proportions), then the landing line and the four habit pills.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {Icon} from '../../../web/components/rm/core/Icon.jsx';
import {FPS, TYPE, lightA, onDark, tw} from '../brand';
import {Glow, HBlur, KineticText, Plane, Sfx, Space, drift, useEdges} from '../fx';
import {REVEAL} from '../script';
import {wordAt} from '../timing';

// WordmarkIcon paths, verbatim from web/components/rm/brand/Wordmark.jsx (viewBox 24, stroke 1.75, round caps and joins).
const OUTLINE = 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z';
const DIVIDER = 'M12 8.5V21';
const OUTLINE_LEN = getLength(OUTLINE);
const DIVIDER_LEN = getLength(DIVIDER);

// Wordmark proportions at text size 150: icon 1.25x and gap 0.5x, rounded the way Wordmark rounds them.
const TEXT = 150;
const ICON = Math.round(TEXT * 1.25);
const GAP = Math.round(TEXT * 0.5);
const DRAW = 260; // the icon line-draws at this size, then settles to ICON inside the lockup
const U = DRAW / 24; // px per viewBox unit while drawing
const NAME = 'RoomMe';
// The pen trace: EASE_IN's start handle and EASE's end handle, so the stroke visibly travels, then lands like the brand curve.
const PEN = Easing.bezier(0.55, 0, 0.36, 1);

// Light at the pen tip while a stroke draws: white core, steel-blue halo.
const Tip: React.FC<{path: string; len: number; p: number; a: number}> = ({path, len, p, a}) => {
  if (a <= 0.01) return null;
  const pt = getPointAtLength(path, len * Math.min(1, Math.max(0, p)));
  if (!pt) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: pt.x * U,
        top: pt.y * U,
        width: 110,
        height: 110,
        transform: 'translate(-50%, -50%)',
        borderRadius: 9999,
        opacity: a,
        background: `radial-gradient(circle, ${onDark(1)} 0%, ${onDark(0.85)} 9%, ${lightA(0.55)} 24%, ${lightA(0.14)} 46%, ${lightA(0)} 70%)`,
      }}
    />
  );
};

export const S03Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const dur = durationInFrames / FPS;
  const {exit} = useEdges(0.4, 0.3);

  // Beats (scene-local seconds). The line lands roughly on "how you actually live" but always leaves
  // at least ~0.8 s of full visibility before the exit whip, whatever the final VO timing is.
  const lineIn = Math.max(0.9, Math.min(wordAt('S03', 'how') - 0.35, dur - 1.8));
  const pillsAt = lineIn + 0.3;

  // Impact light at 0: a fast bloom that settles, a shockwave ring, an anamorphic streak.
  const burst = tw(frame, 0, 0.12);
  const bloom = burst * (1 - 0.5 * tw(frame, 0.12, 1.1));
  const ring = tw(frame, 0, 1.05);
  const ringA = burst * (1 - tw(frame, 0.04, 0.95));
  const streak = tw(frame, 0, 0.5);
  const streakA = burst * (1 - tw(frame, 0.06, 0.62));

  // Line-draw: outline first, then the divider.
  const pOut = tw(frame, 0, 0.44, 0, 1, PEN);
  const pDiv = tw(frame, 0.36, 0.24, 0, 1, PEN);
  const tipOut = burst * (1 - tw(frame, 0.38, 0.16));
  const tipDiv = tw(frame, 0.36, 0.04) * (1 - tw(frame, 0.56, 0.14));

  // Glide into the lockup: k = 1 has the icon alone at center, k = 0 is the centered Wordmark lockup.
  const glide = tw(frame, 0.5, 0.8);
  const k = 1 - glide;
  const iconScale = interpolate(glide, [0, 1], [1, ICON / DRAW]);

  // Camera: settling tilt, a push that lands with the impact then keeps creeping in, a pan down to make room, drift.
  const cam = drift(frame, 's03', 1.1);
  const settleTilt = tw(frame, 0, 1.7);
  const dolly = -150 * (1 - tw(frame, 0, 1.5)) + 60 * (frame / durationInFrames);
  const panY = 140 * tw(frame, 0.55, 1.0);

  return (
    <AbsoluteFill>
      <Sfx name="impact" at={0} volume={0.8} />
      <Sfx name="tap" at={pillsAt} volume={0.3} />
      <Sfx name="whoosh" at={dur - 0.3} volume={0.45} />
      <HBlur amount={exit * 40}>
        <Space
          dolly={dolly}
          panX={cam.x + exit * 1300}
          panY={cam.y + panY}
          rx={6 * (1 - settleTilt)}
          ry={-14 * (1 - settleTilt)}
          rz={cam.r * 0.6}
        >
          {/* Light, behind everything */}
          <Plane z={-160} width={0} height={0}>
            <Glow size={1700} opacity={0.75 * bloom} />
            <div
              style={{
                position: 'absolute',
                width: 1800,
                height: 150,
                left: -900,
                top: -75,
                opacity: streakA,
                transform: `scaleX(${0.3 + 0.7 * streak})`,
                background: `radial-gradient(ellipse at center, ${lightA(0.5)} 0%, ${lightA(0.14)} 34%, ${lightA(0)} 70%)`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 1700,
                height: 3,
                left: -850,
                top: -1.5,
                opacity: streakA,
                transform: `scaleX(${0.2 + 0.8 * streak})`,
                background: `linear-gradient(90deg, ${lightA(0)} 0%, ${lightA(0.7)} 34%, ${onDark(0.95)} 50%, ${lightA(0.7)} 66%, ${lightA(0)} 100%)`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 2 * (150 + ring * 1050),
                height: 2 * (150 + ring * 1050),
                transform: 'translate(-50%, -50%)',
                borderRadius: 9999,
                border: `2px solid ${lightA(0.9)}`,
                boxShadow: `0 0 32px ${lightA(0.5)}, inset 0 0 32px ${lightA(0.3)}`,
                opacity: ringA,
              }}
            />
          </Plane>

          {/* The lockup: icon + "RoomMe", composed like <Wordmark onDark size={150} /> */}
          <Plane width={1680} height={ICON}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: GAP,
                  color: onDark(1),
                  fontSize: TEXT,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  // At k = 1 the icon's center sits on the frame center: shift by (gap + text) / 2 = 50% - ICON / 2.
                  transform: `translateX(calc(${k * 50}% - ${(k * ICON) / 2}px))`,
                }}
              >
                <div style={{position: 'relative', width: ICON, height: ICON, flexShrink: 0}}>
                  <div
                    style={{
                      position: 'absolute',
                      left: (ICON - DRAW) / 2,
                      top: (ICON - DRAW) / 2,
                      width: DRAW,
                      height: DRAW,
                      transform: `scale(${iconScale})`,
                    }}
                  >
                    <Glow size={760} opacity={0.9 * bloom} />
                    <svg
                      width={DRAW}
                      height={DRAW}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={onDark(1)}
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
                    >
                      {pOut > 0 && <path d={OUTLINE} {...evolvePath(pOut, OUTLINE)} />}
                      {pDiv > 0 && <path d={DIVIDER} {...evolvePath(pDiv, DIVIDER)} />}
                    </svg>
                    <Tip path={OUTLINE} len={OUTLINE_LEN} p={pOut} a={tipOut} />
                    <Tip path={DIVIDER} len={DIVIDER_LEN} p={pDiv} a={tipDiv} />
                  </div>
                </div>
                {/* One clip box for the word (vertical clip only), letters rise through it */}
                <div style={{display: 'inline-block', overflow: 'hidden', padding: '0.14em 0.1em 0.18em', margin: '-0.14em -0.1em -0.18em'}}>
                  {NAME.split('').map((ch, i) => {
                    const p = tw(frame, 0.58 + i * 0.045, 0.55);
                    return (
                      <span
                        key={i}
                        style={{
                          display: 'inline-block',
                          transform: `translateY(${(1 - p) * 118}%)`,
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Plane>

          {/* The landing line */}
          <Plane y={200} z={30} width={1680}>
            <KineticText
              words={REVEAL.line.split(' ').map((w, i) => ({text: w, start: lineIn + i * 0.045}))}
              dur={0.45}
              style={{...TYPE.h2, color: onDark(0.75), textAlign: 'center', whiteSpace: 'nowrap', paddingLeft: '0.24em'}}
            />
          </Plane>

          {/* Sleep, Dishes, Guests, Noise */}
          <Plane y={318} z={70} width={1680}>
            <div style={{display: 'flex', justifyContent: 'center', gap: 16}}>
              {REVEAL.habits.map((h, i) => {
                const p = tw(frame, pillsAt + i * 0.1, 0.5);
                return (
                  <div
                    key={h.tag}
                    style={{
                      height: 56,
                      padding: '0 28px 0 22px',
                      borderRadius: 9999,
                      background: onDark(0.08),
                      border: `1px solid ${onDark(0.14)}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: onDark(1),
                      fontSize: 26,
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                      opacity: p,
                      transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})`,
                    }}
                  >
                    <Icon name={h.icon} size={24} />
                    {h.tag}
                  </div>
                );
              })}
            </div>
          </Plane>
        </Space>
      </HBlur>
    </AbsoluteFill>
  );
};
