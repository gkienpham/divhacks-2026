import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function LinkUnderline({ children, href, onClick, onDark = false, arrow = true, size = 14, style }) {
  const [hov, setHov] = React.useState(false);
  const c = onDark ? '#fff' : 'var(--ink)';
  const line = onDark ? (hov ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.25)') : (hov ? 'var(--ink)' : 'rgba(14,12,11,.25)');
  const Tag = href ? 'a' : 'button';
  return <Tag href={href} type={href ? undefined : 'button'} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} target={href && /^https?:/.test(href) ? '_blank' : undefined} rel={href && /^https?:/.test(href) ? 'noreferrer' : undefined}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 0 7px', background: 'none', border: 0, borderBottom: '1px solid ' + line, color: c, fontFamily: 'var(--font-sans)', fontSize: size, fontWeight: 500, letterSpacing: '-0.01em', textDecoration: 'none', cursor: 'pointer', transition: 'border-color .3s', whiteSpace: 'nowrap', ...style }}>
    <span>{children}</span>
    {arrow && <Icon name="arrow-up-right" size={13} />}
  </Tag>;
}
