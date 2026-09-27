import React from 'react';
import { Icon } from '../core/Icon.jsx';
const H = { sm: 40, md: 44, lg: 48 };
export function ButtonOutline({ children, size = 'md', arrow = true, icon, onDark = false, href, onClick, disabled, style }) {
  const [hov, setHov] = React.useState(false);
  const Tag = href ? 'a' : 'button';
  const border = onDark ? (hov ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.3)') : (hov ? 'var(--ink)' : 'rgba(14,12,11,.2)');
  return <Tag href={href} type={href ? undefined : 'button'} onClick={disabled ? undefined : onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: H[size] || 44, padding: size === 'sm' ? '0 18px' : '0 22px', borderRadius: 9999, border: '1px solid ' + border, background: 'transparent', color: onDark ? '#fff' : 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: size === 'lg' ? 15 : 14, fontWeight: 500, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, transition: 'border-color .3s', ...style }}>
    {icon && <Icon name={icon} size={15} />}
    <span>{children}</span>
    {arrow && <Icon name="arrow-right" size={14} />}
  </Tag>;
}
