"use client";
// Landing (/). Ported from ui_kits/landing/{LandingTop,LandingMid,LandingBottom}.jsx + index.html.
// Neighborhood cards and counts are real (page.tsx). Decorative photo slots stay empty: ink or sand panels.
import React from 'react';
import { useRouter } from 'next/navigation';
import * as LT from '@/components/rm';
import { usd } from '@/lib/format';

const NAV = { 'How it works': 'how-it-works', 'Neighborhoods': 'neighborhoods', 'Safety': 'safety', 'FAQ': 'faq' };
const jump = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

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
      <h1 className="rm-rise" style={{ animationDelay: '0ms', margin: 0, fontSize: 92, fontWeight: 500, lineHeight: .98, letterSpacing: '-0.035em', maxWidth: '15ch' }}>Find a roommate who lives like you do.</h1>
      <p className="rm-rise" style={{ animationDelay: '260ms', margin: '40px 0 0', maxWidth: 440, fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,.75)' }}>RoomMe matches NYC renters on sleep, dishes, guests and noise, and flags mismatches before you sign a lease.</p>
      <div className="rm-rise" style={{ animationDelay: '380ms', marginTop: 48, display: 'flex', alignItems: 'center', gap: 14, pointerEvents: 'auto' }}>
        <LT.ButtonOnPhoto href="/start">Find my roommate</LT.ButtonOnPhoto>
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
    <>Your match % is math, not AI</>,
  ];
  return <section style={{ borderBottom: '1px solid var(--border)' }}>
    <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
      {cells.map((c, i) => <div key={i} style={{ padding: '36px 32px 36px ' + (i ? '32px' : '0'), borderLeft: i ? '1px solid var(--border)' : 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.35, color: 'var(--ink)' }}>{c}</div>)}
    </div>
  </section>;
}

const PROBLEMS = [
  ['Sleep', 'Their 6 a.m. alarm, your 2 a.m. bedtime.'],
  ['Dishes', 'The sink that’s never empty.'],
  ['Guests', 'The partner who quietly moved in.'],
  ['Noise', 'Calls on speaker at midnight.'],
];
function Problem() {
  const [i, setI] = React.useState(0);
  const W = 321, G = 16, max = PROBLEMS.length - 3;
  return <section style={{ ...wrap, padding: '112px 48px' }}>
    <Intro n="01" label="The problem" title="A bad roommate is a daily tax on your sleep, your kitchen and your peace." lead="Most roommate searches end with one DM vibe check and a 12-month lease. The mismatch shows up after move-in." />
    <div style={{ marginTop: 72, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48 }}>
      <div style={{ gridColumn: 'span 3', paddingTop: 4 }}>
        <p style={{ fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: 20 }}>Sleep, dishes, guests and noise. RoomMe asks about all four before you meet anyone.</p>
      </div>
      <div style={{ gridColumn: 'span 9', minWidth: 0 }}>
        <div style={{ overflow: 'hidden', borderRadius: 21.6 }}>
          <div style={{ display: 'flex', gap: G, transform: 'translateX(' + (-i * (W + G)) + 'px)', transition: 'transform .9s var(--ease-out)' }}>
            {PROBLEMS.map(([l, c]) => <div key={l} style={{ flex: '0 0 ' + W + 'px' }}>
              <LT.ImageCard height={428} title={c} media={<LT.Slot />}
                pill={<LT.FrostedPill size="sm" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{l}</LT.FrostedPill>} />
            </div>)}
          </div>
        </div>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <LT.CircleIconButton icon="arrow-left" label="Previous" disabled={i === 0} onClick={() => setI(Math.max(0, i - 1))} />
          <LT.CircleIconButton icon="arrow-right" label="Next" disabled={i === max} onClick={() => setI(Math.min(max, i + 1))} />
        </div>
      </div>
    </div>
  </section>;
}

