"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

const TIPOS = [
  { value: "sugerencia", label: "Sugerencia", desc: "Una idea para mejorar MediComprende", icon: "💡" },
  { value: "reporte", label: "Reportar error", desc: "Algo no funciona como debería", icon: "🔧" },
] as const;

export function FeedbackWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!tipo || mensaje.trim().length < 10) return;
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tipo === "sugerencia" ? "Sugerencia" : "Reportar error",
          message: mensaje,
          contact: email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setEnviado(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const resetForm = () => {
    setOpen(false);
    setTimeout(() => {
      setTipo(null);
      setMensaje("");
      setEmail("");
      setEnviado(false);
      setError("");
    }, 300);
  };

  if (!session?.user || isAuthPage) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-accent text-ink brutal-border-2 brutal-shadow-sm flex items-center justify-center transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        aria-label="Enviar feedback"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-paper brutal-border-l flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {enviado ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-accent text-ink brutal-border-2 flex items-center justify-center mx-auto mb-5">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mb-2">¡Gracias por tu mensaje!</h2>
              <p className="text-ink/60 text-sm font-mono leading-relaxed">
                Tu {tipo === "sugerencia" ? "sugerencia" : "reporte"} nos ayuda a mejorar.
                Lo revisamos y te respondemos si es necesario.
              </p>
              <button
                onClick={resetForm}
                className="mt-6 text-sm font-mono font-bold uppercase text-accent-2 hover:underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-5 brutal-border-b">
              <div>
                <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight">Ideas y comentarios</h2>
                <p className="text-sm font-mono text-ink/60 mt-0.5">
                  Ayudanos a mejorar MediComprende con tus sugerencias o reportando errores.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="w-9 h-9 bg-ink/10 hover:bg-ink/20 brutal-border-2 flex items-center justify-center text-ink transition-colors flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-mono font-bold uppercase text-ink mb-3">¿Qué tipo de mensaje es?</label>
                <div className="grid grid-cols-2 gap-3">
                  {TIPOS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTipo(t.value)}
                      className={`relative text-left p-4 brutal-border-2 transition-all active:scale-[0.98] ${
                        tipo === t.value
                          ? "bg-accent text-ink"
                          : "bg-white text-ink hover:bg-accent/50"
                      }`}
                    >
                      <span className="text-xl block mb-1.5">{t.icon}</span>
                      <span className="text-sm font-bold font-mono block">{t.label}</span>
                      <span className="text-xs text-ink/60 mt-0.5 block leading-snug font-mono">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="fw-mensaje" className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">
                  Contanos más
                </label>
                <textarea
                  id="fw-mensaje"
                  rows={5}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder={
                    tipo === "sugerencia"
                      ? "Contanos tu idea para mejorar..."
                      : tipo === "reporte"
                      ? "Describí el error que encontraste..."
                      : "Seleccioná un tipo de mensaje..."
                  }
                  className="brutal-input resize-none"
                />
                <p className="text-xs text-ink/40 mt-1.5 text-right font-mono">
                  {mensaje.length} caracteres{mensaje.length > 0 && mensaje.length < 10 ? " (mínimo 10)" : ""}
                </p>
              </div>

              <div>
                <label htmlFor="fw-email" className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">
                  ¿Cómo te contactamos?
                </label>
                <div className="flex items-center gap-2 bg-ink/5 brutal-border-2 px-3.5 py-1.5 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/60 flex-shrink-0">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4l-10 8L2 4" />
                  </svg>
                  <span className="text-xs font-mono text-ink/60">Solo necesitamos tu email para responderte</span>
                </div>
                <input
                  id="fw-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="brutal-input"
                />
                <p className="text-xs text-ink/40 mt-1.5 font-mono">Opcional — si querés que te respondamos</p>
              </div>

              {error && (
                <p className="text-sm font-mono text-white bg-accent-2 brutal-border-2 px-3 py-2">{error}</p>
              )}
            </div>

            <div className="px-6 py-4 brutal-border-t">
              <button
                onClick={handleSubmit}
                disabled={!tipo || mensaje.trim().length < 10 || enviando}
                className="w-full brutal-btn"
              >
                {enviando ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                    </svg>
                    Enviando…
                  </span>
                ) : (
                  "Enviar mensaje"
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-ink/30 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
