// S08 Listings: "Every listing gets a fair-price check."
// Enters from the right. The real listings page lies on a big plane tilted back into the dark, scrolling slowly
// while the camera glides. As the voice reaches "fair", a real Fair price badge lifts off the page and flies to the
// camera at 2.4x with a sheen, and the price check unrolls beside it. Exit: whip up (S09 enters from below).
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND_RGB, C, FLOAT_SHADOW, FPS, TYPE, inkA, lightA, onDark, tw} from '../brand';
import {Glow, HBlur, KineticText, Plane, Sfx, Sheen, Space, drift, useEdges} from '../fx';
import {wordAt} from '../timing';
import {LISTINGS} from '../script';
import {TrustBadge} from '../../../web/components/rm/labels/TrustBadge.jsx';

// listings-tall.png is 3840x6400 @2x, so 1920x3200 CSS px, the page as the browser laid it out.
const IMG = 'captures/listings-tall.png';
const PAGE = {w: 1920, h: 3200};
const WIN_H = 2600; // the slice of the page the plane shows
const POSE = {x: 1000, y: 420, z: -520, rx: 28, ry: -18, rz: 4};
const SCROLL = [900, 1300]; // page y at the plane's top edge, first frame -> last frame
// Row 3, card 1 "Fair price" badge in the capture (CSS px), measured from the PNG.
const BADGE = {x: 292, y: 2022, w: 93.5, h: 30};
const ZOOM = 2.4;
const PERSP = 1400;
const EXIT = 0.28;
const FLIGHT = 0.5;
// Lifts off the page slowly (EASE_IN's start handle), lands like the brand curve (EASE's end handle).
const LIFT = Easing.bezier(0.55, 0, 0.36, 1);

// Left text column (screen px).
const COL_X = 120;
const HEAD_Y = 300;
const ROW_Y = 640; // center line of the badge + pill row
const BADGE_W = BADGE.w * ZOOM;
const GAP = 18;
const PILL_H = 72;
const PILL_W = 596; // the price check pill's natural width (measured); it unrolls to this, then lets go

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const rad = (d: number) => (d * Math.PI) / 180;

// CSS rotateX(a) rotateY(b) rotateZ(c) applied to the plane point (x, y, 0), as Plane composes them (Rz, Ry, then Rx).
const rot = (x: number, y: number, a: number, b: number, c: number) => {
  const x1 = Math.cos(rad(c)) * x - Math.sin(rad(c)) * y;
  const y1 = Math.sin(rad(c)) * x + Math.cos(rad(c)) * y;
  const z2 = -Math.sin(rad(b)) * x1;
  return {x: Math.cos(rad(b)) * x1, y: Math.cos(rad(a)) * y1 - Math.sin(rad(a)) * z2, z: Math.sin(rad(a)) * y1 + Math.cos(rad(a)) * z2};
};

const [LINE1, LINE2] = LISTINGS.headline.split(/(?<=\.) /);

