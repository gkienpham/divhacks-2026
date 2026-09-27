// S09 Agreement: "Agree on house rules, then apply together."
// Enters from below. The House Agreement card assembles row by row, a PDF slides out from behind it and swings
// toward the camera, the timeline ticks Matched / Meetup planned / Agreement / Lock listing, and the last step
// becomes "Apply on Zillow", pressed on "together". Exit: dolly back and fade to ink (S10 opens on ink).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND_RGB, C, EASE_IN, FLOAT_SHADOW, FPS, TYPE, inkA, lightA, onDark, s, tw} from '../brand';
import {Glow, HBlur, Plane, Sfx, Sheen, Space, drift, useEdges} from '../fx';
import {lineAt, wordAt} from '../timing';
import {AGREEMENT, PAIR} from '../script';
import {Eyebrow} from '../../../web/components/rm/labels/Eyebrow.jsx';
import {Icon} from '../../../web/components/rm/core/Icon.jsx';
import {ButtonInk} from '../../../web/components/rm/actions/ButtonInk.jsx';

const PDF_HEAD = 'House Agreement';

const CARD = {x: -300, y: -60, w: 1040};
const STEPS = {x: 606, y: -160, z: 80, w: 400};
const PDF = {w: 300, h: 390};
const STEP_H = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// One agreement row, as in AgreementScreen: sand icon tile, muted label, the rule in ink.
const Rule: React.FC<{rule: (typeof AGREEMENT.rules)[number]; k: number; first: boolean}> = ({rule, k, first}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '12px 0',
      borderTop: first ? 'none' : `1px solid ${C.border}`,
      opacity: k,
      transform: `translateX(${(1 - k) * 48}px)`,
    }}
  >
    <span style={{width: 36, height: 36, flex: 'none', borderRadius: 12, background: C.sand, display: 'grid', placeItems: 'center', color: C.ink}}>
      <Icon name={rule.icon} size={18} />
    </span>
    <span style={{width: 140, flex: 'none', fontSize: 22, color: C.muted}}>{rule.label}</span>
    <span style={{fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', color: C.ink, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
      {rule.text}
    </span>
  </div>
);

// The downloadable PDF: heading, rule lines, two signature lines.
const PdfPage: React.FC<{sheen: number}> = ({sheen}) => (
  <div style={{position: 'relative', width: PDF.w, height: PDF.h}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 12,
        background: C.card,
        boxShadow: FLOAT_SHADOW,
        overflow: 'hidden',
        padding: '30px 26px 32px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', color: C.ink}}>{PDF_HEAD}</div>
      <div style={{marginTop: 12, height: 1.5, background: C.ink}} />
      {[0.62, 0.8, 0.54, 0.72, 0.5, 0.76].map((w, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: `1px solid ${C.border}`}}>
          <span style={{width: 44, height: 7, borderRadius: 9999, background: C.border}} />
          <span style={{width: `${w * 100}%`, maxWidth: 170, height: 7, borderRadius: 9999, background: inkA(0.22)}} />
        </div>
      ))}
      <div style={{marginTop: 'auto', display: 'flex', gap: 22}}>
        {[PAIR.them.name, PAIR.you.name].map((n, i) => (
          <div key={n} style={{flex: 1}}>
            <div style={{fontFamily: 'var(--font-hand)', fontSize: 38, lineHeight: 1, color: C.ink, transform: `rotate(${i ? -3 : -6}deg)`, paddingLeft: 6}}>{n}</div>
            <div style={{marginTop: 4, height: 1.5, background: C.ink}} />
          </div>
        ))}
      </div>
      <Sheen progress={sheen} rgb={BRAND_RGB} intensity={0.12} width={16} />
    </div>
    <div
      style={{
        position: 'absolute',
        right: 16,
        top: -22,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        height: 48,
        padding: '0 20px',
        borderRadius: 9999,
        background: C.ink,
        border: `1px solid ${onDark(0.2)}`,
        color: C.card,
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: '-0.01em',
      }}
    >
      <Icon name="file-text" size={20} />
      {AGREEMENT.pdf}
    </div>
  </div>
);

