/** Connection hints for spam review. The raw IP is never returned, stored or logged. */

export interface VisitorSource {
  ip_hash: string | null;
  detected_country: string | null;
  detected_region: string | null;
}

function countryOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  // XX is Cloudflare's "unknown". Anything else that is not a country code is left empty.
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX') return null;
  return code;
}

function regionOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80);
  if (!cleaned || !/[\p{L}]/u.test(cleaned)) return null;
  return cleaned;
}

async function hashIp(ip: string | null, secret: string | undefined): Promise<string | null> {
  const value = ip?.trim() ?? '';
  const keyMaterial = secret?.trim() ?? '';
  if (!value || !keyMaterial) return null;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(keyMaterial), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
    return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch {
    console.error('ip hash failed');
    return null;
  }
}

/** Reads the IP only to hash it, and reads country and region only. City and coordinates are ignored. */
export async function visitorSource(request: Request, secret: string | undefined): Promise<VisitorSource> {
  const cf = request.cf;
  return {
    ip_hash: await hashIp(request.headers.get('CF-Connecting-IP'), secret),
    detected_country: countryOf(cf?.country),
    detected_region: regionOf(cf?.region),
  };
}
