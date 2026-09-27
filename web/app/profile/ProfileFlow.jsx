"use client";
// /profile: 3A see-your-roommate → 3B quick-tap ×10 → 3C in your words → 3D review → /matches.
// Saves as it goes (POST /api/profile): 3A on Continue, 3B on each answer, the transcript only from 3D, after review.
import React from 'react';
import { useRouter } from 'next/navigation';
import { QUICK, answered } from '@/lib/questions';
import { SeeScreen, QuickTapScreen } from './HabitScreens';
import { VoiceScreen, ReviewScreen, FULL } from './VoiceScreens';

// What /api/profile accepts: sleepNoiseOther only with "Other" picked, and no empty multi answer (missing = not answered yet).
function clean({ sleepNoiseOther, ...q }) {
  if (q.sleepNoise && !q.sleepNoise.length) delete q.sleepNoise;
  const other = sleepNoiseOther?.trim();
  return other && q.sleepNoise?.includes('Other') ? { ...q, sleepNoiseOther: other } : q;
}
const post = body => fetch('/api/profile', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  .then(r => r.ok, () => false);
const gap = quick => QUICK.findIndex(q => !answered(q, quick[q.k])); // first unanswered question, or -1

// see/quick/transcript: the saved profile. A returning user picks up at the first thing missing, or at the top once done.
export default function ProfileFlow({ ai, see: savedSee, quick: savedQuick, transcript: savedTranscript }) {
  const router = useRouter();
  const [step, setStep] = React.useState(() => !savedSee ? 'see' : gap(savedQuick) >= 0 ? 'quick' : savedTranscript ? 'see' : 'voice'); // see | quick | voice | review
  const [qi, setQi] = React.useState(() => Math.max(0, gap(savedQuick)));
  const [see, setSee] = React.useState(savedSee);
  const [answers, setAnswers] = React.useState(savedQuick);
  const [transcript, setTranscript] = React.useState(savedTranscript);
  const [sample, setSample] = React.useState(savedTranscript === FULL);
  const [voiced, setVoiced] = React.useState(false); // 3D offers Re-record for a voice transcript, Back otherwise
  const [ret, setRet] = React.useState(false); // opened from the 3D self-check: return there after one answer
  const [failed, setFailed] = React.useState(false);
  const queue = React.useRef(Promise.resolve(true));
  React.useEffect(() => { window.scrollTo(0, 0); }, [step, qi]);

  // One request at a time, so an older save can't land after a newer one. Resolves to whether it saved.
  const save = body => (queue.current = queue.current.then(() => post(body)).then(ok => { setFailed(!ok); return ok; }));
  const everything = () => ({ ...(see && { see }), quick: clean(answers), ...(step === 'review' && { transcript }) });
  const frame = { failed, onExit: () => save(everything()).then(ok => ok && router.push('/')) };

  // Absolute targets, so a double tap during the advance delay can't skip a question.
  const toQ = i => {
    if (ret) { setRet(false); setStep('review'); }
    else if (i < 0) setStep('see');
    else if (i >= QUICK.length) setStep('voice');
    else setQi(i);
  };

  if (step === 'see') return <SeeScreen value={see} onChange={setSee} frame={frame} onNext={() => { save({ see }); setQi(0); setStep('quick'); }} />;
  if (step === 'quick') {
    const { k, multi } = QUICK[qi];
    // Single-choice answers save on tap (then auto-advance); multi-choice and its "Other" text save on Continue.
    return <QuickTapScreen v={qi} sel={answers[k]} other={answers.sleepNoiseOther} frame={frame}
      onAnswer={a => { const next = { ...answers, [k]: a }; setAnswers(next); if (!multi) save({ quick: clean(next) }); }}
      onOther={t => setAnswers(s => ({ ...s, sleepNoiseOther: t }))}
      onNext={() => { if (multi) save({ quick: clean(answers) }); toQ(qi + 1); }} onBack={() => toQ(qi - 1)} />;
  }
  if (step === 'voice') return <VoiceScreen initial={transcript} sample={sample} frame={frame}
    onDone={(t, source) => { setTranscript(t); setSample(source === 'sample'); setVoiced(source === 'voice'); setStep('review'); }} />;
  return <ReviewScreen ai={ai} quick={answers} transcript={transcript} sample={sample} voiced={voiced} frame={frame}
    onEdit={t => { setTranscript(t); if (!t.trim()) setSample(false); }}
    onSave={() => save(everything()).then(ok => ok && router.push('/matches'))} onBack={() => setStep('voice')}
    onUpdate={k => { setRet(true); setQi(QUICK.findIndex(q => q.k === k)); setStep('quick'); }} />;
}
