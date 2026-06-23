import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePdf } from "@/lib/blob";
import { StudyUpdateSchema, secureLog } from "@/lib/security";

export async function GET(
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
    include: {
      analysis: true,
      profile: { select: { id: true, name: true, color: true, relation: true } },
    },
  });

  if (!study) {
    return NextResponse.json({ error: "Estudio no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...study,
    analysis: study.analysis
      ? {
          ...study.analysis,
          findings: study.analysis.findings as any[],
          medicalTerms: study.analysis.medicalTerms as any[],
          outOfRangeValues: study.analysis.outOfRangeValues as any[] | null,
          parameterExplanations: study.analysis.parameterExplanations as any[] | null,
        }
      : null,
  });
}

export async function DELETE(
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
  });

  if (!study) {
    return NextResponse.json({ error: "Estudio no encontrado" }, { status: 404 });
  }

  try {
    await deletePdf(study.fileUrl);
  } catch {
    console.warn("Could not delete blob for study", id);
  }

  await prisma.$transaction([
    prisma.comparisonStudy.deleteMany({ where: { studyId: id } }),
    prisma.study.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Validate with Zod
  const validation = StudyUpdateSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Datos inválidos";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const study = await prisma.study.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!study) {
    return NextResponse.json({ error: "Estudio no encontrado" }, { status: 404 });
  }

  const data = validation.data;

  const updated = await prisma.study.update({
    where: { id },
    data: {
      title: data.title ?? undefined,
      studyType: data.studyType ?? undefined,
      studyDate: data.studyDate ? new Date(data.studyDate) : undefined,
      notes: data.notes ?? undefined,
      profileId: data.profileId ?? undefined,
    },
  });

  secureLog("info", "STUDY_UPDATED", { userId: session.user.id, studyId: id });
  return NextResponse.json(updated);
}
