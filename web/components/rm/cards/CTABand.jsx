import React from 'react';
import { Eyebrow } from '../labels/Eyebrow.jsx';
export function CTABand({ eyebrow, title, lead, actions, image, minHeight = 460, style }) {
  return <section className="rm-on-dark" style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'var(--ink)', color: '#fff', minHeight, padding: '88px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'var(--font-sans)', isolation: 'isolate', ...style }}>
    {image && <div style={{ position: 'absolute', inset: 0, zIndex: -2, background: 'center/cover no-repeat url(' + image + ')' }} />}
    {image && <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'linear-gradient(90deg,rgba(14,12,11,.92) 0%,rgba(14,12,11,.7) 50%,rgba(14,12,11,.45) 100%)' }} />}
    <div style={{ maxWidth: 640 }}>
      {eyebrow && <Eyebrow onDark>{eyebrow}</Eyebrow>}
      {title && <h2 style={{ margin: eyebrow ? '26px 0 0' : 0, fontSize: 60, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.03em' }}>{title}</h2>}
      {lead && <p style={{ margin: '24px 0 0', fontSize: 15, lineHeight: 1.625, color: 'rgba(255,255,255,.75)', maxWidth: 460 }}>{lead}</p>}
      {actions && <div style={{ display: 'flex', gap: 10, marginTop: 36, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  </section>;
}
