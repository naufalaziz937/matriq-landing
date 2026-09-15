const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

// Uses synthetic API responses; never reads or writes real user data.
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext();
  const user = { user_id: 999, nama: 'Pengguna Uji', email: 'layout@example.test', role: 2, is_activate: true, profile: { kelas: 'Kelas 12', sekolah: 'Sekolah Uji' } };
  await context.addInitScript((user) => {
    localStorage.setItem('token', 'layout-test');
    localStorage.setItem('user', JSON.stringify(user));
  }, user);
  let role = 2;
  await context.route((url) => url.pathname.startsWith('/api/'), (route) => {
    const url = route.request().url();
    return route.fulfill({ json: { success: true, data: url.endsWith('/auth/me') ? { ...user, role } : url.endsWith('/dashboard') ? {} : [] } });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (/hydration|Failed to resolve component/i.test(msg.text())) errors.push(msg.text());
  });
  const base = process.env.BASE_URL || 'http://127.0.0.1:3210';
  const sidebar = page.locator('[data-purpose="navigation-sidebar"]');
  const topbar = page.locator('[data-purpose="top-navigation"]');
  const output = path.join(__dirname, '..', '.artifacts', 'layout');
  fs.mkdirSync(output, { recursive: true });
  try {
    for (const width of (process.env.SKIP_VIEWPORTS ? [] : [360, 390, 768, 1024, 1440, 1920])) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/dashboard', '/profile']) {
        await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await sidebar.locator('nav button').first().waitFor();
        assert.equal(await sidebar.count(), 1);
        assert.equal(await topbar.count(), 1);
        const geometry = await page.evaluate(() => {
          const main = document.querySelector('main').getBoundingClientRect();
          return { left: main.left, width: main.width, scroll: document.documentElement.scrollWidth, viewport: innerWidth };
        });
        if (geometry.scroll > width + 1) {
          console.log(await page.evaluate(() => [...document.querySelectorAll('main *, header *')].filter((el) => el.getBoundingClientRect().right > innerWidth + 1).map((el) => ({ tag: el.tagName, cls: el.className, right: el.getBoundingClientRect().right, text: el.textContent.slice(0, 70) })).slice(0, 15)));
          await page.screenshot({ path: path.join(output, 'overflow.png'), fullPage: true });
        }
        assert.ok(geometry.scroll <= width + 1, JSON.stringify({ route, width, geometry }));
        assert.equal(geometry.left, width >= 1024 ? 260 : 0);
        assert.equal(await sidebar.locator('[aria-current="page"]').count(), route === '/profile' ? 0 : 1);
        if (width < 1024) {
          await page.getByRole('button', { name: 'Buka menu navigasi', exact: true }).click();
          await page.waitForFunction(() => document.querySelector('[data-purpose="navigation-sidebar"]').getBoundingClientRect().left >= -1);
          await sidebar.getByRole('button', { name: 'Tutup menu navigasi' }).click();
          await page.waitForFunction(() => document.querySelector('[data-purpose="navigation-sidebar"]').getBoundingClientRect().right <= 1);
        }
        if (route === '/profile' && [390, 1440].includes(width)) {
          await page.screenshot({ path: path.join(output, 'profile-' + width + '.png'), fullPage: true });
        }
        console.log('PASS', route, width);
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + '/dashboard', { waitUntil: 'domcontentloaded' });
    await sidebar.locator('nav button').first().waitFor();
    await page.evaluate(() => { window.layoutSidebar = document.querySelector('[data-purpose="navigation-sidebar"]'); });
    await page.getByRole('button', { name: 'Buka menu profil', exact: true }).click();
    await page.getByRole('link', { name: 'Profil & Pengaturan' }).click();
    await page.waitForURL('**/profile');
    assert.ok(await page.evaluate(() => window.layoutSidebar === document.querySelector('[data-purpose="navigation-sidebar"]')));
    assert.equal(await sidebar.locator('[aria-current="page"]').count(), 0);
    await sidebar.getByRole('button', { name: 'Home', exact: true }).click();
    await page.waitForURL('**/dashboard');
    await page.getByPlaceholder('Cari materi, soal, atau topik...').fill('tidak-ada-tugas-ini');
    await page.waitForFunction(() => document.querySelectorAll('[data-purpose="today-activities"] h5').length === 0);
    await page.getByRole('button', { name: 'Import AI Soal' }).click();
    await page.getByRole('heading', { name: 'AI Question Parser' }).waitFor();
    console.log('PASS persistent layout, profile navigation, navbar action');
    for (role of [1, 2, 3]) {
      await page.goto(base + '/profile', { waitUntil: 'domcontentloaded' });
      await sidebar.locator('nav button').first().waitFor();
      await page.waitForFunction((role) => JSON.parse(localStorage.getItem('user')).role === role, role);
      const expectedCount = role === 1 ? 11 : role === 3 ? 6 : 8;
      await page.waitForFunction((count) => document.querySelectorAll('[data-purpose="navigation-sidebar"] nav button').length === count, expectedCount);
      assert.equal(await sidebar.locator('nav button').count(), expectedCount);
      console.log('PASS role', role);
    }
    for (const route of ['/login', '/register']) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      assert.equal(await sidebar.count(), 0);
      assert.equal(await topbar.count(), 0);
      console.log('PASS auth without layout', route);
    }
    assert.deepEqual(errors, [], 'Runtime/hydration errors');
    console.log('PASS no runtime/hydration errors');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
