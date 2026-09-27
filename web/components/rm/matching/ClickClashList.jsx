import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { AISummaryTag } from '../labels/AISummaryTag.jsx';
export function ClickClashList({ click = [], clash = [], aiWritten = true, style }) {
  const head = t => <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{t}</div>;
  const row = (content, mark, i) => <li key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderTop: '1px solid var(--border)', fontSize: 14, lineHeight: 1.55, color: 'var(--foreground)' }}><span style={{ width: 16, flex: 'none', display: 'flex', justifyContent: 'center', paddingTop: 3 }}>{mark}</span><span>{content}</span></li>;
  return <div style={{ fontFamily: 'var(--font-sans)', ...style }}>
    {aiWritten && <AISummaryTag style={{ marginBottom: 18 }} />}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 48 }}>
      <div>{head("You'll click")}<ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>{click.slice(0, 3).map((c, i) => row(c, <Icon name="check" size={15} color="var(--ink)" />, i))}</ul></div>
      <div>{head("You'll clash")}<ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>{clash.slice(0, 2).map((c, i) => row(c, <span aria-hidden="true" style={{ width: 7, height: 7, marginTop: 4, borderRadius: 9999, background: 'var(--watch)' }} />, i))}</ul></div>
    </div>
  </div>;
}
