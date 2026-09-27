import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Accordion({ items = [], defaultOpen = 0, multiple = false, style }) {
  const [open, setOpen] = React.useState(defaultOpen == null ? [] : [defaultOpen]);
  const toggle = i => setOpen(o => o.includes(i) ? o.filter(x => x !== i) : multiple ? [...o, i] : [i]);
  return <div style={{ borderBottom: '1px solid rgba(14,12,11,.1)', fontFamily: 'var(--font-sans)', ...style }}>
    {items.map((it, i) => { const on = open.includes(i); return <div key={i} style={{ borderTop: '1px solid rgba(14,12,11,.1)' }}>
      <button type="button" aria-expanded={on} onClick={() => toggle(i)} style={{ display: 'flex', alignItems: 'center', gap: 24, width: '100%', padding: '26px 0', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
        <span style={{ flex: 1, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{it.q}</span>
        <span style={{ width: 32, height: 32, flex: 'none', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + (on ? 'var(--ink)' : 'rgba(14,12,11,.2)'), background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--background)' : 'var(--ink)', transition: 'background-color .3s' }}><Icon name={on ? 'minus' : 'plus'} size={14} /></span>
      </button>
      {on && <div style={{ padding: '0 80px 30px 0', fontSize: 15, lineHeight: 1.625, color: 'var(--muted-foreground)', maxWidth: 720 }}>{it.a}</div>}
    </div>; })}
  </div>;
}
