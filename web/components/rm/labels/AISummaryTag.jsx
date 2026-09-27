import React from 'react';
export function AISummaryTag({ label = 'AI summary', onDark = false, style }) {
  return <span title="Written by AI from both people's answers. The match % is not." style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 9999, border: '1px solid ' + (onDark ? 'rgba(255,255,255,.3)' : 'var(--border)'), color: onDark ? 'rgba(255,255,255,.75)' : 'var(--muted-foreground)', fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.04em', whiteSpace: 'nowrap', ...style }}>{label}</span>;
}
