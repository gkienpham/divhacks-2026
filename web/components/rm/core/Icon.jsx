import React from 'react';
import { ICONS } from './iconData.js';
export function Icon({ name, size = 16, strokeWidth = 1.75, color = 'currentColor', style, title }) {
  const d = ICONS[name];
  if (!d) return null;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block', ...style }} aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined} dangerouslySetInnerHTML={{ __html: (title ? '<title>' + title + '</title>' : '') + d }} />;
}
export const ICON_NAMES = Object.keys(ICONS);
