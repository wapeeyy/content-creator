// Phone captures from the live ORBIT site for the promo / explainer video.
// usage: ORBIT_OWNER_KEY=... DEMO_SEED=<json DemoState> node explainer_capture.cjs <outDir> <CA>
const { chromium, devices } = require('playwright');
const [outDir, ca] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const shooter = (p) => async (sel, name, opts = {}) => {
    const el = p.locator(sel).first();
    if (!(await el.count())) return console.log('missing', sel);
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await el.screenshot({ path: `${outDir}/${name}.png`, ...opts });
    console.log('saved', name);
  };

  // 1. a first-time visitor: hero, free trial, plan cards
  {
    const ctx = await b.newContext({ ...devices['iPhone 13'] });
    await ctx.addInitScript(() => localStorage.setItem('orbit.install.dismissed', '1'));
    const p = await ctx.newPage();
    const shot = shooter(p);
    await p.goto('https://www.orbitonsol.com/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(6000);
    await p.screenshot({ path: `${outDir}/e-home.png` });
    console.log('saved e-home');
    await p.locator('nav.tabs button').last().click();
    await p.waitForTimeout(4000);
    await shot('.trial-card', 'e-trial');
    await shot('.plans-wrap', 'e-plans');
    await ctx.close();
  }

  // 2. an Ultra account (owner code) with a demo portfolio
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.addInitScript(([k, demo]) => {
    localStorage.setItem('orbit.install.dismissed', '1');
    localStorage.setItem('orbit.key.v1', k);
    if (demo) localStorage.setItem('orbit.demo.v1', demo);
  }, [process.env.ORBIT_OWNER_KEY, process.env.DEMO_SEED || '']);
  const p = await ctx.newPage();
  const shot = shooter(p);
  await p.goto('https://www.orbitonsol.com/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(8000);
  await shot('.market, .table-wrap', 'e-discover');
  await p.screenshot({ path: `${outDir}/e-discover-full.png` });
  for (const [m, name] of [['ORBIT picks', 'e-picks'], ['Scalp', 'e-signals']]) {
    const btn = p.locator('.mode-switch button', { hasText: m }).first();
    if (await btn.count()) {
      await btn.click();
      await p.waitForTimeout(9000);
      await p.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
      console.log('saved', name);
    }
  }
  // demo tab
  await p.locator('nav.tabs button', { hasText: /demo/i }).first().click();
  await p.waitForTimeout(9000);
  await p.screenshot({ path: `${outDir}/e-demo.png` });
  console.log('saved e-demo');
  // coin page
  await p.locator('nav.tabs button').nth(1).click();
  await p.fill('form.search input', ca);
  await p.locator('form.search button').first().click();
  await p.waitForSelector('.chart-wrap canvas', { timeout: 90000 });
  await p.waitForTimeout(25000);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: `${outDir}/e-coin.png` });
  console.log('saved e-coin');
  await shot('.chart-wrap', 'e-chart');
  await shot('.read', 'e-read');
  await shot('.safety', 'e-safety');
  await shot('.rugcheck', 'e-rug');
  await shot('.devpanel', 'e-dev');
  await shot('.demo-box', 'e-demobuy');
  await shot('.whales', 'e-whales');
  await shot('.mtf', 'e-mtf');
  await shot('.insiders', 'e-ins');
  await shot('.trade', 'e-trade');
  await b.close();
})();
