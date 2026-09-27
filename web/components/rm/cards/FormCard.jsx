import React from 'react';
export function FormCard({ title, description, children, footer, padding = 40, stickyFooter = false, style }) {
  return <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding, fontFamily: 'var(--font-sans)', ...style }}>
    {title && <h3 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.15, color: 'var(--ink)' }}>{title}</h3>}
    {description && <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{description}</p>}
    <div style={{ marginTop: title || description ? 28 : 0 }}>{children}</div>
    {footer && !stickyFooter && <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>{footer}</div>}
    {footer && stickyFooter && <div style={{ position: 'sticky', bottom: 0, zIndex: 5, margin: '20px ' + (-padding) + 'px ' + (-padding) + 'px', padding: '14px ' + padding + 'px', background: 'var(--card)', borderTop: '1px solid var(--border)', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>{footer}</div>}
  </div>;
}
