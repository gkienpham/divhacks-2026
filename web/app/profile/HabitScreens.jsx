"use client";
// 3A see-your-roommate · 3B quick-tap. Ported from ui_kits/profile/HabitScreens.jsx; ProfileFlow.jsx owns the step state.
import React from 'react';
import * as HX from '@/components/rm';

export function StepFrame({ pct, dark, children, h }) {
  return <div className={dark ? 'rm-on-dark' : undefined} style={{ width: 1440, margin: '0 auto', minHeight: `max(${h || 900}px, 100vh)`, background: dark ? 'var(--ink)' : 'var(--background)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <HX.Header variant={dark ? 'scrolled' : 'light'} brand={<HX.Wordmark onDark={dark} />} items={[]} showSearch={false} showCta={false}
      right={<HX.LinkUnderline href="/" arrow={false} onDark={dark}>Save and exit</HX.LinkUnderline>} />
    <div style={{ padding: '20px 48px 0' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: dark ? '#fff' : 'var(--ink)', whiteSpace: 'nowrap' }}>Step 2 of 4 · Your habits</div>
      <div style={{ marginTop: 10, height: 1, background: dark ? 'rgba(255,255,255,.12)' : 'var(--border)', position: 'relative' }}><div style={{ position: 'absolute', left: 0, top: 0, height: 1, width: pct + '%', background: dark ? '#fff' : 'var(--ink)', transition: 'width .42s var(--ease-out)' }} /></div>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
  </div>;
}

export const H2 = ({ children, size = 60, dark, style }) => <h2 style={{ margin: 0, fontSize: size, fontWeight: 500, lineHeight: size === 60 ? 1.02 : 1.08, letterSpacing: size === 60 ? '-0.03em' : '-0.025em', color: dark ? '#fff' : 'var(--ink)', textWrap: 'pretty', ...style }}>{children}</h2>;

const SEE = [
  { t: 'I want to see them', d: 'We’ll match overlapping schedules. You’re home and awake at the same hours. Good if you want a friend at home.', icon: 'users' },
  { t: 'I’d rather barely see them', d: 'We’ll match opposite schedules. When you’re home, they’re out. Good if you want the bathroom and kitchen to yourself.', icon: 'moon' },
  { t: 'Let RoomMe decide', d: 'We’ll start with overlapping schedules, the safer default.', icon: 'sliders-horizontal' },
];
export function SeeScreen({ value, onChange, onNext }) {
  return <StepFrame pct={40}>
    <section style={{ flex: 1, padding: '64px 48px 64px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'end' }}>
        <div style={{ gridColumn: '1 / span 8' }}><HX.Eyebrow>Seeing each other</HX.Eyebrow><H2 style={{ marginTop: 18 }}>How much do you want to actually see your roommate?</H2></div>
        <p style={{ gridColumn: '9 / span 4', margin: 0, fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)' }}>This changes how we match you.</p>
      </div>
      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
        {SEE.map((c, i) => { const on = value === i; return <button key={c.t} type="button" aria-pressed={on} onClick={() => onChange(i)} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', background: 'var(--card)', borderRadius: 24, border: on ? '2px solid var(--ink)' : '1px solid var(--border)', padding: on ? 31 : 32, minHeight: 300, display: 'flex', flexDirection: 'column', transition: 'border-color .3s var(--ease-out)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <span style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--sand)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><HX.Icon name={c.icon} size={16} /></span>
            <span style={{ width: 28, height: 28, borderRadius: 9999, display: 'grid', placeItems: 'center', background: on ? 'var(--ink)' : 'transparent', border: on ? 0 : '1px solid rgba(14,12,11,.2)', color: 'var(--background)' }}>{on && <HX.Icon name="check" size={14} />}</span>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 48 }}>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{c.t}</div>
            <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)', maxWidth: 360 }}>{c.d}</p>
          </div>
        </button>; })}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 48, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 28 }}>
        <HX.LinkUnderline href="/" arrow={false}>Back</HX.LinkUnderline>
        <HX.ButtonInk size="lg" disabled={value == null} onClick={onNext}>Continue</HX.ButtonInk>
      </div>
    </section>
  </StepFrame>;
}

