"use client";
// 4A · Browse. Ported from ui_kits/listings/BrowseScreen.jsx; data comes from Tiger via page.tsx.
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as LB from '@/components/rm';
import { NAV, EmptyState, ListingCard, useSaved } from '@/components/shared';
import { seenOn } from '@/lib/format';

const ANY_AREA = 'Anywhere', ANY_BUDGET = 'Any budget', ANY_BEDS = 'Any';
const CHIPS = ['All', 'Fair price only', '2 BR', '3+ BR'];

export default function BrowseScreen({ listings, total, stats, page, more, areas, budgets, current }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [saved, toggleSave] = useSaved();
  const [showSaved, setShowSaved] = React.useState(false);
  const [currency, setCurrency] = React.useState('USD');

  const go = patch => {
    const q = new URLSearchParams(sp.toString());
    q.delete('page');
    for (const [k, v] of Object.entries(patch)) v == null ? q.delete(k) : q.set(k, v);
    router.push('/listings' + (q.size ? '?' + q : ''), { scroll: false });
  };
  const chipOn = c => c === 'All' ? !current.fair && !current.beds : c === 'Fair price only' ? current.fair : current.beds === c.split(' ')[0];
  const tog = c => c === 'All' ? go({ fair: null, beds: null })
    : c === 'Fair price only' ? go({ fair: current.fair ? null : '1' })
    : go({ beds: chipOn(c) ? null : c.split(' ')[0] });

  const shown = showSaved ? listings.filter(l => saved.includes(l.zpid)) : listings;

  return <div style={{ width: 1440, margin: '0 auto', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
    <LB.Header variant="light" brand={<LB.Wordmark />} items={NAV} active="Listings" showSearch={false} right={<LB.LinkUnderline arrow={false} size={14} onClick={() => setShowSaved(s => !s)}>{showSaved ? 'All listings' : `Saved (${saved.length})`}</LB.LinkUnderline>} />
    <section style={{ padding: '72px 48px 112px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'end' }}>
        <div style={{ gridColumn: '1 / span 12' }}>
          <LB.Eyebrow>Listings</LB.Eyebrow>
          <h1 style={{ margin: '24px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', color: 'var(--ink)' }}>Places worth splitting.</h1>
        </div>
        <div style={{ gridColumn: '1 / span 12', marginTop: 40, display: 'flex', columnGap: 32 }}>
          {[`${stats.listings.toLocaleString('en-US')} listings`, `${stats.neighborhoods} neighborhoods`, `Seen on ${seenOn(stats.lastSeen)}`].map((s, i) => <div key={s} style={{ paddingLeft: i ? 32 : 0, borderLeft: i ? '1px solid var(--border)' : 0, fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{s}</div>)}
        </div>
      </div>
      <LB.FilterBar style={{ marginTop: 48 }} actionLabel="Search"
        onAction={([area, budget, beds]) => go({ area: area === ANY_AREA ? null : area, budget: budget === ANY_BUDGET ? null : budget, beds: beds === ANY_BEDS ? null : beds.split(' ')[0] })}
        segments={[
          { label: 'Neighborhood', value: current.area || ANY_AREA, options: [ANY_AREA, ...areas] },
          { label: 'Budget per room', value: current.budget || ANY_BUDGET, options: [ANY_BUDGET, ...budgets] },
          { label: 'Bedrooms', value: current.beds ? current.beds + ' BR' : ANY_BEDS, options: [ANY_BEDS, '2 BR', '3+ BR'] },
        ]} />
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        {CHIPS.map(c => <LB.Chip key={c} active={chipOn(c)} onClick={() => tog(c)}>{c}</LB.Chip>)}
        <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{total.toLocaleString('en-US')} match{total === 1 ? '' : 'es'}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <LB.SegmentedToggle size="sm" options={['USD', 'INR', 'CNY', 'KRW', 'EUR']} value={currency} onChange={setCurrency} />
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>approx.</span>
        </div>
      </div>
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', columnGap: 16, rowGap: 48 }}>
        {shown.length ? shown.map(l => <ListingCard key={l.zpid} l={l} currency={currency} saved={saved.includes(l.zpid)} onSave={toggleSave} />)
          : showSaved ? <EmptyState icon="plus" title="No saved listings yet" text="Tap + on any listing to save it. Saved places show up on your matches, so you can see who saved the same one." action={<LB.ButtonInk size="lg" onClick={() => setShowSaved(false)}>Browse listings</LB.ButtonInk>} />
          : <EmptyState icon="search" title="Nothing matches those filters" text="Try another neighborhood or a wider budget." action={<LB.ButtonInk size="lg" onClick={() => router.push('/listings')}>Clear filters</LB.ButtonInk>} />}
      </div>
      {!showSaved && more && <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center' }}><LB.ButtonOutline size="lg" onClick={() => { const q = new URLSearchParams(sp.toString()); q.set('page', String(page + 1)); router.push('/listings?' + q, { scroll: false }); }}>Load more</LB.ButtonOutline></div>}
    </section>
  </div>;
}
