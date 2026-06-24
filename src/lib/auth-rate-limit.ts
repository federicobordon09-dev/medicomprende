const RATE_LIMITED_AUTH_ACTIONS = new Set(["signin"]);

export function shouldRateLimitAuthRequest(method: string, pathname: string): boolean {
  if (method.toUpperCase() !== "POST") return false;

  const segments = pathname.split("/").filter(Boolean);
  const authIndex = segments.findIndex((segment) => segment === "auth");
  const action = authIndex >= 0 ? segments[authIndex + 1] : undefined;

  return action ? RATE_LIMITED_AUTH_ACTIONS.has(action) : false;
}
