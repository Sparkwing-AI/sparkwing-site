/**
 * Worker-level Cloudflare Access puts the signed-in person on ctx.access.
 * There is no JWT to check here. A missing context or a missing email fails closed.
 */
export interface AccessIdentity {
  email?: string;
}

export interface WorkerAccess {
  getIdentity: () => Promise<AccessIdentity | null | undefined>;
}

/** Returns the signed-in email, or null when Access did not authenticate this request. */
export async function accessUser(ctx: ExecutionContext): Promise<string | null> {
  const access = (ctx as { access?: WorkerAccess }).access;
  if (!access) return null;
  try {
    const identity = await access.getIdentity();
    const email = identity?.email?.trim();
    return email ? email : null;
  } catch {
    return null;
  }
}
