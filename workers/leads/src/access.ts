/**
 * Cloudflare Access covers all traffic to this Worker. This check is a second lock: the Worker also refuses any
 * request that does not carry a valid Access token for this application, so a mistake in the Access setup fails closed.
 */
interface Jwk extends JsonWebKey {
  kid: string;
}

let cachedKeys: { fetchedAt: number; keys: Jwk[] } | null = null;

const b64 = (input: string): Uint8Array => {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

async function signingKeys(teamDomain: string): Promise<Jwk[]> {
  if (cachedKeys && Date.now() - cachedKeys.fetchedAt < 10 * 60_000) return cachedKeys.keys;
  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error(`Access certs request failed with ${response.status}`);
  const { keys } = (await response.json()) as { keys: Jwk[] };
  cachedKeys = { fetchedAt: Date.now(), keys };
  return keys;
}

export interface AccessEnv {
  /** For example sparkwing.cloudflareaccess.com. Not a secret. */
  ACCESS_TEAM_DOMAIN?: string;
  /** The Access application's AUD tag. Not a secret. */
  ACCESS_AUD?: string;
}

/** Returns the signed-in email, or null when the request has no valid Access token. */
export async function accessUser(request: Request, env: AccessEnv): Promise<string | null> {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(new TextDecoder().decode(b64(parts[0]))) as { kid?: string; alg?: string };
    if (header.alg !== 'RS256') return null;
    const jwk = (await signingKeys(env.ACCESS_TEAM_DOMAIN)).find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      b64(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (!valid) return null;
    const claims = JSON.parse(new TextDecoder().decode(b64(parts[1]))) as {
      aud?: string[] | string;
      iss?: string;
      exp?: number;
      email?: string;
    };
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!aud.includes(env.ACCESS_AUD)) return null;
    if (claims.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return null;
    if (!claims.exp || claims.exp * 1000 < Date.now()) return null;
    return claims.email ?? 'unknown';
  } catch {
    return null;
  }
}
