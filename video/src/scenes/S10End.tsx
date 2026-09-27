// S10 End: "RoomMe. Find a roommate who lives like you do."
// Opens on ink (S09 fades out). The wordmark rises centered in steel-blue light on "RoomMe", then glides up into the
// end card; the tagline lands word by word with the voice, typeset exactly like the live hero H1 and already sitting
// where that H1 is on roomme.tech; the url, event and credits come up along the bottom. Then roomme.tech flies in from the dark in a browser, tilted, un-tilting
// as it comes, over the end card and behind the tagline, and lands with its viewport exactly on the frame and its own
// H1 right under ours. The tagline melts into it and the last frames are the bare capture (AC-7): the first frame of
// the demo recording that follows.
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE_IN, FPS, lightA, onDark, tw} from '../brand';
import {BrowserFrame, CHROME_H, Glow, Plane, Sfx, Sheen, Space, drift} from '../fx';
import {lineAt, wordAt} from '../timing';
import {END} from '../script';
import {Wordmark} from '../../../web/components/rm/brand/Wordmark.jsx';

const HERO = 'captures/landing-hero.png'; // 3840x2160 @2x of the live landing at 1920x1080, scroll 0

// The live hero H1 (web/app/LandingScreen.jsx Hero): 92px DM Sans 500, line-height .98, -0.035em, max 15ch, on the
// left edge of the 1440 wrap (288), flex-centered under the 72px header pad (top ~385.5). Fitted against the @2x
// capture: top 385.15, and the first line ("Find a roommate who") 0.5px higher, which is how the site's two baselines
// round. With that, every glyph lands on the capture's to the device pixel.
const LINE1 = 4; // words on the H1's first line
const H1_TOP = 385.15;
const H1: React.CSSProperties = {
  position: 'absolute',
  left: 288,
  top: H1_TOP,
  margin: 0,
  maxWidth: '15ch',
  fontSize: 92,
  fontWeight: 500,
  lineHeight: 0.98,
  letterSpacing: '-0.035em',
  color: onDark(1),
  whiteSpace: 'normal',
};
const H1_MID_Y = H1_TOP + 0.98 * 92; // vertical center of the two-line block on screen
// Ink over the capture's own H1 (glyphs x 288-1240, y 385-566) while it flies, so there is never a second, moving copy.
const PATCH = {left: 272, top: 368, width: 988, height: 214};

// The wordmark's end-card spot: above the tagline, on the same left edge (box 690 x 150 at size 120). It first rises
// centered and larger while "RoomMe" is spoken, then glides up into this spot in the pause before "Find".
const WM = {left: 276, top: 150, size: 120, w: 690, h: 150};
const WM_FROM = {x: 960, y: 525, scale: 1.3}; // centered lockup
const FOOT = {top: 928, rule: 900}; // url, event and credits along the bottom, inside the 120px safe area

const HOLD = 8; // last frames: the bare capture only (AC-7 needs 6+)
const MELT = 6; // frames the tagline takes to melt into the capture's own H1 once the page has landed
const FLY = 1.15; // seconds from deep space to the viewport filling the frame
const PERSP = 1800;
const FROM = {x: 2400, z: -5200, rx: 8, ry: 22, rz: -2.5};
// Where the H1 sits inside the flying frame, relative to the frame's center (the frame is the chrome bar + 1080).
const SLOT_Y = CHROME_H + H1_MID_Y - (1080 + CHROME_H) / 2;

const WORDS = END.tagline.split(' ');
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// The tagline in the H1's own inline layout (real spaces, the site's tracking), so at rest it is glyph for glyph the
// capture's H1. Each word rises out of its own clip box; the box is the text's line box, so the layout never changes.
const Tagline: React.FC<{starts: number[]; style?: React.CSSProperties}> = ({starts, style}) => {
  const frame = useCurrentFrame();
  return (
    <h1 style={{...H1, ...style}}>
      {WORDS.map((w, i) => {
        const p = tw(frame, starts[i], 0.55);
        return (
          <React.Fragment key={i}>
            {i > 0 && ' '}
            <span
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                overflow: p < 1 ? 'hidden' : 'visible',
                padding: '0.08em 0 0.18em',
                margin: '-0.08em 0 -0.18em',
              }}
            >
              <span
                style={{
                  position: 'relative',
                  top: i < LINE1 ? -0.5 : 0,
                  display: 'inline-block',
                  transform: p < 1 ? `translateY(${(1 - p) * 118}%) rotate(${(1 - p) * 7}deg)` : undefined,
                  transformOrigin: '0 100%',
                }}
              >
                {w}
              </span>
            </span>
          </React.Fragment>
        );
      })}
    </h1>
  );
};

