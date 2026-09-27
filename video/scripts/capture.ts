// Screenshots of the public roomme.tech pages for the promo (SPEC FR-8, AC-10, EC-3, EC-4). npm run capture
// Read-only: no login, no form submits, no clicks. Every run overwrites public/captures/ (gitignored: Zillow photos).
// 1920x1080 viewport at deviceScaleFactor 2, so viewport shots are 3840x2160 PNGs.
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {chromium, type Page} from 'playwright-core';

const OUT = join(import.meta.dirname, '../public/captures');
const W = 1920, H = 1080;
// www is canonical (the apex 308s to it). EC-3: the local dev server if both are down.
const BASES = ['https://www.roomme.tech', 'https://roomme.tech', 'http://localhost:3000'];
// 3314 31st Ave APT 2F, an Astoria 2 BR with a Fair price badge. If a price re-pull drops it or its badge,
// the first card of the Astoria 2 BR fair-price filter stands in.
const LISTING = {path: '/listings/2089407413', street: '3314 31st Ave APT 2F'};
const FALLBACK = '/listings?area=Astoria&beds=2&fair=1';
// Every element in its final state (rm-rise, header fades), and no Next dev indicator on the local fallback.
const SETTLE_CSS = '*,*::before,*::after{animation:none!important;transition:none!important}nextjs-portal{display:none!important}';

async function pickBase() {
  for (const b of BASES) {
    const ok = await fetch(b, {signal: AbortSignal.timeout(15_000)}).then(async (r) => r.ok && (await r.text()).includes('RoomMe'), () => false);
    if (ok) return b;
    console.warn(`${b} is down or slow`);
  }
  console.error('roomme.tech is unreachable and nothing serves RoomMe on :3000. Start the local app (web/node_modules is missing in this worktree):\n  npm --prefix ../web install && npm --prefix ../web run dev\nthen run npm run capture again.');
  process.exit(1);
}

// Settles the page, saves the PNG, and logs where the trust badges landed in PNG pixels (scenes zoom them off the page).
async function shot(page: Page, name: string, height = H) {
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');
  await page.addStyleTag({content: SETTLE_CSS});
  await page.evaluate(async () => {
    // Lazy photos load now, not on scroll, so the tall shot has no blank cards. 20 s cap for a stuck photo.
    for (const img of document.images) img.loading = 'eager';
    const decoded = Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    await Promise.race([decoded, new Promise((r) => setTimeout(r, 20_000))]);
    await document.fonts.ready;
  });
  await page.waitForTimeout(800);
  const tall = height > H ? {fullPage: true, clip: {x: 0, y: 0, width: W, height}} : {};
  await page.screenshot({path: join(OUT, name), ...tall});
  const badges = await page.getByRole('status').evaluateAll((els, height) => els.flatMap((e) => {
    const r = e.getBoundingClientRect(); // viewport CSS px; the tall shot is taken at scroll 0, so they hold for it too
    return r.bottom > 0 && r.top < height ? [`${e.textContent} (${Math.round(r.x * 2)},${Math.round(r.y * 2)})`] : [];
  }), height);
  console.log(name + (badges.length ? `  badges at: ${badges.join(', ')}` : ''));
}

// Scrolls the section holding `label` so its top edge sits at viewport y `top` (CSS px), or with 'end' so its bottom
// edge meets the viewport bottom. The browser clamps at the page end.
const frame = (page: Page, label: string, top: number | 'end') => page.locator('section')
  .filter({has: page.getByText(label, {exact: true})})
  .evaluate((el, top) => {
    const r = el.getBoundingClientRect();
    scrollTo(0, scrollY + r.top - (top === 'end' ? innerHeight - r.height : top));
  }, top);

const base = await pickBase();
console.log(`capturing ${base}`);
mkdirSync(OUT, {recursive: true});
const browser = await chromium.launch({channel: 'chrome'});
try {
  const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 2});
  const go = (path: string) => page.goto(base + path, {waitUntil: 'networkidle', timeout: 60_000});

  await go('/');
  await shot(page, 'landing-hero.png');
  // Framed so no text is cut at an edge and the dark header never straddles a light/dark section boundary.
  // The problem: the stats strip above it, the Neighborhoods heading below it out of frame.
  // Why you can trust it: top at 0, so the header sits on its own ink and the tab arrows stay in frame.
  // How it works: where the site's own anchor link lands, under the 72px header.
  const LANDING = [['The problem', 'landing-problem.png', 'end'], ['Why you can trust it', 'landing-trust.png', 0], ['How it works', 'landing-how.png', 72]] as const;
  for (const [label, name, top] of LANDING) {
    await frame(page, label, top);
    await shot(page, name);
  }

  await go('/listings');
  await shot(page, 'listings.png');
  await shot(page, 'listings-tall.png', 3200);

  await go(LISTING.path);
  const found = (await page.getByRole('heading', {level: 1, name: LISTING.street}).count()) && (await page.getByRole('status').filter({hasText: 'Fair price'}).count());
  if (!found) {
    console.warn(`${LISTING.street} is gone or no longer a fair price; using the first card of ${FALLBACK}`);
    await go(FALLBACK);
    await go((await page.locator('a[href^="/listings/"]').first().getAttribute('href'))!);
  }
  console.log(`listing: ${page.url()}  ${await page.locator('h1').textContent()}`);
  await shot(page, 'listing-detail.png');
  // Trust check is the last section: y 444 is just below the sticky price card, and the cut above it falls
  // between two Key information rows (at the page end, 'end' would slice the Beds/baths row).
  await frame(page, 'Trust check', 444);
  await shot(page, 'listing-trust.png');
} finally {
  await browser.close();
}
