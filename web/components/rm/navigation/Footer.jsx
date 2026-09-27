import React from 'react';
import { Icon } from '../core/Icon.jsx';
const DEF = [
  { title: 'Product', links: ['How it works', 'Matches', 'Neighborhoods', 'How scoring works'] },
  { title: 'Help', links: ['FAQ', 'Safety', 'Verification', 'Contact'] },
  { title: 'Company', links: ['About', 'Privacy', 'Fair housing', 'Terms'] },
];
export function Footer({ brand = 'RoomMe', blurb = 'Roommate matching for people new to New York.', email = 'hello@roomme.tech', columns = DEF, image, imageTitle = 'Find the person, then the place.', year = 2026, tagline = 'Matching only. We hand you off to the listing.', legal, brandNode, domain, showCard = true, onLink, style }) {
  return <footer className="rm-on-dark" style={{ background: 'var(--ink)', color: '#fff', fontFamily: 'var(--font-sans)', ...style }}>
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '80px 48px 0', display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', columnGap: 48 }}>
      <div style={{ gridColumn: 'span 3' }}>
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>{brandNode || brand}</div>
        {domain && <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>{domain}</div>}
        <p style={{ margin: '22px 0 0', fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,.55)', maxWidth: 220 }}>{blurb}</p>
        {email && <a href={'mailto:' + email} style={{ display: 'block', marginTop: 26, fontSize: 14, color: '#fff' }}>{email}</a>}
      </div>
      {columns.map(c => <div key={c.title} style={{ gridColumn: 'span 2' }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>{c.title}</div>
        <ul style={{ listStyle: 'none', margin: '26px 0 0', padding: 0, display: 'grid', gap: 16 }}>
          {c.links.map(l => <li key={l}><a href="#" onClick={e => { e.preventDefault(); onLink && onLink(l); }} style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>{l}</a></li>)}
        </ul>
      </div>)}
      {showCard && <div style={{ gridColumn: 'span 3', position: 'relative', height: 228, borderRadius: 21.6, overflow: 'hidden', background: image ? 'center/cover url(' + image + ')' : 'rgba(255,255,255,.08)' }}>
        {!image && <div style={{ position: 'absolute', top: 16, right: 18, fontSize: 11, color: 'rgba(255,255,255,.45)' }}>[NYC photo]</div>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(14,12,11,0) 30%,rgba(14,12,11,.6) 62%,rgba(14,12,11,.85) 100%)' }} />
        <div style={{ position: 'absolute', left: 20, bottom: 20, right: 20, fontSize: 20, fontWeight: 500, lineHeight: 1.12, letterSpacing: '-0.015em' }}>{imageTitle}</div>
      </div>}
    </div>
    <div style={{ maxWidth: 1440, margin: '80px auto 0', padding: '0 48px' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', padding: '28px 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
        <span>{legal || ('© ' + year + ' ' + brand + '. All rights reserved.')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 'none' }}>{tagline}<button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ width: 40, height: 40, borderRadius: 9999, border: '1px solid rgba(255,255,255,.3)', background: 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="arrow-up" size={15} /></button></span>
      </div>
    </div>
  </footer>;
}
