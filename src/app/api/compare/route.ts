import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compareStudies } from "@/lib/geminiCompare";
import type { Study } from "@prisma/client";

const COMPARABLE_GROUPS: Record<string, string[]> = {
  lab: ["sangre", "laboratorio"],
  imaging: ["resonancia", "tomografia", "radiografia", "ecografia", "mamografia"],
  ecg: ["electrocardiograma"],
  epicrisis: ["epicrisis"],
  other: ["otro"],
};

function getGroupLabel(types: string[]): string {
  for (const [group, values] of Object.entries(COMPARABLE_GROUPS)) {
    if (types.some((t) => values.includes(t))) return group;
  }
  return "other";
}

function getLabel(type: string): string {
  const labels: Record<string, string> = {
    sangre: "análisis de sangre",
    laboratorio: "análisis de laboratorio",
    resonancia: "resonancia magnética",
    tomografia: "tomografía",
    radiografia: "radiografía",
    ecografia: "ecografía",
    mamografia: "mamografía",
    electrocardiograma: "electrocardiograma",
    epicrisis: "epicrisis",
    otro: "estudio médico",
  };
  return labels[type] || "estudio médico";
}

function getGroupName(group: string): string {
  const names: Record<string, string> = {
    lab: "análisis de laboratorio",
    imaging: "estudios por imágenes",
    ecg: "electrocardiogramas",
    epicrisis: "epicrisis",
    other: "estudios médicos",
  };
  return names[group] || "estudios médicos";
}

function checkCompatibility(analyses: Array<{ study: Pick<Study, "title" | "studyType"> }>): string | null {
  const types = analyses.map((a) => a.study.studyType || "otro");
  const groups = [...new Set(types.map((t) => getGroupLabel([t])))];

  if (groups.length <= 1) return null;

  const typeDetails = types.map((t) => `"${getLabel(t)}"`).join(" y ");
  const groupNames = groups.map((g) => getGroupName(g)).join(" con ");

  return `No se pueden comparar ${typeDetails}. Los ${groupNames} miden parámetros distintos y no tienen métricas en común para establecer una comparación válida. Seleccioná estudios del mismo tipo (por ejemplo, dos análisis de laboratorio o dos estudios por imágenes).`;
}

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
        study: { select: { title: true, studyType: true, studyDate: true, createdAt: true } },
      },
    });

    if (analyses.length < 2) {
      return NextResponse.json(
        { error: "No se encontraron análisis para los estudios seleccionados." },
        { status: 404 }
      );
    }

    const incompatibility = checkCompatibility(analyses);
    if (incompatibility) {
      return NextResponse.json({ error: incompatibility }, { status: 400 });
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
