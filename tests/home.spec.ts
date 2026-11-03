import { expect, test } from '@playwright/test';

test.describe('Home', () => {
  test('has one h1 and the two doors', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Less paperwork, more business.');
    await expect(page.getByRole('link', { name: /I want to bring AI into my business/ })).toHaveAttribute('href', '/bring-ai-in');
    await expect(page.getByRole('link', { name: /I want to scale AI responsibly/ })).toHaveAttribute('href', '/scale-ai');
  });

  test('stats sources open in a new tab and keep the disclaimer visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Industry research, not Sparkkeeper results.')).toBeVisible();
    const sources = page.locator('.home-sources a');
    await expect(sources).toHaveCount(3);
    for (const link of await sources.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('showcase tabs swap the sample screen and update aria-pressed', async ({ page }) => {
    await page.goto('/');
    const ask = page.getByRole('button', { name: /^Ask Sparky/ });
    const upload = page.getByRole('button', { name: /^Upload anything/ });
    await expect(ask).toHaveAttribute('aria-pressed', 'true');
    await upload.click();
    await expect(upload).toHaveAttribute('aria-pressed', 'true');
    await expect(ask).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-panel="upload"]')).toBeVisible();
    await expect(page.locator('[data-panel="ask"]')).toBeHidden();
    await page.getByRole('button', { name: /^Create in one click/ }).click();
    await expect(page.locator('[data-panel="create"]')).toBeVisible();
  });

  test('sample screen is hidden from assistive technology and labelled as sample data', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.mock')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.mock').getByText('Sample data').first()).toBeVisible();
  });

  test('every pause button pauses and resumes together', async ({ page }) => {
    await page.goto('/');
    const buttons = page.getByRole('button', { name: /animations$/ });
    expect(await buttons.count()).toBeGreaterThanOrEqual(3);
    await buttons.first().click();
    await expect(page.locator('html')).toHaveAttribute('data-paused', '');
    for (const button of await buttons.all()) {
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(button).toHaveText('Play animations');
    }
    await buttons.last().click();
    await expect(page.locator('html')).not.toHaveAttribute('data-paused', '');
    await expect(buttons.first()).toHaveText('Pause animations');
  });

  test('marquee shows every item with no duplicate set when motion is reduced', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    const visible = page.locator('.home-marquee-copy:not([aria-hidden="true"]) li');
    await expect(visible).toHaveCount(5);
    await expect(page.locator('.home-marquee-copy[aria-hidden="true"]')).toBeHidden();
    const track = await page.locator('.home-marquee-track').evaluate((el) => ({
      scroll: el.scrollWidth,
      client: el.clientWidth,
      animation: getComputedStyle(el).animationName,
    }));
    expect(track.animation).toBe('none');
    expect(track.scroll).toBeLessThanOrEqual(track.client);
    await context.close();
  });

  test('marquee loops and pauses when motion is allowed', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    const name = () => page.locator('.home-marquee-track').evaluate((el) => getComputedStyle(el).animationName);
    expect(await name()).toBe('home-roll');
    await page.getByRole('button', { name: 'Pause animations' }).first().click();
    expect(await name()).toBe('none');
    await context.close();
  });

  test('placeholders do not render by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('[First client story]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/\[[A-Z][^\]]+\]/);
  });

  test('team cards show the three people with equal widths at wide', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const cards = page.locator('.home-person');
    await expect(cards).toHaveCount(3);
    const widths = await cards.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
    expect(new Set(widths).size).toBe(1);
  });

  test('no horizontal scroll at 390', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
