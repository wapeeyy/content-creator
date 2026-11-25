// Daily X content: open each coin on the live ORBIT site (owner Ultra code), capture the chart and the ORBIT Read.
// usage: node daily_capture.cjs <outDir> <tf> <CA> [CA...]   (owner code read from ORBIT_OWNER_KEY)
const { chromium } = require('playwright');
const fs = require('fs');
const [outDir, tf, ...cas] = process.argv.slice(2);
const KEY = process.env.ORBIT_OWNER_KEY;
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const result = [];
  for (const ca of cas) {
    const c = await b.newContext({ viewport: { width: Number(process.env.VW || 980), height: 1400 }, deviceScaleFactor: 2 });
    await c.addInitScript((k) => {
      localStorage.setItem('orbit.install.dismissed', '1');
      localStorage.setItem('orbit.key.v1', k);
    }, KEY);
    const p = await c.newPage();
    await p.goto('https://www.orbitonsol.com/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(2500);
    await p.locator('nav.tabs button').nth(1).click();
    await p.fill('form.search input', ca);
    await p.locator('form.search button').first().click();
    await p.waitForSelector('.chart-wrap canvas', { timeout: 60000 });
    await p.waitForTimeout(2500);
    if (tf !== '15m') {
      await p.locator('.tf button', { hasText: new RegExp(`^${tf}$`, 'i') }).first().click();
      await p.waitForTimeout(3500);
    }
    // clean chart for marketing: no whale emoji markers, no RSI pane
    for (const name of (process.env.OFF || 'Whales,RSI').split(',')) {
      const btn = p.locator('.layers button', { hasText: name }).first();
      if ((await btn.getAttribute('class'))?.includes('on')) await btn.click();
    }
    await p.waitForTimeout(1500);
    const sym = (await p.locator('.sym').first().textContent().catch(() => '')).replace('$', '').trim();
    const read = await p.evaluate(() => {
      const r = document.querySelector('.read');
      if (!r) return null;
      const t = (s) => r.querySelector(s)?.textContent?.trim() ?? '';
      return {
        bias: t('.read-bias'),
        score: r.querySelector('.read-meter-ends span:nth-child(2)')?.textContent?.trim() ?? '',
        levels: [...r.querySelectorAll('.levels li')].map((li) => [...li.children].map((x) => x.textContent.trim())),
        why: [...r.querySelectorAll('.why:not(.watch) li')].map((x) => x.textContent.trim()),
        watch: [...r.querySelectorAll('.why.watch li')].map((x) => x.textContent.trim()),
      };
    });
    const mtf = await p.evaluate(() =>
      [...document.querySelectorAll('.mtf-cells')].map((row) => [...row.children].map((x) => x.textContent.trim())),
    );
    const file = `${outDir}/${sym || ca.slice(0, 6)}-${tf}.png`;
    await p.locator('.chart-wrap').screenshot({ path: file });
    result.push({ ca, sym, tf, chart: file, read, mtf });
    console.log(sym, read?.bias, read?.score);
    await c.close();
  }
  fs.writeFileSync(`${outDir}/reads-${tf}.json`, JSON.stringify(result, null, 1));
  await b.close();
})();
