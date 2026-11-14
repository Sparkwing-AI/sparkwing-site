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
    for (const field of ['name', 'email', 'country', 'work', 'consent']) {
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
    await page.locator('#country').selectOption('Australia');
    await page.locator('#work').fill('Bookkeeping');
    await page.locator('#consent').check();
    await page.getByRole('button', { name: 'Send my application' }).click();
    await expect(page.locator('#beta-done')).toBeFocused();
    await expect(page.locator('#beta-done')).toContainText("Thanks, we've got your details! The beta starts in late November and spots are limited, so we'll get in touch asap.");
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
      const button = page.locator('.mx-hero .sw-btn').first();
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
    // Playwright's no-JavaScript mode does not render <noscript>, so read the sentence from the built HTML.
    const html = await (await page.request.get('/sparkkeeper/beta')).text();
    const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? '';
    expect(noscript).toContain('This form needs JavaScript to send. Please email <a href="mailto:info@sparkwing.com.au">info@sparkwing.com.au</a>.');
    expect(noscript).not.toContain("That didn't send");
    await context.close();
  });

  test('title, description, Open Graph and Twitter tags match the requirements table', async ({ page }) => {
    const rows: Record<string, [string, string]> = {
      '/': ['Sparkwing: AI apps, strategy and coaching for your business', 'Save time with AI tailored to your business and team. Try Sparkkeeper for bookkeeping, or get AI strategy and coaching. Based in Australia.'],
      '/sparkkeeper': ['Sparkkeeper: AI for bookkeeping and client records', 'Your numbers and clients in one place, alongside your accounting software. Ask Sparky, upload paperwork, create reports.'],
      '/spark-studio': ['AI strategy and consulting, custom AI agents: Spark Studio', 'AI consulting from Sydney. AI strategy, AI systems, custom AI apps and AI agents, built around your business, for businesses across Australia.'],
      '/trust': ['AI governance built in: how Sparkwing keeps AI trustworthy', 'Hive, AI Crew and Control Tower sit under every Sparkwing app, with rules, records and privacy designed in.'],
      '/bring-ai-in': ['AI automation for small business: save hours, Sparkwing', 'AI automation for small and growing businesses in Australia. Clear the manual work first, then add more. No IT team needed.'],
      '/scale-ai': ['AI governance and training for your team, Sparkwing', 'AI strategy, AI governance and AI training for your whole team, with rules and records in place. Built for organisations that need to show their work.'],
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
      ['/sparkkeeper', 'Join the beta', '/sparkkeeper/beta'],
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

test.describe('Decisions of 4 Nov', () => {
  test('beta sends business_type and first_task as separate fields, with no combined message', async ({ page }) => {
    let body: Record<string, unknown> = {};
    await page.route('**/api/leads', async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, body: '{}' });
    });
    await page.goto('/sparkkeeper/beta');
    await page.evaluate(() => document.getElementById('beta-main')!.setAttribute('data-endpoint', 'http://localhost:4322'));
    await page.locator('#name').fill('Test Person');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#business').fill('Test Co');
    await page.locator('#country').selectOption('Australia');
    await page.locator('#work').fill('Bookkeeping for tradies');
    await page.locator('#first').fill('Chasing invoices');
    await page.locator('#consent').check();
    await page.getByRole('button', { name: 'Send my application' }).click();
    await expect(page.locator('#beta-done')).toBeVisible();
    expect(body.type).toBe('beta');
    expect(body.business_type).toBe('Bookkeeping for tradies');
    expect(body.first_task).toBe('Chasing invoices');
    expect(body).not.toHaveProperty('message');
  });

  test('the failed-send message is not shown for the no-JavaScript case, and is for real failures', async ({ page }) => {
    await page.route('**/api/leads', (route) => route.fulfill({ status: 500, body: '{}' }));
    await page.goto('/sparkkeeper/beta');
    await page.evaluate(() => document.getElementById('beta-main')!.setAttribute('data-endpoint', 'http://localhost:4322'));
    await page.locator('#name').fill('Test Person');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#business').fill('Test Co');
    await page.locator('#country').selectOption('Australia');
    await page.locator('#work').fill('Bookkeeping');
    await page.locator('#consent').check();
    await page.getByRole('button', { name: 'Send my application' }).click();
    await expect(page.locator('#beta-fail')).toContainText("That didn't send. Please try again, or email info@sparkwing.com.au.");
  });

  test('announcement text and link are centred on the same line', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'compact', 'The two items wrap onto separate lines at 390.');
    await page.goto('/');
    const [text, link] = await Promise.all([
      page.locator('.sw-announce span').evaluate((el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; }),
      page.locator('.sw-announce a').evaluate((el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; }),
    ]);
    expect(Math.abs(text - link)).toBeLessThanOrEqual(1);
  });

  for (const route of [...motionPages, '/']) {
    test(`pause icon is visible, decorative and clear of the name: ${route}`, async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await page.goto(route);
      const icon = page.locator('[data-motion-trigger] .sw-motion-icon').first();
      await expect(icon).toBeVisible();
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('[data-motion-trigger]').first()).toHaveAttribute('aria-label', 'Pause animation');
      await expect(icon.locator('.sw-motion-icon-pause')).toBeVisible();
      await expect(icon.locator('.sw-motion-icon-play')).toBeHidden();
      await page.locator('[data-motion-trigger]').first().click();
      await page.getByRole('button', { name: /^Yes/ }).click();
      await expect(icon.locator('.sw-motion-icon-play')).toBeVisible();
      await expect(icon.locator('.sw-motion-icon-pause')).toBeHidden();
      await context.close();
    });
  }

  test('pause icon is not shown under reduced motion', async ({ page }) => {
    await page.goto('/spark-studio');
    await expect(page.locator('.sw-motion-icon').first()).toBeHidden();
  });

  test('pause icon glyph has at least 3:1 contrast against its circle', async ({ page }) => {
    await page.goto('/spark-studio');
    const ratio = await page.evaluate(() => {
      const el = document.querySelector('.sw-motion-icon') as HTMLElement;
      const s = getComputedStyle(el);
      const lum = (c: string) => {
        const [r, g, b] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const a = lum(s.color), b = lum(s.backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});

test.describe('medium width', () => {
  for (const width of [390, 1440]) {
    test(`no horizontal scroll on Sparkkeeper at ${width}`, async ({ page }, info) => {
      test.skip(info.project.name !== 'wide', 'The viewport is set inside the test.');
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/sparkkeeper');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  for (const route of ['/sparkkeeper', '/apps/magnet', '/apps/academy', '/apps/nest', '/spark-studio', '/trust', '/bring-ai-in', '/scale-ai']) {
    test(`no horizontal scroll at 768: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 900 });
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, route).toBeLessThanOrEqual(0);
    });
  }
});
