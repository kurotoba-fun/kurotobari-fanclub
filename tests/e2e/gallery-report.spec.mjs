import { expect, test } from '@playwright/test';

test.describe('ギャラリーのキャラクター誤判定報告', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('gallery/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.gallery-grid')).toBeVisible();
  });

  test('モーダルから修正先を選び、X投稿文を生成できる', async ({ page }) => {
    const card = page.locator('.gallery-card:not([hidden])').first();
    const expectedId = await card.getAttribute('data-gallery-id');
    const expectedTags = (await card.getAttribute('data-gallery-tags')).split('|');
    const expectedCurrent = expectedTags[0];

    await card.locator('.gallery-link').click();
    const modal = page.locator('#gallery-modal');
    await expect(modal).toHaveAttribute('aria-hidden', 'false');

    const reportButton = modal.locator('[data-gallery-report-open]');
    await expect(reportButton).toBeVisible();
    await expect(reportButton.locator('img')).toHaveAttribute('src', /report-warning\.svg$/);
    await reportButton.click();

    const panel = modal.locator('[data-gallery-report-panel]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('[data-gallery-report-id]')).toHaveText(expectedId);
    await expect(panel.locator('[data-gallery-report-current]')).toHaveText(expectedCurrent);

    const select = panel.locator('[data-gallery-report-character]');
    const correction = await select.locator('option').evaluateAll((options, current) => {
      const match = options.find((option) => option.value && option.value !== current);
      return match ? match.value : '';
    }, expectedCurrent);
    expect(correction).not.toBe('');
    await select.selectOption(correction);

    const expectedText = `@Mimmyzeta000\nキャラクターID「${expectedId}」\n現在キャラ「${expectedCurrent}」→修正「${correction}」`;
    await expect(panel.locator('[data-gallery-report-preview]')).toHaveText(expectedText);

    const submit = panel.locator('[data-gallery-report-submit]');
    await expect(submit).toHaveAttribute('aria-disabled', 'false');
    const intentUrl = new URL(await submit.getAttribute('href'));
    expect(intentUrl.hostname).toBe('twitter.com');
    expect(intentUrl.pathname).toBe('/intent/tweet');
    expect(intentUrl.searchParams.get('text')).toBe(expectedText);
  });

  test('現在と同じキャラクターは報告できず、入力は保存されない', async ({ page }) => {
    const card = page.locator('.gallery-card:not([hidden])').first();
    const current = (await card.getAttribute('data-gallery-tags')).split('|')[0];
    await card.locator('.gallery-link').click();
    await page.locator('[data-gallery-report-open]').click();

    const panel = page.locator('[data-gallery-report-panel]');
    const select = panel.locator('[data-gallery-report-character]');
    await select.selectOption(current);
    await expect(panel.locator('[data-gallery-report-submit]')).toHaveAttribute('aria-disabled', 'true');
    await expect(panel.locator('[data-gallery-report-submit]')).toHaveAttribute('href', '#');

    const browserStorage = await page.evaluate(() => ({
      cookies: document.cookie,
      localStorage: Object.keys(window.localStorage).filter((key) => /report/i.test(key)),
      sessionStorage: Object.keys(window.sessionStorage).filter((key) => /report/i.test(key))
    }));
    expect(browserStorage.cookies).not.toContain('report');
    expect(browserStorage.localStorage).toEqual([]);
    expect(browserStorage.sessionStorage).toEqual([]);
  });

  test('報告パネルがビューポート内に収まり、横スクロールを発生させない', async ({ page }) => {
    await page.locator('.gallery-card:not([hidden])').first().locator('.gallery-link').click();
    await page.locator('[data-gallery-report-open]').click();
    const panel = page.locator('[data-gallery-report-panel]');
    await expect(panel).toBeVisible();

    const bounds = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow).toBe(false);
  });
});


test('公開ホストでも誤判定報告を表示し、管理UIは非表示にする', async ({ page, baseURL }) => {
  const publicOrigin = 'https://gallery-public.example';
  await page.route(publicOrigin + '/**', async (route) => {
    const requested = new URL(route.request().url());
    const response = await page.request.get(new URL(requested.pathname + requested.search, baseURL).href);
    await route.fulfill({ response });
  });
  await page.goto(publicOrigin + new URL('gallery/', baseURL).pathname, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-gallery-maintenance]')).toBeHidden();
  await expect(page.locator('[data-gallery-correction-builder]')).toBeHidden();
  await page.locator('.gallery-card:not([hidden])').first().locator('.gallery-link').click();
  await expect(page.locator('[data-gallery-report-open]')).toBeVisible();
  await page.locator('[data-gallery-report-open]').click();
  await expect(page.locator('[data-gallery-report-panel]')).toBeVisible();
  await page.locator('[data-gallery-report-character]').selectOption('巫馬 梓睿');
  const submit = page.locator('[data-gallery-report-submit]');
  await expect(submit).toHaveAttribute('aria-disabled', 'false');
  expect(new URL(await submit.getAttribute('href')).searchParams.get('text')).toContain('修正「巫馬 梓睿」');
});
