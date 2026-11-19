import { expect, test } from '@playwright/test';

test.describe('Home', () => {
  test('leads with the rotating promise and the two calls to action', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AI that helps');
    await expect(page.getByRole('link', { name: 'Book a free discovery call' })).toHaveAttribute('data-enquiry', 'call');
    await expect(page.getByRole('link', { name: 'See how it works' })).toHaveAttribute('href', '#how');
    await expect(page.getByRole('link', { name: 'See our services' })).toHaveAttribute('href', '/spark-studio');
    await expect(page.getByRole('link', { name: 'See the full process' })).toHaveAttribute('href', '/how-it-works');
  });

  test('services can be selected and apps link to the apps page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'AI helpers' }).click();
    await expect(page.getByRole('button', { name: 'AI helpers' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: /Sparkkeeper/ }).first()).toHaveAttribute('href', '/apps#sparkkeeper');
    await expect(page.getByRole('link', { name: /Magnet/ }).first()).toHaveAttribute('href', '/apps#magnet');
    await expect(page.getByRole('link', { name: /Academy/ }).first()).toHaveAttribute('href', '/apps#academy');
  });

  test('stats sources open in a new tab', async ({ page }) => {
    await page.goto('/');
    const sources = page.locator('.home-stat-source a');
    await expect(sources).toHaveCount(5);
    for (const link of await sources.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('the pause question works from the keyboard and Escape closes it', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    const trigger = page.locator('.home-hero-hit');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const yes = page.getByRole('button', { name: /^Yes/ });
    await expect(yes).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await context.close();
  });

  test('pause triggers are hidden when the visitor prefers reduced motion', async ({ page }) => {
    await page.goto('/');
    for (const trigger of await page.locator('[data-motion-trigger]').all()) await expect(trigger).toBeHidden();
  });

  test('the gold band opens the call enquiry', async ({ page }) => {
    await page.goto('/');
    const band = page.locator('#contact').getByRole('link', { name: 'Book a discovery call' });
    await expect(band).toHaveAttribute('data-enquiry', 'call');
  });

  for (const width of [390, 900, 1440]) {
    test(`no horizontal scroll at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
