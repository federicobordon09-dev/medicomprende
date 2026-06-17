import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Eliminar todos los estudios del usuario (los blobs se eliminan vía cascada)
    await prisma.study.deleteMany({ where: { userId } });

    // Eliminar datos relacionados
    await prisma.alert.deleteMany({ where: { userId } });
    await prisma.comparison.deleteMany({ where: { userId } });
    await prisma.familyProfile.deleteMany({ where: { userId } });

    // Eliminar cuentas OAuth y sesiones
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });

    // Finalmente eliminar el usuario
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Error al eliminar la cuenta. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
