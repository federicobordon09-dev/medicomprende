import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse, secureLog, RATE_LIMITS } from "@/lib/security";

async function withRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit(
    `auth:ip:${ip}`,
    RATE_LIMITS.AUTH.max,
    RATE_LIMITS.AUTH.windowMs
  );
  if (!allowed) {
    secureLog("warn", "AUTH_RATE_LIMIT", { ip });
    return rateLimitResponse(retryAfter);
  }
  return handler(request);
}

export const GET = (request: NextRequest) => withRateLimit(request, handlers.GET);
export const POST = (request: NextRequest) => withRateLimit(request, handlers.POST);
