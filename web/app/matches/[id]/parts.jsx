"use client";
// Pieces the mutual/agreement/locked kits shared through Babel globals (MutualScreens defined them).
import React from 'react';
import * as MU from '@/components/rm';
import { NAV } from '@/components/shared';
import { ME } from '@/lib/sample-data';
import { usd, day, street, bedsLabel } from '@/lib/format';

export const MFrame = ({ children, h = 900 }) => <div style={{ width: 1440, minHeight: h, margin: '0 auto', background: 'var(--background)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
  <MU.Header variant="light" brand={<MU.Wordmark />} items={NAV} active="Matches" showSearch={false} showCta={false} right={<MU.InitialsAvatar initials={ME.i} name={ME.n} size={36} />} />
  {children}
</div>;
export const Tile = ({ icon }) => <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 12, background: 'var(--sand)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><MU.Icon name={icon} size={16} /></span>;
export const MH2 = ({ children, style }) => <h2 style={{ margin: 0, fontSize: 60, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--ink)', textWrap: 'pretty', ...style }}>{children}</h2>;

// Carry the pair's listing between the steps.
export const withListing = (path, l, extra = '') => `${path}?${extra}listing=${encodeURIComponent(l.zpid)}`;
export const from = l => (l.isBuilding ? 'from ' : '');
export const rentEach = l => `${from(l)}${usd(l.price / 2)} each`;

// Template broker inquiry, built only from listing fields.
export const brokerDraft = l => `Hi, we’re two roommates interested in the ${bedsLabel(l.beds)} at ${street(l.address)} in ${l.neighborhood}, listed at ${from(l)}${usd(l.price)}/mo. ${l.availabilityDate ? `Is it still available for move-in on ${day(l.availabilityDate)}?` : 'Is it still available?'} We’d love to schedule a viewing this week. Thank you.`;
