import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeReport } from "@/lib/geminiClient";
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
    const buffer = await readFileBuffer(study.fileUrl);

    if (buffer.length > MAX_ANALYSIS_BYTES) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande para analizarlo (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Máximo 15 MB.` },
        { status: 400 }
      );
    }

    // Extraemos el texto del PDF y lo enviamos a Gemini como texto.
    // Esto es más confiable que mandar el PDF inline (muchos modelos no lo soportan).
    const { extractTextFromPdf } = await import("@/lib/pdfExtractor");
    let extractedText: string;
    try {
      extractedText = await extractTextFromPdf(buffer);
    } catch {
      return NextResponse.json(
        { error: "No pudimos leer el texto de este archivo. Probá con un PDF que tenga texto seleccionable o volvé a subirlo." },
        { status: 422 }
      );
    }

    const result = await analyzeReport(extractedText);

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
