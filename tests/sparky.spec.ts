import { expect, test } from '@playwright/test';

// Sparky shows its greeting at once. The chat session starts in the background.

const endpoint = 'https://sparkwing-chat.sparkwing.workers.dev/api/chat';

test.describe('Sparky greeting', () => {
  test('appears straight away even when starting the session is slow', async ({ page }) => {
    await page.route('https://challenges.cloudflare.com/**', (route) => route.abort());
    await page.route(endpoint, async (route) => {
      const body = route.request().postDataJSON() as { action?: string };
      if (body.action === 'start') {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        await route.fulfill({ json: { session_id: 'test-session' } });
        return;
      }
      await route.fulfill({ json: { answer: 'Hello from the test.', sources: [] } });
    });
    await page.goto('/');
    const open = page.locator('#sw-ask-open');
    await open.click();
    await expect(page.locator('#sw-ask-log')).toContainText("Hi, I'm Sparky", { timeout: 500 });
    await expect(page.locator('.sw-ask-chip').first()).toBeVisible();
  });

  test('a question sent before the session is ready still gets an answer', async ({ page }) => {
    await page.route('https://challenges.cloudflare.com/**', (route) => route.abort());
    await page.route(endpoint, async (route) => {
      const body = route.request().postDataJSON() as { action?: string };
      if (body.action === 'start') {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.fulfill({ json: { session_id: 'test-session' } });
        return;
      }
      await route.fulfill({ json: { answer: 'Hello from the test.', sources: [] } });
    });
    await page.goto('/');
    await page.locator('#sw-ask-open').click();
    await page.locator('#sw-ask-input').fill('What is Sparkwing?');
    await page.keyboard.press('Enter');
    await expect(page.locator('#sw-ask-log')).toContainText('Hello from the test.', { timeout: 5000 });
  });

  test('if the session cannot start, the greeting gives way to the team message', async ({ page }) => {
    await page.route('https://challenges.cloudflare.com/**', (route) => route.abort());
    await page.route(endpoint, (route) => route.fulfill({ status: 429, json: {} }));
    await page.goto('/');
    await page.locator('#sw-ask-open').click();
    await expect(page.locator('#sw-ask-log')).toContainText("I can't start another chat right now", { timeout: 5000 });
    await expect(page.locator('#sw-ask-log')).not.toContainText("Hi, I'm Sparky");
  });

  test('on a phone, opening does not raise the keyboard and the whole greeting is in view', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.route('https://challenges.cloudflare.com/**', (route) => route.abort());
    await page.route(endpoint, (route) => route.fulfill({ json: { session_id: 'test-session' } }));
    await page.goto('/');
    await page.locator('#sw-ask-open').tap();
    const greeting = page.locator('#sw-ask-log .sw-ask-m').first();
    await expect(greeting).toContainText("Hi, I'm Sparky");
    await expect(greeting).toBeInViewport({ ratio: 1 });
    await expect(page.locator('#sw-ask-input')).not.toBeFocused();
    await context.close();
  });
});
