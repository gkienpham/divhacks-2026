import React from 'react';
const S = {
  fair: { dot: 'var(--fair)', label: 'Fair price' },
  above: { dot: 'var(--watch)', label: 'Above median' },
  check: { dot: 'var(--destructive)', label: 'Check before paying' },
};
export function TrustBadge({ status = 'fair', label, surface = 'white', style }) {
  const s = S[status] || S.fair;
  const frost = surface === 'frosted';
  return <span role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 30, padding: '0 12px', borderRadius: 9999, border: frost ? 0 : '1px solid var(--border)', background: frost ? 'rgba(14,12,11,.6)' : 'var(--card)', backdropFilter: frost ? 'blur(12px)' : undefined, WebkitBackdropFilter: frost ? 'blur(12px)' : undefined, color: frost ? '#fff' : 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', ...style }}>
    <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 9999, background: s.dot, flex: 'none' }} />
    {label || s.label}
  </span>;
}
