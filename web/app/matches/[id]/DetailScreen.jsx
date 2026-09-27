"use client";
// A match before it's mutual: score, habits, click/clash and their saved listings, with Pass / Shortlist.
// Ported from ui_kits/web-app/MatchDetailScreen.jsx (the kit's single-match detail).
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as MD from '@/components/rm';
import { ListingCard } from '@/components/shared';
import { MFrame, MH2, SampleNote, usePair, ErrorLine, Bars, Reasons, HOW_SCORED } from './parts';

const grid = { display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))' };

export default function DetailScreen({ me, m: initial, aiOff }) {
  const router = useRouter();
  const { m, act, busy, error } = usePair(initial);
  const [how, setHow] = React.useState(false);
  const p = m.other;
  const saved = m.saved.slice(0, 3), both = Math.min(m.savedOverlap, saved.length); // overlaps come first
  // Mutual → the server renders 6A in place of this screen.
  const go = async action => { if ((await act({ action }))?.mutual) router.refresh(); };
  const chosen = (text, link, action) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{text}</span>
    <MD.LinkUnderline arrow={false} size={13} onClick={busy ? undefined : () => go(action)}>{link}</MD.LinkUnderline>
  </div>;
  return <MFrame me={me} h={1400}>
    <section style={{ padding: '56px 48px 0' }}>
      <Link href="/matches" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--muted-foreground)', textDecoration: 'none' }}>
        <span style={{ width: 40, height: 40, borderRadius: 9999, border: '1px solid rgba(14,12,11,.2)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><MD.Icon name="arrow-left" size={14} /></span>All matches
      </Link>
    </section>
    <section style={{ padding: '48px 48px 0', ...grid, columnGap: 48, alignItems: 'start' }}>
      <div style={{ gridColumn: 'span 7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <MD.InitialsAvatar initials={p.initials} name={p.name} size={72} />
          <div style={{ display: 'grid', gap: 6 }}>
            {p.meta && <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{p.meta}</span>}
            <SampleNote p={p} />
          </div>
        </div>
        <h1 className="rm-rise" style={{ margin: '36px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', color: 'var(--ink)' }}>You and {p.name}</h1>
        {/* The summary exists only when Gemini wrote it. */}
        {(aiOff || m.summary) && <div style={{ marginTop: 28, maxWidth: 560 }}>
          {aiOff ? <MD.AIOffBadge /> : <><MD.AISummaryTag /><p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.625, color: 'var(--foreground)' }}>{m.summary}</p></>}
        </div>}
        {p.tags.length > 0 && <div style={{ marginTop: 24, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.tags.map(t => <MD.HabitTag key={t}>{t}</MD.HabitTag>)}</div>}
      </div>
      <div style={{ gridColumn: '9 / span 4', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 28, padding: 36 }}>
        <MD.MatchScore value={m.score} onHowScored={() => setHow(h => !h)} linkLabel={how ? 'Hide scoring' : 'How it’s scored'} />
        {how && <div style={{ marginTop: 20, background: 'var(--sand)', borderRadius: 16.8, padding: 18, fontSize: 13, lineHeight: 1.6, color: 'var(--foreground)' }}>{HOW_SCORED}<div style={{ marginTop: 12 }}><MD.LinkUnderline href="/#the-math" size={13}>See the table and a worked example</MD.LinkUnderline></div></div>}
        <div style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
          {m.passedByMe ? chosen('Passed', 'Shortlist instead', 'like')
            : m.likedByMe ? chosen(`Shortlisted. ${p.name} hasn’t said yes.`, 'Remove', 'unlike')
            : <div style={{ display: 'flex', gap: 12 }}>
              <MD.CircleIconButton icon="x" size={48} label="Pass" disabled={busy} onClick={() => go('pass')} />
              <MD.ButtonInk size="lg" fullWidth arrow={false} disabled={busy} onClick={() => go('like')}>Shortlist ♥</MD.ButtonInk>
            </div>}
          <ErrorLine error={error} />
        </div>
      </div>
    </section>

    <section style={{ padding: '112px 48px 0' }}>
      <MD.SectionLabel number="01">Side by side</MD.SectionLabel>
      <MH2 style={{ marginTop: 22 }}>Where you line up</MH2>
      <div style={{ marginTop: 48, ...grid, gap: 16 }}>
        <MD.FormCard style={{ gridColumn: 'span 7' }} padding={36}><Bars m={m} rowGap={28} /></MD.FormCard>
        <MD.FormCard style={{ gridColumn: 'span 5' }} padding={36}><Reasons m={m} /></MD.FormCard>
      </div>
    </section>

    {saved.length > 0 && <section style={{ padding: '112px 48px 0' }}>
      <MD.SectionLabel number="02">Saved listings</MD.SectionLabel>
      <div style={{ marginTop: 22, ...grid, columnGap: 48, alignItems: 'end' }}>
        <MH2 style={{ gridColumn: 'span 7' }}>{p.name} is looking at</MH2>
        {both > 0 && <p style={{ gridColumn: '9 / span 4', margin: 0, fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)' }}>You both saved {both === 1 ? 'one' : both} of these.</p>}
      </div>
      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>{saved.map(l => <ListingCard key={l.zpid} l={l} />)}</div>
    </section>}
    <div style={{ height: 112 }} />
  </MFrame>;
}
