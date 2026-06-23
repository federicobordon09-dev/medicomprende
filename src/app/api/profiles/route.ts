import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCreateProfile } from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const profiles = await prisma.familyProfile.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { studies: true } } },
    orderBy: { createdAt: "asc" },
  });

  const maxProfiles = (await canCreateProfile(session.user.id)).maxProfiles;

  return NextResponse.json({
    profiles: profiles.map((p: any) => ({
      id: p.id,
      name: p.name,
      relation: p.relation,
      color: p.color,
      studyCount: p._count.studies,
    })),
    maxProfiles: maxProfiles === Infinity ? 999 : maxProfiles,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, relation, color } = body;

  if (!name || !relation) {
    return NextResponse.json({ error: "Nombre y relación son requeridos" }, { status: 400 });
  }

  const profileLimit = await canCreateProfile(session.user.id);
  if (!profileLimit.allowed) {
    return NextResponse.json(
      { error: "Alcanzaste el límite de perfiles gratuitos. Actualizá a Pro para crear más perfiles." },
      { status: 400 }
    );
  }

  const profile = await prisma.familyProfile.create({
    data: {
      name,
      relation,
      color: color || "#0D9488",
      userId: session.user.id,
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, relation, color } = body;

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const profile = await prisma.familyProfile.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const updated = await prisma.familyProfile.update({
    where: { id },
    data: {
      name: name ?? undefined,
      relation: relation ?? undefined,
      color: color ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const profile = await prisma.familyProfile.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  await prisma.familyProfile.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
