"use client";
// 3A see-your-roommate · 3B quick-tap. Ported from ui_kits/profile/HabitScreens.jsx; ProfileFlow.jsx owns the state and saving.
import React from 'react';
import * as HX from '@/components/rm';
import { QUICK, SEE_PREFS } from '@/lib/questions';

const HABITS = 'Step 3 of 4 · Your habits';

// frame (from ProfileFlow): onExit saves what's on screen, then leaves; failed = the last save didn't go through.
export function StepFrame({ step, pct, dark, h, onExit, exitLabel = 'Save and exit', failed, children }) {
  return <div className={dark ? 'rm-on-dark' : undefined} style={{ width: 1440, margin: '0 auto', minHeight: `max(${h || 900}px, 100vh)`, background: dark ? 'var(--ink)' : 'var(--background)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <HX.Header variant={dark ? 'scrolled' : 'light'} brand={<HX.Wordmark onDark={dark} />} items={[]} showSearch={false} showCta={false}
      right={<HX.LinkUnderline arrow={false} onDark={dark} onClick={onExit}>{exitLabel}</HX.LinkUnderline>} />
    <div style={{ padding: '20px 48px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, fontSize: 13, fontWeight: 500, color: dark ? '#fff' : 'var(--ink)', whiteSpace: 'nowrap' }}>
        {step}
        {failed && <span role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 400 }}><span style={{ width: 7, height: 7, borderRadius: 9999, background: 'var(--destructive)' }} />Couldn’t save. Try again.</span>}
      </div>
      <div style={{ marginTop: 10, height: 1, background: dark ? 'rgba(255,255,255,.12)' : 'var(--border)', position: 'relative' }}><div style={{ position: 'absolute', left: 0, top: 0, height: 1, width: pct + '%', background: dark ? '#fff' : 'var(--ink)', transition: 'width .42s var(--ease-out)' }} /></div>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
  </div>;
}

export const H2 = ({ children, size = 60, dark, style }) => <h2 style={{ margin: 0, fontSize: size, fontWeight: 500, lineHeight: size === 60 ? 1.02 : 1.08, letterSpacing: size === 60 ? '-0.03em' : '-0.025em', color: dark ? '#fff' : 'var(--ink)', textWrap: 'pretty', ...style }}>{children}</h2>;

// Same order as SEE_PREFS. scoring.ts flips bedtime and wake similarity when a pair wants opposite schedules.
const SEE = [
  { t: 'I want to see them', d: 'Similar bedtimes and wake times. You’re up at the same hours.', icon: 'users' },
  { t: 'I’d rather barely see them', d: 'Opposite bedtimes and wake times. You’re up at different hours.', icon: 'moon' },
  { t: 'Let RoomMe decide', d: 'Similar hours, unless your match prefers opposite.', icon: 'sliders-horizontal' },
];
// value: a SEE_PREFS entry or null.
export function SeeScreen({ value, onChange, onNext, frame }) {
  return <StepFrame step={HABITS} pct={52} {...frame}>
    <section style={{ flex: 1, padding: '64px 48px 64px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'end' }}>
        <div style={{ gridColumn: '1 / span 8' }}><HX.Eyebrow>Seeing each other</HX.Eyebrow><H2 style={{ marginTop: 18 }}>How much do you want to actually see your roommate?</H2></div>
        <p style={{ gridColumn: '9 / span 4', margin: 0, fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)' }}>This changes how we match you.</p>
      </div>
      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
        {SEE.map((c, i) => { const v = SEE_PREFS[i], on = value === v; return <button key={v} type="button" aria-pressed={on} onClick={() => onChange(v)} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', background: 'var(--card)', borderRadius: 24, border: on ? '2px solid var(--ink)' : '1px solid var(--border)', padding: on ? 31 : 32, minHeight: 300, display: 'flex', flexDirection: 'column', transition: 'border-color .3s var(--ease-out)' }}>
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
        <HX.LinkUnderline href="/start" arrow={false}>Back</HX.LinkUnderline>
        <HX.ButtonInk size="lg" disabled={!value} onClick={onNext}>Continue</HX.ButtonInk>
      </div>
    </section>
  </StepFrame>;
}

// v: index into QUICK. sel: current answer (string, or array for multi). other: the "Other" text.
export function QuickTapScreen({ v, sel, other = '', onAnswer, onOther, onNext, onBack, frame }) {
  const q = QUICK[v];
  const picked = q.multi ? sel || [] : sel ? [sel] : [];
  const tap = o => {
    if (q.multi) return onAnswer(picked.includes(o) ? picked.filter(x => x !== o) : [...picked, o]);
    onAnswer(o);
    setTimeout(onNext, 260); // let the ink fill show before advancing
  };
  return <StepFrame step={HABITS} pct={52 + v * 2.5} h={q.multi ? 1040 : 900} {...frame}>
    <section style={{ flex: 1, padding: '40px 48px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <HX.LinkUnderline arrow={false} onClick={onBack}>Back</HX.LinkUnderline>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}><span style={{ color: 'var(--ink)', fontWeight: 500 }}>{v + 1}</span> of {QUICK.length}</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)', position: 'relative' }}><div style={{ position: 'absolute', left: 0, top: 0, height: 1, width: ((v + 1) / QUICK.length * 100) + '%', background: 'var(--ink)', transition: 'width .42s var(--ease-out)' }} /></div>
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
              {o === 'Other' && on && <HX.Field placeholder="Tell us in a few words" value={other} onChange={e => onOther(e.target.value.slice(0, 80))} />}
            </React.Fragment>; })}
          </div>
          {q.multi && <div style={{ marginTop: 32 }}><HX.ButtonInk size="lg" disabled={!picked.length} onClick={onNext}>Continue</HX.ButtonInk></div>}
        </div>
      </div>
    </section>
  </StepFrame>;
}
