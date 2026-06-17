import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeReport } from "@/lib/geminiClient";
import fs from "fs/promises";
import path from "path";

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

    const effectiveMimeType = study.fileMimeType || "application/pdf";
    const MAX_BYTES = 15 * 1024 * 1024;
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande para analizarlo (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Máximo 15 MB.` },
        { status: 400 }
      );
    }

    // Enviamos el archivo directo a Gemini (PDF o imagen).
    // Gemini extrae el texto Y lo analiza internamente - no necesita OCR ni extracción previa.
    const result = await analyzeReport(buffer, effectiveMimeType);

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
    // Devolvemos el error real de Gemini para que el usuario vea qué pasó
    if (message.includes("Gemini:")) {
      const geminiMsg = message.replace("Gemini:", "").trim();
      if (geminiMsg.includes("API_KEY") || geminiMsg.includes("API key")) {
        return NextResponse.json(
          { error: "La API key de Gemini no está configurada correctamente." },
          { status: 500 }
        );
      }
      if (geminiMsg.includes("quota") || geminiMsg.includes("RATE_LIMIT") || geminiMsg.includes("429")) {
        return NextResponse.json(
          { error: "La IA está sobrecargada. Esperá un minuto e intentá de nuevo." },
          { status: 429 }
        );
      }
      if (geminiMsg.includes("SAFETY") || geminiMsg.includes("blocked")) {
        return NextResponse.json(
          { error: "La IA rechazó el archivo por políticas de seguridad. Probá con otro archivo." },
          { status: 400 }
        );
      }
      if (geminiMsg.includes("timed out") || geminiMsg.includes("timeout") || geminiMsg.includes("deadline")) {
        return NextResponse.json(
          { error: "La IA tardó demasiado en responder. Probá con un archivo más chico." },
          { status: 504 }
        );
      }
      if (geminiMsg.includes("fetch") || geminiMsg.includes("network") || geminiMsg.includes("ERR_")) {
        return NextResponse.json(
          { error: "Error de conexión con la IA. Verificá tu internet e intentá de nuevo." },
          { status: 503 }
        );
      }
      // Para otros errores de Gemini, devolvemos el mensaje real
      return NextResponse.json({ error: geminiMsg }, { status: 500 });
    }
    if (message.includes("No pudimos extraer") || message.includes("selectable")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "No pudimos analizar el estudio. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
