import React from 'react';
import { Icon } from '../core/Icon.jsx';
const L = { student: 'Verified student', enrollment: 'Enrollment verified' };
export function VerifiedBadge({ variant = 'student', label, onDark = false, style }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px 0 8px', borderRadius: 9999, border: '1px solid ' + (onDark ? 'rgba(255,255,255,.3)' : 'rgba(14,12,11,.2)'), color: onDark ? '#fff' : 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', ...style }}>
    <Icon name={variant === 'enrollment' ? 'graduation-cap' : 'badge-check'} size={13} />
    {label || L[variant]}
  </span>;
}
