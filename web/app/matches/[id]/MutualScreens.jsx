"use client";
// 6A it’s mutual · 6B plan a meetup. Ported from ui_kits/mutual/MutualScreens.jsx.
// No people photos exist, so faces stay InitialsAvatars; the café has no real source, so it's a sand panel.
import React from 'react';
import * as MU from '@/components/rm';
import { ME, personById } from '@/lib/sample-data';
import { street, bedsLabel } from '@/lib/format';
import { MFrame, Tile, MH2, withListing } from './parts';

export function MutualScreen({ id, l }) {
  const p = personById(id);
  return <MFrame>
    <section style={{ flex: 1, padding: '88px 48px 112px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <MU.Eyebrow>It’s mutual</MU.Eyebrow>
      <MH2 style={{ marginTop: 24, maxWidth: 760 }}>You and {p.n} both said yes.</MH2>
      <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 24 }}>
        {[ME, p].map((x, i) => <React.Fragment key={x.id}>
          {i === 1 && <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{p.s}%</span>}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <MU.InitialsAvatar initials={x.i} name={x.n} size={144} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{x.n}</span>
          </div>
        </React.Fragment>)}
      </div>
      <p style={{ margin: '20px 0 0', fontSize: 14, color: 'var(--muted-foreground)' }}>Photos stay hidden until you both choose to share them.</p>
      <div style={{ marginTop: 40, width: 560, textAlign: 'left', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-foreground)' }}><span>Group text · you, {p.n}, RoomMe agent</span><span>{bedsLabel(l.beds)} · {l.neighborhood}</span></div>
        <MU.ChatBubble from="agent" time="Just now" style={{ marginTop: 18 }}>Hi {ME.n} and {p.n}. You both said yes on the {l.neighborhood} {bedsLabel(l.beds)}. Want to meet this week? Reply here and I’ll pass it on.</MU.ChatBubble>
        <p style={{ margin: '18px 0 0', paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>The RoomMe agent just texted you both an intro. Your numbers stay hidden.</p>
      </div>
      <MU.ButtonInk size="lg" href={withListing(`/matches/${encodeURIComponent(id)}`, l, 'step=meetup&')} style={{ marginTop: 32 }}>Plan a meetup</MU.ButtonInk>
    </section>
  </MFrame>;
}

const FORMATS = [['map-pin', 'In person', 'A public spot'], ['coffee', 'Coffee chat', '30 minutes, near the listing'], ['phone', 'Video call', '15 minutes, link sent by our agent']];
const TIMES = ['Mon Sep 28 · 6:30 PM', 'Wed Sep 30 · 6:30 PM', 'Sat Oct 3 · 11:00 AM'];
const SAFETY = [['users', 'Meet somewhere public'], ['send', 'Tell a friend where you’ll be'], ['wallet', 'Never pay a deposit before viewing'], ['message-circle', 'Our agent relays messages, so you don’t need to share your number']];
export function MeetupScreen({ id, l }) {
  const p = personById(id);
  const [f, setF] = React.useState(0), [t, setT] = React.useState(TIMES[0]), [sent, setSent] = React.useState(false);
  return <MFrame h={1000}>
    <section style={{ padding: '72px 48px 112px' }}>
      <MU.Eyebrow>Plan a meetup · {p.n}</MU.Eyebrow>
      <MH2 style={{ marginTop: 24 }}>Meet before you sign.</MH2>
      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / span 8' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
            {FORMATS.map(([ic, ti, d], i) => { const on = f === i; return <button key={ti} type="button" aria-pressed={on} disabled={sent} onClick={() => setF(i)} style={{ textAlign: 'left', cursor: sent ? 'default' : 'pointer', fontFamily: 'inherit', background: 'var(--card)', borderRadius: 24, border: on ? '2px solid var(--ink)' : '1px solid var(--border)', padding: on ? 23 : 24, minHeight: 168, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><Tile icon={ic} /><span style={{ width: 24, height: 24, borderRadius: 9999, display: 'grid', placeItems: 'center', background: on ? 'var(--ink)' : 'transparent', border: on ? 0 : '1px solid rgba(14,12,11,.2)', color: 'var(--background)' }}>{on && <MU.Icon name="check" size={12} />}</span></div>
              <div style={{ marginTop: 'auto', paddingTop: 28, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{ti}</div>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted-foreground)' }}>{d}</div>
            </button>; })}
          </div>
          <div style={{ marginTop: 40, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Times that work for both of you</div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>{TIMES.map(x => <MU.Chip key={x} icon="calendar" active={t === x} onClick={sent ? undefined : () => setT(x)}>{x}</MU.Chip>)}</div>
          <div style={{ marginTop: 40, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 200, height: 132, flex: 'none', borderRadius: 16.8, overflow: 'hidden', background: 'var(--sand)' }}><MU.Slot /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Suggested place</div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>A public café near the listing</div>
              <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted-foreground)' }}>Near {street(l.address)}, {l.neighborhood}</div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)' }}><MU.Icon name="map-pin" size={14} />Our agent texts you both the exact spot</div>
            </div>
          </div>
          {sent
            ? <div role="status" style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}><span style={{ width: 24, height: 24, borderRadius: 9999, background: 'var(--ink)', color: 'var(--background)', display: 'grid', placeItems: 'center' }}><MU.Icon name="check" size={12} /></span>Sent to {p.n}: {FORMATS[f][1].toLowerCase()}, {t}</span>
              <MU.ButtonInk size="lg" href={withListing(`/agreement/${encodeURIComponent(id)}`, l)}>Draft the house agreement</MU.ButtonInk>
            </div>
            : <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20 }}>
              <MU.ButtonInk size="lg" onClick={() => setSent(true)}>Send via RoomMe agent</MU.ButtonInk>
              <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{p.n} gets the plan by text and can pick another time.</span>
            </div>}
          {sent && <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>We’ll text you both when {p.n} replies. Your numbers stay hidden.</p>}
        </div>
        <aside style={{ gridColumn: '9 / span 4', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: '24px 28px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Before you go</div>
          <div style={{ marginTop: 10 }}>{SAFETY.map(([ic, s], i) => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i ? '1px solid var(--border)' : 0, fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}><Tile icon={ic} />{s}</div>)}</div>
        </aside>
      </div>
    </section>
  </MFrame>;
}