export const S08Listings: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / FPS;
  const d = durationInFrames / FPS;
  const {enter, exit} = useEdges(0.35, EXIT);

  // Beats. The badge lands just ahead of "fair" (picture leads sound), early enough on a short cut that the price
  // check still reads for 0.8 s before the whip.
  const tLand = Math.max(0.3 + FLIGHT, Math.min(wordAt('S08', 'fair') - 0.15, d - 1.15));
  const tLift = tLand - FLIGHT;
  const flight = (f: number) => tw(f, tLift, FLIGHT, 0, 1, LIFT);
  const k = flight(frame);
  const speed = Math.abs(flight(frame + 1) - flight(frame - 1)) / 2; // progress per frame
  const pill = tw(frame, tLand - 0.08, 0.45);

  // Camera: a steady push and orbit with handheld drift; the page scrolls under it.
  const dr = drift(frame, 's08', 1);
  const g = t / d;
  const cam = {perspective: PERSP, panX: dr.x, panY: dr.y + lerp(-20, 30, g), dolly: lerp(-40, 110, g), ry: lerp(2.5, -1.5, g), rz: dr.r};
  const scroll = interpolate(t, [0, d], SCROLL, clamp);

  // Where the badge sits on the page when it lifts (world coords), and where it lands (screen, facing the camera).
  const sLift = interpolate(tLift, [0, d], SCROLL, clamp);
  const on = rot(BADGE.x + BADGE.w / 2 - PAGE.w / 2, BADGE.y + BADGE.h / 2 - sLift - WIN_H / 2, POSE.rx, POSE.ry, POSE.rz);
  const P0 = {x: POSE.x + on.x, y: POSE.y + on.y, z: POSE.z + on.z + 1};
  const P1 = {x: COL_X + BADGE_W / 2 - 960, y: ROW_Y - 540, z: 0};
  // The badge's own camera blends from the page camera to a still one, so it starts exactly on the page.
  const camB = {
    perspective: PERSP,
    panX: lerp(cam.panX, 0, k),
    panY: lerp(cam.panY, 0, k),
    dolly: lerp(cam.dolly, 0, k),
    ry: lerp(cam.ry, 0, k),
    rz: lerp(cam.rz, 0, k),
  };
  const lifted = t >= tLift;
  const hole = tw(frame, tLift, 0.1);
  const dim = tw(frame, tLift, 0.6) * 0.3;
  const sheen = interpolate(t, [tLand - 0.05, tLand + 0.4], [0, 1], clamp); // a quick glint across the landed badge
  const bloom = interpolate(t, [tLand - 0.25, tLand + 0.05, tLand + 0.9], [0, 1, 0.65], clamp);
  const pageSweep = interpolate(t, [0, d], [-0.1, 1.1], clamp);

  // Whips: in from the right, out the top. The type rides a touch faster than the page (it is nearer the camera).
  const whipX = (1 - enter) * 420;
  const whipY = -exit * 560;

  return (
    <HBlur amount={(1 - enter) * 40}>
      <HBlur amount={exit * 40} dir="y">
        {/* Steel-blue light behind the page: a rim around its edges. */}
        <AbsoluteFill style={{transform: `translate(${whipX * 0.85}px, ${whipY * 0.9}px)`}}>
          <Glow x="68%" y="48%" size={2300} opacity={0.75} />
          <Glow x="56%" y="10%" size={1100} opacity={0.35} />

          <Space {...cam}>
            <Plane x={POSE.x} y={POSE.y} z={POSE.z} rx={POSE.rx} ry={POSE.ry} rz={POSE.rz} width={PAGE.w} height={WIN_H}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 28,
                  overflow: 'hidden',
                  background: C.bg,
                  boxShadow: `0 0 0 2px ${lightA(0.45)}, 0 0 140px ${lightA(0.5)}`,
                }}
              >
                <div style={{position: 'absolute', left: 0, top: -scroll, width: PAGE.w, height: PAGE.h}}>
                  <Img src={staticFile(IMG)} style={{display: 'block', width: PAGE.w, height: PAGE.h}} />
                  {/* The spot the badge lifted off. */}
                  <div
                    style={{
                      position: 'absolute',
                      left: BADGE.x - 3,
                      top: BADGE.y - 3,
                      width: BADGE.w + 6,
                      height: BADGE.h + 6,
                      background: C.bg,
                      opacity: hole,
                    }}
                  />
                </div>
                {/* Light falloff: the far end of the page sinks into the dark. */}
                <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.ink} 0%, ${inkA(0.6)} 16%, ${inkA(0)} 42%)`}} />
                <div style={{position: 'absolute', inset: 0, background: C.ink, opacity: dim}} />
                <Sheen progress={pageSweep} rgb={BRAND_RGB} intensity={0.1} width={16} />
              </div>
            </Plane>
          </Space>
        </AbsoluteFill>

        <AbsoluteFill style={{transform: `translate(${whipX * 1.1}px, ${whipY * 1.08}px)`}}>
          {/* Headline, left column. */}
          <div style={{position: 'absolute', left: COL_X, top: HEAD_Y}}>
            <KineticText text={LINE1} at={0.04} stagger={0.06} dur={0.5} style={{...TYPE.h1, color: onDark(1), whiteSpace: 'nowrap'}} />
            <KineticText text={LINE2} at={0.16} stagger={0.06} dur={0.5} style={{...TYPE.h1, color: onDark(1), whiteSpace: 'nowrap'}} />
          </div>

          {/* The fair-price light: blooms behind the badge as it lands. */}
          <Glow x={COL_X + BADGE_W / 2} y={ROW_Y} size={760} opacity={0.55 * bloom} />

          {/* Price check pill: a white nub beside the landed badge that unrolls to the right, so it reads left to right. */}
          <div
            style={{
              position: 'absolute',
              left: COL_X + BADGE_W + GAP,
              top: ROW_Y - PILL_H / 2,
              height: PILL_H,
              maxWidth: pill < 1 ? lerp(PILL_H, PILL_W, pill) : undefined,
              overflow: 'hidden',
              borderRadius: 9999,
              background: C.card,
              border: `1px solid ${C.border}`,
              boxShadow: FLOAT_SHADOW,
              opacity: interpolate(pill, [0, 0.12], [0, 1], clamp),
              transform: `scale(${lerp(0.6, 1, Math.min(1, pill * 4))})`,
              transformOrigin: `${PILL_H / 2}px 50%`,
            }}
          >
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 32px',
                color: C.ink,
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span>{LISTINGS.example.perRoom}</span>
              <span style={{fontWeight: 400, color: C.muted}}>vs</span>
              <span>{LISTINGS.example.median}</span>
            </div>
          </div>
        </AbsoluteFill>

        {/* The badge that lifts off the page (its own camera; blurred along its path while it is fast). */}
        {lifted && (
          <HBlur amount={Math.min(12, speed * 160 * (0.35 + 0.65 * k))} style={{transform: `translate(${whipX * 1.1}px, ${whipY * 1.08}px)`}}>
            <Space {...camB}>
              <Plane
                x={lerp(P0.x, P1.x, k)}
                y={lerp(P0.y, P1.y, k)}
                z={lerp(P0.z, P1.z, k)}
                rx={lerp(POSE.rx, 0, k)}
                ry={lerp(POSE.ry, 0, k)}
                rz={lerp(POSE.rz, 0, k)}
                scale={Math.pow(ZOOM, k) / ZOOM}
              >
                <div style={{zoom: ZOOM}}>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      borderRadius: 9999,
                      overflow: 'hidden',
                      boxShadow: `0 10px 24px -10px ${inkA(0.6 * k)}, 0 0 0 ${0.75 * k}px ${lightA(0.5)}`,
                    }}
                  >
                    <TrustBadge status="fair" surface="white" />
                    <Sheen progress={sheen} rgb={BRAND_RGB} intensity={0.24} width={18} />
                  </div>
                </div>
              </Plane>
            </Space>
          </HBlur>
        )}
      </HBlur>

      <Sfx name="pop" at={tLift + 0.02} volume={0.5} />
      <Sfx name="whoosh" at={d - 0.3} volume={0.45} />
    </HBlur>
  );
};
