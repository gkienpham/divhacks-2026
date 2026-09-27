import React from 'react';
export function Eyebrow({ children, dot = true, onDark = false, onSand = false, style }) {
  return <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, lineHeight: 1, letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: onDark ? 'rgba(255,255,255,.75)' : onSand ? 'var(--foreground)' : 'var(--muted-foreground)', ...style }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: onDark ? '#fff' : 'var(--brand)', flex: 'none' }} />}
    <span>{children}</span>
  </div>;
}
