import React from 'react';
import { InitialsAvatar } from './InitialsAvatar.jsx';
import { AISummaryTag } from '../labels/AISummaryTag.jsx';
export function ChatBubble({ from = 'agent', name, initials, time, children, aiSummary = false, align, avatarTone = 'sand', style }) {
  const agent = from === 'agent';
  const right = align ? align === 'right' : !agent;
  return <div style={{ display: 'flex', gap: 10, flexDirection: right ? 'row-reverse' : 'row', alignItems: 'flex-end', fontFamily: 'var(--font-sans)', ...style }}>
    {!agent && <InitialsAvatar initials={initials} name={name} size={36} tone={avatarTone} />}
    <div style={{ flex: '0 1 auto', minWidth: 0, maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start' }}>
      {(name || time || aiSummary || agent) && <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 12, color: 'var(--muted-foreground)' }}><span style={{ color: 'var(--ink)', fontWeight: 500 }}>{name || (agent ? 'RoomMe agent' : '')}</span>{time && <span>{time}</span>}{aiSummary && <AISummaryTag />}</div>}
      <div style={{ width: 'max-content', maxWidth: '100%', padding: '12px 16px', borderRadius: 16.8, background: agent ? 'var(--ink)' : 'var(--card)', border: agent ? '1px solid var(--ink)' : '1px solid var(--border)', color: agent ? 'var(--background)' : 'var(--foreground)', fontSize: 14, lineHeight: 1.55 }}>{children}</div>
    </div>
  </div>;
}
