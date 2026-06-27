import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeReport } from "@/lib/geminiClient";
import { canPerformAnalysis, incrementAnalysisCount, getUserPlan } from "@/lib/subscription";
import { RateLimitError } from "@/lib/api-error";
import fs from "fs/promises";
import path from "path";

const MAX_ANALYSIS_BYTES = 15 * 1024 * 1024;

export const maxDuration = 120;

async function readFileBuffer(fileUrl: string): Promise<Buffer> {
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    const response = await fetch(fileUrl);
    return Buffer.from(await response.arrayBuffer());
  }
  const localPath = path.join(process.cwd(), "public", fileUrl);
  return fs.readFile(localPath);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const study = await prisma.study.findFirst({
    where: { id, userId: session.user.id },
    include: { analysis: true },
  });

  if (!study) {
    return NextResponse.json({ error: "Estudio no encontrado" }, { status: 404 });
  }

  try {
    const analysisLimit = await canPerformAnalysis(session.user.id);
    if (!analysisLimit.allowed) {
      throw new RateLimitError(`Alcanzaste el límite de análisis gratis este mes. Actualizá a Pro para análisis ilimitados o esperá al próximo mes.`);
    }

    const buffer = await readFileBuffer(study.fileUrl);

    if (buffer.length > MAX_ANALYSIS_BYTES) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande para analizarlo (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Máximo 15 MB.` },
        { status: 400 }
      );
    }

    let extractedText: string;

    // Elegimos extractor según el tipo de archivo
    const isImage = study.fileMimeType && ["image/jpeg", "image/png", "image/webp"].includes(study.fileMimeType);

    if (isImage) {
      // ── Re-análisis de imagen: intentamos OCR ──
      try {
        const { extractTextFromImage } = await import("@/lib/ocrExtractor");
        extractedText = await extractTextFromImage(buffer);
      } catch {
        return NextResponse.json(
          { error: "No pudimos leer el texto de la foto. El reconocimiento de imágenes no está disponible en este entorno. Probá subiendo el PDF digital del informe." },
          { status: 422 }
        );
      }
    } else {
      // ── Re-análisis de PDF: extracción de texto con pdf-parse ──
      const { extractTextFromPdf } = await import("@/lib/pdfExtractor");
      try {
        extractedText = await extractTextFromPdf(buffer);
      } catch {
        return NextResponse.json(
          { error: "No pudimos leer el texto de este archivo. Probá con un PDF que tenga texto seleccionable o volvé a subirlo." },
          { status: 422 }
        );
      }
    }

    const plan = await getUserPlan(session.user.id);
    const result = await analyzeReport(extractedText, undefined, plan);
    await incrementAnalysisCount(session.user.id);

    if (study.analysis) {
      const updated = await prisma.analysis.update({
        where: { studyId: id },
        data: {
          summary: result.summary,
          overallInterpretation: result.overallInterpretation,
          findings: result.findings as any,
          medicalTerms: result.medicalTerms as any,
          outOfRangeValues: result.outOfRangeValues as any,
          parameterExplanations: result.parameterExplanations as any,
          possibleCauses: result.possibleCauses as any,
          recommendations: result.recommendations as any,
          suggestedQuestions: result.suggestedQuestions as any,
          rawAiResponse: result as any,
          promptVersion: "v2",
        },
      });
      return NextResponse.json(updated);
    }

    const analysis = await prisma.analysis.create({
      data: {
        studyId: id,
        summary: result.summary,
        overallInterpretation: result.overallInterpretation,
        findings: result.findings as any,
        medicalTerms: result.medicalTerms as any,
        outOfRangeValues: result.outOfRangeValues as any,
        parameterExplanations: result.parameterExplanations as any,
        possibleCauses: result.possibleCauses as any,
        recommendations: result.recommendations as any,
        suggestedQuestions: result.suggestedQuestions as any,
        rawAiResponse: result as any,
        promptVersion: "v2",
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Re-analysis error:", error);
    const message = error instanceof Error ? error.message : "";
    const statusCode = typeof error === "object" && error !== null && "status" in error ? (error as any).status : null;
    if (message.includes("API_KEY") || message.includes("API key")) {
      return NextResponse.json(
        { error: "La API key de Gemini no está configurada correctamente." },
        { status: 500 }
      );
    }
    if (message.includes("quota") || message.includes("RATE_LIMIT") || message.includes("429")) {
      return NextResponse.json(
        { error: "La IA alcanzó su límite diario de análisis gratis. Esperá a mañana o configurá un plan pago en console.cloud.google.com." },
        { status: 429 }
      );
    }
    if (statusCode === 503 || message.includes("503") || message.includes("Service Unavailable") || message.includes("high demand")) {
      return NextResponse.json(
        { error: "La IA de Google está temporalmente sobrecargada. Esperá unos segundos e intentá de nuevo." },
        { status: 503 }
      );
    }
    if (message.includes("SAFETY") || message.includes("blocked")) {
      return NextResponse.json(
        { error: "La IA rechazó el análisis por políticas de seguridad. Probá con otro archivo." },
        { status: 400 }
      );
    }
    if (message.includes("timed out") || message.includes("timeout") || message.includes("deadline")) {
      return NextResponse.json(
        { error: "La IA tardó demasiado en responder. Probá con un archivo más chico." },
        { status: 504 }
      );
    }
    if (message.includes("fetch") || message.includes("network") || message.includes("ERR_") || message.includes("ECONN")) {
      return NextResponse.json(
        { error: "Error de conexión con la IA. Verificá tu internet e intentá de nuevo." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: message || "No pudimos analizar el estudio. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
