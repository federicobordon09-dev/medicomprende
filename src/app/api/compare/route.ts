import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compareStudies } from "@/lib/geminiCompare";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { studyIds, type = "two_way" } = body;

    if (!studyIds || !Array.isArray(studyIds) || studyIds.length < 2) {
      return NextResponse.json(
        { error: "Seleccioná al menos 2 estudios para comparar." },
        { status: 400 }
      );
    }

    const analyses = await prisma.analysis.findMany({
      where: {
        studyId: { in: studyIds },
        study: { userId: session.user.id },
      },
      include: {
        study: { select: { title: true, studyDate: true, createdAt: true } },
      },
    });

    if (analyses.length < 2) {
      return NextResponse.json(
        { error: "No se encontraron análisis para los estudios seleccionados." },
        { status: 404 }
      );
    }

    const analysesText = analyses
      .map(
        (a: any, i: number) => `
--- Estudio ${i + 1}: ${a.study.title} (${a.study.studyDate || a.study.createdAt.toISOString().split("T")[0]}) ---
Resumen: ${a.summary}
Hallazgos: ${JSON.stringify(a.findings)}
Valores fuera de rango: ${JSON.stringify(a.outOfRangeValues)}
Interpretación: ${a.overallInterpretation}`
      )
      .join("\n");

    const result = await compareStudies(analysesText);

    const comparison = await prisma.comparison.create({
      data: {
        userId: session.user.id,
        type,
        result: result as any,
        studies: {
          create: studyIds.map((studyId: string, index: number) => ({
            studyId,
            orderIndex: index,
          })),
        },
      },
    });

    return NextResponse.json({
      id: comparison.id,
      ...result,
    });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json(
      { error: "Error al comparar los estudios. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const comparisons = await prisma.comparison.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      studies: {
        include: {
          study: { select: { id: true, title: true, studyDate: true } },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return NextResponse.json(comparisons);
}