export const S10End: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const t = frame / FPS;

  // Frames: fly-in ... landF (viewport on the frame) ... melt ... holdF ... end (bare capture).
  const holdF = d - HOLD;
  const landF = holdF - MELT;
  const landT = landF / FPS;

  // Voice sync: "RoomMe." raises the wordmark, then each tagline word rises on its own spoken word.
  const vo = lineAt('S10').words;
  const tRoom = wordAt('S10', 'RoomMe');
  const tFind = wordAt('S10', 'Find');
  const i0 = vo.findIndex((w) => w.start === tFind);
  const starts = WORDS.map((_, i) => (vo[i0 + i]?.start ?? tFind + i * 0.2) - 0.06);
  const tLast = starts[starts.length - 1];

  // The flight starts once the whole line is up (and never gets shorter than 0.8 s).
  const tFly = Math.min(landT - 0.8, Math.max(landT - FLY, tLast + 0.35));
  const k = tw(frame, tFly, landT - tFly);
  const appear = interpolate(t, [tFly, tFly + 0.2], [0, 1], clamp);
  // The frame comes in level with the tagline: its (masked) H1 slot stays on the tagline's line of sight, so the page's
  // nav stays above the type and its lead and buttons below, all the way in.
  const z = lerp(FROM.z, 0, k);
  const y = (H1_MID_Y - 540) * ((PERSP - z) / PERSP) - SLOT_Y;

  // Footer: in as the line's last word lands, early enough that the credits read >= 1 s before the page covers them
  // (its bottom edge reaches the footer about 0.4 s into the flight).
  const tFoot = Math.min(tLast - 0.15, landT - 2.2);
  const rule = tw(frame, tFoot - 0.1, 0.7);
  const foot = [0, 1, 2].map((i) => tw(frame, tFoot + i * 0.1, 0.45));

  const rise = tw(frame, Math.max(0, tRoom - 0.1), 0.8);
  const glide = tw(frame, Math.max(tRoom + 0.45, tFind - 0.35), 0.75);
  const wmX = lerp(WM_FROM.x - (WM.left + WM.w / 2), 0, glide);
  const wmY = lerp(WM_FROM.y - (WM.top + WM.h / 2), 0, glide);
  const wmS = lerp(WM_FROM.scale, 1, glide);
  const clear = tw(frame, tFly - 0.35, 0.4, 0, 1, EASE_IN); // the wordmark rises out before the page arrives
  const bloom = tw(frame, Math.max(0, tRoom - 0.1), 1.2);

  // Camera: a slow push that lands exactly at scale 1 with the page, handheld drift that dies out through the flight.
  const dr = drift(frame, 's10', 1);
  const amp = 1 - tw(frame, tFly, landT - tFly);
  const push = interpolate(tw(frame, 0, landT), [0, 1], [0.955, 1]);
  const cam: React.CSSProperties = {
    transform: `translate(${dr.x * amp}px, ${dr.y * amp}px) scale(${push}) rotate(${dr.r * amp * 0.6}deg)`,
    transformOrigin: '960px 540px',
  };

  const melt = interpolate(frame, [landF, holdF], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <Sfx name="whoosh" at={tFly - 0.05} volume={0.5} />
      {frame >= landF ? (
        // Landed: the bare capture, the tagline melting into its H1, then nothing else at all.
        <AbsoluteFill>
          <Img src={staticFile(HERO)} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} />
          {frame < holdF && <Tagline starts={starts} style={{opacity: melt}} />}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          {/* Light: a bloom around the wordmark, and the wide one the page flies out of. */}
          <Glow x={WM.left + 90 + wmX * 1.4} y={WM.top + 75 + wmY} size={1100 + 500 * (1 - glide)} opacity={0.75 * bloom * (1 - clear)} />
          <Glow x="72%" y="48%" size={1800} opacity={0.42 * bloom} />

          {/* The end card's back layer: wordmark and footer. The arriving page covers the footer. */}
          <AbsoluteFill style={cam}>
            <div
              style={{
                position: 'absolute',
                left: WM.left,
                top: WM.top,
                overflow: 'hidden',
                padding: '16px 24px',
                margin: '-16px -24px',
                transform: `translate(${wmX}px, ${wmY}px) scale(${wmS})`,
              }}
            >
              <div style={{transform: `translateY(${(1 - rise - clear) * 118}%)`}}>
                <Wordmark onDark size={WM.size} />
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: H1.left,
                width: 1920 - 2 * (H1.left as number),
                top: FOOT.rule,
                height: 1,
                background: onDark(0.16),
                transform: `scaleX(${rule})`,
                transformOrigin: '0 50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: H1.left,
                width: 1920 - 2 * (H1.left as number),
                top: FOOT.top,
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                whiteSpace: 'nowrap',
              }}
            >
              {[
                {text: END.url, style: {fontSize: 28, fontWeight: 500, letterSpacing: '-0.01em', color: onDark(0.92)}},
                {text: END.event, style: {fontSize: 22, color: onDark(0.7)}},
                {text: END.credits, style: {fontSize: 22, color: onDark(0.55)}},
              ].map((it, i) => (
                <span key={i} style={{...it.style, opacity: foot[i], transform: `translateY(${(1 - foot[i]) * 16}px)`}}>
                  {it.text}
                </span>
              ))}
            </div>
          </AbsoluteFill>

          {/* roomme.tech, flying in from the dark. */}
          {t >= tFly && (
            <Space perspective={PERSP} panX={-dr.x * amp} panY={-dr.y * amp} rz={dr.r * amp * 0.6}>
              <Plane x={lerp(FROM.x, 0, k)} y={y} z={z} rx={lerp(FROM.rx, 0, k)} ry={lerp(FROM.ry, 0, k)} rz={lerp(FROM.rz, 0, k)} opacity={appear}>
                <BrowserFrame
                  url={END.url}
                  radius={lerp(21.6, 0, k)}
                  style={{boxShadow: `0 0 0 ${2 * (1 - k)}px ${lightA(0.55)}, 0 40px 260px ${lightA(0.5 * (1 - k))}`}}
                >
                  <Img src={staticFile(HERO)} style={{display: 'block', width: 1920, height: 1080}} />
                  <div style={{position: 'absolute', ...PATCH, background: C.ink}} />
                  <Sheen progress={interpolate(t, [tFly + 0.08, landT - 0.12], [0, 1], clamp)} intensity={0.05} width={14} />
                </BrowserFrame>
              </Plane>
            </Space>
          )}

          {/* The tagline, in front of everything: the page lands under it. */}
          <AbsoluteFill style={cam}>
            <Tagline starts={starts} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
