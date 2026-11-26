// Phone captures of the newest ORBIT features (live site, owner Ultra code) for the update video.
// usage: ORBIT_OWNER_KEY=... node update_capture.cjs <outDir> <CA>
const { chromium, devices } = require('playwright');
const fs = require('fs');
const [outDir, ca] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.addInitScript((k) => {
    localStorage.setItem('orbit.install.dismissed', '1');
    localStorage.setItem('orbit.key.v1', k);
    localStorage.setItem('orbit.watch.v1', JSON.stringify([
      { ca: '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump', symbol: 'ANSEM', name: 'ANSEM', added: Date.now() },
      { ca: 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn', symbol: 'PUMP', name: 'Pump', added: Date.now() },
      { ca: 'Dfh5DzRgSvvCFDoYc2ciTkMrbDfRKybA4SoFbPmApump', symbol: 'pippin', name: 'pippin', added: Date.now() },
      { ca: '5EmvWDizkpjAXbcfCcVq69w1id8GaLzi4LLwtuSgpump', symbol: 'Pompom', name: 'Pompom', added: Date.now() },
    ]));
  }, process.env.ORBIT_OWNER_KEY);
  const p = await ctx.newPage();
  const shot = async (sel, name) => {
    const el = p.locator(sel).first();
    if (!(await el.count())) return console.log('missing', sel);
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    await el.screenshot({ path: `${outDir}/${name}.png` });
    console.log('saved', name);
  };
  // coin page
  await p.goto('https://www.orbitonsol.com/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  await p.locator('nav.tabs button').nth(1).click();
  await p.fill('form.search input', ca);
  await p.locator('form.search button').first().click();
  await p.waitForSelector('.chart-wrap canvas', { timeout: 90000 });
  await p.locator('.tf button', { hasText: /^5m$/i }).first().click();
  await p.waitForTimeout(25000);
  await shot('.rugcheck', 'u-rug');
  await shot('.devpanel', 'u-dev');
  await shot('.insiders', 'u-ins');
  await shot('.trade', 'u-trade');
  await shot('.bt', 'u-bt');
  await shot('.read', 'u-read');
  await shot('.chart-wrap', 'u-chart');
  // discover: fresh + watchlist
  await p.locator('nav.tabs button').nth(0).click();
  await p.waitForTimeout(1500);
  await p.locator('.mode-switch button', { hasText: 'Watchlist' }).click();
  await p.waitForTimeout(6000);
  await shot('.watchlist', 'u-watch');
  await p.locator('.mode-switch button', { hasText: 'Fresh' }).click();
  await p.waitForTimeout(20000);
  await shot('.fresh', 'u-fresh');
  // subscribe: telegram + community
  await p.locator('nav.tabs button').last().click();
  await p.waitForTimeout(4000);
  await shot('.tg-card', 'u-tg');
  await shot('.community-card', 'u-community');
  await b.close();
})();
