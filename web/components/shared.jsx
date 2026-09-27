"use client";
// Pieces the design kits shared through Babel globals (BrowseScreen defined them; other screens reused them).
import React from 'react';
import * as LB from '@/components/rm';
import { money, seenOn, day, listingHref, bedsLabel } from '@/lib/format';

export const NAV = ['How it works', 'Matches', 'Listings', 'Neighborhoods', 'FAQ'];

export function EmptyState({ icon, title, text, action }) {
  return <div style={{ gridColumn: '1 / -1', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: '72px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <span style={{ width: 56, height: 56, borderRadius: 9999, border: '1px solid rgba(14,12,11,.2)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><LB.Icon name={icon} size={20} /></span>
    <div style={{ marginTop: 20, fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{title}</div>
    <p style={{ margin: '10px 0 0', maxWidth: 420, fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)' }}>{text}</p>
    {action && <div style={{ marginTop: 28 }}>{action}</div>}
  </div>;
}

export const Sk = ({ w = '100%', h = 14, r = 9999, style }) => <div className="rm-skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;

export function ListingSkeleton() {
  return <div aria-hidden="true"><Sk h={328} r={21.6} /><div style={{ padding: '18px 4px 0' }}><Sk w={96} h={30} /><Sk w="60%" h={22} r={12} style={{ marginTop: 14 }} /><Sk w="80%" style={{ marginTop: 10 }} /><Sk w="100%" h={1} r={0} style={{ marginTop: 20 }} /><Sk w="50%" style={{ marginTop: 14 }} /></div></div>;
}

// Saved listings live on the profile. Server pages pass in getMe()?.saved; toggles are optimistic
// and roll back if POST /api/saved fails.
export function useSaved(initial = []) {
  const [saved, setSaved] = React.useState(initial);
  // Cards link with plain <a>, so Back can show a cached copy of this page (HTTP or back/forward
  // cache) from before a save on the next page: re-read the list then.
  React.useEffect(() => {
    const sync = () => fetch('/api/me').then(r => r.ok && r.json()).then(d => d && setSaved(d.me?.saved ?? [])).catch(() => {});
    if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward') sync();
    const onShow = e => e.persisted && sync();
    addEventListener('pageshow', onShow);
    return () => removeEventListener('pageshow', onShow);
  }, []);
  const toggle = async zpid => {
    const on = !saved.includes(zpid);
    const set = add => setSaved(s => add ? (s.includes(zpid) ? s : [...s, zpid]) : s.filter(x => x !== zpid));
    set(on);
    try {
      const r = await fetch('/api/saved', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ zpid, saved: on }) });
      if (!r.ok) throw new Error(r.statusText);
    } catch { set(!on); }
  };
  return [saved, toggle];
}

// LB.Slot always lazy-loads; photos above the fold (first grid row, detail hero) load right away.
export const Photo = ({ src, alt = '', eager }) => eager && src
  // eslint-disable-next-line @next/next/no-img-element -- a plain <img>, same as LB.Slot
  ? <img src={src.replace(/-p_e\.jpg$/, '-p_f.jpg')} alt={alt} fetchPriority="high" decoding="async" referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  : <LB.Slot src={src} alt={alt} />;

export const listingMeta = l => [
  l.baths != null && `${l.baths} bath${l.baths === 1 ? '' : 's'}`,
  l.sqft && `${l.sqft.toLocaleString('en-US')} sq ft`,
  l.availabilityDate && `Available ${day(l.availabilityDate)}`,
].filter(Boolean).join(' · ');

export const perRoomLabel = (l, cur = 'USD') => `${l.isBuilding ? 'from ' : ''}${money(l.perRoom, cur)} / room`;

// A real listing card: photo, per-room price, trust badge, source link and "Seen on" date (house rule).
export function ListingCard({ l, saved, onSave, currency = 'USD', height = 328, eager }) {
  return <article style={{ minWidth: 0 }}>
    <div style={{ position: 'relative' }}>
      <LB.ImageCard height={height} href={listingHref(l.zpid)} media={<Photo src={l.images[0]} alt={`${bedsLabel(l.beds)} in ${l.neighborhood}`} eager={eager} />} pill={<LB.FrostedPill>{perRoomLabel(l, currency)}{currency !== 'USD' ? ' approx.' : ''}</LB.FrostedPill>} />
      {onSave && <LB.CircleIconButton icon={saved ? 'check' : 'plus'} size={40} filled onDark label={saved ? 'Saved' : 'Save listing'} onClick={() => onSave(l.zpid)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }} />}
    </div>
    <div style={{ padding: '18px 4px 0' }}>
      {l.trust ? <LB.TrustBadge status={l.trust} /> : <div style={{ height: 30, display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--muted-foreground)' }}>Too few nearby to compare</div>}
      <div style={{ marginTop: 14, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{bedsLabel(l.beds)} · {l.neighborhood}</div>
      <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums', minHeight: 22 }}>{listingMeta(l)}</div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
        <span>Seen on {seenOn(l.lastSeen)}</span><span>·</span><LB.LinkUnderline href={l.link} arrow={false} size={13}>View on Zillow ↗</LB.LinkUnderline>
        <span style={{ marginLeft: 'auto', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{l.isBuilding ? 'from ' : ''}{money(l.price)}/mo</span>
      </div>
    </div>
  </article>;
}
