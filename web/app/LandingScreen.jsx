"use client";
// Landing (/). Ported from ui_kits/landing/{LandingTop,LandingMid,LandingBottom}.jsx + index.html.
// Photos, counts and medians are real (page.tsx); each photo links to its area's listings. Decorative slots are ink or sand.
import React from 'react';
import { useRouter } from 'next/navigation';
import * as LT from '@/components/rm';
import { usd, said } from '@/lib/format';
import { BUDGETS } from '@/lib/questions';
import { QUESTIONS, agreement, tags } from '@/lib/score';
import { ME, personById } from '@/lib/sample-data';

// Every match number on this page comes from lib/score or Sam's sample profile, scored by it. None are typed in.
const SAM = personById('sam');
const Q = Object.fromEntries(QUESTIONS.map(f => [f.k, f]));
const N = QUESTIONS.length;
const hhmm = h => String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round(h % 1 * 60)).padStart(2, '0');
const G = Q.guests.opts, guests = (a, b) => agreement('guests', G[a], G[b]);
const HALF = agreement('sleepNoise', ['I snore'], ['No one’s mentioned it']);
const SI = Q.smoking.opts.indexOf('Sometimes inside');
const bar = p => <LT.HabitBar key={p.k} icon={p.icon} label={p.label} value={p.v} you={said(p.you)} them={said(p.them)} themName={SAM.n} />;

const NAV = { 'How it works': 'how-it-works', 'Neighborhoods': 'neighborhoods', 'Safety': 'safety', 'FAQ': 'faq' };
const jump = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
const areaHref = area => '/listings?' + new URLSearchParams({ area });

function Intro({ n, label, title, lead, right, dark, titleSize = 60, span = 7 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'end' }}>
    <div style={{ gridColumn: 'span ' + span }}>
      <LT.SectionLabel number={n} onDark={dark} key={n}>{label}</LT.SectionLabel>
      <h2 style={{ margin: '24px 0 0', fontSize: titleSize, fontWeight: 500, lineHeight: titleSize >= 60 ? 1.02 : 1.08, letterSpacing: titleSize >= 60 ? '-0.03em' : '-0.025em', color: dark ? '#fff' : 'var(--ink)', textWrap: 'pretty' }}>{title}</h2>
    </div>
    {(lead || right) && <div style={{ gridColumn: '9 / span 4' }}>
      {lead && <p style={{ fontSize: 15, lineHeight: 1.625, color: dark ? 'rgba(255,255,255,.75)' : 'var(--muted-foreground)' }}>{lead}</p>}
      {right}
    </div>}
  </div>;
}
// scrollMarginTop keeps anchored sections clear of the fixed 72px header.
const wrap = { maxWidth: 1440, margin: '0 auto', padding: '0 48px', scrollMarginTop: 72 };

