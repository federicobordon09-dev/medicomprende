import { describe, expect, it } from "vitest";
import { shouldRateLimitAuthRequest } from "../auth-rate-limit";

describe("shouldRateLimitAuthRequest", () => {
  it("limits only POST signin requests", () => {
    expect(shouldRateLimitAuthRequest("POST", "/api/auth/signin/google")).toBe(true);
    expect(shouldRateLimitAuthRequest("post", "/api/auth/signin")).toBe(true);
  });

  it("does not limit routine NextAuth reads", () => {
    expect(shouldRateLimitAuthRequest("GET", "/api/auth/session")).toBe(false);
    expect(shouldRateLimitAuthRequest("GET", "/api/auth/csrf")).toBe(false);
    expect(shouldRateLimitAuthRequest("GET", "/api/auth/providers")).toBe(false);
  });

  it("does not limit OAuth callbacks or error pages", () => {
    expect(shouldRateLimitAuthRequest("GET", "/api/auth/callback/google")).toBe(false);
    expect(shouldRateLimitAuthRequest("POST", "/api/auth/callback/google")).toBe(false);
    expect(shouldRateLimitAuthRequest("GET", "/api/auth/error")).toBe(false);
  });
});
