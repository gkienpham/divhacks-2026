"use client";
// /start · 2A sign in → 2B 30-second pre-screen. Ported from ui_kits/onboarding.
// UI only: no auth yet, and answers stay in this component (nothing is sent anywhere).
import React from 'react';
import { useRouter } from 'next/navigation';
import * as SI from '@/components/rm';

function GoogleG({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>;
}
function GoogleButton({ onClick }) {
  return <SI.ButtonOutline size="lg" arrow={false} onClick={onClick} style={{ width: '100%', justifyContent: 'center', background: 'var(--card)', gap: 12 }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}><GoogleG />Continue with Google</span>
  </SI.ButtonOutline>;
}
function InfoRow({ icon, children, badge, action }) {
  return <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 12, background: 'var(--sand)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SI.Icon name={icon} size={16} /></span>
    <div style={{ flex: 1, minWidth: 0, paddingTop: 8 }}><p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--foreground)', textWrap: 'pretty' }}>{children}</p>{action && <div style={{ marginTop: 12 }}>{action}</div>}</div>
    {badge && <span style={{ flex: 'none', paddingTop: 5 }}>{badge}</span>}
  </div>;
}
function SignInScreen({ next }) {
  const [email, setEmail] = React.useState('');
  const [err, setErr] = React.useState(null);
  const go = () => { if (email && !/@.+\..+/.test(email)) { setErr('Enter a full email address, like you@school.edu.'); return; } setErr(null); next(); };
  return <section style={{ maxWidth: 1440, margin: '0 auto', padding: '96px 48px 112px', display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
    <div style={{ gridColumn: 'span 6', paddingTop: 8 }}>
      <SI.Eyebrow>STEP 1 OF 4</SI.Eyebrow>
      <h1 className="rm-rise" style={{ margin: '28px 0 0', fontSize: 84, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', color: 'var(--ink)', maxWidth: '11ch' }}>Let’s find your people.</h1>
      <p className="rm-rise" style={{ animationDelay: '120ms', margin: '32px 0 0', maxWidth: 420, fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)' }}>Sign in, answer a few quick questions, and we’ll show you who lives like you do.</p>
    </div>
    <div style={{ gridColumn: '8 / span 5' }}>
      <SI.FormCard padding={40}>
        <GoogleButton onClick={next} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>or use your school email</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <SI.Field label="School email" type="email" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} error={err} />
        <SI.ButtonInk size="lg" fullWidth style={{ marginTop: 20 }} onClick={go}>Continue</SI.ButtonInk>
      </SI.FormCard>
      <div style={{ marginTop: 24 }}>
        <InfoRow icon="graduation-cap" badge={<SI.VerifiedBadge variant="student" />}>Sign in with a .edu email → Verified student badge</InfoRow>
        <InfoRow icon="file-text" badge={<SI.VerifiedBadge variant="enrollment" />} action={<SI.LinkUnderline arrow={false}>Upload enrollment letter</SI.LinkUnderline>}>International student without an SSN? Upload your enrollment letter → Enrollment verified</InfoRow>
        <InfoRow icon="shield-check">Your phone number is never shown to anyone. Our agent relays messages.</InfoRow>
      </div>
    </div>
  </section>;
}

const GROUPS = [
  { id: 'where', label: 'Where do you want to be?', multi: true, opts: ['Near my school/work', 'Downtown', 'Quiet residential', 'Anywhere near transit'], def: ['Near my school/work', 'Anywhere near transit'] },
  { id: 'commute', label: 'Max commute', opts: ['≤15 min', '16–30', '31–45', '46–60', '60+'], def: ['16–30'] },
  { id: 'budget', label: 'Budget per person', opts: ['Under $1,000', '$1,000–1,500', '$1,500–2,000', '$2,000–2,800', '$2,800+'], def: ['$1,500–2,000'] },
  { id: 'walk', label: 'Walk to subway', opts: ['<5 min', '5–10', '10–20', 'Doesn’t matter'], def: ['5–10'] },
  { id: 'apt', label: 'Apartment', opts: ['2 bed (1 roommate)', '3+ bed', 'Any'], def: ['2 bed (1 roommate)'] },
  { id: 'private', label: 'Private bedroom/bath', opts: ['Private only', 'OK to share', 'No preference'], def: ['OK to share'] },
  { id: 'furn', label: 'Furnished', opts: ['Fully', 'Partly', 'Unfurnished', 'Flexible'], def: ['Flexible'] },
  { id: 'lease', label: 'Lease', opts: ['Month-to-month', '6 months', '12 months', '12+'], def: ['12 months'] },
  { id: 'move', label: 'Move in', opts: ['ASAP', 'Within 1 month', '1–3 months', 'Flexible', 'Pick a date'], def: ['1–3 months'] },
  { id: 'pets', label: 'Pets', opts: ['I have a pet', 'Planning to get one', 'No pets, fine if roommates do', 'Need a pet-free home'], def: ['No pets, fine if roommates do'] },
];
const LINES = ['1', 'A', 'L', 'N/W', '7'];
// Per-room ranges for the budget chips (same bounds as /listings' budget filter).
const BUDGET = { 'Under $1,000': [0, 999], '$1,000–1,500': [1000, 1500], '$1,500–2,000': [1500, 2000], '$2,000–2,800': [2000, 2800], '$2,800+': [2800, Infinity] };

function Group({ n, g, val, set, children, first }) {
  const tog = o => set(g.multi ? (val.includes(o) ? val.filter(x => x !== o) : [...val, o]) : [o]);
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
function PreScreenScreen({ back, next, rooms }) {
  const [v, setV] = React.useState(() => Object.fromEntries(GROUPS.map(g => [g.id, g.def])));
  const [lines, setLines] = React.useState(['1', 'A']);
  const [deal, setDeal] = React.useState(['No smoking/vaping indoors']);
  const [date, setDate] = React.useState('');
  const set = id => val => setV(s => ({ ...s, [id]: val }));
  const [lo, hi] = BUDGET[v.budget[0]], apt = v.apt[0];
  const fit = rooms.filter(([p, b]) => p >= lo && p <= hi && (apt === 'Any' || (apt === '3+ bed' ? b >= 3 : b === 2))).length;
  const col = (arr, off) => <div style={{ minWidth: 0 }}>{arr.map((g, i) => <Group key={g.id} first={i === 0} n={off + i + 1} g={g} val={v[g.id]} set={set(g.id)}>
    {g.id === 'where' && (v.where.includes('Near my school/work') || v.where.includes('Anywhere near transit')) && <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
      {v.where.includes('Near my school/work') && <SI.Field style={{ width: 240, flex: 'none' }} defaultValue="Columbia University" placeholder="Columbia University" />}
      {v.where.includes('Anywhere near transit') && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginRight: 4 }}>Lines</span>
        {LINES.map(l => <SI.Chip key={l} size="sm" active={lines.includes(l)} onClick={() => setLines(s => s.includes(l) ? s.filter(x => x !== l) : [...s, l])}>{l}</SI.Chip>)}
      </div>}
    </div>}
    {g.id === 'move' && v.move.includes('Pick a date') && <SI.Field style={{ marginTop: 10, width: 240 }} type="date" value={date} onChange={e => setDate(e.target.value)} />}
  </Group>)}</div>;
  return <section style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 48px 48px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Pre-screen · about 30 seconds</span><span>Step 2 of 4</span>
    </div>
    <div style={{ marginTop: 10, height: 1, background: 'var(--border)', position: 'relative' }}><div style={{ position: 'absolute', left: 0, top: 0, height: 1, width: '37.5%', background: 'var(--ink)', transition: 'width .9s var(--ease-out)' }} /></div>
    <h2 className="rm-rise" style={{ margin: '18px 0 0', fontSize: 60, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--ink)' }}>First, the basics.</h2>
    <SI.FormCard style={{ marginTop: 20 }} padding={28} stickyFooter footer={<>
      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap', fontSize: 15, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
        <span>{rooms.length.toLocaleString('en-US')} listings</span><SI.Icon name="arrow-right" size={14} style={{ alignSelf: 'center' }} /><span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{fit.toLocaleString('en-US')} fit your basics</span>
      </div>
      <SI.LinkUnderline arrow={false} onClick={back}>Back</SI.LinkUnderline>
      <SI.ButtonInk size="lg" onClick={next}>Continue</SI.ButtonInk>
    </>}>
      <div style={{ marginTop: -11, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 48 }}>
        {col(GROUPS.slice(0, 5), 0)}{col(GROUPS.slice(5), 5)}
      </div>
      <div style={{ padding: '14px 0 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}><SI.Icon name="x" size={14} /><span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Dealbreakers</span></div>
        <div style={{ display: 'flex', gap: 6 }}>{['No smoking/vaping indoors', 'Pet allergy'].map(o => <SI.Chip key={o} size="sm" active={deal.includes(o)} onClick={() => setDeal(s => s.includes(o) ? s.filter(x => x !== o) : [...s, o])}>{o}</SI.Chip>)}</div>
      </div>
    </SI.FormCard>
  </section>;
}

export default function StartScreen({ rooms }) {
  const router = useRouter();
  const [step, setStep] = React.useState('signin');
  const go = s => { setStep(s); window.scrollTo(0, 0); };
  return <div style={{ minWidth: 1440, minHeight: '100vh', background: 'var(--background)' }}>
    <SI.Header fixed variant="light" brand={<SI.Wordmark />} items={[]} showSearch={false} showCta={false} />
    <div style={{ height: 72 }} />
    {step === 'signin'
      ? <SignInScreen next={() => go('prescreen')} />
      : <PreScreenScreen rooms={rooms} back={() => go('signin')} next={() => router.push('/profile')} />}
  </div>;
}
