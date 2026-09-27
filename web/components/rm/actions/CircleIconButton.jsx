import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function CircleIconButton({ icon = 'arrow-right', size = 44, onDark = false, filled = false, disabled = false, label, onClick, style }) {
  const [hov, setHov] = React.useState(false);
  const border = filled ? (onDark ? '#fff' : 'var(--ink)') : onDark ? (hov ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.3)') : (hov ? 'var(--ink)' : 'rgba(14,12,11,.2)');
  const bg = filled ? (onDark ? '#fff' : 'var(--ink)') : 'transparent';
  const fg = filled ? (onDark ? 'var(--ink)' : 'var(--background)') : onDark ? '#fff' : 'var(--ink)';
  return <button type="button" aria-label={label || icon} onClick={disabled ? undefined : onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    style={{ width: size, height: size, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9999, border: '1px solid ' + border, background: bg, color: fg, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, padding: 0, transition: 'border-color .3s, background-color .3s', ...style }}>
    <Icon name={icon} size={size >= 56 ? 20 : size >= 44 ? 16 : 14} />
  </button>;
}
