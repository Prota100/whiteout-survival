const { test, expect } = require('@playwright/test');

test.describe('Whiteout Survival UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://prota100.github.io/whiteout-survival/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('모든 DOM UI 요소 존재', async ({ page }) => {
    await expect(page.locator('#btn-attack')).toBeVisible();
    await expect(page.locator('#btn-build')).toBeVisible();
    await expect(page.locator('#btn-craft')).toBeVisible();
    await expect(page.locator('#btn-hire')).toBeVisible();
    await expect(page.locator('#btn-eat')).toBeVisible();
    await expect(page.locator('#btn-sound')).toBeVisible();
    await expect(page.locator('#res-text')).toBeAttached();
    await expect(page.locator('#hp-fill')).toBeAttached();
    await expect(page.locator('#temp-fill')).toBeAttached();
    await expect(page.locator('#hunger-fill')).toBeAttached();
    await expect(page.locator('#quest-text')).toBeAttached();
  });

  test('하단 버튼 클릭 가능', async ({ page }) => {
    for (const sel of ['#btn-attack','#btn-build','#btn-craft','#btn-hire','#btn-eat','#btn-sound']) {
      const btn = page.locator(sel);
      await expect(btn).toBeEnabled();
      await btn.click();
      await page.waitForTimeout(300);
    }
  });

  test('고용 버튼 → 패널', async ({ page }) => {
    // Ensure no panel is open first
    await page.evaluate(() => { if(window._gameScene?.activePanel) window._gameScene.clearPanel(); window._gameScene && (window._gameScene.activePanel = null); });
    await page.locator('#btn-hire').click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window._gameScene?.activePanel === 'hire')).toBeTruthy();
  });

  test('건설 버튼 → 패널', async ({ page }) => {
    await page.locator('#btn-build').click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window._gameScene?.activePanel === 'build')).toBeTruthy();
  });

  test('제작 버튼 → 패널', async ({ page }) => {
    await page.locator('#btn-craft').click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window._gameScene?.activePanel === 'craft')).toBeTruthy();
  });

  test('사운드 토글', async ({ page }) => {
    const btn = page.locator('#btn-sound');
    await btn.click();
    expect(await btn.textContent()).toBe('🔇');
    await btn.click();
    expect(await btn.textContent()).toBe('🔊');
  });

  test('조이스틱 DOM 존재', async ({ page }) => {
    await expect(page.locator('#joystick-zone')).toBeAttached();
    await expect(page.locator('#joystick')).toBeAttached();
    await expect(page.locator('#joystick-knob')).toBeAttached();
  });

  test('반응형 - 모바일 375x667', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('#btn-attack')).toBeVisible();
    await expect(page.locator('#btn-hire')).toBeVisible();
  });

  test('반응형 - 태블릿 768x1024', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('#btn-attack')).toBeVisible();
  });

  test('반응형 - PC 1920x1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(page.locator('#btn-attack')).toBeVisible();
  });

  test('오버레이 z-index >= 10', async ({ page }) => {
    const z = await page.evaluate(() => parseInt(getComputedStyle(document.getElementById('ui-overlay')).zIndex));
    expect(z).toBeGreaterThanOrEqual(10);
  });

  test('오버레이 pointer-events: none', async ({ page }) => {
    const pe = await page.evaluate(() => getComputedStyle(document.getElementById('ui-overlay')).pointerEvents);
    expect(pe).toBe('none');
  });

  test('버튼 pointer-events: auto', async ({ page }) => {
    const pe = await page.evaluate(() => getComputedStyle(document.getElementById('btn-hire')).pointerEvents);
    expect(pe).toBe('auto');
  });

  test('게임 씬 로드 확인', async ({ page }) => {
    expect(await page.evaluate(() => !!window._gameScene)).toBeTruthy();
    expect(await page.evaluate(() => !!window._gameScene?.player)).toBeTruthy();
  });
});
