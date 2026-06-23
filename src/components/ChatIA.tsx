"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatIAProps {
  studyId: string;
  studyTitle: string;
  userPlan: string | null;
}

export default function ChatIA({ studyId, studyTitle, userPlan }: ChatIAProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    if (userPlan !== "pro") {
      setShowUpgrade(true);
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          studyIds: [studyId],
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setShowUpgrade(true);
          setMessages((prev) => prev.filter((m) => m !== userMessage));
          return;
        }
        throw new Error(data.error || "Error al procesar el mensaje");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e instanceof Error ? e.message : "Error al procesar tu consulta." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-cta-500 to-cta-600 text-white shadow-[0_4px_20px_-4px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_28px_-6px_rgba(79,70,229,0.5)] transition-all active:scale-[0.95] flex items-center justify-center"
        aria-label="Chat con IA"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.2)] border border-azul-200/60 flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-azul-100 bg-gradient-to-r from-cta-50 to-azul-50">
            <div className="w-8 h-8 rounded-lg bg-cta-500 flex items-center justify-center text-white flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-warm-950">Doctor IA</p>
              <p className="text-xs text-warm-500 truncate">{studyTitle}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/50 flex items-center justify-center text-warm-400 hover:text-warm-600 transition-all flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px] bg-azul-50/30">
            {messages.length === 0 && !showUpgrade && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-cta-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
                  </svg>
                </div>
                <p className="text-sm text-warm-600 font-medium">Preguntale a la IA sobre tu estudio</p>
                <p className="text-xs text-warm-400 mt-1">Ej: "¿Qué significa este resultado?"</p>
              </div>
            )}

            {showUpgrade && (
              <div className="bg-cta-50 border border-cta-200 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-cta-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <p className="font-semibold text-sm text-cta-900 mb-1">Chat con IA exclusivo de Pro</p>
                <p className="text-xs text-cta-700 mb-3">Actualizá a Pro para conversar con la IA sobre tus estudios.</p>
                <a
                  href="/pricing"
                  className="inline-block text-xs font-semibold px-4 py-2 rounded-lg bg-cta-500 hover:bg-cta-600 text-white transition-all"
                >
                  Ver planes
                </a>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="block mx-auto mt-2 text-xs text-cta-600 hover:text-cta-700"
                >
                  Cerrar
                </button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cta-500 text-white"
                      : "bg-white border border-azul-200/50 text-warm-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-azul-200/50 rounded-xl px-3.5 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-azul-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-azul-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-azul-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-azul-100 p-3 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Preguntá sobre tu estudio..."
                className="flex-1 px-3.5 py-2 border border-azul-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl bg-cta-500 hover:bg-cta-600 disabled:bg-azul-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-[0.95] flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-warm-400 mt-1.5 text-center">
              Información educativa. No reemplaza una consulta médica.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
