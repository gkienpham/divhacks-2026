"use client";
// Pieces the mutual/agreement/locked kits shared through Babel globals (MutualScreens defined them),
// plus the score pieces the swipe card and the match detail share.
import React from 'react';
import * as MU from '@/components/rm';
import { NAV } from '@/components/shared';
import { QUICK } from '@/lib/questions';
import { usd, day, street, bedsLabel, said } from '@/lib/format';

// What lib/score.ts does, in a few words. The full math is on the landing (/#the-math).
const N = QUICK.length;
export const HOW_SCORED = `Dealbreakers filter first, both ways. Then your ${N} answers are compared in real units (hours, times a week, decibels). Your match % is the average of the ${N} agreements, each counting equally. AI and voice answers never change it.`;

// Display only: "You the same day · Sam right after eating". Each option's first letter drops to lowercase, except the pronoun I.
// All of m.bars (score.ts parts, question order), two per row, every row one height.
export const Bars = ({ m, rowGap = 22 }) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gridAutoRows: '1fr', columnGap: 32, rowGap }}>
  {m.bars.map(b => <MU.HabitBar key={b.k} label={b.label} icon={b.icon} value={b.v} you={said(b.you)} them={said(b.them)} themName={m.other.name} />)}
</div>;

// clickClash can return no exact matches or no gaps under 75%, and ClickClashList always draws both headings.
// So a side with nothing to list says so in one quiet line, in ClickClashList's own layout.
export function Reasons({ m }) {
  if (m.click.length && m.clash.length) return <MU.ClickClashList aiWritten={m.ai} click={m.click} clash={m.clash} />;
  const col = (head, lines, mark, none) => <div>
    <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{head}</div>
    <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>
      {lines.length ? lines.map((c, i) => <li key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderTop: '1px solid var(--border)', fontSize: 14, lineHeight: 1.55, color: 'var(--foreground)' }}>
        <span style={{ width: 16, flex: 'none', display: 'flex', justifyContent: 'center', paddingTop: 3 }}>{mark}</span><span>{c}</span>
      </li>) : <li style={{ padding: '14px 0', borderTop: '1px solid var(--border)', fontSize: 14, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>{none}</li>}
    </ul>
  </div>;
  return <div>
    {m.ai && <MU.AISummaryTag style={{ marginBottom: 18 }} />}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 48 }}>
      {col("You'll click", m.click, <MU.Icon name="check" size={15} color="var(--ink)" />, 'No exact matches')}
      {col("You'll clash", m.clash, <span aria-hidden="true" style={{ width: 7, height: 7, marginTop: 4, borderRadius: 9999, background: 'var(--watch)' }} />, 'No big gaps')}
    </div>
  </div>;
}

export const MFrame = ({ me, children = null, h = 900 }) => <div style={{ width: 1440, minHeight: h, margin: '0 auto', background: 'var(--background)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
  <MU.Header variant="light" brand={<MU.Wordmark />} items={NAV} active="Matches" showSearch={false} showCta={false} right={<MU.InitialsAvatar initials={me.initials} name={me.name} size={36} />} />
  {children}
</div>;
export const Tile = ({ icon }) => <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 12, background: 'var(--sand)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><MU.Icon name={icon} size={16} /></span>;
export const MH2 = ({ children, style }) => <h2 style={{ margin: 0, fontSize: 60, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--ink)', textWrap: 'pretty', ...style }}>{children}</h2>;
// Seeded people are labeled wherever they appear.
export const SampleNote = ({ p, style }) => p.synthetic ? <span style={{ fontSize: 12, color: 'var(--muted-foreground)', ...style }}>Sample profile</span> : null;

// Carry the pair's listing between the steps.
export const pairHref = (path, l, q = {}) => { const s = new URLSearchParams(l ? { ...q, listing: l.zpid } : q).toString(); return s ? `${path}?${s}` : path; };

// One POST /api/matches/[id] per action. Only what the server returns is shown, so nothing looks saved that isn't.
export function usePair(initial) {
  const [m, setM] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const act = async body => {
    setBusy(true); setError(null);
    const res = await fetch(`/api/matches/${initial.id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(r => r.json()).catch(() => ({}));
    setBusy(false);
    if (res.match) setM(res.match); else setError(res.error || 'Couldn’t save. Try again.');
    return res.match ?? null;
  };
  return { m, act, busy, error };
}
export const ErrorLine = ({ error, style }) => error ? <p role="alert" style={{ margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)', ...style }}><span style={{ width: 7, height: 7, flex: 'none', borderRadius: 9999, background: 'var(--destructive)' }} />{error}</p> : null;

// Template broker inquiry, built only from listing fields.
export const brokerDraft = l => `Hi, we’re two roommates interested in the ${bedsLabel(l.beds)} at ${street(l.address)} in ${l.neighborhood}, listed ${l.isBuilding ? 'from' : 'at'} ${usd(l.price)}/mo. ${l.availabilityDate ? `Is it still available for move-in on ${day(l.availabilityDate)}?` : 'Is it still available?'} We’d love to schedule a viewing this week. Thank you.`;