// Same labels as /listings' budget filter, so "Browse" hands them straight over.
const ANY_BUDGET = 'Any budget';
const BUDGETS = ['Under $1,000', '$1,000–1,500', '$1,500–2,000', '$2,000–2,800', '$2,800+'];
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
      { label: 'Budget per room', value: ANY_BUDGET, options: [ANY_BUDGET, ...BUDGETS] },
      { label: 'Bedrooms', value: 'Any', options: ['Any', '2 BR', '3+ BR'] },
    ]} />
    <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
      {list.map(h => <LT.ImageCard key={h.name} href={'/listings?' + new URLSearchParams({ area: h.name })} height={360} title={h.name} subtitle={h.borough}
        media={<LT.Slot src={h.img} />}
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
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
      <LT.ButtonInk disabled={!sam} icon="message-circle" arrow={false}>{sam ? 'Chat is open' : 'Chat opens on mutual yes'}</LT.ButtonInk>
    </div>
    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted-foreground)' }}>Tap Sam’s status to preview.</div>
  </div>;
}
const TABS = [
  { t: 'Math, not AI', d: 'Your score is a weighted comparison of your answers. AI never sets it.', f: () => <div style={{ width: '100%', maxWidth: 460, display: 'grid', gap: 28 }}>
    <div style={{ display: 'grid', justifyItems: 'start', gap: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 60, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>87%</span>
        <span style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em' }}>Match</span>
      </div>
      <LT.LinkUnderline size={13} href="#faq">How it’s scored</LT.LinkUnderline>
    </div>
    <div style={{ display: 'grid', gap: 22 }}>
      <LT.HabitBar icon="moon" label="Sleep" value={96} you="23:00–00:00" them="23:00–00:00" themName="Sam" />
      <LT.HabitBar icon="utensils" label="Dishes" value={72} you="Same evening" them="Next morning" themName="Sam" />
      <LT.HabitBar icon="users" label="Guests" value={45} you="Rarely (1–2/month)" them="Most weekends" themName="Sam" />
    </div>
  </div> },
  { t: 'Contradictions, quoted', d: 'When answers don’t line up, we quote both and suggest a question. You decide whether to send it.', f: () => <LT.ContradictionCallout style={{ width: '100%', maxWidth: 500 }} answers={[{ source: 'Quick-tap · Guests', quote: 'Rarely (1–2/month)' }, { source: 'Voice interview', quote: 'I host brunch most Sundays' }]} question="How often do you usually have people over on weekends?" /> },
  { t: 'Mutual opt-in', d: 'Chat opens only when you both say yes.', f: () => <OptInFragment /> },
  { t: 'Fair housing by design', d: 'We match on habits, never on who you are. Photos stay hidden until you both opt in.', f: () => <div style={{ width: '100%', maxWidth: 460, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
    {[['K', 'Kien', [['sunrise', 'Early riser', 1], ['utensils', 'Cooks daily'], ['moon', 'Quiet evenings', 1]]], ['S', 'Sam', [['sunrise', 'Early riser', 1], ['coffee', 'Works from home'], ['moon', 'Quiet evenings', 1]]]].map(([i, n, tags]) =>
      <div key={n} style={{ display: 'grid', gap: 14, justifyItems: 'start' }}>
        <LT.InitialsAvatar initials={i} size={72} />
        <div><div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Photo hidden</div></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{tags.map(([ic, l, s]) => <LT.HabitTag key={l} icon={ic} shared={!!s}>{l}</LT.HabitTag>)}</div>
      </div>)}
  </div> },
  { t: 'Works with AI off', d: 'If the AI is down, matching still works.', f: () => <div style={{ width: '100%', maxWidth: 440, display: 'grid', gap: 22, justifyItems: 'start' }}>
    <LT.AIOffBadge />
    <LT.MatchScore value={87} showLink={false} />
    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--foreground)', borderTop: '1px solid var(--border)', paddingTop: 18 }}>Sleep: same answer (23:00–00:00). Guests: different answers (Rarely (1–2/month) · Most weekends).</p>
  </div> },
];
function TrustTabs() {
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>{T.f()}</div>
          </div>
          <div className="rm-on-dark" style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <LT.CircleIconButton onDark icon="arrow-left" label="Previous" disabled={a === 0} onClick={() => setA(Math.max(0, a - 1))} />
            <LT.CircleIconButton onDark icon="arrow-right" label="Next" disabled={a === TABS.length - 1} onClick={() => setA(Math.min(TABS.length - 1, a + 1))} />
          </div>
        </div>
        <nav className="rm-on-dark" style={{ gridColumn: 'span 3', display: 'grid', gap: 18, justifyItems: 'end' }}>
          {TABS.map((x, i) => <button key={x.t} type="button" onClick={() => setA(i)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: i === a ? 500 : 400, letterSpacing: '-0.01em', textAlign: 'right', color: i === a ? '#fff' : 'rgba(255,255,255,.6)', transition: 'color .3s' }}>{x.t}</button>)}
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
      { icon: 'mic', title: 'Talk for 90 seconds', text: 'A quick-tap profile plus a short voice interview.' },
      { icon: 'users', title: 'Meet your top 5', text: 'Explained matches; chat opens on mutual yes; meet in public.' },
      { icon: 'file-text', title: 'Sign the House Agreement', text: 'Quiet hours, guests, chores and bills, agreed before the lease.' },
    ]} />
  </section>;
}

