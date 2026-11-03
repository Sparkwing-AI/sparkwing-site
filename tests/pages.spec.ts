import { expect, test } from '@playwright/test';

const motionPages = [
  '/sparkkeeper',
  '/apps/magnet',
  '/apps/academy',
  '/apps/nest',
  '/spark-studio',
  '/trust',
  '/bring-ai-in',
  '/scale-ai',
];

test.describe('Page set', () => {
  for (const route of motionPages) {
    test(`one h1, no Pause button, and click-to-pause is wired: ${route}`, async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('button', { name: 'Pause animations' })).toHaveCount(0);
      const trigger = page.locator('[data-motion-trigger]').first();
      await expect(trigger).toBeVisible();
      await trigger.click();
      await page.getByRole('button', { name: /^Yes/ }).click();
      await expect(page.locator('html')).toHaveAttribute('data-paused', '');
      await context.close();
    });

    test(`animation trigger is hidden under reduced motion: ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('[data-motion-trigger]').first()).toBeHidden();
    });
  }

  test('no bracketed placeholder text renders on any new page, apart from the Trust masking samples', async ({ page }) => {
    for (const route of [...motionPages, '/sparkkeeper/beta']) {
      await page.goto(route);
      const text = await page.locator('main').innerText();
      const found = (text.match(/\[[^\]]{2,}\]/g) ?? []).filter((token) => !['[CUSTOMER 1]', '[EMAIL 1]', '[PHONE 1]'].includes(token));
      expect(found, route).toEqual([]);
    }
  });
});

test.describe('Sparkkeeper', () => {
  test('sub-nav marks the current page and Taglish block is hidden until toggled', async ({ page }) => {
    await page.goto('/sparkkeeper');
    await expect(page.locator('.sw-subnav [aria-current="page"]')).toHaveText('Sparkkeeper');
    await expect(page.locator('[lang="fil"]').first()).toBeHidden();
  });
});

test.describe('Apps', () => {
  const apps = [
    { route: '/apps/magnet', name: 'Magnet' },
    { route: '/apps/academy', name: 'Academy' },
    { route: '/apps/nest', name: 'Nest' },
  ];
  for (const app of apps) {
    test(`${app.name} marks itself in the sub-nav and opens the app enquiry`, async ({ page }) => {
      await page.goto(app.route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(app.name);
      await expect(page.locator('.sw-subnav [aria-current="page"]')).toHaveText(app.name);
      await page.getByRole('link', { name: 'Ask us about this app' }).click();
      await expect(page.locator('#sw-enquiry')).toBeVisible();
      await expect(page.locator('#enq-topic')).toHaveValue('app');
      await expect(page.getByRole('link', { name: 'How the base platform works' })).toHaveAttribute('href', '/trust');
    });
  }

  test('/apps redirects to Magnet and points its canonical there', async ({ page }) => {
    await page.goto('/apps');
    await expect(page).toHaveURL(/\/apps\/magnet$/);
    const response = await page.request.get('/apps');
    expect(await response.text()).toContain('rel="canonical" href="https://sparkwing.com.au/apps/magnet"');
  });
});

test.describe('Trust', () => {
  test('has the three anchors and the FR-502 sentence', async ({ page }) => {
    await page.goto('/trust');
    for (const id of ['hive', 'ai-crew', 'control-tower']) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.getByText("This is how Sparkwing is designed, and we'll confirm what's live for you.")).toBeVisible();
  });
});

test.describe('Spark Studio', () => {
  test('shows no prices or client names, and the CTA opens the studio enquiry', async ({ page }) => {
    await page.goto('/spark-studio');
    await expect(page.locator('main')).not.toContainText(/\$\d/);
    await page.getByRole('link', { name: 'Book a discovery call' }).first().click();
    await expect(page.locator('#enq-topic')).toHaveValue('studio');
  });
});

test.describe('Beta application', () => {
  test('shows an error under each empty required field and focuses the first', async ({ page }) => {
    await page.goto('/sparkkeeper/beta');
    await page.getByRole('button', { name: 'Send my application' }).click();
    for (const field of ['name', 'email', 'business', 'country', 'work', 'consent']) {
      await expect(page.locator(`#${field}-err`)).toBeVisible();
      await expect(page.locator(`#${field}`)).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator(`#${field}`)).toHaveAttribute('aria-describedby', `${field}-err`);
    }
    await expect(page.locator('#name')).toBeFocused();
  });

  test('keeps entries when sending fails and shows the fallback message', async ({ page }) => {
    await page.goto('/sparkkeeper/beta');
    await page.locator('#name').fill('Test Person');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#business').fill('Test Co');
    await page.locator('#country').selectOption('Australia');
    await page.locator('#work').fill('Bookkeeping');
    await page.locator('#consent').check();
    await page.getByRole('button', { name: 'Send my application' }).click();
    await expect(page.locator('#beta-fail')).toBeVisible();
    await expect(page.locator('#beta-fail')).toContainText("That didn't send. Please try again, or email info@sparkwing.com.au.");
    await expect(page.locator('#name')).toHaveValue('Test Person');
  });

  test('both tickboxes start unticked and the FAQ uses details elements', async ({ page }) => {
    await page.goto('/sparkkeeper/beta');
    await expect(page.locator('#consent')).not.toBeChecked();
    await expect(page.locator('#marketing')).not.toBeChecked();
    await expect(page.locator('.bt-faq details')).toHaveCount(8);
  });

  test('confirmation replaces the form and takes focus when the endpoint accepts', async ({ page }) => {
    await page.route('**/api/leads', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.goto('/sparkkeeper/beta');
    await page.evaluate(() => document.getElementById('beta-main')!.setAttribute('data-endpoint', 'http://localhost:4322'));
    await page.locator('#name').fill('Test Person');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#business').fill('Test Co');
    await page.locator('#country').selectOption('Philippines');
    await page.locator('#work').fill('Bookkeeping');
    await page.locator('#consent').check();
    await page.getByRole('button', { name: 'Send my application' }).click();
    await expect(page.locator('#beta-done')).toBeFocused();
    await expect(page.locator('#beta-done')).toContainText("We'll email test@example.com to tell you if the beta is a fit.");
    await expect(page.locator('#beta-form')).toBeHidden();
  });
});

