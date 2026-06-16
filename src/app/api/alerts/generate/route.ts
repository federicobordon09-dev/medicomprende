import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectAlerts } from "@/lib/geminiAlerts";

export async function POST(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const studies = await prisma.study.findMany({
      where: { userId: session.user.id },
      include: {
        analysis: {
          select: {
            summary: true,
            overallInterpretation: true,
            findings: true,
            outOfRangeValues: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (studies.length < 2) {
      return NextResponse.json({
        alerts: [],
        message: "Se necesitan al menos 2 estudios para generar alertas.",
      });
    }

    const studiesHistoryText = studies
      .map(
        (s: any, i: number) => `
--- Estudio ${i + 1}: ${s.title} (${s.studyDate || s.createdAt.toISOString().split("T")[0]}) ---
Resumen: ${s.analysis?.summary || "Sin análisis"}
Valores fuera de rango: ${JSON.stringify(s.analysis?.outOfRangeValues || [])}
Hallazgos: ${JSON.stringify(s.analysis?.findings || [])}
Interpretación: ${s.analysis?.overallInterpretation || ""}`
      )
      .join("\n");

    const result = await detectAlerts(studiesHistoryText);

    const createdAlerts = [];
    for (const alert of result.alerts) {
      const existing = await prisma.alert.findFirst({
        where: {
          userId: session.user.id,
          type: alert.type,
          acknowledged: false,
        },
      });

      if (!existing) {
        const created = await prisma.alert.create({
          data: {
            userId: session.user.id,
            studyIds: studies.map((s: any) => s.id),
            type: alert.type,
            severity: alert.severity,
            parameter: alert.parameter,
            title: alert.title,
            description: alert.description,
            trend: alert.trend,
          },
        });
        createdAlerts.push(created);
      }
    }

    return NextResponse.json({
      alerts: createdAlerts,
      count: createdAlerts.length,
    });
  } catch (error) {
    console.error("Alert generation error:", error);
    return NextResponse.json(
      { error: "Error al generar alertas." },
      { status: 500 }
    );
  }
}
