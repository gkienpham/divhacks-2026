"use client";
// 7A · Locked and handed off, the last screen in the product. Ported from ui_kits/locked/LockedScreen.jsx.
// The agreement card shows the saved agreement, so 6C edits carry over.
import React from 'react';
import * as LK from '@/components/rm';
import { Photo, perRoomLabel } from '@/components/shared';
import { usd, seenOn, day, listingHref, bedsLabel } from '@/lib/format';
import { MFrame, SampleNote, brokerDraft } from '@/app/matches/[id]/parts';

const lkCard = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', minWidth: 0 };
const LkHead = ({ children, right }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{children}</span>{right}</div>;
const Check = ({ size = 20 }) => <span style={{ width: size, height: size, flex: 'none', borderRadius: 9999, background: 'var(--ink)', color: 'var(--background)', display: 'grid', placeItems: 'center' }}><LK.Icon name="check" size={size / 2 + 1} /></span>;

export default function LockedScreen({ me, m, l }) {
  const p = m.other;
  const [copied, setCopied] = React.useState(false);
  const draft = brokerDraft(l);
  const title = `${bedsLabel(l.beds)} · ${l.neighborhood}`;
  // Applying is the one step left, so it stays open.
  const steps = [['Matched', true], ['Meetup planned', !!m.meetup], ['Agreed', true], ['Locked', true], ['Apply on Zillow', false]];
  return <MFrame me={me}>
    <section style={{ padding: '24px 48px 112px' }}>
      <div className="rm-on-dark" style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'var(--ink)', color: '#fff', minHeight: 520, padding: '88px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', isolation: 'isolate' }}>
        <a href={listingHref(l.zpid)} aria-label={`${title} listing`} style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: '45%', zIndex: -2 }}><Photo src={l.images[0]} eager /></a>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none', background: 'linear-gradient(90deg,rgba(14,12,11,.92) 0%,rgba(14,12,11,.7) 50%,rgba(14,12,11,.45) 100%)' }} />
        <div style={{ maxWidth: 900, pointerEvents: 'none' }}>
          <LK.Eyebrow onDark>Locked</LK.Eyebrow>
          <h1 style={{ margin: '28px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', textWrap: 'pretty' }}>{p.name} & {me.name}: go get the {l.neighborhood} {bedsLabel(l.beds)}.</h1>
          <p style={{ margin: '28px 0 0', maxWidth: 480, fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,.75)' }}>The rest happens on Zillow.</p>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, alignItems: 'stretch' }}>
        <article style={lkCard}>
          <LK.ImageCard height={240} radius={16.8} href={listingHref(l.zpid)} media={<LK.Slot src={l.images[0]} alt={title} />} pill={<LK.FrostedPill>{perRoomLabel(l)}</LK.FrostedPill>} />
          {l.trust && <LK.TrustBadge status={l.trust} style={{ marginTop: 18, alignSelf: 'flex-start' }} />}
          <div style={{ marginTop: 12, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{title}</div>
          <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{l.isBuilding ? 'from ' : ''}{usd(l.price)}/mo{l.availabilityDate ? ` · Available ${day(l.availabilityDate)}` : ''} · Seen on {seenOn(l.lastSeen)}</div>
          <LK.LinkUnderline href={l.link} arrow={false} size={13} style={{ marginTop: 12, alignSelf: 'flex-start' }}>View on Zillow ↗</LK.LinkUnderline>
          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            {/* ButtonInk has no target prop, so open the source listing in a new tab by hand. */}
            <LK.ButtonInk size="lg" fullWidth arrow={false} onClick={() => window.open(l.link, '_blank', 'noopener,noreferrer')}>Apply on Zillow ↗</LK.ButtonInk>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>Not our listing. We link back.</p>
          </div>
        </article>
        <article style={lkCard}>
          <LkHead right={<span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Template</span>}>Message to the broker</LkHead>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>From the listing. Edit before sending.</p>
          <div style={{ marginTop: 18, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 16.8, padding: '18px 20px', fontSize: 15, lineHeight: 1.625, color: 'var(--ink)' }}>{draft}</div>
          <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
            <LK.ButtonOutline size="lg" arrow={false} icon={copied ? 'check' : undefined} onClick={() => navigator.clipboard?.writeText(draft).then(() => setCopied(true), () => {})}>{copied ? 'Copied' : 'Copy message'}</LK.ButtonOutline>
          </div>
        </article>
        <article style={lkCard}>
          <LkHead>House agreement</LkHead>
          <div style={{ marginTop: 10 }}>
            {m.agreement.sections.map((s, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderTop: i ? '1px solid var(--border)' : 0 }}>
              <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 12, background: 'var(--sand)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><LK.Icon name={s.icon} size={16} /></span>
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{s.title}</div><div style={{ marginTop: 2, fontSize: 14, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{s.text}</div></div>
            </div>)}
          </div>
          <div style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 20px', fontSize: 13, color: 'var(--ink)' }}>
            {['You', p.name].map((n, i) => <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check />{n} confirmed</span>)}
            <SampleNote p={p} />
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 24 }}><LK.ButtonOutline size="lg" arrow={false} icon="file-text" href={`/api/matches/${m.id}/pdf`}>Download PDF</LK.ButtonOutline></div>
        </article>
      </div>

      <div style={{ marginTop: 16, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: '32px 40px' }}>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))' }}>
          <div style={{ position: 'absolute', left: 11, right: '20%', top: 11, height: 1, background: 'var(--ink)' }} />
          {steps.map(([s, done], i) => <div key={s} style={{ position: 'relative', minWidth: 0 }}>
            {done ? <Check size={22} /> : <span style={{ display: 'block', width: 22, height: 22, borderRadius: 9999, background: 'var(--card)', border: '1px solid var(--ink)' }} />}
            <div style={{ marginTop: 16, fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ marginTop: 6, fontSize: 16, fontWeight: 500, color: done ? 'var(--ink)' : 'var(--muted-foreground)', paddingRight: 16 }}>{s}</div>
          </div>)}
        </div>
      </div>
      <p style={{ margin: '24px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)', textAlign: 'center' }}>RoomMe isn’t a broker and doesn’t hold deposits. Never pay anyone before you’ve seen the apartment and signed a lease.</p>
    </section>
  </MFrame>;
}
