import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Chip({ children, active = false, icon, size = 'md', onClick, style }) {
  const [hov, setHov] = React.useState(false);
  const h = size === 'sm' ? 30 : 36;
  return <button type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} aria-pressed={active}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: h, padding: size === 'sm' ? '0 12px' : '0 16px', borderRadius: 9999, border: '1px solid ' + (active ? 'var(--ink)' : hov ? 'rgba(14,12,11,.4)' : 'var(--border)'), background: active ? 'var(--ink)' : 'var(--card)', color: active ? 'var(--background)' : hov ? 'var(--ink)' : 'var(--muted-foreground)', fontFamily: 'var(--font-sans)', fontSize: size === 'sm' ? 12 : 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: onClick ? 'pointer' : 'default', transition: 'border-color .3s, color .3s', ...style }}>
    {icon && <Icon name={icon} size={13} />}
    {children}
  </button>;
}
