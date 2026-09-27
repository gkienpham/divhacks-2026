"use client";
// Pieces the mutual/agreement/locked kits shared through Babel globals (MutualScreens defined them).
import React from 'react';
import * as MU from '@/components/rm';
import { NAV } from '@/components/shared';
import { usd, day, street, bedsLabel } from '@/lib/format';

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
