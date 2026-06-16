import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeReport } from "@/lib/geminiClient";
import fs from "fs/promises";
import path from "path";

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

    let text: string;
    if (study.ocrApplied) {
      const { extractTextFromImage } = await import("@/lib/ocrExtractor");
      text = await extractTextFromImage(buffer);
    } else {
      const { extractTextFromPdf } = await import("@/lib/pdfExtractor");
      try {
        text = await extractTextFromPdf(buffer);
      } catch {
        const { extractTextFromImage } = await import("@/lib/ocrExtractor");
        text = await extractTextFromImage(buffer);
      }
    }

    const result = await analyzeReport(text);

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
    return NextResponse.json(
      { error: "No pudimos analizar el estudio. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
