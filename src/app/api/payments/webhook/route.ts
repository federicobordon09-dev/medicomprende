import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log("[Webhook MP] Received:", JSON.stringify({ type, data }));

    if (type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const payment = await getPayment(paymentId);
    console.log("[Webhook MP] Payment data:", JSON.stringify(payment, null, 2));

    let userId = payment.external_reference;

    // Fallback: buscar por preference_id si external_reference no llegó
    if (!userId && payment.preference_id) {
      console.log("[Webhook MP] external_reference vacío, buscando por preference_id:", payment.preference_id);
      const sub = await prisma.subscription.findFirst({
        where: { mpPreferenceId: payment.preference_id },
      });
      userId = sub?.userId;
      if (userId) {
        console.log("[Webhook MP] Usuario encontrado por preference_id:", userId);
      }
    }

    // Fallback final: buscar por mpSubscriptionId
    if (!userId) {
      console.log("[Webhook MP] Buscando suscripción por mpSubscriptionId:", paymentId);
      const sub = await prisma.subscription.findFirst({
        where: { mpSubscriptionId: paymentId },
      });
      userId = sub?.userId;
      if (userId) {
        console.log("[Webhook MP] Usuario encontrado por mpSubscriptionId:", userId);
      }
    }

    if (!userId) {
      console.log("[Webhook MP] No se pudo determinar userId para payment:", paymentId);
      return NextResponse.json({ received: true });
    }

    const status = payment.status;

    let subscriptionStatus: string;
    switch (status) {
      case "approved":
        subscriptionStatus = "active";
        break;
      case "pending":
        subscriptionStatus = "pending";
        break;
      case "in_process":
        subscriptionStatus = "pending";
        break;
      case "rejected":
      case "cancelled":
      case "refunded":
        subscriptionStatus = "expired";
        break;
      default:
        subscriptionStatus = "expired";
    }

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        status: subscriptionStatus,
        mpSubscriptionId: paymentId,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        status: subscriptionStatus,
        mpPreferenceId: payment.preference_id,
        mpSubscriptionId: paymentId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    console.log("[Webhook MP] Suscripción actualizada para usuario:", userId, "→", subscriptionStatus);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook MP] Error:", error);
    return NextResponse.json({ received: true });
  }
}
