import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function HabitBar({ label, icon, value = 80, you, them, themName = 'Sam', style }) {
  return <div style={{ fontFamily: 'var(--font-sans)', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
      {icon && <Icon name={icon} size={15} />}<span style={{ flex: 1 }}>{label}</span><span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
    </div>
    <div style={{ marginTop: 10, height: 4, borderRadius: 9999, background: 'var(--sand)', overflow: 'hidden' }}><div style={{ width: Math.max(0, Math.min(100, value)) + '%', height: '100%', borderRadius: 9999, background: 'var(--ink)', transition: 'width .9s var(--ease-out)' }} /></div>
    {(you || them) && <div style={{ marginTop: 9, fontSize: 13, color: 'var(--muted-foreground)' }}>You {you} · {themName} {them}</div>}
  </div>;
}
