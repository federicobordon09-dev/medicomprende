import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const handler = auth((req) => {
  if (!req.auth?.user?.id) {
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/");
    if (isApiRoute) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(url);
  }
});

export function proxy(request: NextRequest, ctx: { params: Promise<unknown> }) {
  return handler(request, ctx);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/studies/:path*",
    "/api/user/:path*",
    "/api/profiles/:path*",
    "/api/alerts/:path*",
    "/api/chat/:path*",
    "/api/compare/:path*",
    "/api/feedback/:path*",
  ],
};
