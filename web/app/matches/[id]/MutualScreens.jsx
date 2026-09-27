"use client";
// 6A it’s mutual · 6B plan a meetup. Ported from ui_kits/mutual/MutualScreens.jsx.
// No people photos exist, so faces stay InitialsAvatars; the café has no real source, so it's a sand panel.
import React from 'react';
import * as MU from '@/components/rm';
import { ListingCard } from '@/components/shared';
import { street } from '@/lib/format';
import { MFrame, Tile, MH2, SampleNote, pairHref, usePair, ErrorLine } from './parts';
import { Chat } from './Chat';

export function MutualScreen({ me, m, l, aiOff }) {
  const p = m.other;
  const [next, href] = m.status === 'locked' ? ['Open the hand-off', `/locked/${m.id}`]
    : m.meetup ? ['House agreement', pairHref(`/agreement/${m.id}`, l)]
    : ['Plan a meetup', pairHref(`/matches/${m.id}`, l, { step: 'meetup' })];
  return <MFrame me={me}>
    <section style={{ flex: 1, padding: '88px 48px 112px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <MU.Eyebrow>It’s mutual</MU.Eyebrow>
      <MH2 style={{ marginTop: 24, maxWidth: 760 }}>You and {p.name} both said yes.</MH2>
      <div style={{ marginTop: 48, display: 'flex', alignItems: 'flex-start', gap: 24 }}>
        {[me, p].map((x, i) => <React.Fragment key={i}>
          {i === 1 && <span style={{ marginTop: 64, fontSize: 13, fontWeight: 500, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{m.score}%</span>}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <MU.InitialsAvatar initials={x.initials} name={x.name} size={144} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{x.name}</span>
            <SampleNote p={x} style={{ marginTop: -6 }} />
          </div>
        </React.Fragment>)}
      </div>
      {p.synthetic && <Chat me={me} m={m} aiOff={aiOff} />}
      {l && <div style={{ marginTop: 48, width: 560, textAlign: 'left' }}><ListingCard l={l} height={300} eager /></div>}
      {m.meetup && <p style={{ margin: '28px 0 0', fontSize: 14, color: 'var(--muted-foreground)' }}>Meetup: {m.meetup.format.toLowerCase()}, {m.meetup.time}</p>}
      <MU.ButtonInk size="lg" href={href} style={{ marginTop: 32 }}>{next}</MU.ButtonInk>
    </section>
  </MFrame>;
}

const FORMATS = [['map-pin', 'In person', 'A public spot'], ['coffee', 'Coffee chat', '30 minutes, near the listing'], ['phone', 'Video call', '15 minutes']];
const SAFETY = [['users', 'Meet somewhere public'], ['send', 'Tell a friend where you’ll be'], ['wallet', 'Never pay a deposit before viewing']];
// times: three upcoming slots computed on the server (pair.ts meetupSlots).
export function MeetupScreen({ me, m: initial, l, times }) {
  const { m, act, busy, error } = usePair(initial);
  const p = m.other, saved = m.meetup;
  const [f, setF] = React.useState(() => Math.max(0, FORMATS.findIndex(x => x[1] === saved?.format)));
  const [t, setT] = React.useState(saved?.time ?? times[0]);
  return <MFrame me={me} h={1000}>
    <section style={{ padding: '72px 48px 112px' }}>
      <MU.Eyebrow>Plan a meetup · {p.name}</MU.Eyebrow>
      <MH2 style={{ marginTop: 24 }}>Meet before you sign.</MH2>
      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / span 8' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
            {FORMATS.map(([ic, ti, d], i) => { const on = f === i; return <button key={ti} type="button" aria-pressed={on} disabled={!!saved} onClick={() => setF(i)} style={{ textAlign: 'left', cursor: saved ? 'default' : 'pointer', fontFamily: 'inherit', background: 'var(--card)', borderRadius: 24, border: on ? '2px solid var(--ink)' : '1px solid var(--border)', padding: on ? 23 : 24, minHeight: 168, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><Tile icon={ic} /><span style={{ width: 24, height: 24, borderRadius: 9999, display: 'grid', placeItems: 'center', background: on ? 'var(--ink)' : 'transparent', border: on ? 0 : '1px solid rgba(14,12,11,.2)', color: 'var(--background)' }}>{on && <MU.Icon name="check" size={12} />}</span></div>
              <div style={{ marginTop: 'auto', paddingTop: 28, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{ti}</div>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted-foreground)' }}>{d}</div>
            </button>; })}
          </div>
          <div style={{ marginTop: 40, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Pick a time</div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>{times.map(x => <MU.Chip key={x} icon="calendar" active={t === x} onClick={saved ? undefined : () => setT(x)}>{x}</MU.Chip>)}</div>
          {FORMATS[f][1] !== 'Video call' && <div style={{ marginTop: 40, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
            <div aria-hidden="true" style={{ width: 200, height: 132, flex: 'none', borderRadius: 16.8, background: 'var(--sand)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Suggested place</div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{l ? 'A public café near the listing' : 'A public café'}</div>
              {l && <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted-foreground)' }}>Near {street(l.address)}, {l.neighborhood}</div>}
            </div>
          </div>}
          {saved
            ? <div role="status" style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}><span style={{ width: 24, height: 24, borderRadius: 9999, background: 'var(--ink)', color: 'var(--background)', display: 'grid', placeItems: 'center' }}><MU.Icon name="check" size={12} /></span>Saved: {saved.format.toLowerCase()}, {saved.time}</span>
              <MU.ButtonInk size="lg" href={pairHref(`/agreement/${m.id}`, l)}>House agreement</MU.ButtonInk>
            </div>
            : <MU.ButtonInk size="lg" disabled={busy} onClick={() => act({ action: 'meetup', format: FORMATS[f][1], time: t })} style={{ marginTop: 40 }}>Send to {p.name}</MU.ButtonInk>}
          <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>{p.synthetic ? 'Sample profile: no one is notified.' : `${p.name} sees it in RoomMe.`}</p>
          <ErrorLine error={error} />
        </div>
        <aside style={{ gridColumn: '9 / span 4', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: '24px 28px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Before you go</div>
          <div style={{ marginTop: 10 }}>{SAFETY.map(([ic, s], i) => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i ? '1px solid var(--border)' : 0, fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}><Tile icon={ic} />{s}</div>)}</div>
        </aside>
      </div>
    </section>
  </MFrame>;
}
