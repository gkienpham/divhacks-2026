"use client";
// 6A chat with a sample profile. The page holds the chat (nothing is saved); each turn POSTs it to /api/matches/[id]/chat,
// where Gemini writes the other person's next message, or RoomMe's neutral question when asked.
import React from 'react';
import * as MU from '@/components/rm';
import { ErrorLine } from './parts';

export function Chat({ me, m, aiOff }) {
  const p = m.other;
  const [chat, setChat] = React.useState([]);
  const [text, setText] = React.useState('');
  const [waiting, setWaiting] = React.useState(aiOff ? null : 'them'); // who Gemini is writing for
  const [error, setError] = React.useState(null);
  const list = React.useRef(null);
  const opened = React.useRef(false);

  // The server writes the next line as `as` from `lines`, which are passed in so no turn reads a stale chat.
  const turn = async (as, lines) => {
    setWaiting(as); setError(null);
    const res = await fetch(`/api/matches/${m.id}/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ as, chat: lines }) })
      .then(r => r.json()).catch(() => ({}));
    setWaiting(null);
    if (!res.text) { setError(res.error || 'Couldn’t reach RoomMe. Try again.'); return null; }
    const next = [...lines, { by: as, text: res.text, ai: res.ai }];
    setChat(next);
    return next;
  };
  // Opener. The ref keeps Strict Mode's second effect run from asking twice.
  React.useEffect(() => { if (!aiOff && !opened.current) { opened.current = true; turn('them', []); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }); }, [chat, waiting]);

  const send = e => {
    e.preventDefault();
    const t = text.trim();
    if (!t || waiting) return;
    const next = [...chat, { by: 'me', text: t }];
    setChat(next); setText('');
    if (!aiOff) turn('them', next);
  };
  const ask = async () => {
    const next = await turn('roomme', chat);
    if (next && !aiOff) await turn('them', next);
  };

  return <div style={{ marginTop: 48, width: 560, textAlign: 'left', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 16px 16px 24px', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Chat with {p.name}</span>
      <MU.ButtonOutline size="sm" icon="sparkle" arrow={false} disabled={!!waiting} onClick={ask}>Ask RoomMe</MU.ButtonOutline>
    </div>
    <div ref={list} role="log" aria-label={`Chat with ${p.name}`} style={{ height: 360, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {chat.map((x, i) => x.by === 'roomme'
        ? <MU.ChatBubble key={i} from="agent" name="RoomMe" aiSummary={x.ai}>{x.text}</MU.ChatBubble>
        : <MU.ChatBubble key={i} from="person" align={x.by === 'me' ? 'right' : 'left'} initials={(x.by === 'me' ? me : p).initials}>{x.text}</MU.ChatBubble>)}
      {waiting && <span role="status" style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{waiting === 'them' ? `${p.name} is typing…` : 'RoomMe is writing a question…'}</span>}
    </div>
    <form onSubmit={send} style={{ display: 'flex', gap: 12, padding: 16, borderTop: '1px solid var(--border)' }}>
      <input value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder={`Message ${p.name}`} aria-label={`Message ${p.name}`}
        style={{ flex: 1, minWidth: 0, height: 44, padding: '0 16px', borderRadius: 9999, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 14, outline: 'none' }} />
      <MU.ButtonInk type="submit" icon="send" arrow={false} disabled={!!waiting || !text.trim()}>Send</MU.ButtonInk>
    </form>
    <div style={{ padding: '0 24px 16px' }}>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--muted-foreground)' }}>{aiOff ? `AI is off, so ${p.name} can’t reply.` : `Sample profile: Gemini writes ${p.name}’s replies. Nothing here is saved.`}</p>
      <ErrorLine error={error} />
    </div>
  </div>;
}
