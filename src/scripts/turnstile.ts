/** Cloudflare Turnstile for the website forms. Loads only when a form is sent, so nothing extra runs on page load. */

type TurnstileApi = {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
};

let load: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  load ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
      if (api) resolve(api);
      else reject(new Error('turnstile'));
    };
    script.onerror = () => {
      load = undefined;
      reject(new Error('turnstile'));
    };
    document.head.append(script);
  });
  return load;
}

/**
 * A fresh single-use token. It shows nothing unless Cloudflare needs the visitor to do something,
 * and then the check appears inside `near`. Resolves to an empty string when no site key is set,
 * or if the check fails, and the server then decides.
 */
export async function turnstileToken(sitekey: string | undefined, action: string, near: HTMLElement): Promise<string> {
  if (!sitekey) return '';
  let api: TurnstileApi;
  try {
    api = await loadTurnstile();
  } catch {
    return '';
  }
  const holder = document.createElement('div');
  near.append(holder);
  return new Promise((resolve) => {
    let widget = '';
    const finish = (token: string) => {
      window.clearTimeout(limit);
      if (widget) api.remove(widget);
      holder.remove();
      resolve(token);
    };
    const limit = window.setTimeout(() => finish(''), 30_000);
    widget = api.render(holder, {
      sitekey,
      action,
      appearance: 'interaction-only',
      callback: (token: string) => finish(token),
      'error-callback': () => finish(''),
      'expired-callback': () => finish(''),
    });
  });
}
