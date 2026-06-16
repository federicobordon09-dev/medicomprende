import Link from "next/link";

interface EmptyStateProps {
  icon?: "document" | "search" | "alert" | "profile" | "upload";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  document: (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="8" width="32" height="48" rx="4" />
      <path d="M24 20h16M24 28h16M24 36h10" strokeWidth="2" />
      <circle cx="44" cy="44" r="10" strokeWidth="2" />
      <path d="M40 44h8M44 40v8" strokeWidth="2" />
    </svg>
  ),
  search: (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="28" cy="28" r="14" />
      <path d="M38 38l12 12" strokeWidth="2" />
    </svg>
  ),
  alert: (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M32 12v28M32 48v4" strokeWidth="2" />
      <circle cx="32" cy="32" r="22" strokeWidth="1.5" />
    </svg>
  ),
  profile: (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="32" cy="22" r="10" strokeWidth="1.5" />
      <path d="M16 52c0-8.84 7.16-16 16-16s16 7.16 16 16" strokeWidth="1.5" />
    </svg>
  ),
  upload: (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M48 38v8a4 4 0 01-4 4H20a4 4 0 01-4-4v-8" strokeWidth="1.5" />
      <path d="M32 16v24M24 24l8-8 8 8" strokeWidth="2" />
    </svg>
  ),
};

export function EmptyState({
  icon = "document",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const btnClass = "inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-coral-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]";

  const content = (
    <div className="text-center py-16 px-6">
      <div className="text-sk-300 mb-6 flex justify-center empty-state-icon" style={{ animation: "fadeInScale 0.5s var(--ease-out-expo) 0.1s both, emptyStateFloat 3s var(--ease-in-out-expo) 1s infinite" }}>
        {ICONS[icon]}
      </div>
      <h3 className="font-display font-semibold text-xl text-warm-950 mb-2" style={{ animation: "slideUp 0.5s var(--ease-out-expo) 0.2s both" }}>
        {title}
      </h3>
      <p className="text-warm-500 max-w-md mx-auto mb-8" style={{ animation: "slideUp 0.5s var(--ease-out-expo) 0.3s both" }}>
        {description}
      </p>
      {(actionLabel && actionHref) ? (
        <Link
          href={actionHref}
          className={btnClass}
          style={{ animation: "slideUp 0.5s var(--ease-out-expo) 0.4s both" }}
        >
          {actionLabel}
        </Link>
      ) : (actionLabel && onAction) ? (
        <button
          onClick={onAction}
          className={btnClass}
          style={{ animation: "slideUp 0.5s var(--ease-out-expo) 0.4s both" }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );

  return content;
}
