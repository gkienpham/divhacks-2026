// S05 Contradiction. "We flag answers that don't add up."
// A quick-tap answer and a voice quote fly in from both sides and slide together while the camera creeps in. They
// collide on "add" (stamp, shake, steel-blue flash), and the real ContradictionCallout opens out of the impact point
// behind a ring of light as the two answers shrink onto its quote rows. Exit: the camera pushes into the callout,
// which fades to ink (S06 opens on a huge 87 that dollies back).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {BRAND_RGB, C, EASE_IN, FLOAT_SHADOW, FPS, TYPE, lightA, onDark, settle, tw} from '../brand';
import {Glow, HBlur, KineticText, Plane, Sfx, Sheen, Space, drift} from '../fx';
import {lineAt, wordAt} from '../timing';
import {CONTRADICTION} from '../script';
import {ContradictionCallout} from '../../../web/components/rm/matching/ContradictionCallout.jsx';
import {Icon} from '../../../web/components/rm/core/Icon.jsx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const linear = (x: number) => x;
const norm = (x: string) => x.toLowerCase().replace(/[^a-z]/g, '');

// World px from the frame center, except HEAD_TOP (screen px: the headline sits outside the camera).
const HEAD_TOP = 118;
const CARD_Y = 40; // answer cards
const WL = 420; // quick-tap card width
const WR = 640; // voice card width
const CONTACT = (WL - WR) / 2; // where the cards meet, so the pair sits centered
const PAD_X = 38; // card side padding
const GAP = {drift: 95, rush: 115}; // each card's distance from the contact point: slow slide, then the rush
const CALLOUT_Y = 62;
const K = 1.47; // callout zoom: its suggested question (15 px in the app) reads at 22 px
const CW = 600; // callout width before zoom
const CH = 488; // callout height at that width
const ROWS = [
  [136, 208],
  [214, 290],
]; // its two quote rows (px inside it, before zoom), between the divider lines
const M = (18 * K) / 36; // card scale at which a card's 36 px quote matches the callout's zoomed 18 px quote
// Card center that lands its quote on callout row i at scale M. From the callout's box model at width 600
// (quote rows centered 174 and 252 px down), with per-row offsets measured by cross-correlating a render of the
// card words against the callout's own words at the handoff frames.
const rowTarget = (w: number, i: number) => ({
  x: (-CW / 2 + 32) * K - (-w / 2 + PAD_X) * M + [1, 0][i],
  y: CALLOUT_Y + ([174, 252][i] - CH / 2) * K - 18 * M + [7, 5][i],
});
// The callout opens out of the impact point (in its own pre-zoom px) behind a soft edge with light on its front.
const OPEN = {x: CW / 2 + CONTACT / K, y: CH / 2 + (CARD_Y - CALLOUT_Y) / K, r: 540, edge: 50};
// The push aims at the callout's eyebrow ("Worth a second look"), so it grows toward the lens and the callout grows
// down, away from the headline.
const AIM = {x: -120, y: -270};

// A white answer card. Its shell (fill, shadow, and a rim light on the edge that faces the other card) and its icon
// can dissolve on their own while the words keep moving.
const Answer: React.FC<{
  source: string;
  quote: string;
  icon: string;
  width: number;
  side: -1 | 1;
  shell: number;
  rim: number;
  iconK: number;
}> = ({source, quote, icon, width, side, shell, rim, iconK}) => (
  <div style={{position: 'relative', width, padding: `30px ${PAD_X}px 34px`, whiteSpace: 'nowrap'}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 24,
        background: C.card,
        opacity: shell,
        boxShadow: `${FLOAT_SHADOW}, ${-side * 20}px 0 56px -14px ${lightA(0.95 * rim)}, inset ${side * 2}px 0 0 ${lightA(0.7 * rim)}`,
      }}
    />
    <div style={{position: 'relative', display: 'flex', alignItems: 'center', fontSize: 24, color: C.muted}}>
      <span style={{width: 32 * iconK, overflow: 'hidden', opacity: iconK, flex: 'none'}}>
        <Icon name={icon} size={22} />
      </span>
      {source}
    </div>
    <div style={{position: 'relative', marginTop: 12, fontSize: 36, fontWeight: 500, letterSpacing: '-0.01em', color: C.ink}}>“{quote}”</div>
  </div>
);

