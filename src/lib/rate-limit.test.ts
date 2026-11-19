import { describe, expect, it } from "vitest";

import { clientIp, createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the maximum and then blocks", () => {
    const limiter = createRateLimiter(3, 1000);
    expect([1, 2, 3, 4].map(() => limiter.check("a", 0))).toEqual([true, true, true, false]);
  });

  it("tracks each key separately", () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("b", 0)).toBe(true);
    expect(limiter.check("a", 1)).toBe(false);
  });

  it("starts a fresh window once the window has elapsed", () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 999)).toBe(false);
    expect(limiter.check("a", 1000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for address", () => {
    const request = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(request)).toBe("1.2.3.4");
  });

  it("falls back to unknown", () => {
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
