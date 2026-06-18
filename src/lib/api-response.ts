import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppError, isAppError, UnauthorizedError } from "@/lib/api-error";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session;
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  const message = error instanceof Error ? error.message : "Error interno del servidor";
  console.error("[API Error]", message, error);
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 }
  );
}

export function apiHandler(handler: (request: Request, ...args: any[]) => Promise<NextResponse>) {
  return async (request: Request, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return apiError(error);
    }
  };
}
