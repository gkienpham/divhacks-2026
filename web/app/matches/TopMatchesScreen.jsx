"use client";
// 5A swipe · 5B grid · 5C AI off · empty. Ported from ui_kits/matches/TopMatchesScreen.jsx. Loading lives in loading.tsx.
import React from 'react';
import * as MG from '@/components/rm';
import { NAV, EmptyState, Sk } from '@/components/shared';
import { ME, QUEUE, SHORT, PEOPLE, TAGS, REASONS, SCORES } from '@/lib/sample-data';
import SwipeView, { useMatchHref } from './SwipeView';

export function MatchSkeleton() {
  return <div aria-hidden="true" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Sk w={48} h={48} /><div style={{ flex: 1 }}><Sk w="50%" h={18} r={12} /><Sk w={110} h={26} style={{ marginTop: 8 }} /></div><Sk w={64} h={44} r={12} /></div>
    <div style={{ marginTop: 20, display: 'flex', gap: 6 }}><Sk w={84} h={28} /><Sk w={96} h={28} /><Sk w={72} h={28} /></div>
    <Sk w="85%" style={{ marginTop: 18 }} /><Sk w={104} h={36} style={{ marginTop: 22 }} />
  </div>;
}

function GridView({ list, setList }) {
  const href = useMatchHref();
  return <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
    {PEOPLE.map(([ini, n], i) => { const on = list.some(x => x[1] === n); return <article key={n} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', color: 'var(--brand)', fontVariantNumeric: 'tabular-nums', paddingTop: 4, width: 22 }}>{String(i + 1).padStart(2, '0')}</span>
        <MG.InitialsAvatar initials={ini} name={n} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <a href={href(n.toLowerCase())} style={{ display: 'block', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)', textDecoration: 'none' }}>{n}</a>
          <MG.VerifiedBadge style={{ marginTop: 6 }} />
        </div>
        <MG.MatchScore value={SCORES[i]} showLink={false} style={{ zoom: 44 / 60, textAlign: 'right' }} />
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>{TAGS[i % 5].map(t => <MG.HabitTag key={t}>{t}</MG.HabitTag>)}</div>
      <p style={{ margin: '16px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{REASONS[i % 5]}</p>
      <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <MG.ButtonOutline size="sm" arrow={!on} icon={on ? 'check' : undefined} onClick={() => setList(s => on ? s.filter(x => x[1] !== n) : s.length < 5 ? [...s, [ini, n]] : s)}>{on ? 'Shortlisted' : 'Shortlist'}</MG.ButtonOutline>
        <MG.LinkUnderline href={href(n.toLowerCase())} size={13}>Open match</MG.LinkUnderline>
      </div>
    </article>; })}
  </div>;
}

export default function TopMatchesScreen({ ai = true, covers = {} }) {
  const [view, setView] = React.useState('Swipe');
  const [list, setList] = React.useState(SHORT);
  return <div style={{ width: 1440, margin: '0 auto', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
    <MG.Header variant="light" brand={<MG.Wordmark />} items={NAV} active="Matches" showSearch={false} showCta={false}
      right={<MG.InitialsAvatar initials={ME.i} name={ME.n} size={36} />} />
    <section style={{ padding: '72px 48px 112px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'end' }}>
        <div style={{ gridColumn: '1 / span 7' }}>
          <MG.Eyebrow>Matches</MG.Eyebrow>
          <h1 style={{ margin: '24px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', color: 'var(--ink)' }}>Your top 20</h1>
          <p style={{ margin: '24px 0 0', fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)', maxWidth: 440 }}>Ranked by your match score: math on your answers, not AI.</p>
          {!ai && <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--muted-foreground)' }}>AI is off. Matching still works; explanations are rule-based.</p>}
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>Sample profiles for the demo. Real matches appear once you finish your profile.</p>
        </div>
        <div style={{ gridColumn: '9 / span 4', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          {!ai && <MG.AIOffBadge />}
          <MG.SegmentedToggle options={['Swipe', 'Grid']} value={view} onChange={setView} />
        </div>
      </div>
      {!QUEUE.length ? <div style={{ marginTop: 56, display: 'grid' }}><EmptyState icon="sliders-horizontal" title="No matches yet: finish your profile" text="We rank matches once your habits are in. You’re on step 2 of 4." action={<MG.ButtonInk size="lg" href="/profile">Finish my profile</MG.ButtonInk>} /></div>
        : view === 'Swipe' ? <SwipeView ai={ai} covers={covers} list={list} setList={setList} /> : <GridView list={list} setList={setList} />}
    </section>
  </div>;
}
