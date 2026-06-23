"use client";

import Link from "next/link";

interface UpgradeBannerProps {
  reason: "analyses" | "comparisons" | "studies";
  remaining: number;
}

export function UpgradeBanner({ reason, remaining }: UpgradeBannerProps) {
  const messages: Record<string, { title: string; description: string }> = {
    analyses: {
      title: "Te quedan {remaining} análisis este mes",
      description: "Actualizá a Pro para análisis ilimitados con IA.",
    },
    comparisons: {
      title: "Te quedan {remaining} comparaciones este mes",
      description: "Con Pro compará estudios sin límite.",
    },
    studies: {
      title: "Límite de estudios alcanzado ({remaining} disponibles)",
      description: "Actualizá a Pro para guardar todos tus estudios.",
    },
  };

  const msg = messages[reason];

  return (
    <div className="bg-gradient-to-r from-cta-500 to-cta-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {msg.title.replace("{remaining}", String(remaining))}
          </p>
          <p className="text-white/80 text-xs mt-1">{msg.description}</p>
          <Link
            href="/pricing"
            className="inline-block mt-2 text-xs font-bold bg-white text-cta-600 px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </div>
  );
}
