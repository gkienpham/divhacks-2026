import React from 'react';
export function SectionLabel({ number = '01', children, onDark = false, onSand = false, style }) {
  return <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, lineHeight: 1, letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap', ...style }}>
    <span style={{ color: 'var(--brand)' }}>{number}</span>
    <span style={{ color: onDark ? 'rgba(255,255,255,.75)' : onSand ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{children}</span>
  </div>;
}
