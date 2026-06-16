import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const comparison = await prisma.comparison.findFirst({
    where: { id, userId: session.user.id },
    include: {
      studies: {
        include: {
          study: { select: { id: true, title: true, studyDate: true } },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!comparison) {
    return NextResponse.json({ error: "Comparación no encontrada" }, { status: 404 });
  }

  const result = comparison.result as Record<string, unknown>;

  return NextResponse.json({
    id: comparison.id,
    ...result,
    studies: comparison.studies.map((s: any) => s.study),
    createdAt: comparison.createdAt,
  });
}
