import React from 'react';
// Stand-in for the design bundle's <image-slot>: a real photo when we have one, else a sand panel.
export function Slot({ src, alt = '', style }) {
  const s = { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style };
  // Zillow's stored "-p_e" photo is ~600px wide; "-p_f" is the 900px variant, sharp enough for 1440 heroes.
  return src
    ? <img src={src.replace(/-p_e\.jpg$/, '-p_f.jpg')} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" style={{ objectFit: 'cover', display: 'block', ...s }} />
    : <div aria-hidden="true" style={{ background: 'var(--sand)', ...s }} />;
}
