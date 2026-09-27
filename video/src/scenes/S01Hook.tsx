// S01 Hook: "Every New Yorker has a roommate horror story."
// The landing page's four horror lines float on white cards in an ink void. The camera pushes through them the
// whole scene and, in the last 0.3 s, rushes past the nearest ones into S02 (transitions table: scale up, blur).
import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Icon} from '../../../web/components/rm/core/Icon.jsx';
import {C, FLOAT_SHADOW, FPS, TYPE, inkA, onDark, tw} from '../brand';
import {Glow, KineticText, Plane, Sfx, Sheen, Space, drift, useEdges} from '../fx';
import {HORROR} from '../script';
import {lineAt} from '../timing';

const P = 1800; // Space perspective
const EXIT = 0.3; // seconds of rush at the end
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// World position for a point that should sit at screen offset (sx, sy) from center at depth z on frame 0.
const place = (sx: number, sy: number, z: number) => ({x: (sx * (P - z)) / P, y: (sy * (P - z)) / P, z});

// Cards in HORROR order (also the order they emerge). Screen spots keep the headline band clear, and with the
// camera pushing straight in they only move outward from there. Far cards are built larger so their lines stay
// readable; fog and slower parallax still put them at the back.
const CARDS = [
  {...place(-400, -292, -300), scale: 1, rx: -8, ry: 16, rz: -3},
  {...place(470, 300, -750), scale: 1, rx: 8, ry: -18, rz: 3},
  {...place(515, -300, -2200), scale: 1.32, rx: -10, ry: -20, rz: 2},
  {...place(-500, 312, -1450), scale: 1.1, rx: 10, ry: 20, rz: -4},
];

// Dust in the void, for speed and depth. Seeded above or below the headline band, so it streams away from it.
const MOTES = Array.from({length: 44}, (_, i) => {
  const sx = (random(`m${i}x`) - 0.5) * 2200;
  const band = 230 + random(`m${i}y`) * 380;
  const sy = random(`m${i}s`) < 0.5 ? -band : band;
  const z = -3000 + random(`m${i}z`) * 2800;
  return {...place(sx, sy, z), size: 5 + random(`m${i}r`) * 7, a: 0.25 + random(`m${i}a`) * 0.45};
});

// Depth fog: far things sink into the ink.
const fogAt = (zView: number) => interpolate(zView, [-2600, -1300, -250], [0.5, 0.26, 0], clamp);
// Anything close to the lens fades before it crosses it (CSS 3D breaks behind the camera).
const lensFade = (zView: number) => interpolate(zView, [P * 0.4, P * 0.7], [1, 0], clamp);

