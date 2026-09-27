import React from 'react';
import { LinkUnderline } from '../actions/LinkUnderline.jsx';
export function MatchScore({ value = 86, caption = 'match · metric', linkLabel = "How it's scored", onHowScored, showLink = true, onDark = false, style }) {
  return <div style={{ fontFamily: 'var(--font-sans)', ...style }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', color: onDark ? '#fff' : 'var(--ink)' }}>
      <span style={{ fontSize: 60, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 5, marginLeft: 2 }}>%</span>
    </div>
    <div style={{ marginTop: 10, whiteSpace: 'nowrap', fontSize: 13, color: onDark ? 'rgba(255,255,255,.6)' : 'var(--muted-foreground)' }}>{caption}</div>
    {showLink && <LinkUnderline onDark={onDark} onClick={onHowScored} size={13} style={{ marginTop: 16 }}>{linkLabel}</LinkUnderline>}
  </div>;
}
