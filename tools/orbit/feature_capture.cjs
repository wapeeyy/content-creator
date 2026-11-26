// Feature panels from the live ORBIT site (owner Ultra code): quick safety check, whale list, ORBIT Read.
// usage: ORBIT_OWNER_KEY=... node feature_capture.cjs <outDir> <CA>
const { chromium } = require('playwright');
const [outDir, ca] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 520, height: 1400 }, deviceScaleFactor: 2 });
  await c.addInitScript((k) => {
    localStorage.setItem('orbit.install.dismissed', '1');
    localStorage.setItem('orbit.key.v1', k);
  }, process.env.ORBIT_OWNER_KEY);
  const p = await c.newPage();
  await p.goto('https://www.orbitonsol.com/?ca=' + ca, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.chart-wrap canvas', { timeout: 90000 });
  await p.waitForTimeout(12000);
  for (const [sel, name] of [['.safety', 'rug'], ['.whales', 'whales'], ['.read', 'read']]) {
    const el = p.locator(sel).first();
    if (await el.count()) {
      await el.scrollIntoViewIfNeeded();
      await p.waitForTimeout(800);
      await el.screenshot({ path: `${outDir}/feat-${name}.png` });
      console.log('saved', name);
    } else console.log('missing', name);
  }
  await b.close();
})();
