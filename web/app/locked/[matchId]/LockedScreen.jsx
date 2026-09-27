"use client";
// 7A · Locked and handed off, the last screen in the product. Ported from ui_kits/locked/LockedScreen.jsx.
// ponytail: the agreement card shows the default terms; 6C edits aren't persisted, carry them over if they need to be.
import React from 'react';
import * as LK from '@/components/rm';
import { NAV, perRoomLabel } from '@/components/shared';
import { ME, personById } from '@/lib/sample-data';
import { usd, seenOn, day, listingHref, bedsLabel } from '@/lib/format';
import { from, rentEach, brokerDraft } from '@/app/matches/[id]/parts';

const lkCard = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', minWidth: 0 };
const LkHead = ({ children, right }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{children}</span>{right}</div>;

export default function LockedScreen({ id, l, aiOff }) {
  const p = personById(id);
  const [copied, setCopied] = React.useState(false);
  const DRAFT = brokerDraft(l);
  const ROWS = [['moon', 'Quiet hours', 'Weeknights 11 PM – 7 AM'], ['users', 'Guests', 'Up to 2 nights a week, heads-up by text'], ['spray-can', 'Chores', 'Weekly rotation: kitchen, bathroom, trash'], ['wallet', 'Bills', `50/50 (${rentEach(l)}), utilities even, due the 1st`], ['sun', 'Thermostat', '68°F in winter']];
  const title = `${bedsLabel(l.beds)} · ${l.neighborhood}`;
  return <div style={{ width: 1440, margin: '0 auto', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
    <LK.Header variant="light" brand={<LK.Wordmark />} items={NAV} active="Matches" showSearch={false} showCta={false} right={<LK.InitialsAvatar initials={ME.i} name={ME.n} size={36} />} />
    <section style={{ padding: '24px 48px 112px' }}>
      <div className="rm-on-dark" style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'var(--ink)', color: '#fff', minHeight: 520, padding: '88px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', isolation: 'isolate' }}>
        <a href={listingHref(l.zpid)} aria-label={`${title} listing`} style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: '45%', zIndex: -2 }}><LK.Slot src={l.images[0]} /></a>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none', background: 'linear-gradient(90deg,rgba(14,12,11,.92) 0%,rgba(14,12,11,.7) 50%,rgba(14,12,11,.45) 100%)' }} />
        <div style={{ maxWidth: 900, pointerEvents: 'none' }}>
          <LK.Eyebrow onDark>Locked</LK.Eyebrow>
          <h1 style={{ margin: '28px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', textWrap: 'pretty' }}>{p.n} & {ME.n}: go get the {l.neighborhood} {bedsLabel(l.beds)}.</h1>
          <p style={{ margin: '28px 0 0', maxWidth: 480, fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,.75)' }}>You’ve matched, met and agreed. The next step happens on the source listing.</p>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, alignItems: 'stretch' }}>
        <article style={lkCard}>
          <LK.ImageCard height={240} radius={16.8} href={listingHref(l.zpid)} media={<LK.Slot src={l.images[0]} alt={title} />} pill={<LK.FrostedPill>{perRoomLabel(l)}</LK.FrostedPill>} />
          {l.trust && <LK.TrustBadge status={l.trust} style={{ marginTop: 18, alignSelf: 'flex-start' }} />}
          <div style={{ marginTop: 12, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{title}</div>
          <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{from(l)}{usd(l.price)}/mo{l.availabilityDate ? ` · Available ${day(l.availabilityDate)}` : ''} · Seen on {seenOn(l.lastSeen)}</div>
          <LK.LinkUnderline href={l.link} arrow={false} size={13} style={{ marginTop: 12, alignSelf: 'flex-start' }}>View on Zillow ↗</LK.LinkUnderline>
          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <LK.ButtonInk size="lg" fullWidth arrow={false} href={l.link}>Apply on Zillow ↗</LK.ButtonInk>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>Not our listing. We link back.</p>
          </div>
        </article>
        <article style={lkCard}>
          <LkHead right={aiOff ? <LK.AIOffBadge /> : <LK.AISummaryTag />}>Message to the broker</LkHead>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>{aiOff ? 'A template filled in from the listing.' : 'Drafted from your agreement.'} Edit before sending.</p>
          <div style={{ marginTop: 18, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 16.8, padding: '18px 20px', fontSize: 15, lineHeight: 1.625, color: 'var(--ink)' }}>{DRAFT}</div>
          <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
            <LK.ButtonOutline size="lg" arrow={false} icon={copied ? 'check' : undefined} onClick={() => { navigator.clipboard?.writeText(DRAFT); setCopied(true); }}>{copied ? 'Copied' : 'Copy message'}</LK.ButtonOutline>
          </div>
        </article>
        <article style={lkCard}>
          <LkHead>House Agreement</LkHead>
          <div style={{ marginTop: 10 }}>
            {ROWS.map(([ic, k, v], i) => <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderTop: i ? '1px solid var(--border)' : 0 }}>
              <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 12, background: 'var(--sand)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><LK.Icon name={ic} size={16} /></span>
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{k}</div><div style={{ marginTop: 2, fontSize: 14, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{v}</div></div>
            </div>)}
          </div>
          <div style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 20, fontSize: 13, color: 'var(--ink)' }}>
            {['You', p.n].map(n => <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 20, height: 20, borderRadius: 9999, background: 'var(--ink)', color: 'var(--background)', display: 'grid', placeItems: 'center' }}><LK.Icon name="check" size={11} /></span>{n} confirmed</span>)}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 24 }}><LK.ButtonOutline size="lg" arrow={false} icon="file-text" onClick={() => window.print()}>Download PDF</LK.ButtonOutline></div>
        </article>
      </div>

      <div style={{ marginTop: 16, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: '32px 40px' }}>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))' }}>
          <div style={{ position: 'absolute', left: 11, right: '20%', top: 11, height: 1, background: 'var(--ink)' }} />
          {['Matched', 'Met', 'Agreed', 'Locked', 'Apply via the source listing'].map((s, i) => <div key={s} style={{ position: 'relative', minWidth: 0 }}>
            <span style={{ width: 22, height: 22, borderRadius: 9999, background: 'var(--ink)', color: 'var(--background)', display: 'grid', placeItems: 'center' }}><LK.Icon name="check" size={12} /></span>
            <div style={{ marginTop: 16, fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ marginTop: 6, fontSize: 16, fontWeight: 500, color: 'var(--ink)', paddingRight: 16 }}>{s}</div>
          </div>)}
        </div>
      </div>
      <p style={{ margin: '24px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)', textAlign: 'center' }}>RoomMe isn’t a broker and doesn’t hold deposits. Never pay anyone before you’ve seen the apartment and signed a lease.</p>
    </section>
  </div>;
}
