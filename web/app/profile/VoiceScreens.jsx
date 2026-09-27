"use client";
// 3C in your words · 3D review. Ported from ui_kits/profile/VoiceScreens.jsx; ProfileFlow.jsx owns the state and saving.
import React from 'react';
import * as VX from '@/components/rm';
import { QUICK, VOICE_PROMPTS } from '@/lib/questions';
import { contradictions } from '@/lib/signals';
import { startVoiceSession } from '@/lib/voice-client';
import { StepFrame, H2 } from './HabitScreens';

const WORDS = 'Step 4 of 4 · In your words';
const SECS = 90; // hard cap on a voice session
const MAX = 4000; // /api/profile's transcript limit
// "Use sample answers": demo text, labeled as sample wherever it shows.
export const FULL = 'Okay, a perfect Sunday. I sleep in, because on weekends I’m up late, like two a.m. Then I usually have people over for brunch. Most Sundays it’s three or four friends and a big pan of eggs. After that I’m pretty lazy. Laundry, a long walk, maybe a movie.\n\nA habit that drives me crazy is dishes left in the sink overnight. Once is fine. Every night isn’t.\n\nIf something bugs me I’d rather just say it in person, like in the kitchen, not over text. I think it’s faster and nobody reads a tone into it.\n\nWeekdays I’m out by eight, back around six, cook something simple, and I’m in bed before midnight.\n\nI’m somewhere in the middle. I like having people over, but I also need a couple of quiet nights a week.';
const BARS = Array.from({ length: 36 }, (_, i) => 6 + Math.round(Math.abs(Math.sin(i * 1.7) * 18 + Math.sin(i * .6) * 10)));
const KEYFRAMES = '@keyframes rm-wave{from{transform:scaleY(.35)}to{transform:scaleY(1)}}';
const LINE = '1px solid rgba(255,255,255,.12)';

