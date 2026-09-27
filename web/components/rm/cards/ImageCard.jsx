import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function ImageCard({ image, placeholder = 'Photo', title, subtitle, meta, pill, tags, height = 420, width, radius = 21.6, onClick, href, children, forceHover = false, media, titleSize = 22, style }) {
  const [h, setHov] = React.useState(false);
  const hov = h || forceHover;
  const Tag = href ? 'a' : 'div';
  return <Tag href={href} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    style={{ position: 'relative', display: 'block', width: width || '100%', height, borderRadius: radius, overflow: 'hidden', background: 'var(--sand)', cursor: onClick || href ? 'pointer' : 'default', color: '#fff', textDecoration: 'none', isolation: 'isolate', ...style }}>
    <div style={{ position: 'absolute', inset: 0, transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform .9s var(--ease-out)', background: image ? 'center/cover no-repeat url(' + image + ')' : 'var(--sand)' }}>
      {media}
      {!image && !media && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)', fontSize: 12, letterSpacing: '0.02em', paddingBottom: '22%' }}>[{placeholder}]</div>}
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(14,12,11,0) 30%,rgba(14,12,11,.6) 62%,rgba(14,12,11,.85) 100%)', pointerEvents: 'none' }} />
    {pill && <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{pill}</div>}
    <div style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 9999, background: '#fff', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hov ? 1 : 0, transform: hov ? 'none' : 'translateY(4px)', transition: 'opacity .3s, transform .3s var(--ease-out)', pointerEvents: 'none' }}><Icon name="arrow-up-right" size={16} /></div>
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 20, fontFamily: 'var(--font-sans)', pointerEvents: 'none' }}>
      {title && <div style={{ fontSize: titleSize, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.15 }}>{title}</div>}
      {subtitle && <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 5 }}>{subtitle}</div>}
      {meta && <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 14, lineHeight: 1.4 }}>{meta}</div>}
      {tags && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>{tags}</div>}
      {children}
    </div>
  </Tag>;
}
