// The House Agreement as a real PDF (GET /api/matches/[id]/pdf): the saved agreement, open questions, a rough rent
// overview from the pair's listing, and who confirmed. Standard Helvetica, so text is WinAnsi: other characters print as "?".
import { PDFDocument, PDFString, StandardFonts, rgb, type Color, type PDFFont } from 'pdf-lib';
import { bedsLabel, day, seenOn, usd } from './format';
import type { MatchView } from './matches';

const hex = (h: string) => rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4), 16) / 255);
const INK = hex('0e0c0b'), MUTED = hex('6e6a65'), BRAND = hex('3d7096'), LINE = hex('dddbd7');
// TrustBadge's dots and labels.
const TRUST = { fair: [hex('4a7c59'), 'Fair price'], above: [hex('b7791f'), 'Above median'], check: [hex('e40014'), 'Check before paying'] } as const;
const W = 612, H = 792, M = 54, CW = W - 2 * M, LABEL = 140, BOTTOM = 84; // US Letter, 0.75 in margins, footer below BOTTOM
const NOTE = 'RoomMe isn’t a broker and doesn’t hold deposits. Never pay anyone before you’ve seen the apartment and signed a lease. This agreement is between roommates; it isn’t a lease.';

export interface AgreementPdfInput {
  me: { id: number; name: string };
  m: MatchView; // needs m.agreement
  history: { time: string; price: number }[]; // the listing's price snapshots, oldest first
  now?: Date;
}

