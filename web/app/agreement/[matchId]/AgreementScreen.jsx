"use client";
// 6C · House agreement. Ported from ui_kits/mutual/AgreementScreen.jsx.
// ponytail: edits and confirmations live in component state only; persist them if the agreement needs to survive a reload.
import React from 'react';
import * as AG from '@/components/rm';
import { ME, personById } from '@/lib/sample-data';
import { usd, seenOn, day, bedsLabel } from '@/lib/format';
import { MFrame, Tile, withListing, from, rentEach, brokerDraft } from '@/app/matches/[id]/parts';

export default function AgreementScreen({ id, l, aiOff }) {
  const p = personById(id);
  const [sections, setSections] = React.useState(() => [['moon', 'Quiet hours', 'Weeknights 11 PM – 7 AM'], ['users', 'Guests', 'Overnight guests up to 2 nights a week, with a heads-up by text'], ['spray-can', 'Chores', 'Weekly rotation: kitchen, bathroom, trash'], ['wallet', 'Bills', `Rent split 50/50 (${rentEach(l)}). Con Ed and internet split evenly, due on the 1st`], ['sun', 'Thermostat', '68°F in winter']]);
  const [editing, setEditing] = React.useState(null);
  const [resolved, setResolved] = React.useState([]);
  const [copied, setCopied] = React.useState(false);
  const [theyOk, setTheyOk] = React.useState(false);
  const OPEN = [`${p.n} wants a cat by spring. Both OK?`, 'Sunday brunch guests: how many, how often?'];
  const DRAFT = brokerDraft(l);
  const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24 };
  const tag = aiOff ? <AG.AIOffBadge /> : <AG.AISummaryTag />;
  return <MFrame h={1400}>
    <section style={{ padding: '72px 48px 112px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'end' }}>
        <div style={{ gridColumn: '1 / span 8' }}>
          <AG.Eyebrow>House agreement · Draft</AG.Eyebrow>
          <h1 style={{ margin: '24px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', color: 'var(--ink)' }}>{p.n} & {ME.n} · {bedsLabel(l.beds)} {l.neighborhood}</h1>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--muted-foreground)' }}>{tag}{aiOff ? 'Built from a template and both profiles. Edit anything.' : 'Drafted from both profiles. Edit anything.'}</div>
        </div>
        <div style={{ gridColumn: '9 / span 4', fontSize: 13, color: 'var(--muted-foreground)', display: 'flex', flexWrap: 'wrap', gap: '4px 10px', justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: 'var(--ink)' }}>{from(l)}{usd(l.price)}/mo</span>{l.availabilityDate && <><span>·</span><span>Available {day(l.availabilityDate)}</span></>}<span>·</span><span>Seen on {seenOn(l.lastSeen)}</span><span>·</span><AG.LinkUnderline href={l.link} arrow={false} size={13}>View on Zillow ↗</AG.LinkUnderline>
        </div>
      </div>
      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / span 7' }}>
          <AG.SectionLabel number="01">What you agreed</AG.SectionLabel>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sections.map(([ic, t, x], i) => <div key={t} style={{ ...card, padding: 24, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <Tile icon={ic} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{t}</div>
                {editing === i
                  ? <AG.Field as="textarea" rows={2} value={x} onChange={e => setSections(s => s.map((r, j) => j === i ? [r[0], r[1], e.target.value] : r))} style={{ marginTop: 10 }} />
                  : <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>{x}</p>}
              </div>
              <AG.LinkUnderline arrow={false} size={13} onClick={() => setEditing(editing === i ? null : i)} style={{ marginTop: 4 }}>{editing === i ? 'Done' : 'Edit'}</AG.LinkUnderline>
            </div>)}
          </div>
          <AG.SectionLabel number="02" style={{ marginTop: 56 }}>Open questions</AG.SectionLabel>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OPEN.map(q => { const r = resolved.includes(q); return <div key={q} style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 7, height: 7, flex: 'none', borderRadius: 9999, background: r ? 'var(--fair)' : 'var(--watch)' }} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{q}</span>
              {r ? <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Resolved</span> : <AG.ButtonOutline size="sm" arrow={false} onClick={() => setResolved(s => [...s, q])}>Resolve</AG.ButtonOutline>}
            </div>; })}
          </div>
        </div>
        <aside style={{ gridColumn: '8 / span 5', position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...card, padding: 28 }}>
            <AG.Timeline items={[{ label: 'Done', title: 'Matched ✓' }, { label: 'Done', title: 'Met ✓' }, { label: 'Now', title: 'Agreement', text: 'Both confirm the draft.' }, { label: 'Next', title: 'Lock listing', pending: true }, { label: 'Last', title: 'Apply via the source listing', pending: true }]} />
            <div style={{ marginTop: 28, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              {[[ME.i, 'You', true], [p.i, p.n, theyOk]].map(([i, n, ok]) => <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <AG.InitialsAvatar initials={i} name={n} size={36} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{n}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: ok ? 'var(--ink)' : 'var(--muted-foreground)' }}>{!ok && <span style={{ width: 7, height: 7, borderRadius: 9999, background: 'var(--watch)' }} />}{ok ? '✓ confirmed' : 'waiting'}</span>
              </div>)}
            </div>
            <AG.ButtonInk size="lg" fullWidth disabled={!theyOk} href={theyOk ? withListing(`/locked/${encodeURIComponent(id)}`, l) : undefined} style={{ marginTop: 20 }}>Lock this listing</AG.ButtonInk>
            {theyOk
              ? <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>You both confirmed.</p>
              : <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>Unlocks when you both confirm.</p>
                <AG.LinkUnderline arrow={false} size={12} onClick={() => setTheyOk(true)}>Simulate {p.n} confirming</AG.LinkUnderline>
              </div>}
          </div>
          <div style={{ ...card, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Message to the broker ({aiOff ? 'template' : 'draft'})</span>{tag}</div>
            <div style={{ marginTop: 16, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 16.8, padding: '16px 18px', fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{DRAFT}</div>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 20 }}>
              <AG.ButtonOutline size="sm" arrow={false} icon={copied ? 'check' : undefined} onClick={() => { navigator.clipboard?.writeText(DRAFT); setCopied(true); }}>{copied ? 'Copied' : 'Copy'}</AG.ButtonOutline>
              <AG.LinkUnderline href={l.link} arrow={false} size={14}>Open on Zillow ↗</AG.LinkUnderline>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </MFrame>;
}
