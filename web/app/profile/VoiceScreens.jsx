"use client";
// 3C voice interview · 3D review. Ported from ui_kits/profile/VoiceScreens.jsx; ProfileFlow.jsx owns the step state.
import React from 'react';
import * as VX from '@/components/rm';
import { StepFrame, H2 } from './HabitScreens';

const PROMPTS = ['A perfect Sunday at home', 'A roommate habit that drives you crazy', 'How you bring up a problem', 'Your typical weekday', 'Social hub or quiet recharge?'];
// Demo script: plays on the timer while no voice agent is connected.
const LIVE = [
  'Okay, a perfect Sunday. I sleep in, because on weekends I’m up late, like two a.m. Then I usually have people over for brunch. Most Sundays it’s three or four friends and a big pan of eggs.',
  'After that I’m pretty lazy. Laundry, a long walk, maybe a movie.',
  'A habit that drives me crazy is dishes left in the sink overnight. Once is fine. Every night isn’t.',
  'If something bugs me I’d rather just say it in person, like in the kitchen, not over text',
];
export const FULL = 'Okay, a perfect Sunday. I sleep in, because on weekends I’m up late, like two a.m. Then I usually have people over for brunch. Most Sundays it’s three or four friends and a big pan of eggs. After that I’m pretty lazy. Laundry, a long walk, maybe a movie.\n\nA habit that drives me crazy is dishes left in the sink overnight. Once is fine. Every night isn’t.\n\nIf something bugs me I’d rather just say it in person, like in the kitchen, not over text. I think it’s faster and nobody reads a tone into it.\n\nWeekdays I’m out by eight, back around six, cook something simple, and I’m in bed before midnight.\n\nI’m somewhere in the middle. I like having people over, but I also need a couple of quiet nights a week.';
const BARS = Array.from({ length: 36 }, (_, i) => 6 + Math.round(Math.abs(Math.sin(i * 1.7) * 18 + Math.sin(i * .6) * 10)));
const SECS = 90;
const KEYFRAMES = '@keyframes rm-wave{from{transform:scaleY(.35)}to{transform:scaleY(1)}}@keyframes rm-blink{50%{opacity:0}}';

// ElevenLabs plugs in via `startVoiceSession({ onLine, onEnd })`, which starts the agent and returns a stop function.
// Not wired yet: without it this screen is UI only and plays the LIVE demo lines on the 90s timer.
// onDone(transcript, isDemo) hands the text to 3D. Audio is never stored.
export function VoiceScreen({ onDone, startVoiceSession }) {
  const [left, setLeft] = React.useState(SECS);
  const [paused, setPaused] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [typed, setTyped] = React.useState('');
  const [lines, setLines] = React.useState([]);
  const live = !!startVoiceSession;
  const finish = () => typing ? onDone(typed, false) : live ? onDone(lines.join('\n\n'), false) : onDone(FULL, true);
  const run = !paused && !typing;
  React.useEffect(() => {
    if (!run) return;
    const t = setTimeout(() => left <= 1 ? finish() : setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  });
  React.useEffect(() => {
    if (!startVoiceSession || typing) return;
    return startVoiceSession({ onLine: l => setLines(x => [...x, l]), onEnd: () => setLeft(1) });
  }, [startVoiceSession, typing]);
  const el = SECS - left;
  const shown = live ? lines : LIVE.slice(0, Math.ceil(el / 10));
  const done = Math.min(PROMPTS.length, Math.floor(el / 18));
  const R = 96, C = 2 * Math.PI * R;
  return <StepFrame pct={47} dark>
    <style>{KEYFRAMES}</style>
    <section style={{ flex: 1, padding: '72px 48px 56px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / span 4' }}>
          <VX.Eyebrow onDark>Voice interview · about 90 seconds</VX.Eyebrow>
          <H2 size={44} dark style={{ marginTop: 18 }}>Tell us how you actually live.</H2>
          <div style={{ marginTop: 40 }}>
            {PROMPTS.map((p, i) => { const s = i < done ? 'done' : i === done && !typing ? 'now' : ''; return <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: '1px solid rgba(255,255,255,.12)', borderBottom: i === 4 ? '1px solid rgba(255,255,255,.12)' : 0 }}>
              <span style={{ width: 24, height: 24, flex: 'none', borderRadius: 9999, display: 'grid', placeItems: 'center', background: s === 'done' ? '#fff' : 'transparent', border: s === 'done' ? 0 : '1px solid ' + (s === 'now' ? '#fff' : 'rgba(255,255,255,.3)'), color: 'var(--ink)' }}>{s === 'done' && <VX.Icon name="check" size={12} />}{s === 'now' && <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#fff' }} />}</span>
              <span style={{ fontSize: 15, color: s === 'done' ? 'rgba(255,255,255,.6)' : '#fff', textDecorationLine: s === 'done' ? 'line-through' : 'none', textDecorationColor: 'rgba(255,255,255,.3)' }}>{p}</span>
            </div>; })}
          </div>
        </div>
        <div style={{ gridColumn: '5 / span 4', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, opacity: typing ? 0.4 : 1, transition: 'opacity .42s var(--ease-out)' }}>
          <div style={{ position: 'relative', width: 216, height: 216, display: 'grid', placeItems: 'center' }}>
            <svg width="216" height="216" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="108" cy="108" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
              <circle cx="108" cy="108" r={R} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - left / SECS)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <button type="button" aria-label={run ? 'Pause recording' : 'Resume recording'} disabled={typing} onClick={() => setPaused(p => !p)} style={{ width: 160, height: 160, borderRadius: 9999, border: 0, background: '#fff', color: 'var(--ink)', display: 'grid', placeItems: 'center', cursor: typing ? 'default' : 'pointer' }}><VX.Icon name="mic" size={32} /></button>
          </div>
          <div style={{ marginTop: 24, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')} left</div>
          <div style={{ marginTop: 28, height: 40, display: 'flex', alignItems: 'center', gap: 4 }}>
            {BARS.map((b, i) => <span key={i} style={{ width: 2, height: b, borderRadius: 2, background: 'rgba(255,255,255,.45)', animation: `rm-wave 1.4s var(--ease-out) ${(i % 9) * 0.11}s infinite alternate`, animationPlayState: run ? 'running' : 'paused' }} />)}
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{run ? 'Listening' : 'Paused'}</div>
        </div>
        <div style={{ gridColumn: '9 / span 4', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 28, minHeight: 440 }}>
          {typing ? <>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Your answers</span>
            <VX.Field as="textarea" rows={15} value={typed} onChange={e => setTyped(e.target.value)} placeholder="Answer the prompts on the left in your own words." style={{ marginTop: 20 }} />
          </> : <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Live transcript</span><span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.6)' }}><span style={{ width: 7, height: 7, borderRadius: 9999, background: run ? 'var(--destructive)' : 'rgba(255,255,255,.3)' }} />{run ? 'Recording' : 'Paused'}</span></div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {shown.map((l, i) => <p key={i} style={{ margin: 0, fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,.75)' }}>{l}{i === shown.length - 1 && run && <span style={{ display: 'inline-block', width: 1, height: 16, marginLeft: 3, verticalAlign: -3, background: '#fff', animation: 'rm-blink 1s steps(2) infinite' }} />}</p>)}
            </div>
          </>}
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 48, display: 'flex', alignItems: 'center', gap: 28 }}>
        <VX.ButtonOutline onDark size="lg" arrow={false} icon={typing ? 'mic' : undefined} onClick={() => setTyping(t => !t)}>{typing ? 'Use my voice' : 'Type instead'}</VX.ButtonOutline>
        {typing ? <VX.ButtonInk size="lg" disabled={!typed.trim()} onClick={finish} style={{ background: '#fff', color: 'var(--ink)' }}>Review my answers</VX.ButtonInk>
          : <VX.LinkUnderline onDark arrow={false} onClick={finish}>End early</VX.LinkUnderline>}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Audio isn’t stored. You’ll review the transcript before it’s saved.</span>
      </div>
    </section>
  </StepFrame>;
}

