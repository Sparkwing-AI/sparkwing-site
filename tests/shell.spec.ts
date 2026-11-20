import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Header menu, footer and enquiry modal behaviour (FR-001 to FR-005, FR-904, FR-905, FR-910).

test.describe('header menu', () => {
  test('wide nav lists Home, Services and Apps, with no dropdown', async ({ page }, info) => {
    test.skip(info.project.name === 'compact', 'Wide layout only');
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Products' })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/services');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Apps' })).toHaveAttribute('href', '/apps');
    await expect(page.locator('.sw-announce')).toHaveCount(0);
  });

  test('compact: Menu button reads Menu or Close and lists the same links', async ({ page }, info) => {
    test.skip(info.project.name !== 'compact', 'Compact layout only');
    await page.goto('/');
    const menu = page.locator('.sw-menu-btn');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await menu.click();
    const close = page.getByRole('button', { name: 'Close', exact: true }).first();
    await expect(close).toHaveAttribute('aria-expanded', 'true');
    const first = page.locator('#sw-menu a').first();
    await expect(first).toHaveText('Home');
    await page.keyboard.press('Escape');
    await expect(page.locator('.sw-menu-btn')).toBeFocused();
    await expect(page.locator('#sw-menu')).toBeHidden();
  });
});

test.describe('enquiry modal', () => {
  test('opens from the footer button with the topic set, and Esc returns focus', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('header').getByRole('link', { name: 'Book a discovery call' });
    await expect(button).toHaveAttribute('href', 'mailto:info@sparkwing.com.au');
    await button.click();
    const dialog = page.getByRole('dialog', { name: 'Talk to us' });
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel('Your name')).toBeFocused();
    await expect(page.getByLabel("What you're after")).toHaveValue('call');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('shows errors under fields, focuses the first, keeps entries', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Book a discovery call' }).click();
    await page.getByLabel('Email', { exact: true }).fill('not-an-email');
    await page.getByRole('button', { name: 'Send' }).click();
    const name = page.getByLabel('Your name');
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAttribute('aria-describedby', 'enq-name-err');
    await expect(page.locator('#enq-name-err')).toHaveText('Please enter your name.');
    await expect(page.locator('#enq-email-err')).toHaveText('Please enter a valid email, like you@business.com.');
    await expect(page.locator('#enq-consent-err')).toHaveText('Please tick this box so we can contact you.');
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue('not-an-email');
  });

  test('both tickboxes start unticked and the marketing one never blocks sending', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Book a discovery call' }).click();
    await expect(page.locator('#enq-consent')).not.toBeChecked();
    await expect(page.locator('#enq-marketing')).not.toBeChecked();
    await page.getByLabel('Your name').fill('Ada');
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await page.getByLabel('Your message').fill('Hello');
    await page.locator('#enq-consent').check();
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.sw-error:visible')).toHaveCount(0);
  });

  test('a failed send keeps the form filled and offers the email address', async ({ page }) => {
    await page.route('**/api/leads', (route) => route.abort());
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('sw-enquiry')!.dataset.endpoint = 'http://localhost:4321';
      });
    });
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Book a discovery call' }).click();
    await page.getByLabel('Your name').fill('Ada');
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await page.getByLabel('Your message').fill('Hello');
    await page.locator('#enq-consent').check();
    await page.getByRole('button', { name: 'Send' }).click();
    const fail = page.locator('#enq-fail');
    await expect(fail).toBeVisible();
    await expect(fail).toContainText("That didn't send. Please try again, or email info@sparkwing.com.au.");
    await expect(page.getByLabel('Your name')).toHaveValue('Ada');
  });

  test('a successful send replaces the form and moves focus to the message', async ({ page }) => {
    await page.route('**/api/leads', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('sw-enquiry')!.dataset.endpoint = 'http://localhost:4321';
      });
    });
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Book a discovery call' }).click();
    await page.getByLabel('Your name').fill('Ada');
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await page.getByLabel('Your message').fill('Hello');
    await page.locator('#enq-consent').check();
    await page.getByRole('button', { name: 'Send' }).click();
    const done = page.locator('#enq-done');
    await expect(done).toHaveText("Thanks, we received your message. We'll get back to you real soon.");
    await expect(done).toBeFocused();
    await expect(page.locator('#enq-form')).toBeHidden();
  });

  test('fits at 320px and scrolls inside itself', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Book a discovery call' }).click();
    const box = await page.getByRole('dialog').boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(box!.height).toBeLessThanOrEqual(480);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('axe passes with the modal open', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Book a discovery call' }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});

test.describe('legal links inside forms', () => {
  test('privacy links open in a new tab and the typed answers stay', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/sparkkeeper/beta');
    const beta = page.locator('#beta-form');
    await beta.getByLabel('Your name').fill('Ada Lovelace');
    await beta.getByLabel('Work email').fill('ada@example.com');
    await beta.getByLabel('Business name (optional)').fill('Analytical Engines');
    const formLink = page.locator('#beta-form').getByRole('link', { name: /Privacy policy/ });
    await expect(formLink).toHaveAttribute('target', '_blank');
    await expect(formLink).toHaveAttribute('rel', 'noopener');
    await expect(formLink).toHaveAccessibleName(/opens in a new tab/);
    const [policy] = await Promise.all([page.waitForEvent('popup'), formLink.click()]);
    await expect(policy).toHaveURL(/\/privacy$/);
    await expect(beta.getByLabel('Your name')).toHaveValue('Ada Lovelace');
    await expect(beta.getByLabel('Work email')).toHaveValue('ada@example.com');
    await expect(beta.getByLabel('Business name (optional)')).toHaveValue('Analytical Engines');
    await policy.close();
    await expect(page.locator('main a[href="/privacy"]').nth(1)).not.toHaveAttribute('target', '_blank');

    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Book a discovery call' }).click();
    const dialog = page.getByRole('dialog', { name: 'Talk to us' });
    await dialog.getByLabel('Your name').fill('Grace');
    await dialog.getByLabel('Email', { exact: true }).fill('grace@example.com');
    await dialog.getByLabel('Your message').fill('A longer note that should stay put');
    const modalLink = dialog.getByRole('link', { name: /Privacy policy/ });
    await expect(modalLink).toHaveAttribute('target', '_blank');
    await expect(modalLink).toHaveAttribute('rel', 'noopener');
    await expect(modalLink).toHaveAccessibleName(/opens in a new tab/);
    const [again] = await Promise.all([page.waitForEvent('popup'), modalLink.click()]);
    await expect(dialog.getByLabel('Your name')).toHaveValue('Grace');
    await expect(dialog.getByLabel('Email', { exact: true })).toHaveValue('grace@example.com');
    await expect(dialog.getByLabel('Your message')).toHaveValue('A longer note that should stay put');
    await again.close();

    const footerPrivacy = page.locator('footer').getByRole('link', { name: 'Privacy' });
    await expect(footerPrivacy).not.toHaveAttribute('target', /_blank/);
    await expect(page.locator('footer').getByRole('link', { name: 'Terms' })).not.toHaveAttribute('target', /_blank/);
  });
});

const serviceAnchors = [
  { name: 'Our process', id: 'steps' },
  { name: 'Your AI plan', id: 'plan' },
  { name: 'Your business knowledge', id: 'business-knowledge' },
  { name: 'Your rules', id: 'trust' },
  { name: 'Team training', id: 'training' },
] as const;

async function expectEyebrowBelowHeader(page: Page, id: string) {
  const eyebrow = page.locator(`#${id}`);
  await expect(eyebrow).toBeInViewport();
  const place = await page.evaluate((anchorId) => {
    const label = document.getElementById(anchorId)?.getBoundingClientRect();
    const header = document.querySelector('[data-header]')?.getBoundingClientRect();
    if (!label || !header) return null;
    const headerBottom = header.bottom > 0 && header.top < window.innerHeight ? header.bottom : 0;
    return { top: label.top, headerBottom };
  }, id);
  expect(place).not.toBeNull();
  expect(place!.top).toBeGreaterThanOrEqual(place!.headerBottom - 1);
  expect(place!.top - place!.headerBottom).toBeLessThanOrEqual(140);
}

test.describe('footer', () => {
  test('company line reads as required and ACN is absent', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.sw-footer-legal')).toHaveText(
      'Sparkwing Pty Ltd · ABN 90 703 825 370 · Sydney, Australia · Privacy · Terms',
    );
    await expect(page.locator('body')).not.toContainText('ACN');
  });

  test('lists Apps, Services and Contact, with no Learn more column', async ({ page }) => {
    await page.goto('/');
    const headings = page.locator('.sw-footer-heading');
    await expect(headings).toHaveText(['Apps', 'Services', 'Contact']);
    await expect(page.locator('footer').getByRole('link', { name: 'Build your AI plan' })).toHaveCount(0);
    await expect(page.locator('footer').getByRole('link', { name: 'Cut manual admin' })).toHaveCount(0);
    await expect(page.locator('footer').getByRole('link', { name: 'Use AI safely' })).toHaveCount(0);
    await expect(page.locator('header').getByRole('link', { name: 'Cut manual admin' })).toHaveCount(0);
    await expect(page.locator('header').getByRole('link', { name: 'Use AI safely' })).toHaveCount(0);
  });

  for (const width of [390, 900, 1440]) {
    test(`Services links land on the eyebrow at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });

      for (const anchor of serviceAnchors) {
        await page.goto(`/services#${anchor.id}`);
        await expectEyebrowBelowHeader(page, anchor.id);
      }

      await page.goto('/services');
      for (const anchor of serviceAnchors) {
        await page.locator('footer').getByRole('link', { name: anchor.name, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/services#${anchor.id}$`));
        await expectEyebrowBelowHeader(page, anchor.id);
      }

      await page.getByRole('link', { name: 'See the five steps' }).click();
      await expect(page).toHaveURL(/#steps$/);
      await expectEyebrowBelowHeader(page, 'steps');
    });
  }
});
