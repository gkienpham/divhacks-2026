import React from 'react';
export function WordmarkIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M12 8.5V21" />
  </svg>;
}
export function Wordmark({ onDark = false, size = 18, showIcon = true, style }) {
  const c = onDark ? '#fff' : 'var(--ink)';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.5), color: c, fontFamily: 'var(--font-sans)', fontSize: size, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap', ...style }}>
    {showIcon && <WordmarkIcon size={Math.round(size * 1.25)} />}
    RoomMe
  </span>;
}
