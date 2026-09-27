import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function FrostedPill({ children, variant = 'ink', icon, dot, size = 'md', style }) {
  const ink = variant === 'ink';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: size === 'sm' ? 26 : 32, padding: size === 'sm' ? '0 10px' : '0 13px', borderRadius: 9999, background: ink ? 'rgba(14,12,11,.6)' : 'rgba(255,255,255,.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: ink ? '#fff' : 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: size === 'sm' ? 12 : 13, fontWeight: 500, letterSpacing: '-0.005em', whiteSpace: 'nowrap', ...style }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: dot, flex: 'none' }} />}
    {icon && <Icon name={icon} size={13} />}
    {children}
  </span>;
}
