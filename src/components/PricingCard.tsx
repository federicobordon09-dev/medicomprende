"use client";

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
      className={`relative flex flex-col ${
        highlighted
          ? "bg-ink text-paper brutal-shadow-accent"
          : "bg-paper text-ink brutal-shadow"
      } brutal-border`}
    >
      {badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent-2 text-white text-xs font-mono font-bold uppercase px-3 py-1 brutal-border-2 z-10">
          {badge}
        </span>
      )}

      <div className="p-6">
        <h3 className="font-display font-bold text-lg uppercase tracking-tight mb-1">
          {name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className={`font-display font-bold text-4xl ${highlighted ? "text-accent" : "text-ink"}`}>
            {price}
          </span>
          <span className={`text-sm font-mono ${highlighted ? "text-paper/60" : "text-ink/60"}`}>
            {priceSublabel}
          </span>
        </div>
      </div>

      <div className="brutal-divider" />

      <div className="p-6 flex-1">
        <ul className="space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-mono">
              <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 brutal-border-2 ${
                highlighted ? "bg-accent text-ink" : "bg-ink text-paper"
              }`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className={highlighted ? "text-paper" : "text-ink"}>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={ctaAction}
          disabled={disabled || ctaLoading}
          className={`w-full brutal-btn text-sm ${
            highlighted
              ? "bg-accent text-ink"
              : "bg-ink text-paper hover:bg-accent hover:text-ink"
          }`}
        >
          {ctaLoading ? "Procesando…" : disabled ? disabledReason || cta : cta}
        </button>
      </div>
    </div>
  );
}
