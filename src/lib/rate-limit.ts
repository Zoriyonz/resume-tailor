/**
 * Fixed-window, in-memory rate limiter keyed by client identifier.
 *
 * Best effort only: state lives in one server instance, so on serverless hosting each
 * instance counts separately. It limits casual abuse; it is not a billing-grade control.
 */
export interface RateLimiter {
  /** Returns true if the request is allowed, false if the key is over its limit. */
  check(key: string, now?: number): boolean;
}

export function createRateLimiter(maxRequests: number, windowMs: number): RateLimiter {
  const hits = new Map<string, { count: number; windowStart: number }>();

  return {
    check(key, now = Date.now()) {
      const entry = hits.get(key);
      if (!entry || now - entry.windowStart >= windowMs) {
        hits.set(key, { count: 1, windowStart: now });
        return true;
      }
      if (entry.count >= maxRequests) return false;
      entry.count += 1;
      return true;
    },
  };
}

/** First address of x-forwarded-for, or "unknown". */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? (forwarded.split(",")[0] ?? "").trim() || "unknown" : "unknown";
}
