import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSubscription } from "@/lib/subscription";
import { chatWithContext } from "@/lib/geminiChat";
import {
  ChatMessageSchema,
  checkRateLimit,
  rateLimitResponse,
  secureLog,
  RATE_LIMITS,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Rate limit
  const { allowed, retryAfter } = checkRateLimit(
    `chat:user:${session.user.id}`,
    RATE_LIMITS.CHAT.max,
    RATE_LIMITS.CHAT.windowMs
  );
  if (!allowed) return rateLimitResponse(retryAfter);

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

    // Validate input with Zod
    const validation = ChatMessageSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Datos inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { message, studyIds, history } = validation.data;

    const whereStudies: Record<string, unknown> = { userId: session.user.id };
    if (studyIds && studyIds.length > 0) {
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

    const chatHistory = (history || []).map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    }));

    const response = await chatWithContext(message, context, chatHistory);

    secureLog("info", "CHAT_SUCCESS", { userId: session.user.id });

    return NextResponse.json({
      response,
      disclaimer: "Esta información es educativa y no reemplaza la consulta con un profesional de la salud.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    secureLog("error", "CHAT_ERROR", {
      userId: session.user.id,
      error: message.substring(0, 200),
    });

    const statusCode = typeof error === "object" && error !== null && "status" in error ? (error as any).status : null;
    if (statusCode === 503 || message.includes("503") || message.includes("Service Unavailable") || message.includes("high demand") || message.includes("temporary")) {
      return NextResponse.json(
        { error: "La IA de Google está temporalmente sobrecargada. Esperá unos segundos e intentá de nuevo." },
        { status: 503 }
      );
    }
    if (message.includes("quota") || message.includes("RATE_LIMIT") || message.includes("429")) {
      return NextResponse.json(
        { error: "La IA alcanzó su límite diario. Esperá a mañana para seguir usando el chat." },
        { status: 429 }
      );
    }
    if (message.includes("SAFETY") || message.includes("blocked")) {
      return NextResponse.json(
        { error: "La IA rechazó la consulta por políticas de seguridad. Reformulá tu pregunta." },
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
      { error: "Error al procesar tu consulta. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