export async function agreementPdf({ me, m, history, now = new Date() }: AgreementPdfInput): Promise<Uint8Array> {
  const a = m.agreement!, l = m.listing, them = m.other;
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ok = new Set(reg.getCharacterSet());
  const clean = (s: string) => [...s.replace(/\p{Cf}/gu, '').replace(/[^\S\u00a0]+/g, ' ')].map((c) => (ok.has(c.codePointAt(0)!) ? c : '?')).join('');
  // Greedy word wrap on plain spaces, so seenOn's "Sep\u00a026" stays together. A word wider than the line (a URL) is cut.
  const wrap = (s: string, size: number, width: number, font: PDFFont = reg) => {
    const lines: string[] = [], fits = (t: string) => font.widthOfTextAtSize(t, size) <= width;
    for (let w of clean(s).split(' ')) {
      const next = lines.length ? `${lines[lines.length - 1]} ${w}` : w;
      if (lines.length && fits(next)) { lines[lines.length - 1] = next; continue; }
      while (!fits(w)) {
        let i = w.length - 1;
        while (i > 1 && !fits(w.slice(0, i))) i--;
        lines.push(w.slice(0, i));
        w = w.slice(i);
      }
      lines.push(w);
    }
    return lines;
  };

  let page = doc.addPage([W, H]), y = H - M; // y: top of the next block
  const need = (h: number) => { if (y - h < BOTTOM) { page = doc.addPage([W, H]); y = H - M; } };
  const draw = (s: string, x: number, size: number, font: PDFFont = reg, color: Color = INK, at = y) =>
    page.drawText(clean(s), { x, y: at, size, font, color });
  const rule = (color = LINE, thickness = 0.5) => page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness, color });
  const heading = (s: string) => { need(64); y -= 34; draw(s, M, 13, bold); y -= 9; rule(INK, 0.75); };
  // Muted label on the left, wrapped value on the right, hairline under. href makes the value a link.
  const row = (label: string, value: string, dot?: Color, href?: string) => {
    const labels = wrap(label, 9.5, LABEL - 12), lines = wrap(value, 11, CW - LABEL - (dot ? 13 : 0));
    const n = Math.max(labels.length, lines.length);
    need(n * 15 + 12);
    y -= 16;
    labels.forEach((s, i) => draw(s, M, 9.5, reg, MUTED, y - i * 15));
    if (dot) page.drawCircle({ x: M + LABEL + 3, y: y + 3.5, size: 3, color: dot });
    lines.forEach((s, i) => draw(s, M + LABEL + (dot ? 13 : 0), 11, reg, INK, y - i * 15));
    const top = y + 12;
    y -= (n - 1) * 15 + 9;
    rule();
    if (href) page.node.addAnnot(doc.context.register(doc.context.obj({
      Type: 'Annot', Subtype: 'Link', Rect: [M + LABEL, y, W - M, top], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(href) },
    })));
  };

  // Header
  draw('RoomMe', M, 13, bold, INK, y - 13);
  draw('roomme.tech', W - M - reg.widthOfTextAtSize('roomme.tech', 9), 9, reg, MUTED, y - 12);
  y -= 58;
  draw(m.status === 'locked' ? 'HOUSE AGREEMENT' : 'HOUSE AGREEMENT · DRAFT', M, 8.5, bold, BRAND);
  for (const s of wrap(`${them.name} & ${me.name}`, 28, CW, bold)) { y -= 32; draw(s, M, 28, bold); }
  const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
  y -= 22;
  draw([l && `${bedsLabel(l.beds)} in ${l.neighborhood}`, `Generated ${date}`].filter(Boolean).join(' · '), M, 11, reg, MUTED);

  heading('What you agreed');
  for (const s of a.sections) row(s.title, s.text);

  if (a.open.length) {
    heading('Open questions');
    for (const o of a.open) row(o.resolved ? 'Resolved' : 'Still open', o.q, TRUST[o.resolved ? 'fair' : 'above'][0]);
  }

  need(172); // the confirmations and signature lines stay on one page
  heading('Confirmed');
  for (const [p, name] of [[me.id, me.name], [them.id, them.synthetic ? `${them.name} (sample profile)` : them.name]] as const)
    row(name, a.confirmed.includes(p) ? 'Confirmed in RoomMe' : 'Not confirmed yet');
  y -= 64;
  const half = CW / 2 - 14;
  [me.name, them.name].forEach((n, i) => {
    const x = M + i * (half + 28);
    page.drawLine({ start: { x, y }, end: { x: x + half - 72, y }, thickness: 0.75, color: INK });
    page.drawLine({ start: { x: x + half - 60, y }, end: { x: x + half, y }, thickness: 0.75, color: INK });
    draw(`${n}, signature`, x, 8.5, reg, MUTED, y - 12);
    draw('Date', x + half - 60, 8.5, reg, MUTED, y - 12);
  });
  y -= 12;

  if (l) {
    const from = l.isBuilding ? 'from ' : '', each = l.price / 2;
    need(390); // about the whole overview, so it starts on a new page rather than splitting
    heading('Rent overview');
    row('Address', l.address);
    row('Unit', [bedsLabel(l.beds), l.baths && `${l.baths} bath`, l.sqft && `${l.sqft.toLocaleString('en-US')} sq ft`].filter(Boolean).join(' · '));
    if (l.availabilityDate) row('Available', day(l.availabilityDate));
    row('Monthly rent', `${from}${usd(l.price)}/mo`);
    row('Each pays (50/50)', `${from}${usd(each)}/mo`);
    if (l.medianRent && l.medianN) {
      const pct = Math.round((l.price / l.medianRent - 1) * 100);
      const vs = pct ? `This one is ${Math.abs(pct)}% ${pct < 0 ? 'below' : 'above'}` : 'This one is right at it';
      const [dot, label] = l.trust ? TRUST[l.trust] : [undefined, ''];
      row('Area median', `${usd(l.medianRent)}/mo for a ${bedsLabel(l.beds)} in ${l.neighborhood} (${l.medianN} listings). ${vs}${label && `: ${label.toLowerCase()}`}.`, dot);
    } else row('Area median', `Too few ${bedsLabel(l.beds)} listings in ${l.neighborhood} to compare.`);
    const first = history[0], last = history[history.length - 1];
    if (first && last) {
      const d = last.price - first.price;
      row('Price history', d ? `${d < 0 ? 'Down' : 'Up'} ${usd(Math.abs(d))} since ${seenOn(first.time)} (was ${usd(first.price)})` : `No change seen since ${seenOn(first.time)}`);
    }
    row('Move-in cash', `${l.isBuilding ? 'From' : 'About'} ${usd(each * 2)} each: first month plus a security deposit, which NY law caps at one month’s rent.`);
    row('Fees', 'No broker fee when the landlord hired the broker (NYC FARE Act). Application fees are capped at $20.');
    if (l.broker) row('Listed by', l.broker.replace(/^Listing by:\s*/, ''));
    row('Listing', l.link, undefined, l.link);
  }

  const pages = doc.getPages();
  pages.forEach((p, i) => {
    wrap(NOTE, 8, CW - 60).forEach((s, j) => p.drawText(s, { x: M, y: 44 - j * 11, size: 8, font: reg, color: MUTED }));
    const n = `${i + 1} / ${pages.length}`;
    p.drawText(n, { x: W - M - reg.widthOfTextAtSize(n, 8), y: 44, size: 8, font: reg, color: MUTED });
  });
  doc.setTitle(clean(`House agreement · ${them.name} & ${me.name}`));
  doc.setCreator('RoomMe');
  doc.setProducer('RoomMe');
  doc.setCreationDate(now);
  return doc.save();
}
