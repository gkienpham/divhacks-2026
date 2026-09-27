import React from 'react';
export function SegmentedToggle({ options = [], value, defaultValue, onChange, size = 'md', onDark = false, style }) {
  const [inner, setInner] = React.useState(defaultValue ?? options[0]);
  const cur = value ?? inner;
  const h = size === 'sm' ? 36 : 44;
  return <div role="tablist" style={{ display: 'inline-flex', padding: 4, gap: 2, borderRadius: 9999, border: '1px solid ' + (onDark ? 'rgba(255,255,255,.2)' : 'var(--border)'), background: onDark ? 'rgba(255,255,255,.06)' : 'var(--card)', fontFamily: 'var(--font-sans)', ...style }}>
    {options.map(o => { const a = o === cur; return <button key={o} role="tab" aria-selected={a} type="button" onClick={() => { setInner(o); onChange && onChange(o); }}
      style={{ height: h - 10, padding: '0 16px', borderRadius: 9999, border: 0, background: a ? (onDark ? '#fff' : 'var(--ink)') : 'transparent', color: a ? (onDark ? 'var(--ink)' : 'var(--background)') : onDark ? 'rgba(255,255,255,.7)' : 'var(--muted-foreground)', fontFamily: 'inherit', fontSize: size === 'sm' ? 13 : 14, fontWeight: 500, letterSpacing: '-0.01em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background-color .3s, color .3s' }}>{o}</button>; })}
  </div>;
}
