import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";
import { verifyMpWebhookSignature, secureLog } from "@/lib/security";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint activo",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    // Verify webhook signature
    if (!verifyMpWebhookSignature(signature, rawBody)) {
      secureLog("warn", "MP_WEBHOOK_INVALID_SIGNATURE", {
        signature: signature || "none",
      });
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      secureLog("warn", "MP_WEBHOOK_INVALID_JSON", {});
      return NextResponse.json({ received: true });
    }

    const { type, data } = body;

    secureLog("info", "MP_WEBHOOK_RECEIVED", {
      type,
      paymentId: data?.id,
    });

    if (type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const payment = await getPayment(paymentId);

    secureLog("info", "MP_WEBHOOK_PAYMENT_DATA", {
      paymentId,
      status: payment.status,
      hasExternalRef: !!payment.external_reference,
    });

    let userId = payment.external_reference;

    // Fallback: buscar por preference_id si external_reference no llegó
    if (!userId && payment.preference_id) {
      secureLog("info", "MP_WEBHOOK_FALLBACK_PREFERENCE", { preferenceId: payment.preference_id });
      const sub = await prisma.subscription.findFirst({
        where: { mpPreferenceId: payment.preference_id },
      });
      userId = sub?.userId;
    }

    // Fallback final: buscar por mpSubscriptionId
    if (!userId) {
      secureLog("info", "MP_WEBHOOK_FALLBACK_SUBSCRIPTION", { paymentId });
      const sub = await prisma.subscription.findFirst({
        where: { mpSubscriptionId: paymentId },
      });
      userId = sub?.userId;
    }

    if (!userId) {
      secureLog("warn", "MP_WEBHOOK_NO_USER", { paymentId });
      return NextResponse.json({ received: true });
    }

    const status = payment.status;

    let subscriptionStatus: string;
    switch (status) {
      case "approved":
        subscriptionStatus = "active";
        break;
      case "pending":
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

    secureLog("info", "MP_WEBHOOK_SUBSCRIPTION_UPDATED", {
      userId,
      status: subscriptionStatus,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    secureLog("error", "MP_WEBHOOK_ERROR", {
      error: error instanceof Error ? error.message.substring(0, 200) : "unknown",
    });
    return NextResponse.json({ received: true });
  }
}
