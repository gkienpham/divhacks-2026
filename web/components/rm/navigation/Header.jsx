import React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '../core/Icon.jsx';
import { ButtonInk } from '../actions/ButtonInk.jsx';
import { ButtonOnPhoto } from '../actions/ButtonOnPhoto.jsx';
// Nav labels → routes, so every screen's header works without wiring its own handlers.
const ROUTES = { 'How it works': '/#how-it-works', 'Matches': '/matches', 'Listings': '/listings', 'Neighborhoods': '/#neighborhoods', 'Safety': '/#safety', 'FAQ': '/#faq', 'Profile': '/profile' };
export function Header({ variant = 'transparent', items = ['How it works', 'Matches', 'Neighborhoods', 'Safety', 'FAQ'], active, onNavigate, ctaLabel = 'Start matching', onCta, brand = 'RoomMe', onBrand, fixed = false, ctaVariant = 'ink', showSearch = true, showCta = true, right, style }) {
  const router = useRouter();
  const nav = onNavigate || (it => router.push(ROUTES[it] || '/'));
  const brandClick = onBrand || (() => router.push('/'));
  const ctaClick = onCta || (() => router.push('/start'));
  const dark = variant !== 'light';
  const bg = variant === 'scrolled' ? 'rgba(14,12,11,.92)' : variant === 'light' ? 'var(--background)' : 'transparent';
  return <header className={dark ? 'rm-on-dark' : undefined} style={{ position: fixed ? 'fixed' : 'relative', top: 0, left: 0, right: 0, zIndex: 50, height: 72, background: bg, backdropFilter: variant === 'scrolled' ? 'blur(12px)' : undefined, WebkitBackdropFilter: variant === 'scrolled' ? 'blur(12px)' : undefined, transition: 'background-color .4s', fontFamily: 'var(--font-sans)', ...style }}>
    <div style={{ maxWidth: 1440, margin: '0 auto', height: '100%', padding: '0 48px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
      <button type="button" onClick={brandClick} style={{ justifySelf: 'start', background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: dark ? '#fff' : 'var(--ink)' }}>{brand}</button>
      <nav style={{ display: 'flex', gap: 36 }}>
        {items.map(it => { const a = it === active; return <button key={it} type="button" onClick={() => nav(it)} style={{ position: 'relative', background: 'none', border: 0, padding: '6px 0', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: a ? 500 : 400, color: dark ? (a ? '#fff' : 'rgba(255,255,255,.7)') : (a ? 'var(--ink)' : 'var(--muted-foreground)') }}>{it}{a && <span style={{ position: 'absolute', left: '50%', bottom: -6, width: 4, height: 4, marginLeft: -2, borderRadius: 9999, background: dark ? '#fff' : 'var(--ink)' }} />}</button>; })}
      </nav>
      <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 22 }}>
        {showSearch && <button type="button" aria-label="Search listings" onClick={() => router.push('/listings')} style={{ background: 'none', border: 0, padding: 4, cursor: 'pointer', color: dark ? '#fff' : 'var(--ink)' }}><Icon name="search" size={18} /></button>}
        {right}
        {showCta && (ctaVariant === 'onPhoto' ? <ButtonOnPhoto size="md" onClick={ctaClick}>{ctaLabel}</ButtonOnPhoto> : <ButtonInk size="md" onClick={ctaClick}>{ctaLabel}</ButtonInk>)}
      </div>
    </div>
  </header>;
}
