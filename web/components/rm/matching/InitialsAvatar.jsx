import React from 'react';
export function InitialsAvatar({ initials = '', name, size = 48, onDark = false, tone = 'sand', style }) {
  const txt = (initials || (name || '').split(/\s+/).map(w => w[0]).join('')).slice(0, 2).toUpperCase();
  return <span aria-label={name || txt} style={{ width: size, height: size, flex: 'none', borderRadius: 9999, background: onDark ? 'rgba(255,255,255,.12)' : tone === 'card' ? 'var(--card)' : 'var(--sand)', color: onDark ? '#fff' : 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: Math.round(size * 0.36), fontWeight: 500, letterSpacing: '-0.01em', ...style }}>{txt}</span>;
}
