import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compareStudies } from "@/lib/geminiCompare";
import { canPerformComparison, incrementComparisonCount } from "@/lib/subscription";
import { RateLimitError, isAppError } from "@/lib/api-error";
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
    const comparisonLimit = await canPerformComparison(session.user.id);
    if (!comparisonLimit.allowed) {
      throw new RateLimitError(`Alcanzaste el límite de comparaciones gratis este mes. Actualizá a Pro para comparaciones ilimitadas.`);
    }

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

    await incrementComparisonCount(session.user.id);

    return NextResponse.json({
      id: comparison.id,
      ...result,
    });
  } catch (error) {
    console.error("Comparison error:", error);
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : "";
    if (message.includes("API_KEY") || message.includes("API key")) {
      return NextResponse.json(
        { error: "La API key de Gemini no está configurada correctamente." },
        { status: 500 }
      );
    }
    if (message.includes("503") || message.includes("Service Unavailable") || message.includes("high demand") || message.includes("temporary")) {
      return NextResponse.json(
        { error: "La IA de Google está temporalmente sobrecargada. Esperá unos segundos e intentá de nuevo." },
        { status: 503 }
      );
    }
    if (message.includes("quota") || message.includes("RATE_LIMIT") || message.includes("429")) {
      return NextResponse.json(
        { error: "La IA alcanzó su límite diario de análisis gratis. Esperá a mañana o configurá un plan pago." },
        { status: 429 }
      );
    }
    if (message.includes("SAFETY") || message.includes("blocked")) {
      return NextResponse.json(
        { error: "La IA rechazó la comparación por políticas de seguridad. Probá con otros estudios." },
        { status: 400 }
      );
    }
    if (message.includes("fetch") || message.includes("network") || message.includes("ERR_") || message.includes("ECONN")) {
      return NextResponse.json(
        { error: "Error de conexión con la IA. Verificá tu internet e intentá de nuevo." },
        { status: 503 }
      );
    }
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
