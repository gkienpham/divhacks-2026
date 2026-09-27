// S04 Quiz and voice: "Tap ten habits. Then talk for ninety seconds." Two halves split at "Then":
// a tilted quick-tap card where a real tap floods the pill with ink, then one continuous whip to the dark voice
// interview screen (web/app/profile/VoiceScreens.jsx) with a depleting ring, VO-driven waveform and a live transcript.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Icon} from '../../../web/components/rm/core/Icon.jsx';
import {BRAND_RGB, C, EASE_IN, FLOAT_SHADOW, FPS, TYPE, W, inkA, onDark, tw} from '../brand';
import {Glow, HBlur, KineticText, Plane, Sfx, Sheen, Space, drift, useEdges, useVoLevels} from '../fx';
import {QUIZ, VOICE} from '../script';
import {wordAt} from '../timing';

// The mid-scene whip: EASE_IN for PRE s into the split, the brand EASE for POST s out of it. The two distances are
// chosen so the speed matches at the split (EASE_IN ends at slope 4, EASE starts at slope 1 / 0.22).
const PRE = 0.16;
const POST = 0.26;
const K_IN = 4 / PRE;
const K_OUT = 1 / 0.22 / POST;
const WHIP_A = (W * K_OUT) / (K_IN + K_OUT);
const WHIP_B = W - WHIP_A;

// Labels are left-aligned Planes placed by their left edge (world px from the frame center), chosen so the text stays
// inside the 120 px safe margin at the end of each half's dolly (perspective grows it outward).
const QUIZ_LABEL = {left: -795, width: 720};
const VOICE_LABEL = {left: -760, top: -375, width: 1400, lineH: 98};

// Quiz card geometry.
const CARD_W = 900;
const PILL_H = 56;
const TAP_X = 190; // where the tap lands on the picked pill (px from its left edge)

