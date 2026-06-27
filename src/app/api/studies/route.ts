import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadPdf } from "@/lib/blob";
import { analyzeReport } from "@/lib/geminiClient";
import { sha256 } from "@/lib/utils";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-response";
import { ValidationError, ConflictError, RateLimitError } from "@/lib/api-error";
import { canPerformAnalysis, canStoreStudy, incrementAnalysisCount, getUserPlan } from "@/lib/subscription";
import { validatePdfUpload, isValidPdfMagic, checkAnalysisRateLimit, sanitizePdfText } from "@/lib/security";

export const maxDuration = 120;
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const type = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

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

    return apiSuccess({
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
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Rate limit
    const rateLimitResponse = await checkAnalysisRateLimit(request, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const profileId = formData.get("profileId") as string | null;
    const studyType = formData.get("studyType") as string | null;
    const studyDate = formData.get("studyDate") as string | null;
    const notes = formData.get("notes") as string | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      throw new ValidationError("No se recibió ningún archivo.");
    }

    // Validate file
    const validation = validatePdfUpload(file);
    if (!validation.valid) {
      throw new ValidationError(validation.error!);
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new ValidationError("El archivo es muy grande. Máximo 15MB.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Magic bytes check
    if (file.type === "application/pdf" && !isValidPdfMagic(buffer)) {
      throw new ValidationError("El archivo no parece ser un PDF válido.");
    }

    // Empty file check
    if (buffer.length < 100) {
      throw new ValidationError("El archivo está vacío o no contiene datos legibles.");
    }

    const fileHash = await sha256(arrayBuffer);

    const existing = await prisma.study.findFirst({
      where: { fileHash, userId: session.user.id },
    });
    if (existing) {
      throw new ConflictError("Este archivo ya fue subido anteriormente.");
    }

    const [analysisLimit, studyLimit] = await Promise.all([
      canPerformAnalysis(session.user.id),
      canStoreStudy(session.user.id),
    ]);

    if (!studyLimit.allowed) {
      throw new RateLimitError(`Alcanzaste el límite de ${studyLimit.remaining} estudios guardados. Actualizá a Pro para historial ilimitado.`);
    }

    if (!analysisLimit.allowed) {
      throw new RateLimitError(`Alcanzaste el límite de análisis gratis este mes. Actualizá a Pro para análisis ilimitados o esperá al próximo mes.`);
    }

    const fileUrl = await uploadPdf(buffer, file.name, session.user.id, file.type);

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
      const plan = await getUserPlan(session.user.id);
      const result = await analyzeReport(buffer, file.type, plan, sanitizePdfText);
      await incrementAnalysisCount(session.user.id);
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
      const msg = err instanceof Error ? err.message : "";
      const errStatus = typeof err === "object" && err !== null && "status" in err ? (err as any).status : null;
      let userError: string;
      let status: number;
      if (msg.includes("API_KEY") || msg.includes("API key")) {
        userError = "La API key de Gemini no está configurada correctamente.";
        status = 500;
      } else if (msg.includes("quota") || msg.includes("RATE_LIMIT") || msg.includes("429")) {
        userError = "La IA alcanzó su límite diario de análisis. Esperá a mañana o upgradéá el plan de Gemini API.";
        status = 429;
      } else if (errStatus === 503 || msg.includes("503") || msg.includes("Service Unavailable") || msg.includes("high demand")) {
        userError = "La IA de Google está temporalmente sobrecargada. Esperá unos segundos e intentá de nuevo desde el historial.";
        status = 503;
      } else if (msg.includes("imagen") || msg.includes("foto") || msg.includes("OCR") || msg.includes("Tesseract")) {
        // Errores específicos de imágenes — mostramos el mensaje real
        userError = msg;
        status = 400;
      } else {
        userError = "El archivo se guardó pero no pudimos analizarlo con la IA. Intentalo de nuevo desde el historial.";
        status = 500;
      }
      return NextResponse.json({
        study: { ...study, analysis: null },
        error: userError,
      }, { status });
    }

    return apiSuccess({
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
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json().catch(() => null);
    const ids: string[] | null = body?.ids ?? null;

    const where = ids
      ? { id: { in: ids }, userId: session.user.id }
      : { userId: session.user.id };

    const studies = await prisma.study.findMany({ where, select: { id: true, fileUrl: true } });

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

    return apiSuccess({ deleted: studies.length });
  } catch (error) {
    return apiError(error);
  }
}
