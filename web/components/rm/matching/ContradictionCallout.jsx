import React from 'react';
import { Eyebrow } from '../labels/Eyebrow.jsx';
import { AISummaryTag } from '../labels/AISummaryTag.jsx';
import { ButtonInk } from '../actions/ButtonInk.jsx';
import { LinkUnderline } from '../actions/LinkUnderline.jsx';
export function ContradictionCallout({ eyebrow = 'Worth asking', answers = [], question = '', onSend, onSkip, sent = false, style }) {
  const [draft, setDraft] = React.useState(question);
  const [state, setState] = React.useState(sent ? 'sent' : 'draft');
  return <div style={{ background: 'var(--sand)', borderRadius: 24, padding: 32, fontFamily: 'var(--font-sans)', ...style }}>
    <Eyebrow onSand>{eyebrow}</Eyebrow>
    <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--foreground)', maxWidth: 520 }}>Two answers point different ways. It may be nothing. Here they are, word for word.</p>
    <div style={{ marginTop: 22, display: 'grid', gap: 0 }}>
      {answers.map((a, i) => <div key={i} style={{ padding: '16px 0', borderTop: '1px solid rgba(14,12,11,.1)' }}>
        <div style={{ fontSize: 12, color: 'var(--foreground)' }}>{a.source}</div>
        <div style={{ marginTop: 6, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>“{a.quote}”</div>
      </div>)}
    </div>
    <div style={{ marginTop: 8, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16.8, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted-foreground)' }}>Suggested question · draft <AISummaryTag /></div>
      {state === 'sent' ? <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }}>{draft}</div> :
        <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2} style={{ display: 'block', width: '100%', marginTop: 8, border: 0, padding: 0, resize: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }} />}
    </div>
    <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
      {state === 'sent' ? <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Question sent. You’ll see the reply here.</span> : <>
        <ButtonInk size="sm" onClick={() => { setState('sent'); onSend && onSend(draft); }}>Send question</ButtonInk>
        <LinkUnderline arrow={false} onClick={onSkip}>Skip</LinkUnderline></>}
    </div>
  </div>;
}