// Voice only when /api/voice/session hands out a signed URL (ELEVENLABS_API_KEY + ELEVENLABS_AGENT_ID). Typing otherwise:
// { configured: false } (any status), an error body, or no network.
// Only the user's own lines are kept. Nothing is saved here: onDone(text, 'voice' | 'typed' | 'sample') hands it to 3D.
export function VoiceScreen({ initial, sample: wasSample, onDone, frame }) {
  const [url, setUrl] = React.useState(); // undefined while checking, null = typing only
  const [typing, setTyping] = React.useState(false);
  const [typed, setTyped] = React.useState(initial);
  const [sample, setSample] = React.useState(wasSample);
  const [phase, setPhase] = React.useState('idle'); // idle → connecting → live → done (one session per visit)
  const [left, setLeft] = React.useState(SECS);
  const [lines, setLines] = React.useState([]);
  const [noVoice, setNoVoice] = React.useState(false);
  const said = React.useRef([]);
  const stop = React.useRef(null);
  const ended = React.useRef(false);

  React.useEffect(() => {
    let on = true;
    fetch('/api/voice/session', { cache: 'no-store' }).then(r => r.json())
      .then(d => on && setUrl(d?.signedUrl || null), () => on && setUrl(null));
    return () => { on = false; stop.current?.(); };
  }, []);

  // Counts from the connect time; at 0 it stops the session, and the SDK's disconnect lands in finish().
  React.useEffect(() => {
    if (phase !== 'live') return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const l = Math.max(0, SECS - Math.floor((Date.now() - t0) / 1000));
      setLeft(l);
      if (!l) stop.current?.();
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  // Every way out of a session ends here once: the timer, End early, Type instead, the agent hanging up, or an error.
  const finish = why => {
    if (ended.current) return;
    ended.current = true;
    stop.current?.();
    setPhase('done');
    const text = said.current.join('\n\n').slice(0, MAX);
    if (text && why !== 'type') return onDone(text, 'voice');
    if (text) setTyped(text);
    setNoVoice(why === 'error');
    setTyping(true);
  };
  const start = () => {
    setPhase('connecting');
    stop.current = startVoiceSession(url, {
      onStart: () => setPhase('live'),
      onLine: l => { said.current = [...said.current, l]; setLines(said.current); },
      onEnd: err => finish(err ? 'error' : 'end'),
    });
  };

  const voice = url && !typing;
  const R = 96, C = 2 * Math.PI * R;
  return <StepFrame step={WORDS} pct={80} dark exitLabel="Exit" {...frame}>
    <style>{KEYFRAMES}</style>
    <section style={{ flex: 1, padding: '72px 48px 56px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / span 4' }}>
          <VX.Eyebrow onDark>{voice ? 'Voice interview · 90 seconds' : 'Five prompts'}</VX.Eyebrow>
          <H2 size={44} dark style={{ marginTop: 18 }}>Tell us how you actually live.</H2>
          <ol style={{ margin: '40px 0 0', padding: 0, listStyle: 'none' }}>
            {VOICE_PROMPTS.map((p, i) => <li key={p} style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '14px 0', borderTop: LINE, borderBottom: i === VOICE_PROMPTS.length - 1 ? LINE : 0 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 15, color: '#fff' }}>{p}</span>
            </li>)}
          </ol>
        </div>
        {voice && <>
          <div style={{ gridColumn: '5 / span 4', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
            <div style={{ position: 'relative', width: 216, height: 216, display: 'grid', placeItems: 'center' }}>
              <svg width="216" height="216" aria-hidden="true" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
                <circle cx="108" cy="108" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
                <circle cx="108" cy="108" r={R} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - left / SECS)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <button type="button" aria-label="Start the voice interview" disabled={phase !== 'idle'} onClick={start} style={{ width: 160, height: 160, borderRadius: 9999, border: 0, background: '#fff', color: 'var(--ink)', display: 'grid', placeItems: 'center', cursor: phase === 'idle' ? 'pointer' : 'default' }}><VX.Icon name="mic" size={32} /></button>
            </div>
            <div style={{ marginTop: 24, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}{phase === 'live' && ' left'}</div>
            <div aria-hidden="true" style={{ marginTop: 28, height: 40, display: 'flex', alignItems: 'center', gap: 4, opacity: phase === 'live' ? 1 : 0, transition: 'opacity .42s var(--ease-out)' }}>
              {BARS.map((b, i) => <span key={i} style={{ width: 2, height: b, borderRadius: 2, background: 'rgba(255,255,255,.45)', animation: `rm-wave 1.4s var(--ease-out) ${(i % 9) * 0.11}s infinite alternate`, animationPlayState: phase === 'live' ? 'running' : 'paused' }} />)}
            </div>
            <div role="status" style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{{ idle: 'Tap to start', connecting: 'Connecting…', live: 'Listening' }[phase]}</div>
          </div>
          <div style={{ gridColumn: '9 / span 4', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 28, minHeight: 440 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Transcript</span>
              {phase === 'live' && <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.6)' }}><span style={{ width: 7, height: 7, borderRadius: 9999, background: 'var(--destructive)' }} />Live</span>}
            </div>
            <div aria-live="polite" style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {lines.length ? lines.map((l, i) => <p key={i} style={{ margin: 0, fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,.75)' }}>{l}</p>)
                : <p style={{ margin: 0, fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,.6)' }}>Your words show up here.</p>}
            </div>
          </div>
        </>}
        {url !== undefined && !voice && <div style={{ gridColumn: '6 / span 7' }}>
          <VX.Field as="textarea" rows={14} label={<span style={{ color: '#fff' }}>{sample ? 'Sample answers' : 'Your answers'}</span>} placeholder="A few sentences for each prompt." value={typed}
            onChange={e => { const t = e.target.value.slice(0, MAX); setTyped(t); if (!t.trim()) setSample(false); }} />
        </div>}
      </div>
      {url !== undefined && <div style={{ marginTop: 'auto', paddingTop: 48, display: 'flex', alignItems: 'center', gap: 28 }}>
        {voice ? <>
          <VX.ButtonOutline onDark size="lg" arrow={false} onClick={() => phase === 'idle' ? setTyping(true) : finish('type')}>Type instead</VX.ButtonOutline>
          {phase === 'live' && <VX.LinkUnderline onDark arrow={false} onClick={() => finish('end')}>End early</VX.LinkUnderline>}
        </> : <>
          <VX.ButtonOnPhoto size="lg" disabled={!typed.trim()} onClick={() => onDone(typed, sample ? 'sample' : 'typed')}>Review my answers</VX.ButtonOnPhoto>
          {url && phase === 'idle' && <VX.ButtonOutline onDark size="lg" arrow={false} icon="mic" onClick={() => setTyping(false)}>Use my voice</VX.ButtonOutline>}
          {!typed.trim() && <VX.LinkUnderline onDark arrow={false} onClick={() => { setTyped(FULL); setSample(true); }}>Use sample answers</VX.LinkUnderline>}
        </>}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{noVoice ? 'Voice didn’t connect.' : voice ? 'Audio isn’t stored. You’ll review the transcript before it’s saved.' : 'You’ll review it before it’s saved.'}</span>
      </div>}
    </section>
  </StepFrame>;
}

// A quick-tap answer and a sentence of the transcript that point different ways, both word for word. Rule-based: no AISummaryTag.
function SelfCheck({ c, source, kept, onUpdate, onKeep }) {
  return <div style={{ background: 'var(--sand)', borderRadius: 24, padding: 32 }}>
    <VX.Eyebrow onSand>Worth a second look</VX.Eyebrow>
    <div style={{ marginTop: 22 }}>
      {[[QUICK.find(q => q.k === c.key).q, c.quick], [source, c.voice]].map(([s, quote]) => <div key={s} style={{ padding: '16px 0', borderTop: '1px solid rgba(14,12,11,.1)' }}>
        <div style={{ fontSize: 12, color: 'var(--foreground)' }}>{s}</div>
        <div style={{ marginTop: 6, fontSize: 18, fontWeight: 500, lineHeight: 1.45, letterSpacing: '-0.01em', color: 'var(--ink)' }}>“{quote}”</div>
      </div>)}
    </div>
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
      {kept ? <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Kept both answers.</span> : <>
        <VX.ButtonInk size="sm" onClick={onUpdate}>Update answer</VX.ButtonInk>
        <VX.ButtonOutline size="sm" arrow={false} onClick={onKeep}>Keep both</VX.ButtonOutline></>}
    </div>
  </div>;
}

// quick: the 3B answers; the self-check reruns on every edit. There's no AI text here, so AI on shows nothing extra.
export function ReviewScreen({ ai, quick, transcript, sample, voiced, onEdit, onSave, onBack, onUpdate, frame }) {
  const [kept, setKept] = React.useState([]);
  const found = contradictions(quick, transcript);
  const label = sample ? 'Sample answers' : voiced ? 'Your transcript' : 'Your answers';
  return <StepFrame step={WORDS} pct={92} h={1000} {...frame}>
    <section style={{ flex: 1, padding: '56px 48px 64px' }}>
      <VX.Eyebrow>Review</VX.Eyebrow>
      <H2 style={{ marginTop: 18 }}>Edit anything before it’s saved.</H2>
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48, alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / span 7' }}>
          <VX.FormCard padding={28}>
            <VX.Field as="textarea" label={label} hint="· edit freely" rows={15} value={transcript} onChange={e => onEdit(e.target.value.slice(0, MAX))} />
          </VX.FormCard>
          <p style={{ margin: '20px 0 0', fontSize: 14, color: 'var(--muted-foreground)' }}>Voice answers never change your match %.</p>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: voiced ? 12 : 28 }}>
            <VX.ButtonInk size="lg" onClick={onSave}>Save my profile</VX.ButtonInk>
            {voiced ? <VX.ButtonOutline size="lg" arrow={false} icon="mic" onClick={onBack}>Re-record</VX.ButtonOutline>
              : <VX.LinkUnderline arrow={false} onClick={onBack}>Back</VX.LinkUnderline>}
          </div>
        </div>
        <div style={{ gridColumn: '8 / span 5', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!ai && <div><VX.AIOffBadge /></div>}
          {found.map(c => <SelfCheck key={c.key} c={c} source={label} kept={kept.includes(c.key)} onUpdate={() => onUpdate(c.key)} onKeep={() => setKept(k => [...k, c.key])} />)}
        </div>
      </div>
    </section>
  </StepFrame>;
}
