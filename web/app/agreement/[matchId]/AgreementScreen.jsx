"use client";
// 6C · House agreement. Ported from ui_kits/mutual/AgreementScreen.jsx.
// The draft is rule-based, from both profiles (lib/matches.ts). Edits, resolves and confirmations persist on the match;
// an edit clears both confirmations (server rule).
import React from 'react';
import { useRouter } from 'next/navigation';
import * as AG from '@/components/rm';
import { usd, seenOn, day, bedsLabel } from '@/lib/format';
import { MFrame, Tile, SampleNote, usePair, ErrorLine, brokerDraft } from '@/app/matches/[id]/parts';

const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24 };
const dot = c => <span style={{ width: 7, height: 7, flex: 'none', borderRadius: 9999, background: c }} />;

export default function AgreementScreen({ me, m: initial, l, aiOff }) {
  const router = useRouter();
  const { m, act, busy, error } = usePair(initial);
  const [editing, setEditing] = React.useState(null);
  const [text, setText] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const p = m.other, a = m.agreement;
  const mine = a.confirmed.includes(me.id), theirs = a.confirmed.includes(p.id);
  const draft = l && brokerDraft(l);
  const edit = i => { setEditing(i); setText(a.sections[i].text); };
  // Unchanged or emptied text isn't saved, so it never clears the confirmations.
  const done = async () => {
    const v = text.trim();
    if (v && v !== a.sections[editing].text && !await act({ action: 'agreement', sections: a.sections.map((s, j) => j === editing ? { ...s, text: v } : s) })) return;
    setEditing(null);
  };
  const lock = async () => { if (await act({ action: 'lock', listing: l.zpid })) router.push(`/locked/${m.id}`); };
  return <MFrame me={me} h={1400}>
    <section style={{ padding: '72px 48px 112px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'end' }}>
        <div style={{ gridColumn: '1 / span 8' }}>
          <AG.Eyebrow>House agreement · Draft</AG.Eyebrow>
          <h1 style={{ margin: '24px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', color: 'var(--ink)' }}>{p.name} & {me.name}{l && ` · ${bedsLabel(l.beds)} ${l.neighborhood}`}</h1>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--muted-foreground)' }}>{aiOff && <AG.AIOffBadge />}Drafted from both profiles. Edit anything.</div>
        </div>
        {l && <div style={{ gridColumn: '9 / span 4', fontSize: 13, color: 'var(--muted-foreground)', display: 'flex', flexWrap: 'wrap', gap: '4px 10px', justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: 'var(--ink)' }}>{l.isBuilding ? 'from ' : ''}{usd(l.price)}/mo</span>{l.availabilityDate && <><span>·</span><span>Available {day(l.availabilityDate)}</span></>}<span>·</span><span>Seen on {seenOn(l.lastSeen)}</span><span>·</span><AG.LinkUnderline href={l.link} arrow={false} size={13}>View on Zillow ↗</AG.LinkUnderline>
        </div>}
      </div>
      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / span 7' }}>
          <AG.SectionLabel number="01">What you agreed</AG.SectionLabel>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {a.sections.map((s, i) => <div key={i} style={{ ...card, padding: 24, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <Tile icon={s.icon} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{s.title}</div>
                {editing === i
                  ? <><AG.Field as="textarea" rows={2} value={text} onChange={e => setText(e.target.value)} style={{ marginTop: 10 }} /><ErrorLine error={error} /></>
                  : <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>{s.text}</p>}
              </div>
              {(editing === null || editing === i) && <AG.LinkUnderline arrow={false} size={13} onClick={busy ? undefined : editing === i ? done : () => edit(i)} style={{ marginTop: 4 }}>{editing !== i ? 'Edit' : busy ? 'Saving…' : 'Done'}</AG.LinkUnderline>}
            </div>)}
          </div>
          {a.open.length > 0 && <>
            <AG.SectionLabel number="02" style={{ marginTop: 56 }}>Open questions</AG.SectionLabel>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {a.open.map((o, i) => <div key={i} style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                {dot(o.resolved ? 'var(--fair)' : 'var(--watch)')}
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{o.q}</span>
                {o.resolved ? <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Resolved</span> : <AG.ButtonOutline size="sm" arrow={false} disabled={busy} onClick={() => act({ action: 'agreement', open: a.open.map((x, j) => j === i ? { ...x, resolved: true } : x) })}>Resolve</AG.ButtonOutline>}
              </div>)}
            </div>
          </>}
        </div>
        <aside style={{ gridColumn: '8 / span 5', position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...card, padding: 28 }}>
            <AG.Timeline items={[{ label: 'Done', title: 'Matched ✓' }, m.meetup ? { label: 'Done', title: 'Meetup planned ✓' } : { label: 'Skipped', title: 'Meetup', pending: true }, { label: 'Now', title: 'Agreement', text: 'Both confirm the draft.' }, { label: 'Next', title: 'Lock listing', pending: true }, { label: 'Last', title: 'Apply on Zillow', pending: true }]} />
            <div style={{ marginTop: 28, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              {[[me, 'You', mine], [p, p.name, theirs]].map(([x, n, ok], i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <AG.InitialsAvatar initials={x.initials} name={x.name} size={36} />
                <span style={{ flex: 1, display: 'grid', gap: 2 }}><span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{n}</span><SampleNote p={x} /></span>
                {ok ? <span style={{ fontSize: 13, color: 'var(--ink)' }}>✓ confirmed</span>
                  : i === 0 ? <AG.ButtonOutline size="sm" arrow={false} disabled={busy || editing !== null} onClick={() => act({ action: 'confirm' })}>Confirm</AG.ButtonOutline>
                  : <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted-foreground)' }}>{dot('var(--watch)')}waiting</span>}
              </div>)}
            </div>
            <AG.ButtonInk size="lg" fullWidth disabled={!mine || !theirs || !l || busy} onClick={lock} style={{ marginTop: 20 }}>Lock this listing</AG.ButtonInk>
            {!(mine && theirs) && <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>Unlocks when you both confirm.</p>
              {p.synthetic && !theirs && <AG.LinkUnderline arrow={false} size={12} onClick={busy ? undefined : () => act({ action: 'simulate-confirm' })}>Simulate {p.name} confirming</AG.LinkUnderline>}
            </div>}
            <ErrorLine error={editing === null && error} style={{ justifyContent: 'center' }} />
          </div>
          {l && <div style={{ ...card, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Message to the broker</span><span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Template</span></div>
            <div style={{ marginTop: 16, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 16.8, padding: '16px 18px', fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{draft}</div>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 20 }}>
              <AG.ButtonOutline size="sm" arrow={false} icon={copied ? 'check' : undefined} onClick={() => navigator.clipboard?.writeText(draft).then(() => setCopied(true), () => {})}>{copied ? 'Copied' : 'Copy'}</AG.ButtonOutline>
              <AG.LinkUnderline href={l.link} arrow={false} size={14}>Open on Zillow ↗</AG.LinkUnderline>
            </div>
          </div>}
        </aside>
      </div>
    </section>
  </MFrame>;
}
