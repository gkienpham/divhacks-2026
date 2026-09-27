import React from 'react';
import { Icon } from '../core/Icon.jsx';
const H = { sm: 40, md: 44, lg: 48 };
export function ButtonInk({ children, size = 'md', arrow = true, icon, href, onClick, disabled, type = 'button', fullWidth, style }) {
  const [hov, setHov] = React.useState(false);
  const h = H[size] || 44;
  const Tag = href ? 'a' : 'button';
  return <Tag href={href} type={href ? undefined : type} onClick={disabled ? undefined : onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    style={{ display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined, alignItems: 'center', justifyContent: 'center', gap: 10, height: h, padding: size === 'sm' ? '0 18px' : '0 22px', borderRadius: 9999, border: 0, background: 'var(--ink)', color: 'var(--background)', fontFamily: 'var(--font-sans)', fontSize: size === 'lg' ? 15 : 14, fontWeight: 500, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : hov ? 0.86 : 1, transition: 'opacity .3s', ...style }}>
    {icon && <Icon name={icon} size={15} />}
    <span>{children}</span>
    {arrow && <Icon name="arrow-right" size={14} style={{ transform: hov && !disabled ? 'translateX(2px)' : 'none', transition: 'transform .3s var(--ease-out)' }} />}
  </Tag>;
}