const HorrorCard: React.FC<{tag: string; icon: string; line: string; dark: number; sheen: number}> = ({tag, icon, line, dark, sheen}) => (
  <div style={{position: 'relative', width: 640, padding: 36, borderRadius: 24, background: C.card, boxShadow: FLOAT_SHADOW, overflow: 'hidden'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <span style={{width: 56, height: 56, borderRadius: 16.8, background: C.sand, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} size={26} />
      </span>
      <span style={{fontSize: 24, fontWeight: 500, lineHeight: 1, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted}}>{tag}</span>
    </div>
    <div style={{marginTop: 26, fontSize: 40, fontWeight: 500, lineHeight: 1.12, letterSpacing: '-0.02em', color: C.ink, textWrap: 'balance'}}>{line}</div>
    {/* Darkness lifts off the card; a band of light crosses it while it is still in shadow. */}
    <div style={{position: 'absolute', inset: 0, background: C.ink, opacity: dark}} />
    <Sheen progress={sheen} intensity={0.2 * dark} width={24} />
  </div>
);

export const S01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const dur = d / FPS;
  const {exit} = useEdges(0.3, EXIT);

  // A steady push the whole scene, then the rush: the nearest cards pass the lens.
  const dolly = interpolate(frame, [0, d], [0, 800]) + 1900 * exit;
  const cam = drift(frame, 's01', 1.3);

  // The light far back grows as the camera flies toward it, and swells on "horror".
  const words = lineAt('S01').words;
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z]/g, '');
  const hot = Math.max(1, words.findIndex((w) => norm(w.text) === 'horror'));
  const swell = tw(frame, words[hot].start - 0.1, 0.9);

  // Headline, synced by phrase ("Every New Yorker" / "has a roommate" / "horror story."): each phrase lands as its
  // first word is spoken, so "horror story." is up for the last beat instead of arriving on the cut.
  const n = words.length;
  const phraseStarts = [0, words.findIndex((w) => norm(w.text) === 'has'), hot].filter((i) => i >= 0);
  const timed = words.map((w, i) => {
    const p = Math.max(...phraseStarts.filter((s) => s <= i));
    return {text: w.text, start: words[p].start - 0.1 + (i - p) * 0.07};
  });
  const split = (() => {
    const i = words.findIndex((w) => norm(w.text) === 'roommate');
    return i > 0 ? i : Math.ceil(n / 2);
  })();
  // Focus racks from the cards to the headline once it is building, then the rush blurs everything.
  const focus = tw(frame, words[phraseStarts[1] ?? 1].start, 0.8);
  const headStyle = {...TYPE.display, color: onDark(0.72), paddingLeft: '0.24em'};

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: `blur(${2.2 * focus + 16 * exit}px)`}}>
        <Glow x={960 - cam.x * 0.4} y={480 - cam.y * 0.4} size={1700 + 500 * (frame / d) + 700 * exit} opacity={0.62 + 0.2 * swell + 0.18 * exit} />
        <Space perspective={P} dolly={dolly} panX={cam.x} panY={cam.y} rx={cam.y * 0.06} ry={-cam.x * 0.08} rz={cam.r + interpolate(frame, [0, d], [-0.8, 0.6])}>
          {MOTES.map((m, i) => {
            const zv = m.z + dolly;
            const a = lensFade(zv) * (1 - fogAt(zv)) * m.a * tw(frame, 0.05 + random(`m${i}t`) * 0.5, 0.6);
            if (a <= 0.01) return null;
            return (
              <Plane key={i} x={m.x} y={m.y} z={m.z} width={m.size} height={m.size} opacity={a}>
                <div style={{width: '100%', height: '100%', borderRadius: 9999, background: `radial-gradient(circle, ${onDark(1)} 0%, ${onDark(0)} 70%)`}} />
              </Plane>
            );
          })}
          {CARDS.map((c, i) => {
            const at = 0.2 + i * 0.12;
            const rise = tw(frame, at, 1.1); // glides forward out of the dark
            const z = c.z - (1 - rise) * 520;
            const zv = z + dolly;
            const gone = lensFade(zv);
            if (gone <= 0) return null;
            const lit = tw(frame, at + 0.05, 0.8);
            const bob = (k: string, amp: number) => noise2D(`s01c${i}${k}`, frame / 70, 0) * amp;
            const h = HORROR[i];
            return (
              <Plane
                key={h.tag}
                x={c.x + bob('x', 8)}
                y={c.y + bob('y', 10)}
                z={z}
                rx={c.rx + bob('rx', 2)}
                ry={c.ry + bob('ry', 3)}
                rz={c.rz + bob('rz', 0.8)}
                scale={c.scale}
                opacity={tw(frame, at, 0.3) * gone}
              >
                <HorrorCard tag={h.tag} icon={h.icon} line={h.line} dark={1 - lit * (1 - fogAt(zv)) * (1 - 0.12 * focus)} sheen={tw(frame, at, 0.9)} />
              </Plane>
            );
          })}
        </Space>
      </AbsoluteFill>
      {/* Soft ink pool behind the headline keeps it readable whatever passes behind. */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 1050px 360px at 50% 50%, ${inkA(0.72)} 0%, ${inkA(0.45)} 50%, ${inkA(0)} 100%)`}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 120px'}}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${1 + 0.03 * (frame / d) + 0.4 * exit})`,
            opacity: 1 - exit,
            filter: exit > 0.02 ? `blur(${9 * exit}px)` : undefined,
          }}
        >
          <KineticText words={timed.slice(0, split)} dur={0.45} style={headStyle} />
          <KineticText words={timed.slice(split)} dur={0.45} style={headStyle} wordStyle={(i) => (i + split >= hot ? {color: onDark(1)} : undefined)} />
        </div>
      </AbsoluteFill>
      {/* The video opens here: fade up from ink. */}
      <AbsoluteFill style={{background: C.ink, opacity: 1 - tw(frame, 0, 0.3)}} />
      <Sfx name="whoosh-soft" at={0.8} volume={0.4} />
      <Sfx name="whoosh" at={dur - 0.3} volume={0.45} />
    </AbsoluteFill>
  );
};