test.describe('404', () => {
  test('is noindex and links to Home and Sparkkeeper', async ({ page }) => {
    await page.goto('/404');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("We couldn't find that page.");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('main').getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await expect(page.locator('main').getByRole('link', { name: 'Sparkkeeper' })).toHaveAttribute('href', '/sparkkeeper');
  });
});

test.describe('Review fixes', () => {
  for (const route of ['/spark-studio', '/scale-ai']) {
    test(`hero button focus ring is visible on the dark band: ${route}`, async ({ page }) => {
      await page.goto(route);
      const button = page.locator('.ph .sw-btn').first();
      await button.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(button).toBeFocused();
      const outline = await button.evaluate((el) => getComputedStyle(el).outlineColor);
      const gold = await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.style.color = getComputedStyle(document.documentElement).getPropertyValue('--sw-color-focus-on-deep');
        document.body.append(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      });
      expect(outline).toBe(gold);
    });
  }

  test('without JavaScript the beta form is hidden and the email address is offered', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/sparkkeeper/beta');
    await expect(page.locator('#beta-form')).toBeHidden();
    await expect(page.locator('main').getByRole('link', { name: 'info@sparkwing.com.au' }).first()).toBeVisible();
    await context.close();
  });

  test('without JavaScript both language blocks are readable', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/sparkkeeper');
    await expect(page.locator('[data-lang-block="en"]')).toBeVisible();
    await expect(page.locator('[data-lang-block="tl"]')).toBeVisible();
    await context.close();
  });

  test('Taglish toggle swaps the language block and sets lang', async ({ page }) => {
    await page.goto('/sparkkeeper');
    await page.getByRole('button', { name: 'Taglish' }).click();
    await expect(page.locator('[data-lang-block="tl"]')).toBeVisible();
    await expect(page.locator('[data-lang-block="tl"]')).toHaveAttribute('lang', 'fil');
    await expect(page.locator('[data-lang-block="en"]')).toBeHidden();
  });

  test('title, description, Open Graph and Twitter tags match the requirements table', async ({ page }) => {
    const rows: Record<string, [string, string]> = {
      '/': ['Sparkwing: AI automation for less paperwork, more business', 'Hand your manual admin to AI you can check. Sparkwing helps businesses in Australia and the Philippines save hours with trusted AI.'],
      '/sparkkeeper': ['Sparkkeeper: AI for bookkeeping and client records', 'Your numbers and clients in one place, alongside your accounting software and registered books. Ask Sparky, upload paperwork, create reports.'],
      '/spark-studio': ['Spark Studio: AI consulting, automation and custom AI agents', 'AI consulting from Sydney-based Sparkwing. We set AI up around your business and build custom apps or AI agents when you need more.'],
      '/trust': ['AI governance built in: how Sparkwing keeps AI trustworthy', 'Hive, AI Crew and Control Tower sit under every Sparkwing app, with rules, records and masking designed in.'],
      '/bring-ai-in': ['AI for business: start with one app, Sparkwing', 'AI automation for small and growing businesses in Australia and the Philippines. Start with the job that eats the most hours. No IT team needed.'],
      '/scale-ai': ['AI strategy and governance for your team, Sparkwing', 'Get more from AI across your team, with rules and records in place. AI strategy, governance, ecosystems and enablement.'],
      '/sparkkeeper/beta': ['Apply for the free Sparkkeeper beta, Sparkwing', 'Full Sparkkeeper features free for one month, with AI credits included and top-ups on request. Limited seats. See what to expect and apply.'],
    };
    for (const [route, [title, description]] of Object.entries(rows)) {
      await page.goto(route);
      await expect(page, route).toHaveTitle(title);
      expect(title.length, `${route} title length`).toBeLessThanOrEqual(60);
      expect(description.length, `${route} description length`).toBeLessThanOrEqual(155);
      await expect(page.locator('meta[name="description"]'), route).toHaveAttribute('content', description);
      await expect(page.locator('meta[property="og:title"]'), route).toHaveAttribute('content', title);
      await expect(page.locator('meta[property="og:description"]'), route).toHaveAttribute('content', description);
      await expect(page.locator('meta[name="twitter:title"]'), route).toHaveAttribute('content', title);
      await expect(page.locator('meta[name="twitter:description"]'), route).toHaveAttribute('content', description);
    }
  });

  test('Trust anchors land on the whole card, with its label visible', async ({ page }) => {
    for (const id of ['hive', 'ai-crew', 'control-tower']) {
      await page.goto(`/trust#${id}`);
      const card = page.locator(`#${id}`);
      await expect(card).toBeInViewport({ ratio: 1 });
      await expect(card.locator('.pf-tag')).toBeInViewport({ ratio: 1 });
    }
  });
  test('links on the new pages match the requirements link table', async ({ page }) => {
    const checks: Array<[string, string, string]> = [
      ['/sparkkeeper', 'Apply for the beta', '/sparkkeeper/beta'],
      ['/bring-ai-in', 'See what it covers today', '/sparkkeeper#scope'],
      ['/scale-ai', 'Control Tower Governance and guardrails', '/trust#control-tower'],
      ['/scale-ai', 'Academy', '/apps/academy'],
      ['/scale-ai', 'Nest', '/apps/nest'],
      ['/spark-studio', 'How the base platform works', '/trust'],
    ];
    for (const [route, name, href] of checks) {
      await page.goto(route);
      await expect(page.locator('main').getByRole('link', { name: new RegExp(name) }).first(), `${route} ${name}`).toHaveAttribute('href', href);
    }
  });

  test('sticky sub-nav does not hide a focused link', async ({ page }) => {
    await page.goto('/apps/magnet');
    const padding = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
    const bar = await page.locator('.sw-subnav').evaluate((el) => el.getBoundingClientRect().height);
    expect(padding).toBeGreaterThanOrEqual(bar);
  });
});