export const S05Contradiction: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const T = d / FPS;
  const t = frame / FPS;
  const [quick, voice] = CONTRADICTION.answers;

  // The cards meet on "add", but at least 0.85 s before the cut so the callout gets its read. Frame-aligned, so the
  // flash peaks on a frame and the stamp lands with it.
  const hit = Math.round(Math.max(1.1, Math.min(wordAt('S05', 'add'), T - 0.85)) * FPS) / FPS;
  const since = Math.max(0, t - hit);
  const after = t >= hit;

  // Headline: "We flag answers" rises word by word with the voice, then "that don't add up." lands as one phrase on
  // "that", so the whole line is up by the impact and holds through the callout.
  const vo = lineAt('S05').words;
  const head = CONTRADICTION.headline.split(' ');
  const cut = Math.max(1, head.findIndex((w) => norm(w) === 'that'));
  const p2 = wordAt('S05', 'that') - 0.16;
  const words = head.map((text, i) => ({
    text,
    start: i < cut ? Math.max(vo[0].start - 0.1 + i * 0.05, (vo[i]?.start ?? 0) - 0.1) : p2 + (i - cut) * 0.05,
  }));

  // Camera: whip in from the right, creep in while the cards close, shake and recoil on impact, then one continuous
  // push that starts gently and rushes into the eyebrow at the cut. It always breathes.
  const inX = 900 * (1 - tw(frame, 0, 0.4));
  const inBlur = 40 * (1 - tw(frame, 0, 0.35));
  const pushAt = hit + 0.3;
  const push = tw(frame, pushAt, Math.max(0.2, T - pushAt), 0, 1, EASE_IN);
  const dr = drift(frame, 's05', 1.2);
  const shake = after ? 16 * Math.exp(-since * 12) : 0;
  const creep = tw(frame, 0.45, Math.max(0.1, hit - 0.45), 0, 150, linear);
  const recoil = 120 * tw(frame, hit + 0.04, 0.5);
  const dolly = creep - recoil + 1350 * push;
  const arc = 2.5 * (1 - tw(frame, 0, hit + 0.2)); // a slow arc around the pair that settles by the impact
  const camX = -inX + dr.x + shake * Math.sin(since * 75) + AIM.x * push;
  const camY = dr.y + shake * 0.6 * Math.sin(since * 95 + 1) + (CALLOUT_Y + AIM.y) * push;
  // The last frames: the headline lifts away, the frame softens and goes to ink.
  const headOut = interpolate(frame, [d - 8, d - 2], [0, 1], clamp);
  const blurOut = interpolate(frame, [d - 6, d - 1], [0, 10], clamp);
  const fade = interpolate(frame, [d - 6, d - 1], [0, 0.95], clamp);

  // Cards: fly in from each side (3D, turning to face each other), slide together, then rush into each other.
  // They start just before the cut, so the whip lands on a card already in frame.
  const inL = tw(frame, -0.15, 0.8);
  const inR = tw(frame, -0.08, 0.8);
  const slide = interpolate(t, [0.5, hit], [0, 1], clamp);
  const approach = tw(frame, hit - 0.4, 0.4, 0, 1, EASE_IN);
  const gap = GAP.drift * (1 - slide) + GAP.rush * (1 - approach);
  const rim = after ? 0 : tw(frame, hit - 0.7, 0.7, 0, 1, EASE_IN);
  // After the hit each card shrinks onto its row of the callout: the shell dissolves first, the words hand off last.
  // The sand patches clear first, uncovering the callout's own words exactly under the card words, then those fade,
  // so the text never dims mid-swap.
  const morph = tw(frame, hit + 0.02, 0.34);
  const shell = 1 - tw(frame, hit + 0.04, 0.2);
  const patch = interpolate(t, [hit + 0.33, hit + 0.37], [1, 0], clamp);
  const handoff = interpolate(t, [hit + 0.37, hit + 0.42], [1, 0], clamp);
  const card = (w: number, sign: -1 | 1, p: number, i: number) => {
    const restX = CONTACT + sign * (gap + w / 2);
    const to = rowTarget(w, i);
    const float = (1 - approach) * (1 - morph);
    return {
      x: interpolate(p, [0, 1], [sign * 1500, restX]) + morph * (to.x - restX),
      y: CARD_Y + morph * (to.y - CARD_Y) + 7 * float * noise2D(`s05y${i}`, frame / 40, 0),
      z: interpolate(p, [0, 1], [-420, 30]) - 30 * morph, // lands on the callout's own plane
      // Fly in turned 25 degrees, hold a shallow V facing each other, square up for the contact.
      ry: -sign * (25 * (1 - p) + 7 * p * (1 - approach)),
      rz: 0.8 * float * noise2D(`s05r${i}`, frame / 50, 0),
      scale: 1 - morph * (1 - M),
      opacity: interpolate(p, [0, 0.25], [0, 1], clamp) * handoff,
    };
  };

  // Callout: opens out of the impact point behind a ring of light, tilted back (rx 10 settling to 2), then one
  // steel-blue sheen. Sand patches hide its two quote rows until the cards land on them.
  const open = tw(frame, hit, 0.42);
  const r = open * OPEN.r;
  const mask = open < 1 ? `radial-gradient(circle at ${OPEN.x}px ${OPEN.y}px, #000 ${r - OPEN.edge}px, transparent ${r}px)` : undefined;
  const ringR = Math.max(0, r - OPEN.edge / 2);
  const ringA = after && open < 1 ? (1 - open) ** 0.7 : 0;
  const lit = tw(frame, hit + 0.06, 0.4);
  const tilt = settle(frame, hit, 0.9);
  const sheen = tw(frame, hit + 0.26, 0.75);

  // Light: a key light builds behind the closing pair, then the impact flash (bloom, white core, anamorphic streak).
  const charge = after ? 0 : slide * 0.35 + approach * 0.55;
  const flash = after ? Math.exp(-since * 7.5) : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: blurOut > 0.3 ? `blur(${blurOut}px)` : undefined}}>
        <HBlur amount={inBlur}>
          <Space dolly={dolly} panX={camX} panY={camY} rx={dr.r * 0.8} ry={dr.r * 1.2 + arc}>
            {/* Ambient floor light, the key light behind the pair, then the backlight that comes up behind the callout. */}
            <Plane y={380} z={-600}>
              <Glow x={0} y={0} size={2600} opacity={0.3} />
            </Plane>
            <Plane x={CONTACT} y={CARD_Y} z={-420}>
              <Glow x={0} y={0} size={1500} opacity={0.18 + charge} />
            </Plane>
            <Plane y={CALLOUT_Y} z={-260}>
              <Glow x={0} y={0} size={1900} opacity={0.5 * lit} />
            </Plane>

            {t >= hit - 0.05 && (
              <Plane y={CALLOUT_Y} rx={10 - 8 * tilt}>
                <div style={{position: 'relative', zoom: K, width: CW}}>
                  <div style={{position: 'absolute', inset: 0, borderRadius: 24, boxShadow: FLOAT_SHADOW, opacity: lit}} />
                  <div style={{position: 'relative', borderRadius: 24, overflow: 'hidden'}}>
                    <div style={{position: 'relative', WebkitMaskImage: mask, maskImage: mask}}>
                      <ContradictionCallout eyebrow={CONTRADICTION.eyebrow} answers={[...CONTRADICTION.answers]} question={CONTRADICTION.question} sent={false} />
                      {ROWS.map(([top, bottom]) => (
                        <div key={top} style={{position: 'absolute', left: 28, right: 28, top, height: bottom - top, background: C.sand, opacity: patch}} />
                      ))}
                      <Sheen progress={sheen} rgb={BRAND_RGB} intensity={0.15} />
                    </div>
                    {ringA > 0.01 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: OPEN.x - ringR,
                          top: OPEN.y - ringR,
                          width: 2 * ringR,
                          height: 2 * ringR,
                          borderRadius: 9999,
                          border: `1.5px solid ${lightA(0.9)}`,
                          boxShadow: `0 0 22px 3px ${lightA(0.6)}, inset 0 0 22px 3px ${lightA(0.45)}`,
                          opacity: ringA,
                        }}
                      />
                    )}
                  </div>
                </div>
              </Plane>
            )}

            {handoff > 0 && (
              <>
                <Plane {...card(WL, -1, inL, 0)}>
                  <Answer source={quick.source} quote={quick.quote} icon="users" width={WL} side={-1} shell={shell} rim={rim} iconK={1 - morph} />
                </Plane>
                <Plane {...card(WR, 1, inR, 1)}>
                  <Answer source={voice.source} quote={voice.quote} icon="mic" width={WR} side={1} shell={shell} rim={rim} iconK={1 - morph} />
                </Plane>
              </>
            )}

            {flash > 0.02 && (
              <Plane x={CONTACT} y={CARD_Y} z={90}>
                <Glow x={0} y={0} size={1700 + 900 * (1 - flash)} opacity={flash} />
                <Glow x={0} y={0} size={560} opacity={flash ** 1.5} rgb="255,255,255" />
                <div
                  style={{
                    position: 'absolute',
                    left: -1100,
                    top: -38,
                    width: 2200,
                    height: 76,
                    opacity: flash ** 2,
                    background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${onDark(0.9)} 0%, ${lightA(0.55)} 22%, ${lightA(0)} 100%)`,
                  }}
                />
              </Plane>
            )}
          </Space>

          {/* Headline in screen space: rides the whip in, breathes a little, lifts away on the push. */}
          <AbsoluteFill
            style={{
              opacity: 1 - headOut,
              transform: `translate(${inX - 0.5 * dr.x}px, ${-0.5 * dr.y - 120 * headOut}px) scale(${1 + 0.08 * headOut})`,
            }}
          >
            <div style={{position: 'absolute', top: HEAD_TOP, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <KineticText words={words} dur={0.38} style={{...TYPE.h2, color: onDark(1), whiteSpace: 'nowrap', marginRight: '-0.24em'}} />
            </div>
          </AbsoluteFill>
        </HBlur>
      </AbsoluteFill>
      {/* The push ends on ink: S06 opens with a huge 87 that dollies back. */}
      <AbsoluteFill style={{background: C.ink, opacity: fade}} />
      <Sfx name="stamp" at={hit} volume={0.5} />
      <Sfx name="whoosh-soft" at={T - 0.35} volume={0.35} />
    </AbsoluteFill>
  );
};
