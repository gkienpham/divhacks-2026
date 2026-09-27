// S07 Shortlist: "Shortlist up to five. Meet when it's mutual."
// Beat 1: a 3D floor of the top 20 match cards; Sam's card lifts out, opens into the swipe card (SwipeView.jsx),
// is dragged right until the SHORTLIST stamp punches in, then flies off. Beat 2: KP and SK glide in from the sides
// and meet around 87%, "It's mutual". Enters from the right; exit: default whip left.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND_RGB, C, EASE, EASE_IN, FLOAT_SHADOW, FPS, TYPE, inkA, lightA, onDark, tw} from '../brand';
import {Glow, HBlur, KineticText, Plane, Sfx, Sheen, Space, drift, useEdges} from '../fx';
import {wordAt} from '../timing';
import {MATCHES, PAIR} from '../script';
import {InitialsAvatar} from '../../../web/components/rm/matching/InitialsAvatar.jsx';
import {MatchScore} from '../../../web/components/rm/matching/MatchScore.jsx';
import {HabitTag} from '../../../web/components/rm/labels/HabitTag.jsx';
import {Eyebrow} from '../../../web/components/rm/labels/Eyebrow.jsx';

const CAP_PILL = 'Shortlist up to 5';
const STAMP = 'Shortlist';

// The floor: 4 x 5 compact cards on a plane tilted back like a table top, scaled so it bleeds off the frame.
const COLS = 4;
const ROWS = 5;
const CW = 440;
const CH = 124;
const GAP = 40;
const GW = COLS * CW + (COLS - 1) * GAP;
const GH = ROWS * CH + (ROWS - 1) * GAP;
const FLOOR = {x: 60, y: 200, z: -260, rx: 52, scale: 1.25};
const SAM_SLOT = 13; // row 3, col 1: near the camera, left of center
const PERSP = 1300;

// The swipe card (SwipeView.jsx at 560 px) is laid out at 1x and zoomed, so its text stays crisp and >= 22 px.
const ZF = 1.8;
const FULL_H = 341; // 1x layout height: 32 + 72 + 24 + 20 + 24 + 85 + 24 + 28 + 32
const HERO = {x: 190, y: 50, z: 0, rx: 3, ry: -9};

// Beat 2: the pair's row (y) and how far each avatar stops from the center.
const PAIR_Y = 70;
const MEET_X = 268;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const rad = (deg: number) => (deg * Math.PI) / 180;

// CSS rotateX(rx) rotateZ(rz) applied to a local point (y down, z toward the viewer), as Plane composes them.
const rotXZ = (x: number, y: number, rx: number, rz: number) => {
  const cz = Math.cos(rad(rz));
  const sz = Math.sin(rad(rz));
  const x1 = cz * x - sz * y;
  const y1 = sz * x + cz * y;
  return {x: x1, y: Math.cos(rad(rx)) * y1, z: Math.sin(rad(rx)) * y1};
};

// Slot center relative to the floor's center (floor units, before FLOOR.scale).
const slotXY = (i: number) => ({
  x: (i % COLS) * (CW + GAP) + CW / 2 - GW / 2,
  y: Math.floor(i / COLS) * (CH + GAP) + CH / 2 - GH / 2,
});

// Everyone but Sam, in order; Sam takes SAM_SLOT.
const OTHERS = MATCHES.names.filter((n) => n !== PAIR.them.name);
const SLOTS = Array.from({length: COLS * ROWS}, (_, i) => (i === SAM_SLOT ? null : OTHERS[i < SAM_SLOT ? i : i - 1]));

