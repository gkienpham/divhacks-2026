// Self-check against the real DB. Run from web/:
//   npx tsx --env-file=.env.local --conditions=react-server lib/listings.check.ts
// (react-server makes `server-only` resolve to its empty build.)
import assert from 'node:assert/strict';
import { pool } from './db';
import { getListing, getListingStats, getNeighborhoods, getPriceHistory, listListings } from './listings';

const ZS = 'https://photos.zillowstatic.com/';
async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t = performance.now();
  const r = await fn();
  console.log(`${label}: ${(performance.now() - t).toFixed(0)} ms`);
  return r;
}

async function main() {
  const all = await timed('listListings()', () => listListings());
  assert.equal(all.listings.length, 24);
  const sample = all.listings[0];
  console.log('sample', JSON.stringify(sample, null, 1));
  assert.ok(sample.images.length > 0 && sample.images.every((u) => u.startsWith(ZS)));
  assert.equal(sample.perRoom, Math.round(sample.price / Math.max(sample.beds, 1)));
  assert.ok(!('thumbnail' in sample) && !('total' in sample));
  assert.ok(!Number.isNaN(Date.parse(sample.firstSeen)) && !Number.isNaN(Date.parse(sample.lastSeen)));
  assert.ok(sample.availabilityDate === null || /^\d{4}-\d{2}-\d{2}$/.test(sample.availabilityDate));
  for (const k of ['beds', 'price', 'perRoom'] as const) assert.equal(typeof sample[k], 'number');
  console.log('total', all.total);

  const astoria2 = await timed("listListings({Astoria, '2'})", () => listListings({ neighborhood: 'Astoria', beds: '2' }));
  console.log('Astoria 2br total', astoria2.total);
  assert.ok(astoria2.listings.every((l) => l.neighborhood === 'Astoria' && l.beds === 2));

  const fair = await listListings({ fairOnly: true, minPerRoom: 1500, maxPerRoom: 2000, beds: '3+', pageSize: 100 });
  assert.ok(fair.listings.every((l) => l.trust === 'fair' && l.beds >= 3 && l.perRoom >= 1500 && l.perRoom <= 2000));
  console.log('fair 3+ $1500-2000/room total', fair.total);

  const page2 = await listListings({ page: 2, pageSize: 5 });
  assert.equal(page2.total, all.total);
  assert.equal(page2.listings[0].zpid, (await listListings({ pageSize: 10 })).listings[5].zpid);

  // Trust distribution over everything.
  const dist: Record<string, number> = {};
  for (let page = 1; ; page++) {
    const { listings } = await listListings({ page, pageSize: 100 });
    if (!listings.length) break;
    for (const l of listings) dist[String(l.trust)] = (dist[String(l.trust)] ?? 0) + 1;
  }
  console.log('trust distribution', dist);
  assert.equal(Object.values(dist).reduce((a, b) => a + b, 0), all.total);

  const one = await timed('getListing', () => getListing(sample.zpid));
  assert.deepEqual(one, sample);
  assert.equal(await getListing('nope'), null);
  const unit = all.listings.find((l) => l.zpid.includes(':'));
  if (unit) assert.equal((await getListing(unit.zpid))?.zpid, unit.zpid);

  const hist = await timed('getPriceHistory', () => getPriceHistory(sample.zpid));
  assert.ok(hist.length >= 1 && typeof hist[0].price === 'number' && !Number.isNaN(Date.parse(hist[0].time)));
  console.log('history', hist);

  const stats = await timed('getListingStats', () => getListingStats());
  console.log('stats', stats);
  assert.equal(stats.listings, all.total);

  const areas = await timed('getNeighborhoods', () => getNeighborhoods());
  console.log('neighborhoods', areas.length, 'covers with images', areas.filter((a) => a.cover && a.cover.images.length > 0).length);
  console.log(areas.map((a) => `${a.neighborhood}: ${a.count} listings, median $${a.medianPerRoom}/room, cover ${a.cover?.trust}`).join('\n'));
  assert.equal(stats.neighborhoods, areas.length);
  assert.equal(areas.reduce((n, a) => n + a.count, 0), all.total);
  assert.ok(areas.every((a, i) => i === 0 || areas[i - 1].count >= a.count));
  assert.ok(areas.every((a) => a.cover && a.cover.images.every((u) => u.startsWith(ZS))));
}

main().then(() => console.log('OK'), (e) => { console.error(e); process.exitCode = 1; }).finally(() => pool.end());
