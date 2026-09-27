"use client";
// 4B · Listing detail + trust panel. Ported from ui_kits/listings/DetailScreen.jsx.
// Design copy with no data behind it (amenity chips, "groups interested", lister location) is left out.
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as LD from '@/components/rm';
import { NAV, useSaved } from '@/components/shared';
import { usd, seenOn, day, street, bedsLabel } from '@/lib/format';

function RangeBar({ l }) {
  const m = l.medianPerRoom, lo = m * 0.85, hi = m * 1.15;
  const pos = v => Math.min(100, Math.max(0, (v - lo) / (hi - lo) * 100)) + '%';
  return <div>
    <div style={{ fontSize: 15, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}><span style={{ fontWeight: 500 }}>{usd(l.perRoom)} per room</span> <span style={{ color: 'var(--muted-foreground)' }}>vs {l.neighborhood} median ≈{usd(m)}</span></div>
    <div style={{ position: 'relative', marginTop: 22, height: 6, borderRadius: 9999, background: 'var(--sand)' }}>
      <div style={{ position: 'absolute', left: '50%', top: -8, width: 1, height: 22, background: 'rgba(14,12,11,.4)' }} />
      <div style={{ position: 'absolute', left: pos(l.perRoom), top: '50%', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 9999, background: 'var(--ink)', border: '2px solid var(--card)' }} />
    </div>
    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-foreground)' }}><span>−15%</span><span>Median</span><span>+15%</span></div>
  </div>;
}

function Sparkline({ history, l }) {
  const first = history[0], last = history[history.length - 1];
  const w = 360, h = 56;
  const ps = history.map(p => p.price), lo = Math.min(...ps), hi = Math.max(...ps);
  const pts = history.map((p, i) => [i / Math.max(1, history.length - 1) * w, hi === lo ? h / 2 : (1 - (p.price - lo) / (hi - lo)) * h]);
  return <div>
    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Price history (from our snapshots)</div>
    {history.length > 1
      ? <svg width="100%" viewBox={`0 -4 ${w} ${h + 8}`} style={{ display: 'block', marginTop: 14, overflow: 'visible' }}>
        <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="var(--ink)" />
      </svg>
      : <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>One snapshot so far. The line fills in as we re-check the listing.</p>}
    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
      <span>First seen {seenOn(first ? first.time : l.firstSeen)} · {usd(first ? first.price : l.price)}</span>
      {history.length > 1 && <span>{seenOn(last.time)} · {usd(last.price)}</span>}
    </div>
  </div>;
}