const MiniCard: React.FC<{name: string; o: number; sweep: number}> = ({name, o, sweep}) => (
  <div
    style={{
      position: 'relative',
      width: CW,
      height: CH,
      borderRadius: 21.6,
      background: C.card,
      border: `1px solid ${C.border}`,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '0 28px',
      opacity: o,
    }}
  >
    <InitialsAvatar name={name} size={48} />
    <span style={{fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', color: C.ink}}>{name}</span>
    <Sheen progress={sweep} rgb={BRAND_RGB} intensity={0.2} width={20} />
  </div>
);

// Sam's card: the compact floor card at m = 0, the full swipe card at m = 1. Avatar and name are shared elements.
const HeroCard: React.FC<{m: number; lift: number; stamp: number; sheen: number}> = ({m, lift, stamp, sheen}) => {
  const w = lerp(CW, 560 * ZF, m);
  const h = lerp(CH, FULL_H * ZF, m);
  const r = lerp(21.6, 24 * ZF, m);
  const av = lerp(48, 72 * ZF, m);
  const avX = lerp(28, 32 * ZF, m);
  const avY = lerp((CH - 48) / 2, 32 * ZF, m);
  const nameX = avX + av + lerp(20, 18 * ZF, m);
  // The details sit at their final layout and rise in early: the growing card reveals them as it opens.
  const f = (a: number, b: number) => interpolate(m, [a, b], [0, 1], {...clamp, easing: EASE});
  const rise = (k: number): React.CSSProperties => ({opacity: k, transform: `translateY(${(1 - k) * 14}px)`});
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: r, boxShadow: FLOAT_SHADOW, opacity: lift}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: r,
          background: C.card,
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
          // Picked out on the floor by a steel-blue rim before it lifts.
          boxShadow: `0 0 0 ${lerp(2, 0, lift)}px ${lightA(0.75)}, 0 0 64px ${lightA(0.6 * (1 - lift))}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 28,
            top: 0,
            height: CH,
            display: 'flex',
            alignItems: 'center',
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: C.ink,
            fontVariantNumeric: 'tabular-nums',
            opacity: interpolate(m, [0.1, 0.4], [1, 0], clamp),
          }}
        >
          {PAIR.pct}%
        </div>
        <div style={{position: 'absolute', left: 0, top: 0, zoom: ZF, width: 560, padding: 32}}>
          <div style={{height: 72}} />
          <div style={{marginTop: 24, ...rise(f(0.3, 0.6))}}>
            <Eyebrow style={{fontSize: 12.5, whiteSpace: 'normal', lineHeight: 1.6}}>{PAIR.them.meta}</Eyebrow>
          </div>
          <div style={{marginTop: 24, ...rise(f(0.38, 0.68))}}>
            <MatchScore value={PAIR.pct} showLink={false} />
          </div>
          <div style={{marginTop: 24, display: 'flex', gap: 6, ...rise(f(0.55, 0.85))}}>
            {PAIR.tagsThem.map((tag) => (
              <HabitTag key={tag} style={{fontSize: 12.5}}>
                {tag}
              </HabitTag>
            ))}
          </div>
        </div>
        <InitialsAvatar initials={PAIR.them.initials} name={PAIR.them.name} size={av} style={{position: 'absolute', left: avX, top: avY}} />
        <div
          style={{
            position: 'absolute',
            left: nameX,
            top: avY + av / 2,
            transform: 'translateY(-50%)',
            fontSize: lerp(24, 26 * ZF, m),
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: lerp(-0.01, -0.015, m) + 'em',
            color: C.ink,
          }}
        >
          {PAIR.them.name}
        </div>
        <Sheen progress={sheen} rgb={BRAND_RGB} intensity={0.09} width={12} />
      </div>
      {/* The app's Shortlist stamp (SwipeView Stamp: ink pill, 2 px ink border, -8 deg), punched in at 28 px. */}
      <div
        style={{
          position: 'absolute',
          right: 48,
          top: 54,
          padding: '12px 26px',
          borderRadius: 9999,
          border: `2px solid ${C.ink}`,
          background: C.ink,
          color: C.card,
          fontSize: 28,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: interpolate(stamp, [0, 0.3], [0, 1], clamp),
          transform: `rotate(-8deg) scale(${lerp(1.8, 1, stamp)})`,
          boxShadow: `0 10px 24px -10px ${inkA(0.45)}`,
        }}
      >
        {STAMP}
      </div>
    </div>
  );
};

export const S07Shortlist: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / FPS;
  const d = durationInFrames / FPS;
  const {enter, exit} = useEdges(0.35, 0.3);

  // Beats (scene-local seconds) from the VO. Beat 2 comes in before "mutual" when the line runs long, so
  // "It's mutual" still reads for >= 0.8 s before the exit whip. The card is gone before beat 2.
  const exitAt = d - 0.3;
  const tB2 = Math.min(wordAt('S07', 'mutual') - 0.3, exitAt - 1.1);
  const tStamp = Math.min(wordAt('S07', 'Meet') - 0.4, tB2 - 0.6);
  const tLift = Math.max(0.24, tStamp - 0.62);
  const liftDur = Math.max(0.3, tStamp - tLift); // the card is open as the stamp hits
  const tFly = tStamp + 0.24; // the stamp holds, then the card is released
  const tMeet = tB2 + 0.36; // the avatars come to rest

  // Camera: a glide forward over the floor with handheld drift.
  const dr = drift(frame, 's07', 1);
  const cam = {perspective: PERSP, panX: dr.x, panY: dr.y + lerp(-30, 20, tw(frame, 0, d)), rz: dr.r};
  const glide = interpolate(t, [0, tB2 + 0.6], [-220, 40], {...clamp, easing: EASE});
  const floorRz = lerp(-9, -7, tw(frame, 0, tB2 + 0.6));

  // Sam's card: slot pose (tracks the gliding floor) -> hero pose facing the camera -> dragged -> swiped off right.
  const lift = tw(frame, tLift, liftDur);
  const morph = tw(frame, tLift + liftDur * 0.08, liftDur * 0.85);
  const drag = tw(frame, tStamp - 0.18, 0.4); // like a finger dragging it: the stamp shows once it passes the threshold
  const stamp = tw(frame, tStamp, 0.16);
  const hit = interpolate(t, [tStamp, tStamp + 0.05, tStamp + 0.3], [0, 1, 0], clamp);
  const fly = interpolate(t, [tFly, tFly + 0.3], [0, 1], {...clamp, easing: EASE_IN});
  const slot = slotXY(SAM_SLOT);
  const onFloor = rotXZ(slot.x * FLOOR.scale, (slot.y + glide) * FLOOR.scale, FLOOR.rx, floorRz);
  const arc = Math.sin(Math.PI * lift);
  const hero = {
    x: lerp(FLOOR.x + onFloor.x, HERO.x, lift) + drag * 56 + fly * 1700,
    y: lerp(FLOOR.y + onFloor.y, HERO.y, lift) - arc * 40 + fly * 70,
    z: lerp(FLOOR.z + onFloor.z, HERO.z, lift) + arc * 220,
    rx: lerp(FLOOR.rx, HERO.rx, lift),
    ry: lerp(0, HERO.ry, lift),
    rz: lerp(floorRz, 0, lift) + drag * 3 + fly * 11, // 14 deg at the end, like the app's fly-out
    scale: lerp(FLOOR.scale, 1, lift) * (1 - 0.014 * hit),
  };

  // Floor: far rows sink into the dark; everything dims while the card is up, then fades out under beat 2.
  const dim = lerp(1, 0.32, lift);
  const floorOut = 1 - tw(frame, tB2 - 0.15, 0.45);
  const sweep = interpolate(t, [0.05, tStamp + 0.25], [-0.2, 1.3], clamp);

  // Beat 2: the camera keeps pushing in and orbits slowly, so the layers parallax.
  const bK = tw(frame, tB2 - 0.08, 0.62);
  const bS = tw(frame, tB2 + 0.02, 0.62);
  const b2 = tw(frame, tB2, d - tB2);
  const creep = interpolate(t, [tB2, d], [0, 1], clamp); // linear, so the hold never freezes
  const pct = tw(frame, tMeet - 0.14, 0.45);
  const pulse = interpolate(t, [tMeet - 0.08, tMeet + 0.1, tMeet + 0.9], [0, 1, 0.55], clamp);
  const stage = tw(frame, tB2 - 0.2, 0.6); // beat 2's own light takes over from the floor's horizon
  const spread = interpolate(t, [tMeet - 0.06, tMeet + 0.6], [0, 1], {...clamp, easing: EASE});
  const streak = interpolate(t, [tMeet - 0.06, tMeet + 0.06, tMeet + 0.8], [0, 1, 0.35], clamp);
  const sub = tw(frame, tB2 + 0.36, 0.5);
  const titleOut = tw(frame, tB2 - 0.05, 0.3);
  const rim = (k: number) => ({boxShadow: `0 0 0 1.5px ${lightA(0.6 * k)}, 0 0 56px ${lightA(0.55 * k)}`});
  const close = lerp(0, 14, tw(frame, tMeet, d - tMeet)); // the pair keeps drifting together

  const whipX = (1 - enter) * 420 - exit * 520;
  const whipBlur = Math.max((1 - enter) * 40, exit * 40);

  return (
    <HBlur amount={whipBlur} style={{background: C.ink}}>
      <AbsoluteFill style={{transform: `translateX(${whipX}px)`}}>
        {/* The light source: a steel-blue horizon behind the far edge of the floor. */}
        <Glow x="66%" y="28%" size={1800} opacity={0.9 * floorOut} />

        <Space {...cam}>
          <Plane x={FLOOR.x} y={FLOOR.y} z={FLOOR.z} rx={FLOOR.rx} rz={floorRz} scale={FLOOR.scale} width={GW} height={GH} opacity={floorOut}>
            {/* The ground catches the horizon light, so the field reads as a surface past the cards. */}
            <div
              style={{
                position: 'absolute',
                left: -900,
                top: -900 + glide,
                width: GW + 1800,
                height: GH + 1500,
                background: `radial-gradient(ellipse 50% 45% at 55% 30%, ${lightA(0.2)}, ${lightA(0.07)} 55%, ${lightA(0)} 100%)`,
              }}
            />
            {/* Light spills onto the floor where Sam's card lifts off. */}
            <Glow x={slot.x + GW / 2} y={slot.y + GH / 2 + glide} size={900} opacity={lift * 0.9} />
            {SLOTS.map((name, i) => {
              if (!name) return null;
              const p = slotXY(i);
              const row = Math.floor(i / COLS);
              const k = (i % COLS) * 0.1 + row * 0.07;
              return (
                <div key={name} style={{position: 'absolute', left: p.x + GW / 2 - CW / 2, top: p.y + GH / 2 - CH / 2 + glide}}>
                  <MiniCard name={name} o={dim * lerp(0.55, 0.96, row / (ROWS - 1))} sweep={sweep - k} />
                </div>
              );
            })}
          </Plane>
        </Space>

        {/* Depth fog: the far rows sink into ink under the title; thins out as the card lifts. */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${C.ink} 0%, ${inkA(0.92)} 20%, ${inkA(0.5)} 42%, ${inkA(0)} 64%)`,
            opacity: 1 - lift * 0.4,
          }}
        />
        <Glow x="66%" y="24%" size={1300} opacity={0.3 * floorOut} />

        {/* "Your top 20" and the cap, top left. */}
        <AbsoluteFill style={{padding: 120, opacity: 1 - titleOut, transform: `translateY(${-titleOut * 24}px)`}}>
          <KineticText text={MATCHES.title} at={0.06} stagger={0.06} dur={0.5} style={{...TYPE.h1, color: C.card}} />
          <div
            style={{
              marginTop: 30,
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              height: 50,
              padding: '0 22px',
              borderRadius: 9999,
              border: `1px solid ${onDark(0.28)}`,
              color: onDark(0.88),
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              opacity: tw(frame, 0.22, 0.3),
              transform: `translateY(${(1 - tw(frame, 0.22, 0.45)) * 14}px)`,
            }}
          >
            <span style={{width: 8, height: 8, borderRadius: 9999, background: C.card}} />
            {CAP_PILL}
          </div>
        </AbsoluteFill>

        {/* Sam's card, in its own layer so the swipe can carry motion blur. */}
        {fly < 1 && (
          <HBlur amount={fly * 46}>
            <Space {...cam}>
              <Plane x={hero.x} y={hero.y} z={hero.z} rx={hero.rx} ry={hero.ry} rz={hero.rz} scale={hero.scale}>
                <HeroCard m={morph} lift={lift} stamp={stamp} sheen={interpolate(t, [tLift + liftDur * 0.45, tStamp + 0.4], [0, 1], clamp)} />
              </Plane>
            </Space>
          </HBlur>
        )}

        {/* Beat 2: it's mutual. */}
        <Glow x="50%" y="56%" size={1300} opacity={Math.max(0.4 * stage, 0.95 * pulse)} />
        <Space
          perspective={PERSP}
          dolly={120 * b2 + 100 * creep}
          panX={dr.x * 0.6}
          panY={dr.y * 0.6}
          rx={2 - 2 * b2 - creep}
          ry={-7 + 6 * b2 + 4 * creep}
          rz={dr.r * 0.5}
        >
          <Plane y={-205} z={-40} width={1500}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <KineticText
                text={MATCHES.mutual}
                at={tB2 - 0.06}
                stagger={0.09}
                dur={0.5}
                style={{...TYPE.display, color: C.card, whiteSpace: 'nowrap', paddingLeft: '0.24em'}}
              />
            </div>
          </Plane>
          {/* The meeting: a soft anamorphic bloom behind the pair (light only, nothing crosses the type). */}
          <Plane y={PAIR_Y} z={-60} width={0} height={0} opacity={streak}>
            <div
              style={{
                position: 'absolute',
                left: -800,
                top: -90,
                width: 1600,
                height: 180,
                transform: `scaleX(${0.4 + 0.6 * spread})`,
                background: `radial-gradient(ellipse at center, ${lightA(0.5)} 0%, ${lightA(0.14)} 38%, ${lightA(0)} 70%)`,
              }}
            />
          </Plane>
          <Plane x={lerp(-820, -MEET_X, bK) + close} y={PAIR_Y} z={lerp(-160, 60, bK)} opacity={tw(frame, tB2 - 0.08, 0.2)}>
            <InitialsAvatar initials={PAIR.you.initials} name={PAIR.you.name} size={144} onDark style={rim(pulse)} />
          </Plane>
          <Plane x={lerp(820, MEET_X, bS) - close} y={PAIR_Y} z={lerp(-160, 60, bS)} opacity={tw(frame, tB2 + 0.02, 0.2)}>
            <InitialsAvatar initials={PAIR.them.initials} name={PAIR.them.name} size={144} onDark style={rim(pulse)} />
          </Plane>
          <Plane y={PAIR_Y} z={20} scale={lerp(0.86, 1, pct)} opacity={pct}>
            <div style={{display: 'flex', alignItems: 'flex-start', color: C.card, fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>
              <span style={{fontSize: 96, lineHeight: 1, letterSpacing: '-0.04em'}}>{PAIR.pct}</span>
              <span style={{fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8, marginLeft: 3}}>%</span>
            </div>
          </Plane>
          <Plane y={228} z={-10} width={1200} opacity={sub}>
            <div style={{textAlign: 'center', fontSize: 30, fontWeight: 400, color: onDark(0.75), transform: `translateY(${(1 - sub) * 14}px)`}}>
              {MATCHES.mutualSub}
            </div>
          </Plane>
        </Space>
      </AbsoluteFill>

      <Sfx name="stamp" at={tStamp} volume={0.6} />
      <Sfx name="whoosh" at={tFly - 0.05} volume={0.35} />
      <Sfx name="chime" at={tMeet - 0.04} volume={0.5} />
      <Sfx name="whoosh" at={d - 0.3} volume={0.45} />
    </HBlur>
  );
};
