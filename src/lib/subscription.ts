import { prisma } from "./prisma";
import { ForbiddenError } from "./api-error";

export const FREE_LIMITS = {
  MAX_ANALYSES_PER_MONTH: 3,
  MAX_COMPARISONS_PER_MONTH: 2,
  MAX_STUDIES_STORED: 10,
} as const;

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUserPlan(userId: string): Promise<"free" | "pro"> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (sub?.status === "active" && sub.currentPeriodEnd > new Date()) {
    return "pro";
  }

  return "free";
}

export async function canPerformAnalysis(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const plan = await getUserPlan(userId);
  if (plan === "pro") return { allowed: true, remaining: Infinity };

  return checkUsageLimit(userId, "analysesCount", FREE_LIMITS.MAX_ANALYSES_PER_MONTH);
}

export async function canPerformComparison(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const plan = await getUserPlan(userId);
  if (plan === "pro") return { allowed: true, remaining: Infinity };

  return checkUsageLimit(userId, "comparisonsCount", FREE_LIMITS.MAX_COMPARISONS_PER_MONTH);
}

export async function canStoreStudy(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const plan = await getUserPlan(userId);
  if (plan === "pro") return { allowed: true, remaining: Infinity };

  const count = await prisma.study.count({ where: { userId } });
  const remaining = Math.max(0, FREE_LIMITS.MAX_STUDIES_STORED - count);
  return { allowed: remaining > 0, remaining };
}

async function checkUsageLimit(
  userId: string,
  field: "analysesCount" | "comparisonsCount",
  maxAllowed: number
): Promise<{ allowed: boolean; remaining: number }> {
  const month = getCurrentMonth();

  const usage = await prisma.usageLimit.findUnique({
    where: { userId_month: { userId, month } },
  });

  const currentCount = usage?.[field] ?? 0;
  const remaining = Math.max(0, maxAllowed - currentCount);

  return { allowed: currentCount < maxAllowed, remaining };
}

export async function incrementAnalysisCount(userId: string): Promise<void> {
  await incrementUsage(userId, "analysesCount");
}

export async function incrementComparisonCount(userId: string): Promise<void> {
  await incrementUsage(userId, "comparisonsCount");
}

async function incrementUsage(userId: string, field: "analysesCount" | "comparisonsCount"): Promise<void> {
  const month = getCurrentMonth();

  await prisma.usageLimit.upsert({
    where: { userId_month: { userId, month } },
    update: { [field]: { increment: 1 } },
    create: {
      userId,
      month,
      [field]: 1,
    },
  });
}

export async function requireSubscription(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  if (plan !== "pro") {
    throw new ForbiddenError("Esta funcionalidad requiere el plan Pro. Actualizá tu plan en Configuración.");
  }
}