function Hero() {
  // No hero photo (Kien): the section's ink background carries the white copy.
  return <section className="rm-on-dark" style={{ position: 'relative', height: '100vh', minHeight: 820, overflow: 'hidden', background: 'var(--ink)', color: '#fff' }}>
    <div style={{ ...wrap, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 72, pointerEvents: 'none' }}>
      <h1 className="rm-rise" style={{ animationDelay: '120ms', margin: 0, fontSize: 92, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', maxWidth: '15ch' }}>Find a roommate who lives like you do.</h1>
      <p className="rm-rise" style={{ animationDelay: '260ms', margin: '40px 0 0', maxWidth: 440, fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,.75)' }}>RoomMe matches NYC renters on sleep, dishes, guests and noise, and flags mismatches before you sign a lease.</p>
      <div className="rm-rise" style={{ animationDelay: '380ms', marginTop: 48, display: 'flex', alignItems: 'center', gap: 14, pointerEvents: 'auto' }}>
        <LT.ButtonOnPhoto href="/start" style={{ height: 64, padding: '0 32px', fontSize: 18 }}>Find my roommate</LT.ButtonOnPhoto>
        <LT.CircleIconButton onDark icon="sliders-horizontal" label="See how matching works" onClick={() => jump('safety')} />
        <button type="button" onClick={() => jump('safety')} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>See how matching works</button>
      </div>
      <div style={{ position: 'absolute', right: 48, top: '36%', display: 'grid', gap: 64 }}>
        {['Matched on habits', 'Checked before the lease'].map((t, i) => <div key={t} style={{ borderLeft: '1px solid ' + (i ? 'rgba(255,255,255,.3)' : '#fff'), padding: '0 0 64px 16px', width: 124, fontSize: 13, lineHeight: 1.4, color: i ? 'rgba(255,255,255,.7)' : '#fff' }}>{t}</div>)}
      </div>
    </div>
  </section>;
}

function TrustStrip({ stats }) {
  const cells = [
    <>{stats.listings.toLocaleString('en-US')} NYC listings · {stats.neighborhoods} neighborhoods</>,
    <>1.41% vacancy, lowest since 1968 <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(NYC HPD)</span></>,
    <>Your match % is a metric</>,
  ];
  return <section style={{ borderBottom: '1px solid var(--border)' }}>
    <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
      {cells.map((c, i) => <div key={i} style={{ padding: '36px 32px 36px ' + (i ? '32px' : '0'), borderLeft: i ? '1px solid var(--border)' : 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.35, color: 'var(--ink)' }}>{c}</div>)}
    </div>
  </section>;
}

// Each mismatch, and the quick-tap question (lib/score.ts) that catches it before the lease.
const PROBLEMS = [
  ['Sleep', 'Their 6 a.m. alarm, your 2 a.m. bedtime.', 'bedtime'],
  ['Dishes', 'The sink that’s never empty.', 'dishes'],
  ['Guests', 'The partner who quietly moved in.', 'overnight'],
  ['Noise', 'Calls on speaker at midnight.', 'noise'],
].map(([l, c, k]) => [l, c, Q[k]]);
function Problem() {
  return <section style={{ ...wrap, padding: '112px 48px' }}>
    <Intro n="01" label="The problem" title="A bad roommate is a daily tax on your sleep, your kitchen and your peace." lead="Most roommate searches end with one DM vibe check and a 12-month lease. The mismatch shows up after move-in." />
    <div style={{ marginTop: 72, display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16 }}>
      {PROBLEMS.map(([l, c, x]) => <div key={l} style={{ minHeight: 380, borderRadius: 21.6, background: 'var(--sand)', padding: 28, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LT.Eyebrow onSand>{l}</LT.Eyebrow>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--card)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LT.Icon name={x.icon} size={16} /></span>
        </div>
        <p style={{ marginTop: 32, fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.015em', color: 'var(--ink)', textWrap: 'pretty' }}>{c}</p>
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(14,12,11,.1)' }}>
          <div style={{ fontSize: 12, color: 'var(--foreground)' }}>RoomMe asks</div>
          <div style={{ marginTop: 6, fontSize: 15, fontWeight: 500, lineHeight: 1.45, letterSpacing: '-0.01em', color: 'var(--ink)', textWrap: 'pretty' }}>“{x.q}”</div>
        </div>
      </div>)}
    </div>
  </section>;
}

// Same labels as /listings' budget filter (lib/questions.ts), so "Browse" hands them straight over.
const ANY_BUDGET = 'Any budget';
function Neighborhoods({ stats, hoods, featured }) {
  const router = useRouter();
  const ANY = 'Any of ' + hoods.length;
  const [hood, setHood] = React.useState(ANY);
  const list = hood === ANY ? featured : hoods.filter(h => h.name === hood);
  const browse = ([area, budget, beds]) => {
    const q = new URLSearchParams();
    if (area !== ANY) q.set('area', area);
    if (budget !== ANY_BUDGET) q.set('budget', budget);
    if (beds !== 'Any') q.set('beds', beds.split(' ')[0]);
    router.push('/listings' + (q.size ? '?' + q : ''));
  };
  const asOf = new Date(stats.lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
  return <section id="neighborhoods" style={{ ...wrap, padding: '0 48px 112px' }}>
    <Intro n="02" label="Neighborhoods" title="Start with where you want to live." />
    <LT.FilterBar style={{ marginTop: 56 }} actionLabel="Browse" onAction={browse} onChange={(l, v) => { if (l === 'Neighborhood') setHood(v); }} segments={[
      { label: 'Neighborhood', value: ANY, options: [ANY, ...hoods.map(h => h.name)] },
      { label: 'Budget per room', value: ANY_BUDGET, options: [ANY_BUDGET, ...BUDGETS.map(b => b.label)] },
      { label: 'Bedrooms', value: 'Any', options: ['Any', '2 BR', '3+ BR'] },
    ]} />
    <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
      {list.map(h => <LT.ImageCard key={h.name} href={areaHref(h.name)} height={360} title={h.name} subtitle={h.borough}
        media={<LT.Slot src={h.img} alt={h.alt} />}
        pill={h.median != null && <LT.FrostedPill size="sm">{'≈' + usd(h.median) + ' / room median'}</LT.FrostedPill>}
        tags={<><LT.HabitTag tone="onPhoto" icon="house">{h.count + ' listings'}</LT.HabitTag>{h.lines && <LT.HabitTag tone="onPhoto" icon="train-front">{h.lines}</LT.HabitTag>}</>} />)}
    </div>
    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <LT.ButtonOutline size="lg" href="/listings">{'See all ' + hoods.length + ' neighborhoods'}</LT.ButtonOutline>
      <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Public listings as of {asOf}. We link back to the source.</span>
    </div>
  </section>;
}

function OptInFragment() {
  const [sam, setSam] = React.useState(false);
  const row = (i, name, yes, onClick) => <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
    <LT.InitialsAvatar initials={i} size={48} />
    <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{name}</span>
    <LT.Chip active={yes} onClick={onClick} icon={yes ? 'check' : 'clock'}>{yes ? 'Said yes' : 'Waiting'}</LT.Chip>
  </div>;
  return <div style={{ width: '100%', maxWidth: 440 }}>
    <div style={{ borderTop: '1px solid var(--border)' }}>{row('K', 'Kien', true)}{row('S', 'Sam', sam, () => setSam(s => !s))}</div>
    <div aria-live="polite" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', color: sam ? 'var(--ink)' : 'var(--muted-foreground)' }}>
      <LT.Icon name={sam ? 'handshake' : 'clock'} size={16} />{sam ? 'It’s mutual. Time to plan a meetup.' : 'Waiting on Sam'}
    </div>
    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted-foreground)' }}>Tap Sam’s status to preview.</div>
  </div>;
}
// Kien and Sam are sample-data.js profiles; every number is theirs, scored by lib/score.
const ME_TAGS = tags(ME.answers);
const TABS = [
  { t: 'Metric', d: `Your match % is the average agreement across your ${N} answers. AI never sets it.`, f: () => <div style={{ width: '100%', maxWidth: 460, display: 'grid', gap: 28 }}>
    <div style={{ display: 'grid', justifyItems: 'start', gap: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 60, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{SAM.s + '%'}</span>
        <span style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em' }}>Match</span>
      </div>
      <LT.LinkUnderline size={13} href="#the-math">How it’s scored</LT.LinkUnderline>
    </div>
    <div style={{ display: 'grid', gap: 22 }}>
      {['bedtime', 'noise', 'overnight'].map(k => bar(SAM.parts.find(p => p.k === k)))}
    </div>
  </div> },
  // ContradictionCallout's look without its AI tag or Send button: the check is a keyword rule, and nothing is sent from here.
  { t: 'Contradictions, quoted', d: 'When two answers disagree, we quote both and suggest a question. You decide whether to ask.', f: flag => flag && <div style={{ width: '100%', maxWidth: 500, background: 'var(--sand)', borderRadius: 24, padding: 32 }}>
    <LT.Eyebrow onSand>Worth asking</LT.Eyebrow>
    <div style={{ marginTop: 22 }}>{[['Quick-tap · ' + Q[flag.key].label, flag.quick + (Q[flag.key].suffix ?? '')], ['Voice interview', '“' + flag.voice + '”']].map(([s, q]) => <div key={s} style={{ padding: '16px 0', borderTop: '1px solid rgba(14,12,11,.1)' }}>
      <div style={{ fontSize: 12, color: 'var(--foreground)' }}>{s}</div>
      <div style={{ marginTop: 6, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{q}</div>
    </div>)}</div>
    <div style={{ marginTop: 8, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16.8, padding: '16px 18px' }}>
      <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Suggested question</div>
      <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }}>{flag.question}</div>
    </div>
  </div> },
  { t: 'Mutual opt-in', d: 'Nothing moves until you both say yes.', f: () => <OptInFragment /> },
  { t: 'Fair housing by design', d: 'We match on habits, never on who you are. Profiles show initials, not faces.', f: () => <div style={{ width: '100%', maxWidth: 460, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
    {[['K', 'Kien', ME_TAGS, SAM.tags], ['S', 'Sam', SAM.tags, ME_TAGS]].map(([i, n, mine, theirs]) =>
      <div key={n} style={{ display: 'grid', gap: 14, justifyItems: 'start' }}>
        <LT.InitialsAvatar initials={i} size={72} />
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{n}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{mine.map(l => <LT.HabitTag key={l} shared={theirs.includes(l)}>{l}</LT.HabitTag>)}</div>
      </div>)}
  </div> },
  // What an AI-off match card shows: the same %, and score.ts's rule-based reasons.
  { t: 'Works with AI off', d: 'If the AI is down, matching still works.', f: () => <div style={{ width: '100%', maxWidth: 500, display: 'grid', gap: 24, justifyItems: 'start' }}>
    <LT.AIOffBadge />
    <LT.MatchScore value={SAM.s} showLink={false} />
    <LT.ClickClashList aiWritten={false} style={{ width: '100%' }} click={SAM.click} clash={SAM.clash} />
  </div> },
];
function TrustTabs({ flag }) {
  const [a, setA] = React.useState(0);
  const T = TABS[a];
  return <section id="safety" style={{ background: 'var(--ink)', color: '#fff', scrollMarginTop: 72 }}>
    <div style={{ ...wrap, padding: '112px 48px' }}>
      <Intro n="03" label="Why you can trust it" title="Roommate matching that can explain itself." titleSize={44} dark />
      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 9' }}>
          <div key={a} className="rm-rise" style={{ aspectRatio: '16 / 10', background: 'var(--card)', borderRadius: 21.6, padding: 48, display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 48, color: 'var(--ink)', animationDuration: '.6s' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <LT.Eyebrow>{T.t}</LT.Eyebrow>
              <h3 style={{ margin: '24px 0 0', fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.015em', textWrap: 'pretty' }}>{T.d}</h3>
              <div style={{ marginTop: 'auto', fontSize: 13, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{String(a + 1).padStart(2, '0')} / {String(TABS.length).padStart(2, '0')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>{T.f(flag)}</div>
          </div>
          <div className="rm-on-dark" style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <LT.CircleIconButton onDark icon="arrow-left" label="Previous" disabled={a === 0} onClick={() => setA(Math.max(0, a - 1))} />
            <LT.CircleIconButton onDark icon="arrow-right" label="Next" disabled={a === TABS.length - 1} onClick={() => setA(Math.min(TABS.length - 1, a + 1))} />
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Kien and Sam are sample profiles.</span>
          </div>
        </div>
        <nav className="rm-on-dark" style={{ gridColumn: 'span 3', display: 'grid', gap: 18, justifyItems: 'end' }}>
          {TABS.map((x, i) => <button key={x.t} type="button" aria-pressed={i === a} onClick={() => setA(i)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: i === a ? 500 : 400, letterSpacing: '-0.01em', textAlign: 'right', color: i === a ? '#fff' : 'rgba(255,255,255,.6)', transition: 'color .3s' }}>{x.t}</button>)}
        </nav>
      </div>
    </div>
  </section>;
}

function HowItWorks() {
  return <section id="how-it-works" style={{ ...wrap, padding: '112px 48px' }}>
    <Intro n="04" label="How it works" title="From pre-screen to House Agreement" />
    <LT.Stepper style={{ marginTop: 80 }} steps={[
      { icon: 'sliders-horizontal', title: '30-second pre-screen', text: 'Budget, move-in, neighborhoods, dealbreakers.' },
      { icon: 'mic', title: 'Tap, then talk', text: `${N} habit questions, then talk for 90 seconds. Typing works too.` },
      { icon: 'users', title: 'Shortlist up to 5', text: 'Every match % explained. A meetup opens only on a mutual yes.' },
      { icon: 'file-text', title: 'House Agreement', text: 'Quiet hours, guests, chores and bills, agreed before the lease.' },
    ]} />
    <ScoreMath />
  </section>;
}

// The match % explainer (Kien's). The steps, table and worked example render from lib/score and Sam's scored sample
// profile, so they can't drift from the code.
const H3 = { margin: 0, fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.015em', color: 'var(--ink)', textWrap: 'pretty' };
const MUTED = { margin: 0, fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)' };
const SUB = { marginTop: 6, fontSize: 12, lineHeight: 1.4, color: 'var(--muted-foreground)' };
const TH = { padding: '0 24px 16px 0', textAlign: 'left', fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted-foreground)' };
const TD = { padding: '24px 24px 24px 0', borderTop: '1px solid var(--border)', verticalAlign: 'top', fontSize: 15, lineHeight: 1.5, color: 'var(--ink)' };
// Per kind: [unit, value shown for an answer, how the gap is measured, where agreement hits 0].
const MEASURE = {
  clock: f => ['clock time', hhmm, 'Hours apart on a 24-hour clock', f.full + ' h apart'],
  ratio: f => [f.unit, String, 'Ratio of (1 + value)', 2 ** f.full + '× apart'],
  linear: f => [f.unit, String, f.unit === 'dB' ? 'dB apart (approx.)' : f.unit.replace(/^./, c => c.toUpperCase()) + ' apart', f.full + ' ' + f.unit + ' apart'],
  same: () => ['reports it or not', v => v ? 'Yes' : 'No', 'Same answer or not', 'None: a mismatch scores ' + HALF + '%'],
};
const COLS = Math.max(...QUESTIONS.map(f => f.opts.length)); // one value column per answer, aligned across rows
const STEPS = [
  ['Dealbreakers filter first', 'Checked both ways, before any scoring. “No smoking/vaping indoors” rules out anyone who smokes inside. A pet allergy, or needing a pet-free home, rules out anyone with a pet or planning one.'],
  ['Each answer becomes a real quantity', <>Bedtimes become clock hours, guests become guests a month, noise becomes decibels. Then, per question:
    <div style={{ margin: '16px 0', padding: '18px 22px', borderRadius: 12, background: 'var(--sand)', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>agreement = max(0, 1 − gap ÷ full-clash gap)</div>
    The same answer scores 100%; the full-clash gap or wider scores 0%. Rounded to a whole %.</>],
  ['Your match % is the average', `The mean of the ${N} agreements, rounded. Every question counts the same: ${100 / N} points. AI never sets it, and voice answers don’t change it.`],
];
const NOTES = [
  ['Counts use ratios', 'Never to once a month is a bigger change than 8 to 9 times a month.'],
  [`Sleep clashes at ${Q.bedtime.full} hours`, `${Q.bedtime.full} hours apart puts one person’s wind-down or morning inside the other’s sleep.`],
  ['Smoking skips a step', `“Sometimes inside” sits at ${Q.smoking.vals[SI]}, not ${SI}: crossing indoors counts double.`],
  ['Sleep noise costs half', `Snoring or grinding can be medical, so a mismatch scores ${HALF}% and never rules anyone out.`],
];
function ScoreMath() {
  const vs = SAM.parts.map(p => p.v), mean = vs.reduce((s, v) => s + v, 0) / vs.length;
  return <div id="the-math" style={{ marginTop: 112, paddingTop: 72, borderTop: '1px solid var(--border)', scrollMarginTop: 96, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, rowGap: 96 }}>
    <div style={{ gridColumn: 'span 4' }}>
      <LT.Eyebrow>The math</LT.Eyebrow>
      <h3 style={{ ...H3, margin: '24px 0 0', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.025em' }}>How your match % is calculated</h3>
      <p style={{ ...MUTED, marginTop: 24 }}>Three steps, the same for everyone. The table is read straight from the scoring code.</p>
    </div>
    <ol style={{ gridColumn: '6 / span 7', margin: 0, padding: 0, listStyle: 'none', borderBottom: '1px solid var(--border)' }}>
      {STEPS.map(([t, body], i) => <li key={t} style={{ display: 'grid', gridTemplateColumns: '56px minmax(0,1fr)', padding: '32px 0', borderTop: '1px solid var(--border)' }}>
        <span style={{ paddingTop: 4, fontSize: 13, fontWeight: 500, color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{t}</div>
          <div style={{ ...MUTED, marginTop: 10 }}>{body}</div>
        </div>
      </li>)}
    </ol>

    <div style={{ gridColumn: 'span 12' }}>
      <h3 style={H3}>The {N} questions, in real units</h3>
      <table style={{ marginTop: 40, width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
        <thead><tr>{[['Question', '17%'], ['Value per answer', '49%'], ['Gap', '19%'], ['Full-clash gap', '15%']].map(([h, w]) => <th key={h} style={{ ...TH, width: w }}>{h}</th>)}</tr></thead>
        <tbody>{QUESTIONS.map(f => { const [unit, val, gap, zero] = MEASURE[f.kind](f); return <tr key={f.k}>
          <td style={TD}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><LT.Icon name={f.icon} size={15} />{f.label}</span><div style={{ ...SUB, paddingLeft: 23 }}>{unit}</div></td>
          <td style={TD}><div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS},minmax(0,1fr))`, columnGap: 16 }}>
            {f.opts.map((o, i) => <div key={o}><div>{val(f.vals[i])}</div><div style={SUB}>{o}</div></div>)}
          </div></td>
          <td style={TD}>{gap}</td>
          <td style={TD}>{zero}</td>
        </tr>; })}</tbody>
      </table>
    </div>

    {NOTES.map(([t, d]) => <div key={t} style={{ gridColumn: 'span 3', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{t}</div>
      <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{d}</p>
    </div>)}

    <div style={{ gridColumn: 'span 12', background: 'var(--card)', borderRadius: 24, padding: 48, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, rowGap: 48 }}>
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <LT.Eyebrow>Worked example</LT.Eyebrow>
        <h3 style={{ ...H3, marginTop: 24 }}>You and {SAM.n}</h3>
        <p style={{ ...MUTED, marginTop: 12 }}>“You” is {ME.n}. Both are sample profiles, scored by the app’s own code.</p>
        <LT.MatchScore value={SAM.s} showLink={false} style={{ marginTop: 'auto', paddingTop: 32 }} />
      </div>
      <div style={{ gridColumn: '6 / span 7', display: 'grid', gridTemplateRows: `repeat(${Math.ceil(vs.length / 2)},auto)`, gridAutoFlow: 'column', gridAutoColumns: 'minmax(0,1fr)', columnGap: 40, rowGap: 24 }}>
        {SAM.parts.map(bar)}
      </div>
      <div style={{ gridColumn: 'span 12', padding: '20px 24px', borderRadius: 12, background: 'var(--sand)', display: 'flex', alignItems: 'baseline', gap: 24, fontSize: 15, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ fontSize: 13, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>Match %</span>
        <span>{`(${vs.join(' + ')}) ÷ ${vs.length} = ${+mean.toFixed(2)} → `}<span style={{ fontWeight: 500 }}>{SAM.s + '%'}</span></span>
      </div>
    </div>
  </div>;
}

function BrandStatement() {
  // No street photo (Kien): plain ink band. A brand line, not a quote.
  return <section style={{ position: 'relative', height: 640, overflow: 'hidden', background: 'var(--ink)', color: '#fff' }}>
    <div style={{ ...wrap, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', pointerEvents: 'none' }}>
      <p style={{ margin: 0, maxWidth: 640, fontSize: 44, fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.025em', textWrap: 'pretty' }}>Every New Yorker has a roommate horror story. RoomMe is how you avoid writing one.</p>
      <div style={{ marginTop: 40 }}><LT.Wordmark onDark size={22} /></div>
    </div>
  </section>;
}

function FAQ() {
  return <section id="faq" style={{ background: 'rgba(234,231,225,.6)', scrollMarginTop: 72 }}>
    <div style={{ ...wrap, padding: '112px 48px', display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48 }}>
      <div style={{ gridColumn: 'span 4' }}>
        <LT.Eyebrow onSand>FAQ</LT.Eyebrow>
        <h2 style={{ margin: '24px 0 0', fontSize: 44, fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.025em', color: 'var(--ink)' }}>Questions worth asking first</h2>
      </div>
      <div style={{ gridColumn: '5 / span 8' }}>
        <LT.Accordion defaultOpen={0} items={[
          { q: 'Is my match % made by AI?', a: `No. It’s plain math on your ${N} quick-tap answers, the same with AI on or off. Voice answers never change it.` },
          { q: 'How is my match % calculated?', a: <>Each answer becomes a real quantity: clock hours, times a week, decibels. On each question, agreement is 100% when you match and falls in a straight line to 0% at that question’s full-clash gap. Your match % is the average of the {N}, and every question counts the same.
            <div style={{ marginTop: 16 }}><LT.LinkUnderline size={13} href="#the-math">See the table and a worked example</LT.LinkUnderline></div></> },
          { q: 'Why compare guests and cleaning by ratio?', a: `Going from no guests to one or two a month changes a home more than going from eight to nine, so counts are compared by ratio (a log scale), not by difference. Guests ${G[0]} vs ${G[1]} a month scores ${guests(0, 1)}%; ${G[3]} vs ${G[4].toLowerCase()} scores ${guests(3, 4)}%.` },
          { q: 'What do dealbreakers do?', a: 'They filter people out before any scoring, both ways. “No smoking/vaping indoors” rules out smoking sometimes or often inside. A pet allergy, or needing a pet-free home, rules out having a pet or planning to get one. Filtered people never appear, so no other answer can outweigh a dealbreaker.' },
          { q: 'Why does sleep noise only cost half?', a: `Snoring or grinding can be medical, so we never rule anyone out for it. If only one of you reports sleep noise, that question scores ${HALF}%, not 0%.` },
          { q: 'Why can’t I see photos of people?', a: 'Profiles show initials, not faces, so matches stay about habits.' },
          { q: 'Where do the listings come from?', a: 'Public Zillow listings, linked back to the source with the date we saw them.' },
          { q: 'What if the AI gets something wrong?', a: 'AI only writes the wording on a match card, and that text is always labeled. The score and the questions worth asking come from fixed rules, so everything works with AI off.' },
        ]} />
      </div>
    </div>
  </section>;
}

function FinalCTA({ hoods }) {
  const P = [['Astoria', -9], ['Bushwick', 4], ['Harlem', -3]];
  return <section style={{ ...wrap, padding: '112px 48px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'center' }}>
      <div style={{ gridColumn: 'span 5' }}>
        <h2 style={{ margin: 0, fontSize: 56, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--ink)' }}>Ready when you are.</h2>
        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 28 }}>
          <LT.ButtonInk size="lg" href="/start">Find my roommate</LT.ButtonInk>
          <LT.LinkUnderline href="#safety">See how matching works</LT.LinkUnderline>
        </div>
      </div>
      <div style={{ gridColumn: '7 / span 6', display: 'flex', alignItems: 'flex-start', padding: '48px 0 56px 24px' }}>
        {P.map(([n, r], k) => { const h = hoods.find(x => x.name === n);
          return <a key={n} href={areaHref(n)} aria-label={n + ' listings'} style={{ display: 'block', position: 'relative', zIndex: k === 1 ? 2 : 1, marginLeft: k ? -40 : 0, marginTop: k === 1 ? -28 : k === 2 ? 20 : 0 }}>
            <LT.Polaroid rotate={r} width={200} height={240} caption={n} media={<LT.Slot src={h?.img2} alt={h?.alt} />} note={k === 2 ? 'good roommates, quieter Sundays' : null} />
          </a>; })}
      </div>
    </div>
  </section>;
}

const FOOT = { 'How it works': 'how-it-works', 'Neighborhoods': 'neighborhoods', 'FAQ': 'faq', 'Fair housing': 'safety', 'Privacy': 'safety', 'AI guardrails': 'safety' };
function LandingFooter() {
  return <LT.Footer brandNode={<LT.Wordmark onDark size={18} />} domain="roomme.tech" blurb="Matched on habits. Checked before the lease." email={null} showCard={false} tagline="" onLink={l => jump(FOOT[l])}
    columns={[
      { title: 'Product', links: ['How it works', 'Neighborhoods', 'FAQ'] },
      { title: 'Trust', links: ['Fair housing', 'Privacy', 'AI guardrails'] },
      { title: 'Team', links: ['Built at DivHacks 2026'] },
    ]}
    legal="© 2026 RoomMe · Listings come from public sources and link back to the original. RoomMe is not a broker." />;
}

export default function LandingScreen({ stats, hoods, featured, flag }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [active, setActive] = React.useState(undefined);
  React.useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > window.innerHeight - 80);
      let cur; for (const [k, id] of Object.entries(NAV)) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 200 && el.getBoundingClientRect().bottom > 200) cur = k; }
      setActive(cur);
    };
    on(); window.addEventListener('scroll', on); return () => window.removeEventListener('scroll', on);
  }, []);
  return <div style={{ minWidth: 1440, background: 'var(--background)' }}>
    <LT.Header fixed variant={scrolled ? 'scrolled' : 'transparent'} brand={<LT.Wordmark onDark />} items={Object.keys(NAV)} active={active}
      onBrand={() => window.scrollTo({ top: 0, behavior: 'smooth' })} ctaVariant="onPhoto" ctaLabel="Find my roommate" showSearch={false} />
    <Hero />
    <TrustStrip stats={stats} />
    <Problem />
    <Neighborhoods stats={stats} hoods={hoods} featured={featured} />
    <TrustTabs flag={flag} />
    <HowItWorks />
    <BrandStatement />
    <FAQ />
    <FinalCTA hoods={hoods} />
    <LandingFooter />
  </div>;
}
