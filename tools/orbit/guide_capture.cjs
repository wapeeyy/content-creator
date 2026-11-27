// Screens from the live ORBIT site for the A–Z guide video and the PDF user guide (iPhone 13).
// usage: ORBIT_OWNER_KEY=... DEMO_SEED=<json> TPSL_SEED=<json> node guide_capture.cjs <outDir>
// Telegram settings are shown with "Whales on all pairs" on (the GET is mocked, saves are blocked: nothing changes).
const { chromium, devices } = require('playwright');
const [outDir] = process.argv.slice(2);
const CA = 'Ai66LHZG9MCzg1WKdawwqduVAXpNDUuV8M3uyq5ppump';
(async () => {
  const b = await chromium.launch();
  const shot = (p) => async (sel, name) => {
    const el = p.locator(sel).first();
    if (!(await el.count())) return console.log('missing', sel);
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
    await el.screenshot({ path: `${outDir}/${name}.png` });
    console.log('saved', name);
  };
  const screen = async (p, name) => {
    await p.screenshot({ path: `${outDir}/${name}.png` });
    console.log('saved', name);
  };

  // first-time visitor: home, plans
  {
    const c = await b.newContext({ ...devices['iPhone 13'] });
    await c.addInitScript(() => localStorage.setItem('orbit.install.dismissed', '1'));
    const p = await c.newPage();
    await p.goto('https://www.orbitonsol.com/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(6000);
    await screen(p, 'g-home-free');
    await p.locator('nav.tabs button').last().click();
    await p.waitForTimeout(4000);
    await shot(p)('.trial-card', 'g-trial');
    await shot(p)('.plans-wrap', 'g-plans');
    await c.close();
  }

  const c = await b.newContext({ ...devices['iPhone 13'] });
  await c.addInitScript(([k, d, t]) => {
    localStorage.setItem('orbit.install.dismissed', '1');
    localStorage.setItem('orbit.key.v1', k);
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('orbit.demo.v1', d);
      localStorage.setItem('orbit.demo.tpsl.v1', t);
      sessionStorage.setItem('seeded', '1');
    }
  }, [process.env.ORBIT_OWNER_KEY, process.env.DEMO_SEED, process.env.TPSL_SEED]);
  await c.route('**/api/tg', (r) =>
    r.request().method() === 'GET'
      ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ready: true, connected: true, link: 'https://t.me/OrbitOnSolBot', prefs: { whales: true, buying: true, wallets: true, picks: true, allWhales: true, verifiedOnly: true, minWhale: 2000 }, ultraGroup: null, channel: 'https://t.me/orbitonsol' }) })
      : r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  const p = await c.newPage();
  const s = shot(p);
  await p.goto('https://www.orbitonsol.com/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(7000);
  await screen(p, 'g-discover');
  const mode = async (label) => {
    for (let i = 0; i < 4 && !(await p.locator('.mode-switch button.on', { hasText: label }).count()); i++) {
      await p.locator('.mode-switch button', { hasText: label }).first().click({ force: true });
      await p.waitForTimeout(2500);
    }
  };
  await mode('ORBIT picks');
  await p.waitForTimeout(8000);
  await s('.discover-head', 'g-picks-head');
  await s('.coin.pass', 'g-picks-card');
  await p.locator('.views button:visible', { hasText: 'All (' }).first().click().catch(() => {});
  await p.waitForTimeout(1500);
  await s('.coin.fail:visible', 'g-picks-fail');
  await mode('Scalp');
  await p.waitForTimeout(8000);
  await screen(p, 'g-signals');

  // coin page: the 4 views
  await p.goto('https://www.orbitonsol.com/?ca=' + CA, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.chart-wrap canvas', { timeout: 90000 });
  await p.waitForTimeout(12000);
  await screen(p, 'g-chart');
  await s('.chart-card', 'g-chart-card');
  await s('.demo-pos', 'g-demo-pos');
  await s('.alerts, .alert-box, .alertbox', 'g-alerts');
  await p.evaluate(() => document.getElementById('coin-top')?.scrollIntoView({ block: 'start' }));
  for (const [label, name] of [['Chart+Txns', 'g-both'], ['Txns', 'g-txns'], ['Info', 'g-info']]) {
    await p.locator('.coin-bar button', { hasText: new RegExp('^' + label.replace('+', '\\+') + '$') }).click();
    await p.waitForTimeout(name === 'g-info' ? 6000 : 9000);
    await screen(p, name);
  }
  await s('.safety', 'g-safety');
  await p.locator('.coin-bar button', { hasText: /^Chart$/ }).click();
  await p.waitForTimeout(6000);
  await p.locator('.chart-src button', { hasText: 'DexScreener' }).click();
  await p.frameLocator('.dex-embed iframe').locator('canvas').first().waitFor({ timeout: 40000 }).catch(() => console.log('dex slow'));
  await p.waitForTimeout(5000);
  await s('.chart-card', 'g-dex');

  // demo tab
  await p.locator('nav.tabs button', { hasText: /demo/i }).first().click();
  await p.waitForTimeout(7000);
  await s('.card.plan', 'g-demo-balance');
  await s('.demo-stats', 'g-demo-stats');
  await s('.card:has(h3:text("Buy (demo)"))', 'g-demo-buy');
  await s('.positions', 'g-demo-positions');
  await s('.demo-reset', 'g-demo-reset');

  // Pro tab: Telegram card
  await p.locator('nav.tabs button').last().click();
  await p.waitForTimeout(5000);
  await s('.tg-card', 'g-tg-card');
  await s('.tg-prefs', 'g-tg-prefs');
  await b.close();
})();
