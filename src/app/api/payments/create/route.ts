import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPreference } from "@/lib/mercadopago";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-response";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const PRO_PRICE = parseInt(process.env.NEXT_PUBLIC_PRO_PLAN_PRICE || "3000");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const existingSub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existingSub?.status === "active") {
      const now = new Date();
      if (existingSub.currentPeriodEnd > now) {
        return apiSuccess({
          message: "Ya tenés una suscripción activa.",
          subscription: existingSub,
        });
      }
    }

    const preference = await createPreference({
      title: "MediComprende Pro — Mensual",
      description: "Acceso ilimitado a análisis, comparaciones, exportación PDF e historial completo.",
      unitPrice: PRO_PRICE,
      currencyId: "ARS",
      externalReference: session.user.id,
      backUrls: {
        success: `${siteUrl}/dashboard/settings?payment=success`,
        failure: `${siteUrl}/dashboard/settings?payment=failure`,
        pending: `${siteUrl}/dashboard/settings?payment=pending`,
      },
      notificationUrl: `${siteUrl}/api/payments/webhook`,
    });

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        mpPreferenceId: preference.id,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId: session.user.id,
        status: "pending",
        mpPreferenceId: preference.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    return apiSuccess({
      initPoint: preference.init_point,
      preferenceId: preference.id,
    });
  } catch (error) {
    return apiError(error);
  }
}
