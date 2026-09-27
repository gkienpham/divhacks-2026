import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function HabitTag({ children, icon, tone = 'default', shared = false, style }) {
  const t = {
    default: { bg: 'var(--card)', bd: 'var(--border)', fg: 'var(--foreground)' },
    active: { bg: 'var(--ink)', bd: 'var(--ink)', fg: 'var(--background)' },
    sand: { bg: 'var(--sand)', bd: 'var(--sand)', fg: 'var(--ink)' },
    onPhoto: { bg: 'rgba(14,12,11,.6)', bd: 'transparent', fg: '#fff' },
  }[tone] || {};
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 11px', borderRadius: 9999, border: '1px solid ' + t.bd, background: t.bg, color: t.fg, backdropFilter: tone === 'onPhoto' ? 'blur(12px)' : undefined, fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', ...style }}>
    {icon && <Icon name={icon} size={12} />}
    {children}
    {shared && <Icon name="check" size={12} title="You share this" />}
  </span>;
}
