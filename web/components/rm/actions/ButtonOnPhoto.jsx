import React from 'react';
import { Icon } from '../core/Icon.jsx';
const H = { sm: 40, md: 44, lg: 48 };
export function ButtonOnPhoto({ children, size = 'lg', arrow = true, icon, href, onClick, disabled, style }) {
  const [hov, setHov] = React.useState(false);
  const Tag = href ? 'a' : 'button';
  return <Tag href={href} type={href ? undefined : 'button'} onClick={disabled ? undefined : onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: H[size] || 48, padding: size === 'sm' ? '0 18px' : '0 24px', borderRadius: 9999, border: 0, background: hov ? 'var(--background)' : 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: size === 'lg' ? 15 : 14, fontWeight: 500, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'background-color .3s', ...style }}>
    {icon && <Icon name={icon} size={15} />}
    <span>{children}</span>
    {arrow && <Icon name="arrow-right" size={14} style={{ transform: hov ? 'translateX(2px)' : 'none', transition: 'transform .3s var(--ease-out)' }} />}
  </Tag>;
}
