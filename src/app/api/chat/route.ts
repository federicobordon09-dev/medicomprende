import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSubscription } from "@/lib/subscription";
import { chatWithContext } from "@/lib/geminiChat";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await requireSubscription(session.user.id);
  } catch {
    return NextResponse.json(
      { error: "El Chat con IA es exclusivo del plan Pro. Actualizá tu plan en Configuración para usar esta función." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { message, studyIds, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const whereStudies: Record<string, unknown> = { userId: session.user.id };
    if (studyIds && Array.isArray(studyIds) && studyIds.length > 0) {
      whereStudies.id = { in: studyIds };
    }

    const studies = await prisma.study.findMany({
      where: whereStudies as any,
      include: {
        analysis: {
          select: {
            summary: true,
            overallInterpretation: true,
            findings: true,
            outOfRangeValues: true,
            parameterExplanations: true,
            recommendations: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (studies.length === 0) {
      return NextResponse.json({
        response: "No encontré estudios en tu historial. Subí algunos informes médicos para que pueda ayudarte a entenderlos.",
      });
    }

    const context = studies
      .map(
        (s: any, i: number) => `
[Estudio ${i + 1}: ${s.title} - ${s.studyDate || s.createdAt.toISOString().split("T")[0]}]
${s.analysis ? `Resumen: ${s.analysis.summary}\nHallazgos: ${JSON.stringify(s.analysis.findings)}\nValores fuera de rango: ${JSON.stringify(s.analysis.outOfRangeValues)}\nInterpretación: ${s.analysis.overallInterpretation}` : "Sin análisis disponible"}`
      )
      .join("\n\n");

    const chatHistory = (history || []).map((h: { role: string; content: string }) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    }));

    const response = await chatWithContext(message, context, chatHistory);

    return NextResponse.json({
      response,
      disclaimer: "Esta información es educativa y no reemplaza la consulta con un profesional de la salud.",
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Error al procesar tu consulta. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
