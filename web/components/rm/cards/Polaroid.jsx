import React from 'react';
export function Polaroid({ image, placeholder = 'Photo', rotate = -4, width = 200, height = 240, caption, note, notePlacement = 'right', media, style }) {
  const frame = <div style={{ width, padding: '9px 9px 30px', background: '#fff', borderRadius: 4, boxShadow: '0 18px 40px -18px rgba(20,18,14,.45)', transform: 'rotate(' + rotate + 'deg)', flex: 'none' }}>
    <div style={{ position: 'relative', overflow: 'hidden', height, borderRadius: 2, background: image ? 'center/cover url(' + image + ')' : 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)', fontSize: 11 }}>{media || (!image && '[' + placeholder + ']')}</div>
    {caption && <div style={{ marginTop: 8, fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted-foreground)' }}>{caption}</div>}
  </div>;
  if (!note) return <div style={style}>{frame}</div>;
  return <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexDirection: notePlacement === 'left' ? 'row-reverse' : 'row', ...style }}>
    {frame}
    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 26, lineHeight: 1.1, color: 'var(--ink)', transform: 'rotate(-3deg)', maxWidth: 150, marginTop: 8 }}>{note}</div>
  </div>;
}
