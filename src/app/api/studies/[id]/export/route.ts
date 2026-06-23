import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSubscription } from "@/lib/subscription";
import { generateAnalysisPdf } from "@/lib/pdfExport";

export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await requireSubscription(session.user.id);

    const { id } = await params;

    const study = await prisma.study.findFirst({
      where: { id, userId: session.user.id },
      include: {
        analysis: true,
        profile: { select: { id: true, name: true, color: true } },
      },
    });

    if (!study) {
      return NextResponse.json({ error: "Estudio no encontrado" }, { status: 404 });
    }

    if (!study.analysis) {
      return NextResponse.json({ error: "Este estudio aún no tiene análisis. Analizalo primero." }, { status: 400 });
    }

    const pdfBuffer = await generateAnalysisPdf({
      id: study.id,
      title: study.title,
      studyType: study.studyType,
      studyDate: study.studyDate?.toISOString() ?? null,
      fileUrl: study.fileUrl,
      fileSize: study.fileSize,
      ocrApplied: study.ocrApplied,
      profileId: study.profileId,
      profile: study.profile,
      analysis: study.analysis
        ? {
            id: study.analysis.id,
            summary: study.analysis.summary,
            overallInterpretation: study.analysis.overallInterpretation,
            findings: study.analysis.findings as any,
            medicalTerms: study.analysis.medicalTerms as any,
            outOfRangeValues: study.analysis.outOfRangeValues as any,
            createdAt: study.analysis.createdAt.toISOString(),
          }
        : null,
      createdAt: study.createdAt.toISOString(),
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="analisis-${study.title.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[PDF Export] Error:", error);
    const message = error instanceof Error ? error.message : "Error al generar el PDF";
    const status = message.includes("requiere el plan Pro") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
