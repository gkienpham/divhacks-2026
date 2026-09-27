import React from 'react';
export function Timeline({ items = [], style }) {
  return <div style={{ position: 'relative', fontFamily: 'var(--font-sans)', ...style }}>
    <div style={{ position: 'absolute', left: 4.5, top: 8, bottom: 8, width: 1, background: 'var(--border)' }} />
    {items.map((it, i) => <div key={i} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '10px 120px minmax(0,1fr)', columnGap: 24, padding: i ? '30px 0 0' : 0 }}>
      <span style={{ width: 10, height: 10, marginTop: 5, borderRadius: 9999, background: it.pending ? 'var(--background)' : 'var(--ink)', border: '1px solid var(--ink)' }} />
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingTop: 4 }}>{it.label}</span>
      <div><div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{it.title}</div>{it.text && <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{it.text}</p>}</div>
    </div>)}
  </div>;
}
