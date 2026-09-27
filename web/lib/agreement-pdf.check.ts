// Self-check, no DB. Run from web/:
//   npx tsx lib/agreement-pdf.check.ts [out-dir]   (writes the sample PDFs there to eyeball)
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { agreementPdf } from './agreement-pdf';
import type { MatchView } from './matches';

const listing = {
  zpid: '1', neighborhood: 'Astoria', address: '2827 46th St APT 3L, Astoria, NY 11103', beds: 2, baths: 1, sqft: 850,
  price: 4500, perRoom: 2250, isBuilding: false, availabilityDate: '2026-10-15', firstSeen: '2026-09-26T15:00:00Z',
  lastSeen: '2026-09-27T15:00:00Z', link: 'https://www.zillow.com/homedetails/2827-46th-St-APT-3L-Astoria-NY-11103/123_zpid/',
  broker: 'Queens Realty', homeType: 'APARTMENT', medianRent: 4300, medianPerRoom: 2150, medianN: 12, trust: 'fair', images: [],
};
const sections = [
  { icon: 'moon', title: 'Quiet hours', text: 'Weeknights 22:00 – 08:00' },
  { icon: 'users', title: 'Guests', text: 'Up to 2 guests a month. Overnight guests about once a week.' },
  { icon: 'wallet', title: 'Bills', text: 'Rent split 50/50 ($2,250 each). Utilities split the same way.' },
];
const match = (over: Partial<MatchView> = {}) => ({
  id: 7, status: 'locked', other: { id: 2, name: 'Amara', synthetic: true }, listing,
  agreement: { sections, open: [{ q: 'Thermostat in winter: what temperature?', resolved: true }], confirmed: [1, 2] }, ...over,
}) as MatchView;
const me = { id: 1, name: 'You' };
const history = [{ time: '2026-09-26T15:00:00Z', price: 4700 }, { time: '2026-09-27T15:00:00Z', price: 4500 }];

const cases: [string, Parameters<typeof agreementPdf>[0]][] = [
  ['locked', { me, m: match(), history }],
  // Non-WinAnsi text (CJK, ✓, emoji), a newline, a draft with no listing: none of it may throw.
  ['draft-no-listing', { me: { id: 1, name: '李雷 ✓' }, m: match({ status: 'mutual', listing: null, agreement: { sections: [{ icon: 'x', title: 'Pets 🐶', text: 'Line one\nline two' }], open: [], confirmed: [] } }), history: [] }],
  // Long edits flow onto more pages; a building "from" price with no median or history.
  ['long', { me, m: match({ listing: { ...listing, isBuilding: true, medianRent: null, medianN: 2, trust: null }, agreement: { sections: Array.from({ length: 8 }, (_, i) => ({ icon: 'x', title: `Rule ${i + 1}`, text: 'Word '.repeat(60) })), open: [], confirmed: [1] } }), history: [] }],
];
async function main() {
  for (const [name, input] of cases) {
    const bytes = await agreementPdf(input);
    const doc = await PDFDocument.load(bytes);
    assert.ok(doc.getPageCount() >= 1 && doc.getTitle()?.startsWith('House agreement'), name);
    assert.equal(doc.getPages().some((p) => !!p.node.Annots()?.size()), !!input.m.listing, `${name}: the listing URL is a link`);
    if (process.argv[2]) writeFileSync(`${process.argv[2]}/${name}.pdf`, bytes);
    console.log(name, doc.getPageCount(), 'page(s),', bytes.length, 'bytes');
  }
  assert.ok((await PDFDocument.load(await agreementPdf(cases[2][1]))).getPageCount() > 1, 'a long agreement spills onto more pages');
  console.log('ok');
}
main();
