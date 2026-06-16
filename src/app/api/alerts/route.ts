import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const acknowledged = searchParams.get("acknowledged");
  const severity = searchParams.get("severity");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (acknowledged === "true") where.acknowledged = true;
  if (acknowledged === "false") where.acknowledged = false;
  if (severity) where.severity = severity;

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where: where as any,
      orderBy: [
        { severity: "asc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.alert.count({ where: where as any }),
  ]);

  const unreadCount = await prisma.alert.count({
    where: { userId: session.user.id, acknowledged: false },
  });

  return NextResponse.json({
    alerts,
    unreadCount,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { ids, acknowledged } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "IDs requeridos" }, { status: 400 });
  }

  await prisma.alert.updateMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
    data: {
      acknowledged: acknowledged ?? true,
      dismissedAt: acknowledged ? new Date() : null,
    },
  });

  return NextResponse.json({ success: true });
}
