import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Field({ label, hint, placeholder, value, defaultValue, onChange, type = 'text', as = 'input', options = [], rows = 4, error, disabled, name, focused = false, style }) {
  const [fc, setFocus] = React.useState(false);
  const focus = fc || focused;
  const border = error ? 'var(--destructive)' : focus ? 'var(--ink)' : 'var(--border)';
  const base = { width: '100%', height: as === 'textarea' ? 'auto' : 48, minHeight: as === 'textarea' ? 112 : undefined, padding: as === 'textarea' ? '14px 16px' : '0 16px', borderRadius: 16.8, border: '1px solid ' + border, background: disabled ? 'var(--muted)' : 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5, outline: 'none', transition: 'border-color .2s', appearance: 'none', WebkitAppearance: 'none', resize: 'vertical', cursor: disabled ? 'not-allowed' : undefined, opacity: disabled ? 0.7 : 1 };
  const ev = { onFocus: () => setFocus(true), onBlur: () => setFocus(false), onChange, disabled, name, value, defaultValue, placeholder };
  let ctrl;
  if (as === 'select') ctrl = <div style={{ position: 'relative' }}><select {...ev} style={{ ...base, paddingRight: 40 }}>{options.map(o => <option key={o}>{o}</option>)}</select><Icon name="chevron-down" size={16} style={{ position: 'absolute', right: 16, top: 16, pointerEvents: 'none', color: 'var(--muted-foreground)' }} /></div>;
  else if (as === 'textarea') ctrl = <textarea rows={rows} {...ev} style={base} />;
  else ctrl = <input type={type} {...ev} style={base} />;
  return <label style={{ display: 'block', fontFamily: 'var(--font-sans)', ...style }}>
    {label && <span style={{ display: 'flex', gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{label}{hint && <span style={{ fontWeight: 400, color: 'var(--muted-foreground)' }}>{hint}</span>}</span>}
    {ctrl}
    {error && <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--destructive)' }}>{error}</span>}
  </label>;
}
