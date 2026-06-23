"use client";

import { useRouter } from "next/navigation";

interface PricingCardProps {
  name: string;
  price: string;
  priceSublabel: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  ctaAction?: () => void;
  ctaLoading?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  badge?: string;
}

export function PricingCard({
  name,
  price,
  priceSublabel,
  features,
  highlighted = false,
  cta,
  ctaAction,
  ctaLoading = false,
  disabled = false,
  disabledReason,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col ${
        highlighted
          ? "bg-azul-900 text-white ring-2 ring-cta-500 scale-[1.02] shadow-2xl"
          : "bg-white text-warm-950 border border-azul-200/60"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cta-500 text-white text-xs font-bold px-4 py-1 rounded-full">
          {badge}
        </span>
      )}

      <div className="mb-6">
        <h3 className={`font-display font-semibold text-lg mb-1 ${highlighted ? "text-white" : "text-warm-950"}`}>
          {name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className={`font-display font-bold text-4xl ${highlighted ? "text-white" : "text-warm-950"}`}>
            {price}
          </span>
          <span className={`text-sm ${highlighted ? "text-azul-300" : "text-warm-500"}`}>
            {priceSublabel}
          </span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className={`w-5 h-5 mt-0.5 shrink-0 ${highlighted ? "text-cta-400" : "text-teal-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className={`text-sm ${highlighted ? "text-azul-200" : "text-warm-600"}`}>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={ctaAction}
        disabled={disabled || ctaLoading}
        className={`w-full font-semibold py-3 px-6 rounded-xl text-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${
          highlighted
            ? "bg-cta-500 hover:bg-cta-600 text-white"
            : "bg-azul-100 hover:bg-azul-200 text-azul-900"
        }`}
      >
        {ctaLoading ? "Procesando…" : disabled ? disabledReason || cta : cta}
      </button>
    </div>
  );
}