function BrandStatement() {
  // No street photo (Kien): plain ink band.
  return <section style={{ position: 'relative', height: 640, overflow: 'hidden', background: 'var(--ink)', color: '#fff' }}>
    <div style={{ ...wrap, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', pointerEvents: 'none' }}>
      <blockquote style={{ margin: 0, maxWidth: 640, fontSize: 44, fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.025em', textWrap: 'pretty' }}>“Every New Yorker has a roommate horror story. RoomMe is how you avoid writing one.”</blockquote>
      <div style={{ marginTop: 40 }}><LT.Wordmark onDark size={22} /></div>
    </div>
  </section>;
}

function FAQ() {
  return <section id="faq" style={{ background: 'rgba(234,231,225,.6)', scrollMarginTop: 72 }}>
    <div style={{ ...wrap, padding: '112px 48px', display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48 }}>
      <div style={{ gridColumn: 'span 4' }}>
        <LT.Eyebrow>FAQ</LT.Eyebrow>
        <h2 style={{ margin: '24px 0 0', fontSize: 44, fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.025em', color: 'var(--ink)' }}>Questions worth asking first</h2>
      </div>
      <div style={{ gridColumn: '5 / span 8' }}>
        <LT.Accordion defaultOpen={0} items={[
          { q: 'Is my match % made by AI?', a: 'No. It’s a weighted comparison of your answers. AI only writes the explanation, and matching still works with AI off.' },
          { q: 'Why can’t I see photos of people?', a: 'Photos unlock after you both opt in, so matches stay about habits.' },
          { q: 'Where do the listings come from?', a: 'Public listings, collected and linked back to the source with the date we saw them.' },
          { q: 'What if the AI gets something wrong?', a: 'It only suggests questions and quotes both answers word for word. You decide what to send.' },
        ]} />
      </div>
    </div>
  </section>;
}

function FinalCTA() {
  const P = [['Astoria', -9], ['Bushwick', 4], ['Harlem', -3]];
  return <section style={{ ...wrap, padding: '112px 48px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'center' }}>
      <div style={{ gridColumn: 'span 5' }}>
        <LT.Eyebrow>Ready when you are</LT.Eyebrow>
        <h2 style={{ margin: '26px 0 0', fontSize: 56, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--ink)' }}>Don’t sign on a vibe check.</h2>
        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 28 }}>
          <LT.ButtonInk size="lg" href="/start">Find my roommate</LT.ButtonInk>
          <LT.LinkUnderline href="#safety">See how matching works</LT.LinkUnderline>
        </div>
      </div>
      <div style={{ gridColumn: '7 / span 6', display: 'flex', alignItems: 'flex-start', padding: '48px 0 56px 24px' }}>
        {P.map(([n, r], k) => <LT.Polaroid key={n} rotate={r} width={200} height={240}
          media={<LT.Slot />}
          note={k === 2 ? 'good roommates, quieter Sundays' : null}
          style={{ position: 'relative', zIndex: k === 1 ? 2 : 1, marginLeft: k ? -40 : 0, marginTop: k === 1 ? -28 : k === 2 ? 20 : 0 }} />)}
      </div>
    </div>
  </section>;
}

const FOOT = { 'How it works': 'how-it-works', 'Neighborhoods': 'neighborhoods', 'FAQ': 'faq', 'Fair housing': 'safety', 'Privacy': 'safety', 'AI guardrails': 'safety' };
function LandingFooter() {
  return <LT.Footer brandNode={<LT.Wordmark onDark size={18} />} domain="roomme.tech" blurb="Don’t sign on a vibe check." email={null} showCard={false} tagline="" onLink={l => jump(FOOT[l])}
    columns={[
      { title: 'Product', links: ['How it works', 'Neighborhoods', 'FAQ'] },
      { title: 'Trust', links: ['Fair housing', 'Privacy', 'AI guardrails'] },
      { title: 'Team', links: ['Built at DivHacks 2026', 'Columbia'] },
    ]}
    legal="© 2026 RoomMe · Listings come from public sources and link back to the original. RoomMe is not a broker." />;
}

export default function LandingScreen({ stats, hoods, featured }) {
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
    <TrustTabs />
    <HowItWorks />
    <BrandStatement />
    <FAQ />
    <FinalCTA />
    <LandingFooter />
  </div>;
}