export default function DetailScreen({ l, history }) {
  const router = useRouter();
  const [saved, toggleSave] = useSaved();
  const pct = l.medianRent ? Math.round((l.price / l.medianRent - 1) * 100) : null;
  const from = l.isBuilding ? 'from ' : '';
  const KEY = [
    ['wallet', 'Rent', `${from}${usd(l.price)}/mo`],
    ['users', 'Per room', `${from}${usd(l.perRoom)}`],
    ['bed-double', 'Beds/baths', `${bedsLabel(l.beds)}${l.baths != null ? ` · ${l.baths} bath` : ''}${l.sqft ? ` · ${l.sqft.toLocaleString('en-US')} sq ft` : ''}`],
    ['calendar', 'Available', l.availabilityDate ? day(l.availabilityDate) : 'Ask the lister'],
    ['key-round', 'Listed by', (l.broker || 'Not stated').replace(/^Listing by:\s*/, '')],
    ['file-text', 'Source', null],
  ];
  const CHECKS = [
    [pct != null && Math.abs(pct) <= 15, pct == null ? 'Too few nearby listings to compare the price' : `Price is ${Math.abs(pct)}% ${pct < 0 ? 'under' : 'over'} the ${l.neighborhood} median for ${bedsLabel(l.beds)}`],
    [true, `Seen on Zillow on ${seenOn(l.lastSeen)}`],
    [l.trust !== 'check', l.trust === 'check' ? 'Priced 40% or more under the median. Never pay before viewing.' : 'Not priced suspiciously low'],
  ];
  return <div style={{ width: 1440, margin: '0 auto', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
    <section className="rm-on-dark" style={{ position: 'relative', height: 792, overflow: 'hidden', background: 'var(--ink)', color: '#fff' }}>
      <LD.Slot src={l.images[0]} alt={`${bedsLabel(l.beds)} in ${l.neighborhood}`} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg,rgba(14,12,11,.75) 0%,rgba(14,12,11,.35) 30%,rgba(14,12,11,.7) 62%,rgba(14,12,11,.88) 100%)' }} />
      <LD.Header variant="transparent" brand={<LD.Wordmark onDark />} items={NAV} active="Listings" showSearch={false} style={{ position: 'absolute' }} />
      <nav aria-label="Breadcrumb" style={{ position: 'absolute', top: 104, left: 48, display: 'flex', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.85)' }}>
        <Link href="/listings" style={{ color: 'inherit' }}>Listings</Link><span>/</span><Link href={'/listings?area=' + encodeURIComponent(l.neighborhood)} style={{ color: 'inherit' }}>{l.neighborhood}</Link><span>/</span><span style={{ color: '#fff' }}>{bedsLabel(l.beds)}</span>
      </nav>
      <div style={{ position: 'absolute', left: 48, right: 48, bottom: 72, pointerEvents: 'none' }}>
        <LD.Eyebrow onDark>{l.neighborhood} · {bedsLabel(l.beds)}</LD.Eyebrow>
        <h1 style={{ margin: '28px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', maxWidth: '16ch' }}>{street(l.address)}</h1>
        <div style={{ marginTop: 32, display: 'flex', gap: 12, fontSize: 15, color: 'rgba(255,255,255,.75)', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: '#fff' }}>{from}{usd(l.price)}/mo</span><span>·</span><span>{from}{usd(l.perRoom)} per room</span>{l.availabilityDate && <><span>·</span><span>Available {day(l.availabilityDate)}</span></>}<span>·</span><span>Seen on {seenOn(l.lastSeen)}</span>
        </div>
      </div>
    </section>
    <div style={{ position: 'relative' }}>
      <section style={{ padding: '112px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48 }}>
          <div style={{ gridColumn: '1 / span 4' }}>
            <LD.SectionLabel number="01">Overview</LD.SectionLabel>
            <p style={{ margin: '24px 0 0', fontSize: 22, fontWeight: 500, lineHeight: 1.4, letterSpacing: '-0.015em', color: 'var(--ink)', textWrap: 'pretty' }}>{l.address}</p>
            <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <LD.Chip icon="map-pin">{l.neighborhood}</LD.Chip>
              {l.homeType && <LD.Chip icon="house">{l.homeType.charAt(0) + l.homeType.slice(1).toLowerCase().replace(/_/g, ' ')}</LD.Chip>}
              {l.isBuilding && <LD.Chip icon="key-round">Building unit, price “from”</LD.Chip>}
            </div>
            {l.images.length > 1 && <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
              {l.images.slice(1, 5).map(src => <div key={src} style={{ position: 'relative', height: 120, borderRadius: 16.8, overflow: 'hidden', background: 'var(--sand)' }}><LD.Slot src={src} /></div>)}
            </div>}
          </div>
          <div style={{ gridColumn: '5 / span 4' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: '24px 28px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Key information</div>
              <div style={{ marginTop: 10 }}>
                {KEY.map(([ic, k, v], i) => <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i ? '1px solid var(--border)' : 0 }}>
                  <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 12, background: 'var(--sand)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><LD.Icon name={ic} size={16} /></span>
                  <div><div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{k}</div><div style={{ marginTop: 2, fontSize: 14, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{v || <LD.LinkUnderline href={l.link} arrow={false} size={14}>View on Zillow ↗</LD.LinkUnderline>}</div></div>
                </div>)}
              </div>
            </div>
            <p style={{ margin: '14px 0 0 4px', fontSize: 13, color: 'var(--muted-foreground)' }}>Not our listing. We link back.</p>
          </div>
        </div>
      </section>
      <section style={{ padding: '112px 48px', background: 'var(--sand)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48 }}>
          <div style={{ gridColumn: '1 / span 8' }}>
            <LD.SectionLabel number="02" onSand>Trust check</LD.SectionLabel>
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16, alignItems: 'start' }}>
              <div style={{ background: 'var(--card)', borderRadius: 24, padding: 28 }}>
                {l.trust && <LD.TrustBadge status={l.trust} />}
                <div style={{ marginTop: l.trust ? 24 : 0 }}>{l.medianPerRoom ? <RangeBar l={l} /> : <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--ink)' }}>Too few {bedsLabel(l.beds)} listings in {l.neighborhood} to compare this price yet.</p>}</div>
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)' }}><Sparkline history={history} l={l} /></div>
                <div style={{ marginTop: 24, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  {CHECKS.map(([ok, c], i) => <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? '1px solid var(--border)' : 0, fontSize: 14, color: 'var(--ink)' }}>
                    <span style={{ flex: 1 }}>{c}</span>
                    {ok ? <span style={{ width: 22, height: 22, borderRadius: 9999, background: 'var(--ink)', color: 'var(--background)', display: 'grid', placeItems: 'center' }}><LD.Icon name="check" size={12} /></span>
                      : <span aria-label="Check this" style={{ width: 22, height: 22, display: 'grid', placeItems: 'center' }}><span style={{ width: 7, height: 7, borderRadius: 9999, background: l.trust === 'check' ? 'var(--destructive)' : 'var(--watch)' }} /></span>}
                  </div>)}
                </div>
              </div>
              <div style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 24, padding: 28 }}>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>What a flagged listing looks like</div>
                <LD.TrustBadge status="check" style={{ marginTop: 16 }} />
                <div style={{ marginTop: 18, fontSize: 18, fontWeight: 500, lineHeight: 1.4, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Priced 40% or more under the neighborhood median → see it in person before any deposit</div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 14, color: 'var(--ink)' }}>Medians come from every listing we’ve seen in the same neighborhood with the same bedroom count.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ position: 'absolute', top: 112, bottom: 112, right: 48, width: 416, pointerEvents: 'none' }}>
        <div style={{ position: 'sticky', top: 104, pointerEvents: 'auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{from}{usd(l.perRoom)} per room</div>
          <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{bedsLabel(l.beds)} · {l.neighborhood}{l.availabilityDate ? ` · Available ${day(l.availabilityDate)}` : ''}</div>
          <LD.ButtonInk size="lg" fullWidth style={{ marginTop: 24 }} onClick={() => { if (!saved.includes(l.zpid)) toggleSave(l.zpid); router.push('/matches?listing=' + encodeURIComponent(l.zpid)); }}>Save and find roommates for this place</LD.ButtonInk>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}><LD.LinkUnderline href={l.link} arrow={false} size={14}>View on Zillow ↗</LD.LinkUnderline></div>
          <p style={{ margin: '16px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>We don’t rent this unit. When you’re ready, you’ll apply through the source listing.</p>
        </div>
      </div>
    </div>
  </div>;
}
