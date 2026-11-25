// Phone captures of the live app for promo videos: one coin page (owner Ultra) + the Subscribe page as a new visitor.
// usage: ORBIT_OWNER_KEY=... node promo_capture.cjs <outDir> <CA> <tf>
const { chromium, devices } = require('playwright');
const fs = require('fs');
const [outDir, ca, tf = '1h'] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const pos = {};
  // 1. coin page with Ultra
  let c = await b.newContext({ ...devices['iPhone 13'] });
  await c.addInitScript((k) => {
    localStorage.setItem('orbit.install.dismissed', '1');
    localStorage.setItem('orbit.key.v1', k);
  }, process.env.ORBIT_OWNER_KEY);
  let p = await c.newPage();
  await p.goto('https://www.orbitonsol.com/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  await p.locator('nav.tabs button').nth(1).click();
  await p.fill('form.search input', ca);
  await p.locator('form.search button').first().click();
  await p.waitForSelector('.chart-wrap canvas', { timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.locator('.tf button', { hasText: new RegExp(`^${tf}$`, 'i') }).first().click();
  await p.waitForTimeout(3000);
  await p.waitForSelector('.mtf-cells', { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(6000); // let the multi-timeframe rows and whale list finish
  for (const s of ['.chart-card', '.chart-wrap', '.read', '.mtf', '.alerts', '.whales', '.insights']) {
    const bb = await p.locator(s).first().boundingBox().catch(() => null);
    pos[s] = bb ? Math.round(bb.y + (await p.evaluate(() => window.scrollY))) : null;
  }
  await p.screenshot({ path: `${outDir}/promo-coin.png`, fullPage: true });
  await c.close();
  // 2. Subscribe page as a brand-new visitor (trial card + plans)
  c = await b.newContext({ ...devices['iPhone 13'] });
  await c.addInitScript(() => localStorage.setItem('orbit.install.dismissed', '1'));
  p = await c.newPage();
  await p.goto('https://www.orbitonsol.com/?tab=sub', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.trial-card', { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(2000);
  for (const s of ['.trial-card', '.plans-wrap', '.tier-ultra', '.tier-pro']) {
    const bb = await p.locator(s).first().boundingBox().catch(() => null);
    pos['sub' + s] = bb ? Math.round(bb.y + (await p.evaluate(() => window.scrollY))) : null;
  }
  await p.screenshot({ path: `${outDir}/promo-sub.png`, fullPage: true });
  await c.close();
  fs.writeFileSync(`${outDir}/promo-pos.json`, JSON.stringify(pos, null, 1));
  console.log(JSON.stringify(pos));
  await b.close();
})();
