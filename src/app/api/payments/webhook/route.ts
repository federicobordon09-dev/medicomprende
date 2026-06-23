import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const payment = await getPayment(paymentId);
    const userId = payment.external_reference;
    const status = payment.status;

    if (!userId) {
      return NextResponse.json({ received: true });
    }

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
        mpSubscriptionId: paymentId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook MP] Error:", error);
    return NextResponse.json({ received: true });
  }
}
