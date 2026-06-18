import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-response";

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    await prisma.study.deleteMany({ where: { userId } });
    await prisma.alert.deleteMany({ where: { userId } });
    await prisma.comparison.deleteMany({ where: { userId } });
    await prisma.familyProfile.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return apiSuccess({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
