"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

const TYPES = ["Bug", "Sugerencia", "Idea"] as const;

export function FeedbackWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
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
    if (!type) { showToast("Seleccioná un tipo de mensaje.", "error"); return; }
    if (message.trim().length < 10) { showToast("El mensaje debe tener al menos 10 caracteres.", "error"); return; }

    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: message.trim(), contact: contact.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      showToast("¡Gracias! Tu mensaje fue enviado.", "success");
      setOpen(false);
      setType("");
      setMessage("");
      setContact("");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al enviar.", "error");
    } finally {
      setSending(false);
    }
  };

  if (!session?.user || isAuthPage) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-coral-500 hover:bg-coral-600 text-white shadow-xl hover:shadow-coral-500/25 flex items-center justify-center transition-all active:scale-90"
        aria-label="Enviar feedback"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl border-l border-sk-200 flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-sk-100">
          <div>
            <h2 className="font-display font-semibold text-xl text-warm-950">Ideas y comentarios</h2>
            <p className="text-sm text-warm-500 mt-0.5">Contanos qué te gustaría ver en la página, reportá un bug o dejanos cualquier sugerencia.</p>
          </div>
          <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-xl bg-sk-100 hover:bg-sk-200 flex items-center justify-center text-warm-500 transition-colors flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">¿Qué tipo de mensaje es?</label>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    type === t
                      ? "border-coral-500 bg-coral-50 text-coral-700"
                      : "border-sk-200 bg-white text-warm-600 hover:border-sk-300"
                  }`}
                >
                  {t === "Bug" && "🐛 "}{t === "Sugerencia" && "💡 "}{t === "Idea" && "✨ "}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="feedback-message" className="block text-sm font-medium text-warm-700 mb-2">
              ¿Qué mejorarías de la página?
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border-2 border-sk-200 bg-white px-4 py-3 text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all resize-none"
              placeholder="Contanos tu idea, bug o sugerencia..."
            />
          </div>

          <div>
            <label htmlFor="feedback-contact" className="block text-sm font-medium text-warm-700 mb-2">
              ¿Cómo te contactamos?
            </label>
            <input
              id="feedback-contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-xl border-2 border-sk-200 bg-white px-4 py-3 text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all"
              placeholder="Email, link de X/Twitter, Discord, etc."
            />
            <p className="text-xs text-warm-400 mt-1.5">
              Si dejás X o Discord, asegurate de poder recibir DMs en X y solicitudes de amistad o DMs en Discord para que podamos responderte.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-sk-100">
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="w-full bg-coral-500 hover:bg-coral-600 disabled:bg-sk-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="40" />
                </svg>
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
