import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Header menu, footer and enquiry modal behaviour (FR-001 to FR-005, FR-904, FR-905, FR-910).

test.describe('header menu', () => {
  test('Products opens, Esc closes and focus returns to the button', async ({ page }, info) => {
    test.skip(info.project.name === 'compact', 'Wide layout only');
    await page.goto('/');
    const products = page.getByRole('button', { name: 'Products' });
    await expect(products).toHaveAttribute('aria-expanded', 'false');
    await products.click();
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.sw-menu-item', { hasText: 'Hive' })).toBeVisible();
    await expect(page.getByText('Not sure where to begin?')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(products).toHaveAttribute('aria-expanded', 'false');
    await expect(products).toBeFocused();
    await expect(page.locator('#sw-menu')).toBeHidden();
  });

  test('clicking outside closes the menu', async ({ page }, info) => {
    test.skip(info.project.name === 'compact', 'Wide layout only');
    await page.goto('/');
    await page.getByRole('button', { name: 'Products' }).click();
    await page.locator('footer h2').click();
    await expect(page.locator('#sw-menu')).toBeHidden();
  });

  test('compact: Menu button reads Menu or Close and lists page links first', async ({ page }, info) => {
    test.skip(info.project.name !== 'compact', 'Compact layout only');
    await page.goto('/');
    const menu = page.locator('.sw-menu-btn');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await menu.click();
    const close = page.getByRole('button', { name: 'Close', exact: true }).first();
    await expect(close).toHaveAttribute('aria-expanded', 'true');
    const first = page.locator('#sw-menu a').first();
    await expect(first).toHaveText('Save hours');
    await page.keyboard.press('Escape');
    await expect(page.locator('.sw-menu-btn')).toBeFocused();
  });
});

test.describe('enquiry modal', () => {
  test('opens from the footer button with the topic set, and Esc returns focus', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('footer').getByRole('link', { name: 'Book a discovery call' });
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
    await page.locator('footer').getByRole('link', { name: 'Book a discovery call' }).click();
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
    await page.locator('footer').getByRole('link', { name: 'Book a discovery call' }).click();
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
    await page.locator('footer').getByRole('link', { name: 'Book a discovery call' }).click();
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
    await page.locator('footer').getByRole('link', { name: 'Book a discovery call' }).click();
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
    await page.locator('footer').getByRole('link', { name: 'Book a discovery call' }).click();
    const box = await page.getByRole('dialog').boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(box!.height).toBeLessThanOrEqual(480);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('axe passes with the modal open', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').getByRole('link', { name: 'Book a discovery call' }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});

test.describe('footer', () => {
  test('company line reads as required and ACN is absent', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.sw-footer-legal')).toHaveText(
      'Sparkwing Pty Ltd · ABN 90 703 825 370 · Sydney, Australia · Privacy · Terms',
    );
    await expect(page.locator('body')).not.toContainText('ACN');
  });
});
