"use client";
// 5A · Swipe stack. Ported from ui_kits/matches/SwipeView.jsx; matches are MatchViews (lib/matches.ts) from page.tsx.
import React from 'react';
import { useSearchParams } from 'next/navigation';
import * as MS from '@/components/rm';
import { perRoomLabel } from '@/components/shared';
import { QUICK } from '@/lib/questions';
import { seenOn, listingHref, bedsLabel } from '@/lib/format';

const MLab = ({ children }) => <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{children}</div>;
const Rule = () => <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />;
const plain = { color: 'inherit', textDecoration: 'none' };
// Keeps the listing picked on /listings/[id] (?listing=) attached through the pair flow.
export function useMatchHref() {
  const l = useSearchParams().get('listing');
  return id => '/matches/' + id + (l ? '?listing=' + encodeURIComponent(l) : '');
}
// Seeded people are synthetic: say so wherever one appears.
export const SampleNote = ({ style }) => <div style={{ fontSize: 12, color: 'var(--muted-foreground)', ...style }}>Sample profile</div>;

// Rule-based (lib/signals.ts), so it shows with AI on or off and never carries an AI tag. Nothing is sent: the question is theirs to copy.
function WorthAsking({ c, name }) {
  const [copied, setCopied] = React.useState(false);
  const q = QUICK.find(x => x.k === c.key);
  return <div style={{ marginTop: 28, background: 'var(--sand)', borderRadius: 24, padding: 28 }}>
    <MS.Eyebrow onSand>Worth asking</MS.Eyebrow>
    <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--foreground)' }}>Two of {name}’s answers point different ways. It may be nothing.</p>
    <div style={{ marginTop: 18 }}>
      {[['Quick-tap · ' + (q ? q.q : c.key), c.quick], ['Interview', c.voice]].map(([src, quote]) => <div key={src} style={{ padding: '16px 0', borderTop: '1px solid rgba(14,12,11,.1)' }}>
        <div style={{ fontSize: 12, color: 'var(--foreground)' }}>{src}</div>
        <div style={{ marginTop: 6, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>“{quote}”</div>
      </div>)}
    </div>
    <div style={{ marginTop: 8, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16.8, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Suggested question</div>
        <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }}>{c.question}</div>
      </div>
      <MS.ButtonOutline size="sm" arrow={false} icon={copied ? 'check' : undefined} onClick={() => { navigator.clipboard?.writeText(c.question); setCopied(true); }}>{copied ? 'Copied' : 'Copy'}</MS.ButtonOutline>
    </div>
  </div>;
}

function SwipeCard({ m }) {
  const href = useMatchHref();
  const o = m.other;
  const saved = m.savedOverlap ? m.saved.slice(0, m.savedOverlap) : m.saved; // overlaps come first
  return <div style={{ position: 'relative', zIndex: 3, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 32 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <MS.InitialsAvatar initials={o.initials} name={o.name} size={72} />
      <div>
        <a href={href(m.id)} style={{ ...plain, display: 'block', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{o.name}</a>
        {o.synthetic && <SampleNote style={{ marginTop: 6 }} />}
      </div>
      <MS.LinkUnderline href={href(m.id)} size={13} style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>Open match</MS.LinkUnderline>
    </div>
    {o.meta && <MS.Eyebrow style={{ marginTop: 24, whiteSpace: 'normal', lineHeight: 1.6 }}>{o.meta}</MS.Eyebrow>}
    <div style={{ marginTop: 24, display: 'grid', justifyItems: 'start', gap: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 60, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{m.score}%</span>
        <span style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em' }}>Match</span>
      </div>
      <MS.LinkUnderline href="/#faq" size={13}>How it’s scored</MS.LinkUnderline>
    </div>
    <Rule />
    <MLab>Why you matched</MLab>
    <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 32, rowGap: 22 }}>
      {m.bars.map(b => <MS.HabitBar key={b.key} label={b.label} icon={b.icon} value={Math.round(b.similarity * 100)} you={b.a} them={b.b} themName={o.name} />)}
    </div>
    {m.ai && m.summary && <><Rule />
      <MS.AISummaryTag />
      <p style={{ margin: '12px 0 0', fontSize: 18, fontWeight: 500, lineHeight: 1.45, letterSpacing: '-0.01em', color: 'var(--ink)', textWrap: 'pretty' }}>{m.summary}</p></>}
    <Rule />
    <MS.ClickClashList aiWritten={m.ai} click={m.click} clash={m.clash} />
    {m.contradiction && <WorthAsking c={m.contradiction} name={o.name} />}
    {saved.length > 0 && <><Rule />
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{m.savedOverlap ? `You both saved ${m.savedOverlap === 1 ? '1 listing' : m.savedOverlap + ' listings'}` : `${o.name} saved`}</div>
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
        {saved.map(l => <div key={l.zpid} style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
          <a href={listingHref(l.zpid)} tabIndex={-1} aria-hidden="true" style={{ position: 'relative', display: 'block', width: 72, height: 54, flex: 'none', borderRadius: 16.8, overflow: 'hidden', background: 'var(--sand)' }}><MS.Slot src={l.images[0]} /></a>
          <div style={{ minWidth: 0 }}>
            <a href={listingHref(l.zpid)} style={{ ...plain, display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{bedsLabel(l.beds)} · {l.neighborhood}</a>
            <div style={{ marginTop: 2, fontSize: 12, color: 'var(--muted-foreground)' }}>{perRoomLabel(l)} · Seen on {seenOn(l.lastSeen)}</div>
            <MS.LinkUnderline href={l.link} arrow={false} size={12} style={{ marginTop: 4 }}>View on Zillow ↗</MS.LinkUnderline>
          </div>
        </div>)}
      </div></>}
  </div>;
}

const THRESH = 140;
function Stamp({ side, o }) {
  const pass = side === 'left';
  return <div style={{ position: 'absolute', top: 28, [pass ? 'right' : 'left']: 28, zIndex: 5, opacity: o, transform: `rotate(${pass ? 8 : -8}deg)`, padding: '8px 16px', borderRadius: 9999, border: '2px solid var(--ink)', background: pass ? 'var(--card)' : 'var(--ink)', color: pass ? 'var(--ink)' : '#fff', fontSize: 15, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', pointerEvents: 'none' }}>{pass ? 'Pass' : 'Shortlist'}</div>;
}

// ms/act/full are shared with the grid (TopMatchesScreen). The queue is every match not yet liked or passed, in rank order.
export default function SwipeView({ ms, act, full, cap, onGrid }) {
  const href = useMatchHref();
  const [later, setLater] = React.useState([]); // "Come back later", this visit only: those go to the back
  const [gone, setGone] = React.useState('');
  const [dx, setDx] = React.useState(0);
  const [drag, setDrag] = React.useState(false);
  const st = React.useRef(null), moved = React.useRef(false), top = React.useRef(null);
  const open = ms.filter(m => !m.likedByMe && !m.passedByMe);
  const queue = [...open.filter(m => !later.includes(m.id)), ...later.flatMap(id => open.filter(m => m.id === id))];
  const liked = ms.filter(m => m.likedByMe);
  const cur = queue[0];
  const back = id => setLater(l => [...l.filter(x => x !== id), id]);
  const go = dir => {
    if (!cur || gone || (dir === 'right' && full)) return;
    setGone(dir); setDrag(false);
    setTimeout(() => {
      if (dir === 'back') back(cur.id); else act(cur, dir === 'right' ? 'like' : 'pass');
      setGone(''); setDx(0);
      // Cards run taller than the screen: bring the next one's top into view.
      if (top.current?.getBoundingClientRect().top < 0) top.current.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }, 420);
  };
  const down = e => { if (gone || e.button > 0) return; st.current = { x: e.clientX, id: e.pointerId }; moved.current = false; };
  const move = e => {
    const s0 = st.current; if (!s0) return;
    const d = e.clientX - s0.x;
    if (!moved.current && Math.abs(d) > 6) { moved.current = true; setDrag(true); e.currentTarget.setPointerCapture(s0.id); }
    if (moved.current) setDx(d);
  };
  const up = () => { if (!st.current) return; st.current = null; if (!moved.current) return; setDrag(false); if (dx <= -THRESH) go('left'); else if (dx >= THRESH && !full) go('right'); else setDx(0); };
  const fly = { left: 'translateX(-720px) rotate(-14deg)', right: 'translateX(720px) rotate(14deg)', back: 'translateY(48px) scale(.96)' };
  const tf = gone ? fly[gone] : `translateX(${dx}px) rotate(${dx / 24}deg)`;
  const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 };
  const side = { ...card, position: 'sticky', top: 24 };
  const behind = Math.min(2, queue.length - 1);
  return <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
    <aside style={{ gridColumn: '1 / span 3', ...side }}>
      <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>How your score works</div>
      <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>Dealbreakers, budget and apartment size filter first. Then a weighted comparison of 10 habits; bedtime and cleaning count most. Voice answers never change it.</p>
    </aside>
    <div ref={top} style={{ gridColumn: '4 / span 6', display: 'flex', flexDirection: 'column', alignItems: 'center', scrollMarginTop: 24 }}>
      {cur ? <>
        <div style={{ position: 'relative', width: 560, paddingBottom: 28 }}>
          {[2, 1].filter(n => n <= behind).map(n => <div key={n} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 28 - n * 14, zIndex: 3 - n, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, transform: `scale(${1 - n * 0.04})`, transformOrigin: '50% 100%' }} />)}
          <div key={cur.id} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDragStart={e => e.preventDefault()} onClickCapture={e => { if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; } }}
            style={{ position: 'relative', zIndex: 3, touchAction: 'pan-y', userSelect: drag ? 'none' : 'auto', cursor: drag ? 'grabbing' : 'grab', transition: drag ? 'none' : 'transform .42s var(--ease-out), opacity .42s var(--ease-out)', transform: tf, opacity: gone ? 0 : 1 }}>
            <Stamp side="left" o={Math.min(1, Math.max(0, -dx / THRESH))} />
            <Stamp side="right" o={full ? 0 : Math.min(1, Math.max(0, dx / THRESH))} />
            <SwipeCard m={cur} />
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <MS.CircleIconButton icon="x" size={56} label="Pass" onClick={() => go('left')} />
          <MS.ButtonOutline size="lg" arrow={false} onClick={() => go('back')}>Come back later</MS.ButtonOutline>
          <MS.ButtonInk size="lg" arrow={false} disabled={full} onClick={() => go('right')}>Shortlist ♥</MS.ButtonInk>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted-foreground)', textAlign: 'center' }}>{full ? 'Your shortlist is full. Remove someone to add another.' : 'Drag left to pass, right to shortlist.'}</div>
      </> : <div style={{ width: 560, ...card, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>You’ve seen everyone</div>
        <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>Changed your mind? Everyone is still in the grid.</p>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}><MS.ButtonOutline onClick={onGrid}>Open the grid</MS.ButtonOutline></div>
      </div>}
    </div>
    <aside style={{ gridColumn: '10 / span 3', ...side }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}><span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Shortlist</span><span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{liked.length} / {cap}</span></div>
      <div style={{ marginTop: 16 }}>
        {Array.from({ length: cap }, (_, i) => { const s = liked[i]; return <div key={s ? s.id : 'slot' + i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid var(--border)' : 0 }}>
          {s ? <>
            <MS.InitialsAvatar initials={s.other.initials} name={s.other.name} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <a href={href(s.id)} style={{ ...plain, display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{s.other.name}</a>
              {(s.mutual || s.other.synthetic) && <div style={{ marginTop: 2, fontSize: 12, color: 'var(--muted-foreground)' }}>{s.mutual && <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Mutual</span>}{s.mutual && s.other.synthetic && ' · '}{s.other.synthetic && 'Sample profile'}</div>}
            </div>
            {s.status !== 'locked' && <MS.CircleIconButton icon="x" size={28} label={'Remove ' + s.other.name} onClick={() => { back(s.id); act(s, 'unlike'); }} />}
          </> : <>
            <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 9999, border: '1px dashed rgba(14,12,11,.2)' }} />
            <span style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>Open slot</span>
          </>}
        </div>; })}
      </div>
      <p style={{ margin: '14px 0 0', paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>Meetups open only when it’s mutual.</p>
    </aside>
  </div>;
}
