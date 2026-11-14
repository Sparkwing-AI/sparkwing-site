import { expect, test, type Page } from '@playwright/test';

async function pauseViaMarquee(page: Page) {
  await page.locator('.home-marquee [data-motion-trigger]').click();
  await page.getByRole('button', { name: /^Yes/ }).click();
}

test.describe('Home', () => {
  test('has one h1 and the two doors', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("AI that's safe, practical, and goes beyond basic chatbots.");
    await expect(page.getByRole('link', { name: /I want less paperwork and manual admin/ })).toHaveAttribute('href', '/bring-ai-in');
    await expect(page.getByRole('link', { name: /I want AI my team and I can trust/ })).toHaveAttribute('href', '/scale-ai');
  });

  test('the five steps and the apps map cover all five pillars', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.home-flight-card')).toHaveCount(5);
    await expect(page.locator('.home-flight-pillar')).toHaveText(['Discover & plan', 'Your context', 'Your rules', 'Your tools', 'Your people']);
    await expect(page.locator('.home-map-card')).toHaveCount(8);
    await expect(page.locator('.home-map-card--live')).toHaveAttribute('href', '/sparkkeeper');
    await expect(page.locator('.home-map-card', { hasText: 'Coming soon' })).toHaveCount(4);
  });

  test('stats sources open in a new tab and keep the disclaimer visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Figures from independent industry reports.')).toBeVisible();
    const sources = page.locator('.home-sources a');
    await expect(sources).toHaveCount(2);
    for (const link of await sources.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('clicking an animation asks first, and Yes and No behave', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    const triggers = page.locator('[data-motion-trigger]');
    expect(await triggers.count()).toBe(3);
    const marquee = page.locator('.home-marquee [data-motion-trigger]');
    const dialog = page.getByRole('dialog', { name: 'Pause animation?' });

    await marquee.click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'No' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-paused', '');
    await expect(marquee).toBeFocused();

    await marquee.click();
    await dialog.getByRole('button', { name: /^Yes/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-paused', '');
    for (const trigger of await triggers.all()) await expect(trigger).toHaveAccessibleName('Resume animation');

    const other = page.locator('.home-flight-pause [data-motion-trigger]');
    await other.click();
    await expect(page.getByRole('dialog', { name: 'Resume animation?' })).toBeVisible();
    await page.getByRole('button', { name: /^Yes/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-paused', '');
    await expect(other).toHaveAccessibleName('Pause animation');
    await context.close();
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
    await page.keyboard.press('Space');
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-paused', '');
    await context.close();
  });

  test('there is no separate Pause animations button any more', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /animations$/ })).toHaveCount(0);
  });

  test('pause triggers are hidden when the visitor prefers reduced motion', async ({ page }) => {
    await page.goto('/');
    for (const trigger of await page.locator('[data-motion-trigger]').all()) await expect(trigger).toBeHidden();
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

  test('loops run when motion is allowed and every one stops on Pause', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    const loops = ['.home-marquee-track'];
    const name = (selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).animationName);
    for (const selector of loops) await expect.poll(() => name(selector), { message: selector }).not.toBe('none');
    await pauseViaMarquee(page);
    for (const selector of loops) expect(await name(selector), selector).toBe('none');
    await context.close();
  });

  test('paused page shows the static marquee', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    await pauseViaMarquee(page);
    await expect(page.locator('.home-marquee-copy[aria-hidden="true"]')).toBeHidden();
    const fits = await page.locator('.home-marquee-track').evaluate((el) => el.scrollWidth <= el.clientWidth);
    expect(fits).toBe(true);
    await context.close();
  });

  test('without JavaScript nothing moves and the pause triggers are hidden', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference', javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-motion-trigger]').first()).toBeHidden();
    const animation = await page.locator('.home-marquee-track').evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe('none');
    await context.close();
  });

  test('links match the requirements link table', async ({ page }) => {
    await page.goto('/');
    const href = (name: RegExp | string) => page.getByRole('link', { name }).first().getAttribute('href');
    expect(await href(/See everything Sparkkeeper does/)).toBe('/sparkkeeper');
    expect(await href(/^Magnet/)).toBe('/apps/magnet');
    expect(await href(/^Academy/)).toBe('/apps/academy');
    expect(await href(/^Nest/)).toBe('/apps/nest');
    expect(await href(/See how trust is built in/)).toBe('/trust');
    expect(await href('Join the beta')).toBe('/sparkkeeper/beta');
    await expect(page.locator('a', { hasText: 'Sparkkeeper login' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Try the demo' })).toHaveCount(0);
    await expect(page.locator('a[href*="workers.dev"]')).toHaveCount(0);
    await expect(page.locator('.home-try').getByRole('link', { name: 'Join the beta' })).toHaveAttribute('href', '/sparkkeeper/beta');
    await expect(page.getByRole('link', { name: 'Book a discovery call' }).first()).toHaveAttribute('data-enquiry', 'call');
  });

  test('focus ring on the Hive link uses the gold focus colour on the dark band', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /See how Hive works/ });
    await link.focus();
    const colour = await link.evaluate((el) => getComputedStyle(el).outlineColor);
    const gold = await page.evaluate(() => {
      const probe = document.createElement('i');
      probe.style.color = 'var(--sw-color-focus-on-deep)';
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });
    expect(colour).toBe(gold);
  });
  test('placeholders do not render by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('[First client story]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/\[[A-Z][^\]]+\]/);
  });

  test('team cards show the two people with equal widths at wide', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const cards = page.locator('.home-person');
    await expect(cards).toHaveCount(2);
    const widths = await cards.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
    expect(new Set(widths).size).toBe(1);
  });

  for (const width of [390, 768, 1024, 1440]) {
    test(`no horizontal scroll at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