const LOW_GUESTS = ['0', '1–2'];

// demo: the transcript is the voice demo script, so the extracted tags and self-check below describe it.
// guests: the quick-tap guests answer; the self-check only shows when it contradicts "brunch most Sundays".
export function ReviewScreen({ ai, transcript, onEdit, demo, guests, onFinish, onRerecord, onUpdateGuests }) {
  const [asked, setAsked] = React.useState('');
  return <StepFrame pct={50} h={1000}>
    <section style={{ flex: 1, padding: '56px 48px 64px' }}>
      <VX.Eyebrow>Review</VX.Eyebrow>
      <H2 style={{ marginTop: 18 }}>Here’s what we heard. Edit anything.</H2>
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / span 7' }}>
          <VX.FormCard padding={28}>
            <VX.Field as="textarea" label="Your transcript" hint="· edit freely" rows={15} value={transcript} onChange={e => onEdit(e.target.value)} />
          </VX.FormCard>
          <p style={{ margin: '20px 0 0', fontSize: 14, color: 'var(--muted-foreground)' }}>Voice answers never change your match %, only the explanations.</p>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <VX.ButtonInk size="lg" onClick={onFinish}>Save my profile</VX.ButtonInk>
            <VX.ButtonOutline size="lg" arrow={false} icon="mic" onClick={onRerecord}>Re-record</VX.ButtonOutline>
          </div>
        </div>
        <div style={{ gridColumn: '8 / span 5', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!ai ? <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28 }}>
            <VX.AIOffBadge />
            <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>AI is off. Matching uses your quick-tap answers; nothing is pulled from the transcript.</p>
          </div> : demo && <>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>What we’ll use</span><VX.AISummaryTag /></div>
              <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>Pulled from your transcript to write match explanations.</p>
              <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <VX.HabitTag icon="coffee">Hosts Sunday brunch</VX.HabitTag>
                <VX.HabitTag icon="moon">Night owl on weekends</VX.HabitTag>
                <VX.HabitTag icon="message-circle">Talks problems out in person</VX.HabitTag>
              </div>
            </div>
            {LOW_GUESTS.includes(guests) && <div style={{ background: 'var(--sand)', borderRadius: 24, padding: 32 }}>
              <VX.Eyebrow onSand>Worth a second look</VX.Eyebrow>
              <p style={{ margin: '16px 0 0', fontSize: 18, fontWeight: 500, lineHeight: 1.45, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Your quick-tap says guests {guests} per month, but you mentioned brunch most Sundays. Want to update?</p>
              <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                {asked ? <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{asked}</span> : <>
                  <VX.ButtonInk size="sm" onClick={onUpdateGuests}>Update answer</VX.ButtonInk>
                  <VX.ButtonOutline size="sm" arrow={false} onClick={() => setAsked('Kept both answers.')}>Keep both</VX.ButtonOutline></>}
              </div>
            </div>}
          </>}
        </div>
      </div>
    </section>
  </StepFrame>;
}
