// S02 Problem: "Most start with one DM vibe check and a twelve-month lease."
// Beat 1: a tilted chat panel pops three DMs while "One DM vibe check." types out on the right.
// Beat 2 (on "twelve"): a lease slams down over the chat, the camera shakes, the chat is knocked back and the
// label becomes "12-month lease."; a scribble signs it. Beat 3: the vacancy stat. Exit: rush to camera, fade to ink.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {evolvePath} from '@remotion/paths';
import {Icon} from '../../../web/components/rm/core/Icon.jsx';
import {C, EASE_IN, FLOAT_SHADOW, FPS, POLAROID_SHADOW, TYPE, inkA, lightA, onDark, s, settle, tw} from '../brand';
import {Glow, KineticText, Plane, Sfx, Sheen, Space, drift, useEdges} from '../fx';
import {PROBLEM, STAT} from '../script';
import {wordAt} from '../timing';

const P = 1800;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// The tenant's signature: one continuous stroke (a looped capital, a run of small waves, an underline flourish).
const SIG =
  'M18 74 C 26 30, 64 8, 66 40 C 68 66, 36 84, 34 64 C 32 46, 70 50, 86 66 C 98 78, 106 44, 118 52 ' +
  'C 128 60, 126 76, 140 70 C 152 64, 158 40, 170 50 C 180 58, 176 78, 192 72 C 206 66, 212 44, 226 52 ' +
  'C 238 60, 236 76, 252 70 C 270 62, 290 44, 316 46 C 340 48, 350 58, 336 70 C 310 90, 180 96, 70 90';

