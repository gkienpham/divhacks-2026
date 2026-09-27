"use client";
// /start · 2A name and email → 2B 30-second pre-screen → POST /api/profile → /profile. Ported from ui_kits/onboarding.
import React from 'react';
import { useRouter } from 'next/navigation';
import * as SI from '@/components/rm';
import { PRESCREEN, SUBWAY_LINES, DEALBREAKERS, budgetBand } from '@/lib/questions';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const flip = (arr, x) => arr.includes(x) ? arr.filter(y => y !== x) : [...arr, x];

function SignInScreen({ name, setName, email, setEmail, next }) {
  const [err, setErr] = React.useState({});
  const go = e => {
    e.preventDefault();
    const m = email.trim();
    const errs = { name: name.trim() ? null : 'Enter your first name.', email: m && !EMAIL.test(m) ? 'Enter a full email address, like you@school.edu.' : null };
    setErr(errs);
    if (!errs.name && !errs.email) next();
  };
  return <section style={{ maxWidth: 1440, margin: '0 auto', padding: '96px 48px 112px', display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
    <div style={{ gridColumn: 'span 6', paddingTop: 8 }}>
      <SI.Eyebrow>Step 1 of 4</SI.Eyebrow>
      <h1 className="rm-rise" style={{ margin: '28px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', color: 'var(--ink)', maxWidth: '11ch' }}>Let’s find your people.</h1>
      <p className="rm-rise" style={{ animationDelay: '120ms', margin: '32px 0 0', maxWidth: 420, fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)' }}>Answer a few quick questions, and we’ll show you who lives like you do.</p>
    </div>
    <form noValidate onSubmit={go} style={{ gridColumn: '8 / span 5' }}>
      <SI.FormCard padding={40}>
        {/* "Continue with Google" returns here once lib/session.ts signs in with Google. */}
        <SI.Field label="First name" name="name" value={name} onChange={e => setName(e.target.value.slice(0, 40))} error={err.name} />
        <SI.Field label="School email" hint="Optional" type="email" name="email" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value.slice(0, 120))} error={err.email} style={{ marginTop: 20 }} />
        <SI.ButtonInk type="submit" size="lg" fullWidth style={{ marginTop: 28 }}>Continue</SI.ButtonInk>
      </SI.FormCard>
    </form>
  </section>;
}

// The pre-screen being edited. School, lines and date are kept while their chip is off, so turning it back on restores them.
const draft = p => ({
  answers: Object.fromEntries(PRESCREEN.map(g => [g.id, p?.answers?.[g.id] ?? g.def])),
  school: p?.school ?? 'Columbia University',
  lines: p?.lines ?? ['1', 'A'],
  moveDate: p?.moveDate ?? '',
  dealbreakers: p?.dealbreakers ?? [DEALBREAKERS[0]],
});
// → the Prescreen we save (lib/questions.ts): the optional fields only when their chip is on.
const toPrescreen = ({ answers, school, lines, moveDate, dealbreakers }) => ({
  answers, dealbreakers,
  ...(answers.where.includes('Near my school/work') && school.trim() && { school: school.trim() }),
  ...(answers.where.includes('Anywhere near transit') && { lines }),
  ...(answers.move[0] === 'Pick a date' && moveDate && { moveDate }),
});

function Group({ n, g, val, set, children, first }) {
  const tog = o => set(g.multi ? flip(val, o) : [o]);
  return <div style={{ padding: '11px 0', borderTop: first ? 0 : '1px solid var(--border)', minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>{String(n).padStart(2, '0')}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{g.label}</span>
      {g.multi && <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Pick any</span>}
    </div>
    <div style={{ marginTop: 9, display: 'flex', flexWrap: 'wrap', gap: 6 }}>{g.opts.map(o => <SI.Chip key={o} size="sm" active={val.includes(o)} onClick={() => tog(o)}>{o}</SI.Chip>)}</div>
    {children}
  </div>;
}
function PreScreenScreen({ rooms, ps, setPs, back, save, saving, failed }) {
  const v = ps.answers;
  const set = (k, val) => setPs(s => ({ ...s, [k]: val }));
  const answer = id => val => setPs(s => ({ ...s, answers: { ...s.answers, [id]: val } }));
  const band = budgetBand(v.budget[0]), apt = v.apt[0];
  const fit = rooms.filter(([p, b]) => p >= band.min && (band.max == null || p <= band.max) && (apt === 'Any' || (apt === '3+ bed' ? b >= 3 : b === 2))).length;
  const ready = !(v.move[0] === 'Pick a date' && !ps.moveDate);
  const col = (arr, off) => <div style={{ minWidth: 0 }}>{arr.map((g, i) => <Group key={g.id} first={i === 0} n={off + i + 1} g={g} val={v[g.id]} set={answer(g.id)}>
    {g.id === 'where' && (v.where.includes('Near my school/work') || v.where.includes('Anywhere near transit')) && <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
      {v.where.includes('Near my school/work') && <SI.Field style={{ width: 240, flex: 'none' }} value={ps.school} onChange={e => set('school', e.target.value.slice(0, 80))} placeholder="School or workplace" />}
      {v.where.includes('Anywhere near transit') && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginRight: 4 }}>Lines</span>
        {SUBWAY_LINES.map(l => <SI.Chip key={l} size="sm" active={ps.lines.includes(l)} onClick={() => set('lines', flip(ps.lines, l))}>{l}</SI.Chip>)}
      </div>}
    </div>}
    {g.id === 'move' && v.move.includes('Pick a date') && <SI.Field style={{ marginTop: 10, width: 240 }} type="date" value={ps.moveDate} onChange={e => set('moveDate', e.target.value)} />}
  </Group>)}</div>;
  return <section style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 48px 48px' }}>
    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Step 2 of 4 · The basics</div>
    <div style={{ marginTop: 10, height: 1, background: 'var(--border)', position: 'relative' }}><div style={{ position: 'absolute', left: 0, top: 0, height: 1, width: '37.5%', background: 'var(--ink)', transition: 'width .9s var(--ease-out)' }} /></div>
    <h2 className="rm-rise" style={{ margin: '18px 0 0', fontSize: 60, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--ink)' }}>First, the basics.</h2>
    <SI.FormCard style={{ marginTop: 20 }} padding={28} stickyFooter footer={<>
      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap', fontSize: 15, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
        <span>{rooms.length.toLocaleString('en-US')} listings</span><SI.Icon name="arrow-right" size={14} style={{ alignSelf: 'center' }} /><span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{fit.toLocaleString('en-US')} fit your basics</span>
      </div>
      {failed && <span role="alert" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)', whiteSpace: 'nowrap' }}><span style={{ width: 7, height: 7, borderRadius: 9999, background: 'var(--destructive)' }} />Couldn’t save. Try again.</span>}
      <SI.LinkUnderline arrow={false} onClick={back}>Back</SI.LinkUnderline>
      <SI.ButtonInk size="lg" disabled={saving || !ready} onClick={save}>Continue</SI.ButtonInk>
    </>}>
      <div style={{ marginTop: -11, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 48 }}>
        {col(PRESCREEN.slice(0, 5), 0)}{col(PRESCREEN.slice(5), 5)}
      </div>
      <div style={{ padding: '14px 0 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}><SI.Icon name="x" size={14} /><span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Dealbreakers</span></div>
        <div style={{ display: 'flex', gap: 6 }}>{DEALBREAKERS.map(o => <SI.Chip key={o} size="sm" active={ps.dealbreakers.includes(o)} onClick={() => set('dealbreakers', flip(ps.dealbreakers, o))}>{o}</SI.Chip>)}</div>
      </div>
    </SI.FormCard>
  </section>;
}

// `me` = { name, email, prescreen } of a returning user, to prefill both steps.
export default function StartScreen({ rooms, me }) {
  const router = useRouter();
  const [step, setStep] = React.useState('signin');
  const [name, setName] = React.useState(me?.name ?? '');
  const [email, setEmail] = React.useState(me?.email ?? '');
  const [ps, setPs] = React.useState(() => draft(me?.prescreen));
  const [saving, setSaving] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const go = s => { setStep(s); window.scrollTo(0, 0); };
  const save = async () => {
    setSaving(true); setFailed(false);
    const res = await fetch('/api/profile', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), ...(email.trim() && { email: email.trim() }), prescreen: toPrescreen(ps) }),
    }).catch(() => null);
    if (res?.ok) router.push('/profile'); // stays disabled until /profile loads
    else { setSaving(false); setFailed(true); }
  };
  return <div style={{ minWidth: 1440, minHeight: '100vh', background: 'var(--background)' }}>
    <SI.Header fixed variant="light" brand={<SI.Wordmark />} items={[]} showSearch={false} showCta={false} />
    <div style={{ height: 72 }} />
    {step === 'signin'
      ? <SignInScreen name={name} setName={setName} email={email} setEmail={setEmail} next={() => go('prescreen')} />
      : <PreScreenScreen rooms={rooms} ps={ps} setPs={setPs} back={() => go('signin')} save={save} saving={saving} failed={failed} />}
  </div>;
}
