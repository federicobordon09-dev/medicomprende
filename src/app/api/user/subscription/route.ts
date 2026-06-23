import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-response";
import { getUserPlan, getCurrentMonth } from "@/lib/subscription";
import type { Subscription } from "@prisma/client";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    if (body.action === "cancel") {
      const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
      if (!sub) {
        return apiSuccess({ message: "No hay suscripción activa." });
      }

      await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      });

      return apiSuccess({ message: "Suscripción cancelada exitosamente." });
    }

    return apiError(new Error("Acción no válida"));
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await requireAuth();

    const [plan, subscription, usage] = await Promise.all([
      getUserPlan(session.user.id),
      prisma.subscription.findUnique({ where: { userId: session.user.id } }),
      prisma.usageLimit.findUnique({
        where: { userId_month: { userId: session.user.id, month: getCurrentMonth() } },
      }),
    ]);

    const studiesCount = await prisma.study.count({ where: { userId: session.user.id } });

    return apiSuccess({
      plan,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
            currentPeriodStart: subscription.currentPeriodStart.toISOString(),
            cancelledAt: subscription.cancelledAt?.toISOString() ?? null,
          }
        : null,
      usage: {
        analysesCount: usage?.analysesCount ?? 0,
        comparisonsCount: usage?.comparisonsCount ?? 0,
        studiesCount,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
