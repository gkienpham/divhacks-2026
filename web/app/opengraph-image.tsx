import { ImageResponse } from 'next/og';
import { WordmarkIcon } from '@/components/rm/brand/Wordmark';

// Link-preview image: the Wordmark lockup on ink. Centered and under 630 wide, so apps that crop to a square keep all of it.
export const alt = 'RoomMe';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// DM Sans 500, only the glyphs in "RoomMe". Built once at deploy; if Google Fonts fails, the default font beats a failed build.
const dmSans = () =>
  fetch('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500&text=RoomMe')
    .then((r) => r.text())
    .then((css) => fetch(css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)![1]))
    .then((r) => r.arrayBuffer())
    .catch(() => null);

export default async function OpengraphImage() {
  const font = await dmSans();
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, background: '#0e0c0b', color: '#fff' }}>
      <WordmarkIcon size={124} color="#fff" />
      <span style={{ fontFamily: 'DM Sans', fontSize: 104, fontWeight: 500, letterSpacing: -2, lineHeight: 1 }}>RoomMe</span>
    </div>,
    { ...size, fonts: font ? [{ name: 'DM Sans', data: font, weight: 500, style: 'normal' }] : undefined },
  );
}
