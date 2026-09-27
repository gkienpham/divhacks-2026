import React from 'react';
export function AIOffBadge({ label = 'AI off · rule-based mode', style }) {
  return <span role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 28, padding: '0 12px', borderRadius: 9999, background: 'var(--sand)', color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', ...style }}>
    <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 9999, border: '1.5px solid var(--muted-foreground)', flex: 'none' }} />
    {label}
  </span>;
}
