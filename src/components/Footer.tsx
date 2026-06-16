import { footer } from "@/data/contenido";

export default function Footer() {
  return (
    <footer className="bg-azul-950 text-azul-300 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="text-center md:text-left">
            <div className="font-display font-bold text-2xl text-white mb-2">{footer.brand}</div>
            <p className="text-sm text-sk-400">{footer.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-sk-800/50 rounded-full px-4 py-2 text-sk-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Procesamiento en memoria
            </div>
            <div className="flex items-center gap-2 text-xs bg-sk-800/50 rounded-full px-4 py-2 text-sk-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Sin almacenamiento
            </div>
          </div>
        </div>
        <div className="border-t border-sk-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <span className="text-sm text-sk-500">
            &copy; 2026 {footer.brand} &middot; {footer.copyright}
          </span>
        </div>
      </div>
    </footer>
  );
}
