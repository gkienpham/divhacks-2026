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

// Saved listings live in this browser only (no accounts yet).
const KEY = 'rm-saved';
export function useSaved() {
  const [saved, setSaved] = React.useState([]);
  // localStorage is client-only: read it after mount so SSR and hydration markup match.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {} }, []);
  const toggle = zpid => setSaved(s => {
    const n = s.includes(zpid) ? s.filter(x => x !== zpid) : [...s, zpid];
    try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
    return n;
  });
  return [saved, toggle];
}

export const listingMeta = l => [
  l.baths != null && `${l.baths} bath${l.baths === 1 ? '' : 's'}`,
  l.sqft && `${l.sqft.toLocaleString('en-US')} sq ft`,
  l.availabilityDate && `Available ${day(l.availabilityDate)}`,
].filter(Boolean).join(' · ');

export const perRoomLabel = (l, cur = 'USD') => `${l.isBuilding ? 'from ' : ''}${money(l.perRoom, cur)} / room`;

// A real listing card: photo, per-room price, trust badge, source link and "Seen on" date (house rule).
export function ListingCard({ l, saved, onSave, currency = 'USD', height = 328 }) {
  return <article style={{ minWidth: 0 }}>
    <div style={{ position: 'relative' }}>
      <LB.ImageCard height={height} href={listingHref(l.zpid)} media={<LB.Slot src={l.images[0]} alt={`${bedsLabel(l.beds)} in ${l.neighborhood}`} />} pill={<LB.FrostedPill>{perRoomLabel(l, currency)}{currency !== 'USD' ? ' approx.' : ''}</LB.FrostedPill>} />
      {onSave && <LB.CircleIconButton icon={saved ? 'check' : 'plus'} size={40} filled onDark label={saved ? 'Saved' : 'Save listing'} onClick={() => onSave(l.zpid)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }} />}
    </div>
    <div style={{ padding: '18px 4px 0' }}>
      {l.trust ? <LB.TrustBadge status={l.trust} /> : <div style={{ height: 30, display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--muted-foreground)' }}>Too few nearby listings to compare</div>}
      <div style={{ marginTop: 14, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{bedsLabel(l.beds)} · {l.neighborhood}</div>
      <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums', minHeight: 22 }}>{listingMeta(l)}</div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
        <span>Seen on {seenOn(l.lastSeen)}</span><span>·</span><LB.LinkUnderline href={l.link} arrow={false} size={13}>View on Zillow ↗</LB.LinkUnderline>
        <span style={{ marginLeft: 'auto', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{l.isBuilding ? 'from ' : ''}{money(l.price)}/mo</span>
      </div>
    </div>
  </article>;
}