const Bubble: React.FC<{from: string; text: string; at: number}> = ({from, text, at}) => {
  const frame = useCurrentFrame();
  const p = settle(frame, at, 0.45);
  const you = from === 'you';
  return (
    <div
      style={{
        alignSelf: you ? 'flex-end' : 'flex-start',
        padding: '16px 24px',
        borderRadius: you ? '24px 24px 12px 24px' : '24px 24px 24px 12px',
        background: you ? C.sand : C.card,
        color: C.ink,
        fontSize: 30,
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${(1 - p) * 20}px) scale(${0.7 + 0.3 * p})`,
        transformOrigin: you ? '100% 100%' : '0% 100%',
      }}
    >
      {text}
    </div>
  );
};

// Three dots while "they" type, before the first message lands.
const Typing: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  const a = tw(frame, from, 0.3) * (1 - tw(frame, to - 0.08, 0.12));
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 28, top: 146, display: 'flex', gap: 9, padding: '26px 24px', borderRadius: '24px 24px 24px 12px', background: C.card, opacity: a}}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{width: 11, height: 11, borderRadius: 9999, background: C.muted, opacity: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((frame / FPS) * 11 - i * 1.1))}} />
      ))}
    </div>
  );
};

const ChatPanel: React.FC<{bubbleAt: number[]; dim: number}> = ({bubbleAt, dim}) => (
  <div
    style={{
      position: 'relative',
      width: 520,
      height: 640,
      padding: 28,
      borderRadius: 28,
      background: onDark(0.06),
      border: `1px solid ${onDark(0.12)}`,
      boxShadow: `0 60px 120px -40px ${inkA(0.9)}, 0 0 90px -20px ${lightA(0.3)}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 22, borderBottom: `1px solid ${onDark(0.12)}`}}>
      <span style={{width: 56, height: 56, borderRadius: 9999, background: onDark(0.16)}} />
      <div style={{display: 'grid', gap: 10}}>
        <span style={{width: 150, height: 14, borderRadius: 9999, background: onDark(0.5)}} />
        <span style={{width: 96, height: 10, borderRadius: 9999, background: onDark(0.22)}} />
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28}}>
      {PROBLEM.dms.map((m, i) => (
        <Bubble key={i} from={m.from} text={m.text} at={bubbleAt[i]} />
      ))}
    </div>
    <Typing from={0.3} to={bubbleAt[0]} />
    <div style={{marginTop: 'auto', height: 60, borderRadius: 9999, border: `1px solid ${onDark(0.14)}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 9px'}}>
      <span style={{width: 42, height: 42, borderRadius: 9999, background: onDark(0.12), color: onDark(0.6), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name="arrow-up" size={20} />
      </span>
    </div>
    <div style={{position: 'absolute', inset: 0, background: C.ink, opacity: dim}} />
  </div>
);

const Bar: React.FC<{w: number}> = ({w}) => <span style={{display: 'block', width: `${w}%`, height: 14, borderRadius: 9999, background: C.sand}} />;

const Lease: React.FC<{sign: number}> = ({sign}) => {
  const ink = evolvePath(sign, SIG);
  return (
    <div
      style={{
        width: 620,
        height: 800,
        padding: 56,
        borderRadius: 12,
        background: C.card,
        boxShadow: `${POLAROID_SHADOW}, ${FLOAT_SHADOW}`,
        display: 'flex',
        flexDirection: 'column',
        color: C.ink,
      }}
    >
      <div style={{fontSize: 50, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.03em'}}>{PROBLEM.lease.title}</div>
      <div style={{height: 1, background: C.border, margin: '30px 0 28px'}} />
      <div style={{alignSelf: 'flex-start', padding: '10px 18px', borderRadius: 12, background: C.sand, fontSize: 34, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.02em'}}>
        {PROBLEM.lease.term}
      </div>
      <div style={{display: 'grid', gap: 18, marginTop: 34}}>
        {[100, 94, 97, 88, 64].map((w, i) => (
          <Bar key={i} w={w} />
        ))}
      </div>
      <div style={{display: 'grid', gap: 18, marginTop: 30}}>
        {[96, 91, 52].map((w, i) => (
          <Bar key={i} w={w} />
        ))}
      </div>
      <div style={{marginTop: 'auto'}}>
        <svg width={360} height={104} viewBox="0 0 360 104" style={{display: 'block', marginBottom: -22, marginLeft: -6}}>
          <path d={SIG} fill="none" stroke={C.ink} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ink.strokeDasharray} strokeDashoffset={ink.strokeDashoffset} />
        </svg>
        <div style={{height: 1, width: '82%', background: inkA(0.35)}} />
        <div style={{marginTop: 14, fontSize: 28, lineHeight: 1.2, color: C.muted}}>{PROBLEM.lease.sign}</div>
      </div>
    </div>
  );
};

export const S02Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const dur = d / FPS;
  const t = frame / FPS;
  const {exit} = useEdges(0.5, 0.25);

  // Beats from the voiceover.
  const tOne = wordAt('S02', 'one');
  const tVibe = wordAt('S02', 'vibe');
  const tImp = wordAt('S02', 'twelve'); // the lease lands on "twelve"
  const tPill = Math.max(tVibe + 0.4, Math.min(wordAt('S02', 'and'), dur - 1.35));
  const bubbleAt = PROBLEM.dms.map((_, i) => tOne - 0.12 + i * 0.3);

  // Entry: settle from 1.12 (S01 rushed in); a trace of its blur clears.
  const enter = settle(frame, 0, 0.75);
  const scale = (1.12 - 0.12 * enter) * (1 + 0.22 * exit);

  // Impact: a quick shake that dies over 0.3 s.
  const k = t >= tImp ? Math.pow(1 - Math.min(1, (t - tImp) / 0.3), 2) : 0;
  const shake = (seed: string, amp: number) => noise2D(seed, frame * 0.9, 0) * amp * k;
  const cam = drift(frame, 's02', 1);

  // The lease falls toward the frame and slams flat; the chat is knocked back and dimmed. The lease lands at
  // z 160, in front of every corner of the tilted chat, so the two planes never intersect.
  const fall = tw(frame, tImp - 0.34, 0.34, 0, 1, EASE_IN);
  const knock = tw(frame, tImp, 0.5);
  const panelIn = tw(frame, 0, 0.8);
  const flash = t >= tImp ? interpolate(t - tImp, [0, 0.06, 0.8], [0.4, 1, 0.3], clamp) : 0;

  // Labels: "One DM" lands on "one", "vibe check." on "vibe". As the lease drops, its words slide up out of their
  // masks (KineticText's reveal in reverse) and "12-month lease." rises into the same lines on impact.
  const dm = PROBLEM.dmLabel.split(' ').map((w, i) => ({text: w, start: (i < 2 ? tOne : tVibe) - 0.1 + (i % 2) * 0.07}));
  const lease = PROBLEM.leaseLabel.split(' ').map((w, i) => ({text: w, start: tImp - 0.02 + i * 0.08}));
  const tOut = Math.max(tImp - 0.24, tVibe + 0.52); // never before "check." has finished rising (KineticText dur 0.55)
  const dmOut = (i: number) =>
    frame >= tOut * FPS ? {transform: `translateY(${-118 * tw(frame, tOut + i * 0.03, 0.2, 0, 1, EASE_IN)}%)`} : undefined;
  const label = {...TYPE.h1, color: onDark(1)};
  const pill = tw(frame, tPill, 0.6);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translate(${shake('s02x', 22)}px, ${shake('s02y', 16)}px) rotate(${shake('s02r', 0.5)}deg) scale(${scale})`,
          filter: `blur(${8 * (1 - tw(frame, 0, 0.3)) + 10 * exit}px)`,
        }}
      >
        <Glow x={560 - 120 * knock} y={520} size={1400} opacity={0.55 * (1 - 0.45 * knock)} />
        <Glow x={690} y={480} size={1700} opacity={0.9 * flash} />
        <Space
          perspective={P}
          dolly={interpolate(frame, [0, d], [0, 140]) + 1300 * exit}
          panX={cam.x}
          panY={cam.y}
          ry={interpolate(frame, [0, d], [-3, 1.5]) + cam.r * 0.6}
          rz={cam.r}
        >
          <Plane x={-440 - 240 * knock} y={-30} z={-260 * (1 - panelIn) - 620 * knock} rx={6} ry={18 + 16 * (1 - panelIn) + 8 * knock} opacity={panelIn}>
            <ChatPanel bubbleAt={bubbleAt} dim={0.5 * knock} />
          </Plane>
          {fall > 0 && (
            <Plane
              x={-251}
              y={interpolate(fall, [0, 1], [-1150, -56])}
              z={interpolate(fall, [0, 1], [650, 160])}
              rx={interpolate(fall, [0, 1], [38, 5])}
              ry={-6}
              rz={interpolate(fall, [0, 1], [-16, -6])}
              scale={0.69}
            >
              <Lease sign={tw(frame, tImp + 0.1, 0.45)} />
            </Plane>
          )}
        </Space>
        <div style={{position: 'absolute', left: 1070, top: 400, width: 730}}>
          <div style={{position: 'absolute', top: 0, left: 0}}>
            <KineticText words={dm.slice(0, 2)} style={label} wordStyle={dmOut} />
            <KineticText words={dm.slice(2)} style={label} wordStyle={(i) => dmOut(i + 2)} />
          </div>
          <div style={{position: 'absolute', top: 0, left: 0}}>
            <KineticText words={lease.slice(0, 1)} style={label} />
            <KineticText words={lease.slice(1)} style={label} />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 120,
            bottom: 120,
            height: 64,
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderRadius: 9999,
            background: onDark(0.08),
            border: `1px solid ${onDark(0.14)}`,
            overflow: 'hidden',
            opacity: pill,
            transform: `translateY(${(1 - pill) * 24}px)`,
          }}
        >
          <span style={{width: 10, height: 10, borderRadius: 9999, background: C.risk}} />
          <span style={{fontSize: 24, fontWeight: 500, color: onDark(1), letterSpacing: '-0.01em'}}>
            NYC vacancy {STAT.vacancy}. {STAT.note}.
          </span>
          <span style={{fontSize: 22, color: onDark(0.55)}}>{STAT.source}</span>
          <Sheen progress={tw(frame, tPill + 0.2, 0.9)} intensity={0.16} />
        </div>
      </AbsoluteFill>
      {/* Rush to camera, then ink: S03 opens on ink with the impact. */}
      <AbsoluteFill style={{background: C.ink, opacity: interpolate(frame, [d - s(0.25), d - 1], [0, 1], {...clamp, easing: EASE_IN})}} />
      {bubbleAt.map((at, i) => (
        <Sfx key={i} name="pop" at={at} volume={0.5} />
      ))}
      <Sfx name="whoosh-soft" at={tImp - 0.3} volume={0.35} />
      <Sfx name="stamp" at={tImp} volume={0.8} />
      <Sfx name="riser" at={dur - 1.6} volume={0.5} />
    </AbsoluteFill>
  );
};
