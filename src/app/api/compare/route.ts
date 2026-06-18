import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compareStudies } from "@/lib/geminiCompare";
import type { Study } from "@prisma/client";

const STUDY_GROUPS: Record<string, { label: string; description: string; types: string[] }> = {
  lab: {
    label: "análisis de laboratorio",
    description: "parámetros bioquímicos (glucosa, colesterol, etc.)",
    types: ["sangre", "laboratorio"],
  },
  imaging: {
    label: "estudios por imágenes",
    description: "imágenes anatómicas (estructuras, tejidos, órganos)",
    types: ["resonancia", "tomografia", "radiografia", "ecografia", "mamografia"],
  },
  ecg: {
    label: "electrocardiogramas",
    description: "actividad eléctrica del corazón",
    types: ["electrocardiograma"],
  },
  epicrisis: {
    label: "epicrisis",
    description: "resúmenes clínicos y evolución del paciente",
    types: ["epicrisis"],
  },
  other: {
    label: "estudios médicos",
    description: "información médica general",
    types: ["otro"],
  },
};

const TYPE_LABELS: Record<string, string> = {
  sangre: "análisis de sangre",
  laboratorio: "análisis de laboratorio",
  resonancia: "resonancia magnética",
  tomografia: "tomografía",
  radiografia: "radiografía",
  ecografia: "ecografía",
  mamografia: "mamografía",
  electrocardiograma: "electrocardiograma",
  epicrisis: "epicrisis",
  otro: "estudio",
};

function getStudyGroup(type: string): string {
  for (const [group, config] of Object.entries(STUDY_GROUPS)) {
    if (config.types.includes(type)) return group;
  }
  return "other";
}

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || `estudio de tipo "${type}"`;
}

function checkCompatibility(analyses: Array<{ study: Pick<Study, "title" | "studyType"> }>): string | null {
  const types = analyses.map((a) => a.study.studyType || "otro");
  const groups = [...new Set(types.map(getStudyGroup))];

  if (groups.length <= 1) return null;

  const groupDescriptions: string[] = [];
  for (const type of types) {
    const group = getStudyGroup(type);
    const config = STUDY_GROUPS[group];
    if (config) {
      groupDescriptions.push(`"${getTypeLabel(type)}" (mide ${config.description})`);
    }
  }

  const uniqueDescriptions = [...new Set(groupDescriptions)];

  return [
    `No se pueden comparar los estudios seleccionados porque son de tipos distintos:`,
    ...uniqueDescriptions.map((d) => `  • ${d}`),
    ``,
    `Cada tipo de estudio analiza aspectos diferentes del organismo y no comparten métricas comparables. Seleccioná dos o más estudios del mismo tipo (por ejemplo, dos análisis de sangre o dos resonancias) para obtener una comparación válida.`,
  ].join("\n");
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
