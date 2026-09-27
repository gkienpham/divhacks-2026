import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Stepper({ steps = [], current, style }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + steps.length + ',minmax(0,1fr))', fontFamily: 'var(--font-sans)', ...style }}>
    {steps.map((s, i) => { const done = current != null && i < current; const now = current === i;
      return <div key={i} style={{ position: 'relative', paddingRight: 32 }}>
        <div style={{ position: 'absolute', top: 28, left: 56, right: 0, height: 1, background: 'var(--border)' }} />
        <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + (done || now ? 'var(--ink)' : 'var(--border)'), background: done ? 'var(--ink)' : 'var(--background)', color: done ? 'var(--background)' : 'var(--ink)' }}><Icon name={done ? 'check' : s.icon} size={18} /></div>
        <div style={{ marginTop: 26, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{i + 1}. {s.title}</div>
        {s.text && <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)', maxWidth: 250 }}>{s.text}</p>}
      </div>; })}
  </div>;
}
