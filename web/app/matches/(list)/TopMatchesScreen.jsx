"use client";
// 5A swipe · 5B grid · 5C AI off · empty · loading. Ported from ui_kits/matches/TopMatchesScreen.jsx.
// Matches are MatchViews (lib/matches.ts) from page.tsx; like / unlike / pass persist through POST /api/matches/[id].
import React from 'react';
import * as MG from '@/components/rm';
import { NAV, EmptyState, Sk } from '@/components/shared';
import SwipeView, { useMatchHref, SampleNote } from './SwipeView';

function MatchSkeleton() {
  return <div aria-hidden="true" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Sk w={48} h={48} /><div style={{ flex: 1 }}><Sk w="50%" h={18} r={12} /><Sk w={110} h={26} style={{ marginTop: 8 }} /></div><Sk w={64} h={44} r={12} /></div>
    <div style={{ marginTop: 20, display: 'flex', gap: 6 }}><Sk w={84} h={28} /><Sk w={96} h={28} /><Sk w={72} h={28} /></div>
    <Sk w="85%" style={{ marginTop: 18 }} /><Sk w={104} h={36} style={{ marginTop: 22 }} />
  </div>;
}

const Empty = p => <div style={{ marginTop: 56, display: 'grid' }}><EmptyState icon="sliders-horizontal" {...p} /></div>;

function GridView({ ms, act, full }) {
  const href = useMatchHref();
  return <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
    {ms.map((m, i) => { const on = m.likedByMe, reason = m.click.slice(0, 2).join(' · '); return <article key={m.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', color: 'var(--brand)', fontVariantNumeric: 'tabular-nums', paddingTop: 4, width: 22 }}>{String(i + 1).padStart(2, '0')}</span>
        <MG.InitialsAvatar initials={m.other.initials} name={m.other.name} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <a href={href(m.id)} style={{ display: 'block', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)', textDecoration: 'none' }}>{m.other.name}</a>
          {m.other.synthetic && <SampleNote style={{ marginTop: 6 }} />}
        </div>
        <MG.MatchScore value={m.score} showLink={false} style={{ zoom: 44 / 60, textAlign: 'right' }} />
      </div>
      {m.other.tags.length > 0 && <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>{m.other.tags.map(t => <MG.HabitTag key={t}>{t}</MG.HabitTag>)}</div>}
      {reason && <p style={{ margin: '16px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{m.ai && <MG.AISummaryTag style={{ marginRight: 8 }} />}{reason}</p>}
      <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        {m.mutual ? <MG.ButtonInk size="sm" href={href(m.id)}>It’s mutual</MG.ButtonInk>
          : <MG.ButtonOutline size="sm" arrow={!on && !full} icon={on ? 'check' : undefined} disabled={!on && full} onClick={() => act(m, on ? 'unlike' : 'like')}>{on ? 'Shortlisted' : full ? 'Shortlist full' : 'Shortlist'}</MG.ButtonOutline>}
        {m.passedByMe && <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Passed</span>}
        {!m.mutual && <MG.LinkUnderline href={href(m.id)} size={13} style={{ marginLeft: 'auto' }}>Open match</MG.LinkUnderline>}
      </div>
    </article>; })}
  </div>;
}

// me: null = no profile yet. loading: the loading.tsx skeleton.
/** @param {{ ai?: boolean, me?: { name: string, initials: string, complete: boolean } | null, matches?: import('@/lib/matches').MatchView[], cap?: number, loading?: boolean }} props */
export default function TopMatchesScreen({ ai = true, me, matches = [], cap = 5, loading = false }) {
  const [view, setView] = React.useState('Swipe');
  const [ms, setMs] = React.useState(matches);
  const [note, setNote] = React.useState('');
  const full = ms.filter(m => m.likedByMe).length >= cap;
  // Optimistic, then the server's MatchView (it knows when it's mutual). A failed save puts the card back.
  const act = async (m, action) => {
    const put = x => setMs(l => l.map(y => (y.id === x.id ? x : y)));
    put({ ...m, ...{ like: { likedByMe: true, passedByMe: false }, unlike: { likedByMe: false }, pass: { likedByMe: false, passedByMe: true } }[action] });
    setNote('');
    try {
      const r = await fetch('/api/matches/' + m.id, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action }) });
      const match = r.ok ? (await r.json()).match : null;
      if (!match) throw new Error(r.statusText);
      put(match);
    } catch {
      put(m);
      setNote('That didn’t save. Try again.');
    }
  };
  const n = ms.length;
  return <div style={{ width: 1440, margin: '0 auto', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
    <MG.Header variant="light" brand={<MG.Wordmark />} items={NAV} active="Matches" showSearch={false} showCta={false}
      right={me && <MG.InitialsAvatar initials={me.initials} name={me.name} size={36} />} />
    <section style={{ padding: '72px 48px 112px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'end' }}>
        <div style={{ gridColumn: '1 / span 7' }}>
          <MG.Eyebrow>Matches</MG.Eyebrow>
          <h1 style={{ margin: '24px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', color: 'var(--ink)' }}>Your top {n && n < 20 ? n : 20}</h1>
          <p style={{ margin: '24px 0 0', fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)', maxWidth: 440 }}>Ranked by your match score: a metric built from your answers.</p>
          <p role="status" style={{ margin: note ? '8px 0 0' : 0, fontSize: 14, color: 'var(--ink)' }}>{note}</p>
        </div>
        <div style={{ gridColumn: '9 / span 4', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          {!ai && <MG.AIOffBadge />}
          {(loading || n > 0) && <MG.SegmentedToggle options={['Swipe', 'Grid']} value={view} onChange={setView} />}
        </div>
      </div>
      {loading ? <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>{Array.from({ length: 6 }, (_, i) => <MatchSkeleton key={i} />)}</div>
        : !me ? <Empty title="No matches yet" text="Answer a few questions and we’ll rank your top 20." action={<MG.ButtonInk size="lg" href="/start">Start matching</MG.ButtonInk>} />
        : !me.complete ? <Empty title="No matches yet: finish your profile" text="We rank matches once your habits are in." action={<MG.ButtonInk size="lg" href="/profile">Finish my profile</MG.ButtonInk>} />
        : !n ? <Empty title="No matches yet" text="No one fits your answers yet." action={<MG.ButtonOutline size="lg" href="/profile">Edit my answers</MG.ButtonOutline>} />
        : view === 'Swipe' ? <SwipeView ms={ms} act={act} full={full} cap={cap} onGrid={() => setView('Grid')} />
        : <GridView ms={ms} act={act} full={full} />}
    </section>
  </div>;
}
