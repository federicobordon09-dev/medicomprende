import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-accent text-ink brutal-border-2 flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="font-display font-bold text-[clamp(4rem,15vw,8rem)] leading-none text-ink/20 mb-2">
          404
        </div>
        <h1 className="font-display font-bold text-[clamp(1.5rem,3vw,2.4rem)] text-ink uppercase tracking-tight mb-2">
          Página no encontrada
        </h1>
        <p className="text-base text-ink/60 font-mono max-w-md mx-auto mb-8 leading-relaxed">
          La página que buscás no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 brutal-btn text-base"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
