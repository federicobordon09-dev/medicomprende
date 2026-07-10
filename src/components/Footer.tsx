import Link from "next/link";
import { footer } from "@/data/contenido";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper py-14 px-6 border-t-[3px] border-accent">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          <div>
            <div className="font-display font-bold text-2xl uppercase tracking-tight text-paper mb-2">
              <span className="text-paper">Medi</span>
              <span className="bg-accent text-ink px-1">Comprende</span>
            </div>
            <p className="text-sm text-paper/60 font-mono">{footer.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold bg-paper/10 brutal-border-2 px-4 py-2 text-paper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Procesamiento en memoria
            </div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold bg-paper/10 brutal-border-2 px-4 py-2 text-paper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Sin almacenamiento
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          <Link href="/pricing" className="text-sm font-mono font-bold uppercase text-paper/60 hover:text-accent transition-colors">Planes</Link>
          <Link href="/privacidad" className="text-sm font-mono font-bold uppercase text-paper/60 hover:text-accent transition-colors">Privacidad</Link>
          <Link href="/terminos" className="text-sm font-mono font-bold uppercase text-paper/60 hover:text-accent transition-colors">Términos</Link>
        </div>
        <div className="border-t-[3px] border-paper/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <span className="text-sm text-paper/50 font-mono">
            &copy; 2026 {footer.brand} &middot; {footer.copyright}
          </span>
        </div>
      </div>
    </footer>
  );
}
