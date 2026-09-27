import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { ButtonInk } from '../actions/ButtonInk.jsx';
export function FilterBar({ segments = [], actionLabel = 'Find matches', onAction, onChange, style }) {
  const [open, setOpen] = React.useState(-1);
  const [vals, setVals] = React.useState(segments.map(s => s.value));
  React.useEffect(() => { const c = () => setOpen(-1); window.addEventListener('click', c); return () => window.removeEventListener('click', c); }, []);
  return <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', height: 88, padding: '10px 10px 10px 6px', borderRadius: 9999, border: '1px solid var(--border)', background: 'var(--card)', fontFamily: 'var(--font-sans)', ...style }}>
    {segments.map((s, i) => <div key={s.label} style={{ position: 'relative', flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', borderLeft: i ? '1px solid var(--border)' : 0 }}>
      <button type="button" onClick={() => setOpen(open === i ? -1 : i)} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, height: '100%', padding: '0 24px', background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{s.label}</span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--muted-foreground)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vals[i]}</span>
        </span>
        <Icon name="chevron-down" size={16} style={{ color: 'var(--ink)', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
      </button>
      {open === i && s.options && <div style={{ position: 'absolute', top: 'calc(100% + 14px)', left: 8, minWidth: 220, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16.8, padding: 6, zIndex: 20 }}>
        {s.options.map(o => <button key={o} type="button" onClick={() => { const n = [...vals]; n[i] = o; setVals(n); setOpen(-1); onChange && onChange(s.label, o); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', border: 0, borderRadius: 12, background: vals[i] === o ? 'var(--muted)' : 'transparent', fontFamily: 'inherit', fontSize: 13, color: 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}>{o}{vals[i] === o && <Icon name="check" size={14} />}</button>)}
      </div>}
    </div>)}
    <ButtonInk size="lg" onClick={() => onAction && onAction(vals)} style={{ height: 56, padding: '0 26px', marginLeft: 6 }}>{actionLabel}</ButtonInk>
  </div>;
}