// Voice screen geometry.
const RING = 270;
const R = 125;
const CIRC = 2 * Math.PI * R;
// The transcript shows its first sentences as already transcribed and types the Sunday brunch sentence live.
const TYPE_FROM = Math.max(0, VOICE.transcript.indexOf('Most Sundays'));

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const eyebrow: React.CSSProperties = {fontSize: 22, fontWeight: 500, lineHeight: 1, letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap'};

const QuizHalf: React.FC<{tapAt: number; labelAt: number; split: number}> = ({tapAt, labelAt, split}) => {
  const frame = useCurrentFrame();
  const cam = drift(frame, 's04q', 1);
  const settleTilt = tw(frame, 0, split + 0.3);
  const dolly = 45 * tw(frame, 0, split + 0.3);

  const progress = 20 + 10 * tw(frame, tapAt + 0.12, 0.45);
  const flood = tw(frame, tapAt, 0.38);
  const ripple = tw(frame, tapAt - 0.02, 0.55);
  const press = 1 - 0.018 * tw(frame, tapAt - 0.07, 0.07) * (1 - tw(frame, tapAt + 0.04, 0.3));
  const [stepN, ...stepRest] = QUIZ.step.split(' ');

  const pill: React.CSSProperties = {
    height: PILL_H,
    borderRadius: 9999,
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 22,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  };

  return (
    <Space dolly={dolly} panX={cam.x} panY={cam.y} rz={cam.r * 0.5}>
      <Plane z={-220} x={300} width={0} height={0}>
        <Glow size={1500} opacity={0.42} />
      </Plane>

      {/* "10 quick taps", left of the card */}
      <Plane x={QUIZ_LABEL.left + QUIZ_LABEL.width / 2} y={0} z={40} width={QUIZ_LABEL.width}>
        <KineticText
          words={QUIZ.label.split(' ').map((w, i) => ({text: w, start: labelAt + i * 0.07}))}
          dur={0.45}
          style={{...TYPE.h1, color: onDark(1), whiteSpace: 'nowrap'}}
        />
      </Plane>

      {/* The quick-tap card */}
      <Plane x={300} y={0} rx={6 - 3 * settleTilt} ry={-16 + 8 * settleTilt}>
        <div
          style={{
            width: CARD_W,
            padding: 56,
            background: C.card,
            borderRadius: 24,
            boxShadow: FLOAT_SHADOW,
            position: 'relative',
            overflow: 'hidden',
            color: C.ink,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <span style={{...eyebrow, color: C.muted, fontVariantNumeric: 'tabular-nums'}}>
              <span style={{color: C.ink}}>{stepN}</span> {stepRest.join(' ')}
            </span>
            <div style={{flex: 1, height: 2, background: C.sand, position: 'relative'}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: C.ink}} />
            </div>
          </div>
          <div style={{marginTop: 40, fontSize: 44, fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.025em', color: C.ink}}>{QUIZ.q}</div>
          <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10}}>
            {QUIZ.opts.map((o, i) => {
              const picked = i === QUIZ.pick;
              return (
                <div key={o} style={{position: 'relative', transform: picked ? `scale(${press})` : undefined}}>
                  <div style={{...pill, border: `1px solid ${C.border}`, background: C.card, color: C.ink}}>{o}</div>
                  {picked && (
                    <>
                      {/* The ink floods out from the tap point, with the selected state's bg-colored text and check */}
                      <div
                        style={{
                          ...pill,
                          position: 'absolute',
                          inset: 0,
                          border: `1px solid ${C.ink}`,
                          background: C.ink,
                          color: C.bg,
                          clipPath: `circle(${flood * 760}px at ${TAP_X}px ${PILL_H / 2}px)`,
                        }}
                      >
                        {o}
                        <Icon name="check" size={22} />
                      </div>
                      {ripple > 0 && ripple < 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: TAP_X,
                            top: PILL_H / 2,
                            width: 2 * (16 + 84 * ripple),
                            height: 2 * (16 + 84 * ripple),
                            transform: 'translate(-50%, -50%)',
                            borderRadius: 9999,
                            background: inkA(0.15),
                            opacity: 1 - ripple,
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <Sheen progress={interpolate(frame, [0.08 * FPS, (split + 0.1) * FPS], [0, 1], clamp)} rgb={BRAND_RGB} intensity={0.1} width={20} />
        </div>
      </Plane>
    </Space>
  );
};

const VoiceHalf: React.FC<{split: number; dur: number; typeAt: number; typeEnd: number; levels: number[]}> = ({split, dur, typeAt, typeEnd, levels}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const level = levels.reduce((a, b) => a + b, 0) / levels.length;
  const cam = drift(frame, 's04v', 1);
  const push = interpolate(t, [split, dur], [0, 90], clamp);
  const land = tw(frame, split, 0.9);
  const left = 1 - 0.1 * interpolate(t, [split, dur], [0, 1], clamp);
  const typed = Math.round(interpolate(t, [typeAt, typeEnd], [0, VOICE.transcript.length - TYPE_FROM], clamp));
  const caretOn = t < typeEnd || Math.floor(frame / 8) % 2 === 0;

  return (
    <Space dolly={push} panX={cam.x} panY={cam.y} rz={cam.r * 0.5}>
      <Plane z={-240} y={80} width={0} height={0}>
        <Glow size={2000} opacity={0.4} />
      </Plane>

      {/* "90-second voice interview", top left */}
      <Plane x={VOICE_LABEL.left + VOICE_LABEL.width / 2} y={VOICE_LABEL.top + VOICE_LABEL.lineH / 2} z={60} width={VOICE_LABEL.width}>
        <KineticText
          words={VOICE.label.split(' ').map((w, i) => ({text: w, start: split + 0.06 + i * 0.07}))}
          dur={0.45}
          style={{...TYPE.h1, color: onDark(1), whiteSpace: 'nowrap'}}
        />
      </Plane>

      {/* The voice interview screen */}
      <Plane x={40} y={80} ry={16 - 6 * land} rx={2}>
        <div
          style={{
            width: 1560,
            height: 560,
            padding: 56,
            borderRadius: 28,
            background: C.ink,
            border: `1px solid ${onDark(0.1)}`,
            boxShadow: FLOAT_SHADOW,
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '520px 380px 440px',
            columnGap: 54,
            alignItems: 'start',
          }}
        >
          <div>
            <div style={{...eyebrow, color: onDark(0.75), display: 'flex', alignItems: 'center', gap: 12}}>
              <span style={{width: 8, height: 8, borderRadius: 9999, background: onDark(1), flex: 'none'}} />
              {VOICE.eyebrow}
            </div>
            <div style={{...TYPE.h3, marginTop: 24, fontWeight: 500, color: onDark(1)}}>{VOICE.title}</div>
            {/* The five prompts, as in the app; the one being answered is lit */}
            <div style={{marginTop: 34}}>
              {VOICE.prompts.map((p, i) => (
                <div
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 16,
                    padding: '12px 0',
                    borderTop: `1px solid ${onDark(0.12)}`,
                    borderBottom: i === VOICE.prompts.length - 1 ? `1px solid ${onDark(0.12)}` : undefined,
                    fontSize: 22,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{color: onDark(0.45), fontVariantNumeric: 'tabular-nums'}}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{color: i === 0 ? onDark(1) : onDark(0.5)}}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{position: 'relative', width: RING, height: RING, display: 'grid', placeItems: 'center'}}>
              <Glow size={640} opacity={0.55 + 0.45 * level} />
              <svg width={RING} height={RING} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
                <circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke={onDark(0.12)} strokeWidth={2} />
                <circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={R}
                  fill="none"
                  stroke={onDark(1)}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - left)}
                />
              </svg>
              <div
                style={{
                  position: 'relative',
                  width: 200,
                  height: 200,
                  borderRadius: 9999,
                  background: onDark(1),
                  color: C.ink,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: `0 0 0 ${4 + 14 * level}px ${onDark(0.08)}`,
                }}
              >
                <Icon name="mic" size={52} />
              </div>
            </div>
            <div style={{marginTop: 26, fontSize: 32, fontWeight: 500, letterSpacing: '-0.015em', color: onDark(1), fontVariantNumeric: 'tabular-nums'}}>
              {VOICE.timer}
            </div>
            <div style={{marginTop: 20, height: 64, display: 'flex', alignItems: 'center', gap: 5}}>
              {levels.map((l, i) => (
                <span key={i} style={{width: 3, height: 6 + 58 * l, borderRadius: 9999, background: onDark(0.5)}} />
              ))}
            </div>
            <div style={{marginTop: 12, fontSize: 22, color: onDark(0.6)}}>{VOICE.status}</div>
          </div>

          <div style={{border: `1px solid ${onDark(0.1)}`, borderRadius: 24, padding: 32, height: 448}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{fontSize: 24, fontWeight: 500, color: onDark(1)}}>Transcript</span>
              <span style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: onDark(0.6)}}>
                <span style={{width: 10, height: 10, borderRadius: 9999, background: C.risk}} />
                Live
              </span>
            </div>
            <p style={{margin: '26px 0 0', fontSize: 26, lineHeight: 1.5, fontWeight: 400, color: onDark(0.6)}}>
              {VOICE.transcript.slice(0, TYPE_FROM)}
              <span style={{color: onDark(1)}}>{VOICE.transcript.slice(TYPE_FROM, TYPE_FROM + typed)}</span>
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 28,
                  marginLeft: 2,
                  verticalAlign: '-5px',
                  background: onDark(1),
                  opacity: caretOn ? 1 : 0,
                }}
              />
            </p>
          </div>
        </div>
      </Plane>
    </Space>
  );
};

export const S04QuizVoice: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const dur = durationInFrames / FPS;
  const {enter, exit} = useEdges(0.35, 0.3);
  // Waveform levels from the real VO (smooth noise until vo.mp3 exists). Read here, where it is always mounted.
  const levels = useVoLevels('S04', 36);

  const split = wordAt('S04', 'Then');
  const tapWord = wordAt('S04', 'Tap');
  const tapAt = tapWord + 0.35;
  const labelAt = Math.max(0.06, tapWord - 0.1);
  const typeAt = split + 0.32;
  const typeEnd = Math.max(typeAt + 0.6, dur - 0.55);

  // Track offset (px, negative = content moves left): whip-in from the right, the mid whip, the exit whip.
  const trackAt = (f: number) => {
    const e = tw(f, 0, 0.35);
    const x = interpolate(f, [durationInFrames - 0.3 * FPS, durationInFrames], [0, 1], {...clamp, easing: EASE_IN});
    return (1 - e) * 900 - tw(f, split - PRE, PRE, 0, WHIP_A, EASE_IN) - tw(f, split, POST, 0, WHIP_B) - x * 1300;
  };
  const trackX = trackAt(frame);
  const speed = Math.abs(trackAt(frame + 1) - trackAt(frame));
  const blur = Math.max(Math.min(44, speed * 0.1), (1 - enter) * 40, exit * 40);
  const t = frame / FPS;

  return (
    <AbsoluteFill>
      <Sfx name="tap" at={tapAt} volume={0.6} />
      <Sfx name="whoosh" at={split - PRE - 0.08} volume={0.4} />
      <Sfx name="type" at={typeAt} volume={0.3} />
      <Sfx name="whoosh" at={dur - 0.3} volume={0.45} />
      <HBlur amount={blur}>
        <AbsoluteFill style={{transform: `translateX(${trackX}px)`}}>
          {t < split + POST + 0.05 && (
            <AbsoluteFill>
              <QuizHalf tapAt={tapAt} labelAt={labelAt} split={split} />
            </AbsoluteFill>
          )}
          {t > split - PRE - 0.05 && (
            <AbsoluteFill style={{transform: `translateX(${W}px)`}}>
              <VoiceHalf split={split} dur={dur} typeAt={typeAt} typeEnd={typeEnd} levels={levels} />
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      </HBlur>
    </AbsoluteFill>
  );
};