// Vertical timeline. done[i] 0..1 fills step i's circle with ink and a white check; cta 0..1 turns the last step into the button.
const Steps: React.FC<{done: number[]; cta: number; press: number; ring: number}> = ({done, cta, press, ring}) => {
  const last = AGREEMENT.timeline.length - 1;
  const fill = done.reduce((a, v) => a + v, 0); // how far the ink line has run, in steps
  return (
    <div style={{position: 'relative', width: STEPS.w, padding: 36, borderRadius: 24, background: C.card, boxShadow: FLOAT_SHADOW}}>
      <div style={{position: 'relative', height: STEP_H * last + 46}}>
        <div style={{position: 'absolute', left: 13.25, top: 14, width: 1.5, height: STEP_H * last, background: C.border}} />
        <div style={{position: 'absolute', left: 13.25, top: 14, width: 1.5, height: STEP_H * Math.max(0, Math.min(last, fill - 0.5)), background: C.ink}} />
        {AGREEMENT.timeline.map((label, i) => {
          const k = done[i] ?? 0;
          const isLast = i === last;
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: 0,
                top: i * STEP_H,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                height: 28,
                opacity: isLast ? 1 - interpolate(cta, [0, 0.25], [0, 1], clamp) : 1, // out before the button is in: no double text
              }}
            >
              <span
                style={{
                  position: 'relative',
                  width: 28,
                  height: 28,
                  flex: 'none',
                  borderRadius: 9999,
                  background: C.card,
                  border: `1.5px solid ${k > 0 ? C.ink : inkA(0.22)}`,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <span style={{position: 'absolute', inset: -1.5, borderRadius: 9999, background: C.ink, transform: `scale(${k})`}} />
                <span style={{position: 'relative', color: C.card, transform: `scale(${lerp(0.4, 1, k)})`, opacity: k}}>
                  <Icon name="check" size={15} strokeWidth={2.5} />
                </span>
              </span>
              <span style={{fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: k > 0.5 || isLast ? C.ink : C.muted, whiteSpace: 'nowrap'}}>
                {label}
              </span>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: last * STEP_H + 14,
            transform: `translateY(-50%) scale(${lerp(0.92, 1, cta) * (1 - 0.04 * press)})`,
            transformOrigin: '0 50%',
            opacity: interpolate(cta, [0.25, 1], [0, 1], clamp),
          }}
        >
          <ButtonInk
            size="lg"
            arrow={false}
            style={{height: 64, padding: '0 30px', fontSize: 24, gap: 12, boxShadow: `0 0 0 ${ring * 14}px ${lightA(0.35 * (1 - ring))}`}}
          >
            {AGREEMENT.cta}
          </ButtonInk>
        </div>
      </div>
    </div>
  );
};

export const S09Agreement: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / FPS;
  const d = durationInFrames / FPS;
  const {enter} = useEdges(0.35, 0.3);
  const line = lineAt('S09');
  // Reaches full ink on the last frame, so S10 opens on ink.
  const out = interpolate(frame, [durationInFrames - 1 - s(0.3), durationInFrames - 1], [0, 1], clamp);

  // Beats (scene-local seconds) from the VO. The rows land with "Agree on house rules", the PDF with "rules",
  // the checks run through the second half of the line and the button is pressed on "together".
  const tRows = Math.max(0.08, line.start - 0.02);
  const tPdf = Math.max(tRows + 0.3, wordAt('S09', 'rules') - 0.25);
  const tChecks = Math.max(tRows + 0.5, (line.start + line.end) / 2 - 0.05);
  const tCta = Math.max(tChecks + 0.3, wordAt('S09', 'apply') - 0.05);
  const tPress = Math.min(Math.max(tCta + 0.18, wordAt('S09', 'together')), d - 0.4);

  const rows = AGREEMENT.rules.map((_, i) => tw(frame, tRows + i * 0.07, 0.45));
  const done = [0, 1, 2, 3].map((i) => tw(frame, tChecks + i * 0.12, 0.2));
  const cta = tw(frame, tCta, 0.25);
  const press = interpolate(t, [tPress, tPress + 0.07, tPress + 0.3], [0, 1, 0], clamp);
  const ring = interpolate(t, [tPress, tPress + 0.5], [0, 1], clamp);

  // The PDF: slides out from behind the card's right edge, then swings forward toward the camera, tilted.
  const slide = tw(frame, tPdf, 0.32);
  const swing = tw(frame, tPdf + 0.2, 0.55);

  // Camera: rises out of the whip, then glides from the card toward the timeline with a slow push and orbit;
  // dollies back on the way out.
  const dr = drift(frame, 's09', 1);
  const along = tw(frame, 0, d);
  const cruise = (along + t / d) / 2; // half brand ease, half linear: the glide keeps going through the checks
  const cam = {
    perspective: 1800,
    panX: dr.x + lerp(-40, 20, cruise),
    panY: dr.y + lerp(20, -10, cruise),
    dolly: lerp(-80, 40, cruise) - EASE_IN(out) * 650,
    rx: 6 * (1 - enter),
    ry: lerp(3, -2, cruise),
    rz: dr.r,
  };

  return (
    <HBlur amount={(1 - enter) * 40} dir="y" style={{background: C.ink}}>
      <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 380}px)`}}>
        <Glow x="30%" y="38%" size={1500} opacity={0.6} />
        <Glow x="82%" y="38%" size={1000} opacity={0.4 + 0.3 * cta} />
        <Space {...cam}>
          <Plane x={CARD.x} y={CARD.y} rx={4} ry={lerp(12, 6, along)}>
            <div
              style={{
                position: 'relative',
                width: CARD.w,
                padding: 48,
                borderRadius: 24,
                background: C.card,
                boxShadow: FLOAT_SHADOW,
                overflow: 'hidden',
              }}
            >
              <div style={{zoom: 2}}>
                <Eyebrow>{AGREEMENT.eyebrow}</Eyebrow>
              </div>
              <div style={{...TYPE.h2, marginTop: 22, fontWeight: 500, color: C.ink}}>{AGREEMENT.title}</div>
              <div style={{marginTop: 30}}>
                {AGREEMENT.rules.map((r, i) => (
                  <Rule key={r.label} rule={r} k={rows[i]} first={i === 0} />
                ))}
              </div>
              <Sheen progress={interpolate(t, [tRows, tPdf + 0.5], [0, 1], clamp)} rgb={BRAND_RGB} intensity={0.08} width={12} />
            </div>
            <Plane
              x={lerp(200, 470, slide) + 30 * swing}
              y={lerp(90, 210, slide) + 40 * swing}
              z={-30 + 170 * swing}
              rx={6 * swing}
              ry={-14 * swing}
              rz={-5 * swing}
              opacity={t >= tPdf ? 1 : 0}
            >
              <PdfPage sheen={swing} />
            </Plane>
          </Plane>
          <Plane x={STEPS.x} y={STEPS.y} z={STEPS.z} rx={3} ry={lerp(-12, -7, along)}>
            <Steps done={done} cta={cta} press={press} ring={ring} />
          </Plane>
        </Space>
        {/* Out: fade to ink as the camera pulls back. */}
        <AbsoluteFill style={{background: C.ink, opacity: out}} />
      </AbsoluteFill>

      <Sfx name="tap" at={tRows} volume={0.3} />
      <Sfx name="paper" at={tPdf} volume={0.5} />
      <Sfx name="tap" at={tPress} volume={0.55} />
    </HBlur>
  );
};
