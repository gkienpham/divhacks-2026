"use client";
// /profile: 3A see-your-roommate → 3B quick-tap ×10 → 3C voice → 3D review → /matches.
// All state stays in this component; nothing is sent to a server yet.
import React from 'react';
import { useRouter } from 'next/navigation';
import { SeeScreen, QuickTapScreen, Q } from './HabitScreens';
import { VoiceScreen, ReviewScreen } from './VoiceScreens';

const GUESTS = Q.findIndex(q => q.k === 'guests');

export default function ProfileFlow({ ai }) {
  const router = useRouter();
  const [step, setStep] = React.useState('see'); // see | quick | voice | review
  const [see, setSee] = React.useState(null);
  const [qi, setQi] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [other, setOther] = React.useState('');
  const [ret, setRet] = React.useState(false); // opened from the 3D self-check: return there after one answer
  const [transcript, setTranscript] = React.useState('');
  const [demo, setDemo] = React.useState(false);
  React.useEffect(() => { window.scrollTo(0, 0); }, [step, qi]);

  // Absolute targets, so a double tap during the advance delay can't skip a question.
  const toQ = i => {
    if (ret) { setRet(false); setStep('review'); }
    else if (i < 0) setStep('see');
    else if (i >= Q.length) setStep('voice');
    else setQi(i);
  };

  if (step === 'see') return <SeeScreen value={see} onChange={setSee} onNext={() => { setQi(0); setStep('quick'); }} />;
  if (step === 'quick') {
    const k = Q[qi].k;
    return <QuickTapScreen v={qi} sel={answers[k]} other={other} onOther={setOther}
      onAnswer={a => setAnswers(s => ({ ...s, [k]: a }))} onNext={() => toQ(qi + 1)} onBack={() => toQ(qi - 1)} />;
  }
  if (step === 'voice') return <VoiceScreen onDone={(t, isDemo) => { setTranscript(t); setDemo(isDemo); setStep('review'); }} />;
  return <ReviewScreen ai={ai} transcript={transcript} onEdit={setTranscript} demo={demo} guests={answers.guests}
    onFinish={() => router.push('/matches')} onRerecord={() => setStep('voice')}
    onUpdateGuests={() => { setRet(true); setQi(GUESTS); setStep('quick'); }} />;
}
