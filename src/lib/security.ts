/**
 * Verifies that the Origin header matches the Host header on state-changing requests.
 * Used for CSRF mitigation on all state-changing POST requests.
 */
export function verifyCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    const referer = request.headers.get('referer');
    if (!referer) {
      return false;
    }
    try {
      const refererUrl = new URL(referer);
      const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }

  try {
    const originUrl = new URL(origin);
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
    return originUrl.host === host;
  } catch {
    return false;
  }
}
