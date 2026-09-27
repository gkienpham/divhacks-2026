"use client";
// 5A · Swipe stack. Ported from ui_kits/matches/SwipeView.jsx; people come from lib/sample-data, saved-listing photos from Tiger via page.tsx.
import React from 'react';
import { useSearchParams } from 'next/navigation';
import * as MS from '@/components/rm';
import { perRoomLabel } from '@/components/shared';
import { QUEUE } from '@/lib/sample-data';
import { seenOn, listingHref, bedsLabel } from '@/lib/format';

const MLab = ({ children }) => <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{children}</div>;
const Rule = () => <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />;
const plain = { color: 'inherit', textDecoration: 'none' };
// Keeps the listing picked on /listings/[id] (?listing=) attached through the pair flow.
export function useMatchHref() {
  const l = useSearchParams().get('listing');
  return id => '/matches/' + id + (l ? '?listing=' + encodeURIComponent(l) : '');
}

function SwipeCard({ ai, p, covers }) {
  const href = useMatchHref();
  return <div style={{ position: 'relative', zIndex: 3, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 32 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <MS.InitialsAvatar initials={p.i} name={p.n} size={72} />
      <div>
        <a href={href(p.id)} style={{ ...plain, display: 'block', fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{p.n}</a>
        <MS.VerifiedBadge style={{ marginTop: 8 }} />
      </div>
      <MS.LinkUnderline href={href(p.id)} size={13} style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>Open match</MS.LinkUnderline>
    </div>
    <MS.Eyebrow style={{ marginTop: 24 }}>{p.meta}</MS.Eyebrow>
    <div style={{ marginTop: 24, display: 'grid', justifyItems: 'start', gap: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 60, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{p.s}%</span>
        <span style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em' }}>Match</span>
      </div>
      <MS.LinkUnderline href="/#how-it-works" size={13}>How it’s scored</MS.LinkUnderline>
    </div>
    <Rule />
    <MLab>Why you matched</MLab>
    <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 32, rowGap: 22 }}>
      {p.parts.map(x => <MS.HabitBar key={x.k} label={x.label} icon={x.icon} value={x.v} you={x.you} them={x.them} themName={p.n} />)}
    </div>
    {ai && <><Rule />
      <MS.AISummaryTag />
      <p style={{ margin: '12px 0 0', fontSize: 18, fontWeight: 500, lineHeight: 1.45, letterSpacing: '-0.01em', color: 'var(--ink)', textWrap: 'pretty' }}>{p.sum}</p></>}
    <Rule />
    <MS.ClickClashList aiWritten={ai} click={ai && p.aiClick ? p.aiClick : p.click} clash={ai && p.aiClash ? p.aiClash : p.clash} />
    {ai && p.flag && <>
      <MS.ContradictionCallout style={{ marginTop: 28, padding: 28 }}
        answers={[{ source: 'Quick-tap · Guests', quote: 'Rarely (1–2/month)' }, { source: 'Voice interview', quote: 'I host brunch most Sundays' }]}
        question="How often do you usually have people over on weekends?" />
      <p style={{ margin: '10px 0 0 4px', fontSize: 12, color: 'var(--muted-foreground)' }}>Only you see the suggested question until you send it.</p></>}
    <Rule />
    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>You both saved {p.saved.length === 1 ? '1 listing' : p.saved.length + ' listings'}</div>
    <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
      {p.saved.map(([id, t]) => { const l = covers[t.split(' · ')[1]]; return <div key={id} style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
        <div style={{ position: 'relative', width: 72, height: 54, flex: 'none', borderRadius: 16.8, overflow: 'hidden', background: 'var(--sand)' }}><MS.Slot src={l?.images[0]} alt={t} /></div>
        <div style={{ minWidth: 0 }}>
          {l ? <>
            <a href={listingHref(l.zpid)} style={{ ...plain, display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{bedsLabel(l.beds)} · {l.neighborhood}</a>
            <div style={{ marginTop: 2, fontSize: 12, color: 'var(--muted-foreground)' }}>{perRoomLabel(l)} · Seen on {seenOn(l.lastSeen)}</div>
            <MS.LinkUnderline href={l.link} arrow={false} size={12} style={{ marginTop: 4 }}>View on Zillow ↗</MS.LinkUnderline>
          </> : <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{t}</div>}
        </div>
      </div>; })}
    </div>
  </div>;
}

const THRESH = 140;
function Stamp({ side, o }) {
  const pass = side === 'left';
  return <div style={{ position: 'absolute', top: 28, [pass ? 'right' : 'left']: 28, zIndex: 5, opacity: o, transform: `rotate(${pass ? 8 : -8}deg)`, padding: '8px 16px', borderRadius: 9999, border: '2px solid var(--ink)', background: pass ? 'var(--card)' : 'var(--ink)', color: pass ? 'var(--ink)' : '#fff', fontSize: 15, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', pointerEvents: 'none' }}>{pass ? 'Pass' : 'Shortlist'}</div>;
}

// list/setList: the shortlist ([initials, name] pairs), shared with the grid view.
export default function SwipeView({ ai, covers = {}, list, setList }) {
  const href = useMatchHref();
  const [queue, setQueue] = React.useState(QUEUE);
  const [later, setLater] = React.useState([]);
  const [gone, setGone] = React.useState('');
  const [dx, setDx] = React.useState(0);
  const [drag, setDrag] = React.useState(false);
  const st = React.useRef(null), moved = React.useRef(false);
  const cur = queue[0];
  const act = dir => {
    if (!cur || gone) return;
    setGone(dir); setDrag(false);
    setTimeout(() => {
      if (dir === 'right') setList(l => l.length < 5 && !l.find(x => x[1] === cur.n) ? [...l, [cur.i, cur.n]] : l);
      if (dir === 'back') setLater(l => [...l.filter(x => x !== cur.id), cur.id]);
      setQueue(q => dir === 'back' ? [...q.slice(1), q[0]] : q.slice(1));
      if (dir !== 'back') setLater(l => l.filter(x => x !== cur.id));
      setGone(''); setDx(0);
    }, 420);
  };
  const down = e => { if (gone || e.button > 0) return; st.current = { x: e.clientX, id: e.pointerId }; moved.current = false; };
  const move = e => {
    const s0 = st.current; if (!s0) return;
    const d = e.clientX - s0.x;
    if (!moved.current && Math.abs(d) > 6) { moved.current = true; setDrag(true); e.currentTarget.setPointerCapture(s0.id); }
    if (moved.current) setDx(d);
  };
  const up = () => { if (!st.current) return; st.current = null; if (!moved.current) return; setDrag(false); if (dx <= -THRESH) act('left'); else if (dx >= THRESH) act('right'); else setDx(0); };
  const fly = { left: 'translateX(-720px) rotate(-14deg)', right: 'translateX(720px) rotate(14deg)', back: 'translateY(48px) scale(.96)' };
  const tf = gone ? fly[gone] : `translateX(${dx}px) rotate(${dx / 24}deg)`;
  const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 };
  const behind = Math.min(2, queue.length - 1);
  return <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
    <aside style={{ gridColumn: '1 / span 3', ...card }}>
      <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>How your score works</div>
      <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>Dealbreakers filter first. Then each of your 10 answers is compared in real units (hours, times a week, decibels) and your match % is the average agreement, every question counting equally. AI and voice answers never change it.</p>
      <MS.LinkUnderline href="/#how-it-works" size={13} style={{ marginTop: 16 }}>How it’s scored</MS.LinkUnderline>
    </aside>
    <div style={{ gridColumn: '4 / span 6', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {cur ? <>
        <div style={{ position: 'relative', width: 560, paddingBottom: 28 }}>
          {[2, 1].filter(n => n <= behind).map(n => <div key={n} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 28 - n * 14, zIndex: 3 - n, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, transform: `scale(${1 - n * 0.04})`, transformOrigin: '50% 100%' }} />)}
          <div key={cur.id} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDragStart={e => e.preventDefault()} onClickCapture={e => { if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; } }}
            style={{ position: 'relative', zIndex: 3, touchAction: 'pan-y', userSelect: drag ? 'none' : 'auto', cursor: drag ? 'grabbing' : 'grab', transition: drag ? 'none' : 'transform .42s var(--ease-out), opacity .42s var(--ease-out)', transform: tf, opacity: gone ? 0 : 1 }}>
            <Stamp side="left" o={Math.min(1, Math.max(0, -dx / THRESH))} />
            <Stamp side="right" o={Math.min(1, Math.max(0, dx / THRESH))} />
            <SwipeCard ai={ai} p={cur} covers={covers} />
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <MS.CircleIconButton icon="x" size={56} label="Pass" onClick={() => act('left')} />
          <MS.ButtonOutline size="lg" arrow={false} onClick={() => act('back')}>Come back later</MS.ButtonOutline>
          <MS.ButtonInk size="lg" arrow={false} onClick={() => act('right')}>Shortlist ♥</MS.ButtonInk>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted-foreground)', textAlign: 'center' }}>Hold and drag: left to pass, right to shortlist.{later.length ? ` ${later.length} saved for later, shown after everyone else.` : ''}</div>
      </> : <div style={{ width: 560, ...card, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>You’ve seen everyone</div>
        <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>New matches appear as more renters finish their answers.</p>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}><MS.ButtonOutline arrow={false} onClick={() => { setQueue(QUEUE); setLater([]); }}>Start over</MS.ButtonOutline></div>
      </div>}
    </div>
    <aside style={{ gridColumn: '10 / span 3', ...card }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}><span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Shortlist</span><span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{list.length} / 5</span></div>
      <div style={{ marginTop: 16 }}>
        {Array.from({ length: 5 }, (_, i) => { const s = list[i]; return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid var(--border)' : 0 }}>
          {s ? <MS.InitialsAvatar initials={s[0]} name={s[1]} size={36} /> : <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 9999, border: '1px dashed rgba(14,12,11,.2)' }} />}
          {s ? <a href={href(s[1].toLowerCase())} style={{ ...plain, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{s[1]}</a> : <span style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>Open slot</span>}
        </div>; })}
      </div>
      <p style={{ margin: '14px 0 0', paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>Chat opens only when it’s mutual.</p>
    </aside>
  </div>;
}
