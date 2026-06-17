import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadPdf } from "@/lib/blob";
import { analyzeReport } from "@/lib/geminiClient";
import { sha256 } from "@/lib/utils";

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (profileId) where.profileId = profileId;
  if (type) where.studyType = type;

  const [studies, total] = await Promise.all([
    prisma.study.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        analysis: {
          select: {
            id: true,
            summary: true,
            overallInterpretation: true,
            outOfRangeValues: true,
            createdAt: true,
          },
        },
        profile: {
          select: { id: true, name: true, color: true },
        },
      },
    }),
    prisma.study.count({ where: where as any }),
  ]);

  return NextResponse.json({
    studies: studies.map((s: any) => ({
      ...s,
      analysis: s.analysis
        ? {
            ...s.analysis,
            outOfRangeValues: s.analysis.outOfRangeValues as any[] | null,
          }
        : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const profileId = formData.get("profileId") as string | null;
    const studyType = formData.get("studyType") as string | null;
    const studyDate = formData.get("studyDate") as string | null;
    const notes = formData.get("notes") as string | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es muy grande. Máximo 15MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileHash = await sha256(arrayBuffer);

    const existing = await prisma.study.findFirst({
      where: { fileHash, userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este archivo ya fue subido anteriormente." },
        { status: 409 }
      );
    }

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Formato no soportado. Usá PDF o imagen." }, { status: 400 });
    }

    const fileUrl = await uploadPdf(buffer, file.name, session.user.id);

    const study = await prisma.study.create({
      data: {
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        studyType: studyType || null,
        studyDate: studyDate ? new Date(studyDate) : null,
        fileUrl,
        fileHash,
        fileSize: file.size,
        fileMimeType: file.type,
        ocrApplied: false,
        notes: notes || null,
        profileId,
        userId: session.user.id,
      },
    });

    let analysis;
    try {
      // Enviamos el archivo directo a Gemini (PDF o imagen).
      // Gemini extrae el texto y lo analiza internamente - no necesita OCR ni extracción previa.
      const result = await analyzeReport(buffer, file.type);
      analysis = await prisma.analysis.create({
        data: {
          studyId: study.id,
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
    } catch (err) {
      console.error("Analysis error for study", study.id, err);
      const msg = err instanceof Error ? err.message : "";
      let userError: string;
      let status: number;
      if (msg.includes("API_KEY") || msg.includes("API key")) {
        userError = "La API key de Gemini no está configurada correctamente.";
        status = 500;
      } else if (msg.includes("quota") || msg.includes("RATE_LIMIT") || msg.includes("429")) {
        userError = "La IA alcanzó su límite diario de análisis. Esperá a mañana o upgradéá el plan de Gemini API.";
        status = 429;
      } else {
        userError = "El archivo se guardó pero no pudimos analizarlo con la IA. Intentalo de nuevo desde el historial.";
        status = 500;
      }
      return NextResponse.json({
        study: { ...study, analysis: null },
        error: userError,
      }, { status });
    }

    return NextResponse.json({
      study: {
        ...study,
        analysis: {
          ...analysis,
          outOfRangeValues: analysis.outOfRangeValues as any[] | null,
          parameterExplanations: analysis.parameterExplanations as any[] | null,
        },
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error al procesar el archivo. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Si viene un array de ids en el body, eliminar solo esos
  // Si no, eliminar todos los estudios del usuario
  const body = await request.json().catch(() => null);
  const ids: string[] | null = body?.ids ?? null;

  try {
    const where = ids
      ? { id: { in: ids }, userId: session.user.id }
      : { userId: session.user.id };

    const studies = await prisma.study.findMany({ where, select: { id: true, fileUrl: true } });

    // Eliminar archivos del blob storage
    for (const study of studies) {
      try {
        const { deletePdf } = await import("@/lib/blob");
        await deletePdf(study.fileUrl);
      } catch {
        // Si falla la eliminación del blob, igual seguimos
      }
    }

    await prisma.$transaction([
      prisma.comparisonStudy.deleteMany({ where: { studyId: { in: studies.map(s => s.id) } } }),
      prisma.study.deleteMany({ where }),
    ]);

    return NextResponse.json({ deleted: studies.length });
  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json({ error: "Error al eliminar estudios." }, { status: 500 });
  }
}