// The 10 quick-tap answers (docs/PROJECT.md §3). Keys feed the deterministic score; wording for bedtime, cleaning, guests and sleep noise is the kit's.
export const Q = [
  { k: 'bedtime', q: 'What time do you actually go to bed on weeknights?', opts: ['Before 22:00', '22:00–23:00', '23:00–00:00', '00:00–01:00', 'After 01:00'] },
  { k: 'wake', q: 'What time do you usually get up on weekdays?', opts: ['Before 06:00', '06:00–07:00', '07:00–08:00', '08:00–09:00', 'After 09:00'] },
  { k: 'cleaning', q: 'How many times a week do you clean shared spaces?', opts: ['0', '1', '2', '3–4', '5 or more'] },
  { k: 'dishes', q: 'When do your dishes usually get washed?', opts: ['Right after eating', 'The same day', 'The next day', 'When the sink is full'] },
  { k: 'guests', q: 'How many guests do you have per month?', opts: ['0', '1–2', '3–5', '6–10', 'More than 10'] },
  { k: 'overnight', q: 'How often does someone stay the night?', opts: ['Never', '1–2 nights a month', 'About once a week', '2 or more nights a week'] },
  { k: 'sleepNoise', q: 'Has anyone told you that you make noise in your sleep?', multi: true, opts: ['I snore', 'I grind my teeth', 'I talk or move in my sleep', 'No one’s mentioned it', 'Not sure', 'Other'] },
  { k: 'noise', q: 'How loud is your home on a weeknight?', opts: ['Silent', 'Quiet talking', 'Music or TV, low', 'Music or TV, out loud'] },
  { k: 'wfh', q: 'How many days a week do you work from home?', opts: ['0', '1–2', '3–4', '5 or more'] },
  { k: 'smoking', q: 'Do you smoke or use cannabis at home?', opts: ['Never', 'Outside only', 'Sometimes inside', 'Often inside'] },
];

// v: question index. sel: current answer (string, or array for multi). other: the "Other" text.
export function QuickTapScreen({ v, sel, other = '', onAnswer, onOther, onNext, onBack }) {
  const q = Q[v];
  const picked = q.multi ? sel || [] : sel ? [sel] : [];
  const tap = o => {
    if (q.multi) return onAnswer(picked.includes(o) ? picked.filter(x => x !== o) : [...picked, o]);
    onAnswer(o);
    setTimeout(onNext, 260); // let the ink fill show before advancing
  };
  return <StepFrame pct={41 + v * 0.5} h={q.multi ? 1040 : 900}>
    <section style={{ flex: 1, padding: '40px 48px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <HX.LinkUnderline arrow={false} onClick={onBack}>Back</HX.LinkUnderline>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}><span style={{ color: 'var(--ink)', fontWeight: 500 }}>{v + 1}</span> of {Q.length}</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)', position: 'relative' }}><div style={{ position: 'absolute', left: 0, top: 0, height: 1, width: ((v + 1) / Q.length * 100) + '%', background: 'var(--ink)', transition: 'width .42s var(--ease-out)' }} /></div>
        </div>
        <HX.LinkUnderline arrow={false} onClick={onNext}>Skip</HX.LinkUnderline>
      </div>
      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48 }}>
        <div style={{ gridColumn: '1 / span 7' }}>
          <H2>{q.q}</H2>
          {q.multi && <p style={{ margin: '16px 0 0', fontSize: 15, color: 'var(--muted-foreground)' }}>Choose all that apply</p>}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.opts.map(o => { const on = picked.includes(o); return <React.Fragment key={o}>
              <button type="button" aria-pressed={on} onClick={() => tap(o)} style={{ height: 56, padding: '0 24px', borderRadius: 9999, border: '1px solid ' + (on ? 'var(--ink)' : 'var(--border)'), background: on ? 'var(--ink)' : 'var(--card)', color: on ? 'var(--background)' : 'var(--ink)', fontFamily: 'inherit', fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontVariantNumeric: 'tabular-nums', transition: 'background-color .3s var(--ease-out), border-color .3s var(--ease-out)' }}>
                {o}{q.multi ? <span style={{ width: 20, height: 20, borderRadius: 9999, display: 'grid', placeItems: 'center', border: on ? 0 : '1px solid rgba(14,12,11,.2)', background: on ? 'var(--background)' : 'transparent', color: 'var(--ink)' }}>{on && <HX.Icon name="check" size={12} />}</span> : on && <HX.Icon name="check" size={16} />}
              </button>
              {o === 'Other' && on && <HX.Field placeholder="Tell us in a few words" value={other} onChange={e => onOther(e.target.value)} />}
            </React.Fragment>; })}
          </div>
          {q.multi && <div style={{ marginTop: 32 }}><HX.ButtonInk size="lg" disabled={!picked.length} onClick={onNext}>Continue</HX.ButtonInk></div>}
        </div>
      </div>
    </section>
  </StepFrame>;
}
