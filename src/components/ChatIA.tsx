"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatIAProps {
  studyId: string;
  studyTitle: string;
  userPlan: string | null;
}

const SUGGESTED_QUESTIONS = [
  "Explicame este estudio en palabras simples",
  "¿Qué valores están fuera de rango?",
  "¿Qué debería preguntarle a mi médico?",
  "¿Este resultado es preocupante?",
];

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

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content || sending) return;

    if (userPlan !== "pro") {
      setShowUpgrade(true);
      return;
    }

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    if (!text) setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
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
        if (res.status === 503) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.error || "La IA está sobrecargada ahora. Esperá unos segundos e intentá de nuevo." },
          ]);
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
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent text-ink brutal-border-2 brutal-shadow-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center"
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] bg-white brutal-border-2 brutal-shadow flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 brutal-border-b bg-accent/10">
              <div className="w-8 h-8 bg-accent text-ink brutal-border-2 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold uppercase text-sm text-ink">Doctor IA</p>
                <p className="text-xs font-mono text-ink/60 truncate">{studyTitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 hover:bg-ink/10 brutal-border-2 flex items-center justify-center text-ink/40 hover:text-ink transition-all flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[420px] bg-paper-2">
              {messages.length === 0 && !showUpgrade && (
                <div className="space-y-3 py-2">
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-accent text-ink brutal-border-2 flex items-center justify-center mx-auto mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
                      </svg>
                    </div>
                    <p className="text-sm font-mono font-bold uppercase text-ink/70">Preguntale a la IA sobre este estudio</p>
                    <p className="text-xs font-mono text-ink/50 mt-1">O elegí una pregunta:</p>
                  </div>
                  <div className="space-y-1.5">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={q}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.06 }}
                        onClick={() => handleSend(q)}
                        disabled={sending}
                        className="w-full text-left text-xs font-mono px-3.5 py-2.5 bg-white brutal-border-2 hover:bg-accent text-ink/70 hover:text-ink transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {showUpgrade && (
                <div className="bg-accent/10 brutal-border-2 p-4 text-center">
                  <div className="w-10 h-10 bg-accent-2 text-white brutal-border-2 flex items-center justify-center mx-auto mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <p className="font-mono font-bold uppercase text-sm text-ink mb-1">Chat con IA exclusivo de Pro</p>
                  <p className="text-xs font-mono text-ink/60 mb-3">Actualizá a Pro para conversar con la IA sobre tus estudios.</p>
                  <a href="/pricing" className="brutal-btn text-xs">
                    Ver planes
                  </a>
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="block mx-auto mt-2 text-xs font-mono font-bold uppercase text-ink/60 hover:text-ink"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] brutal-border-2 px-3.5 py-2.5 text-sm font-mono leading-relaxed ${
                        msg.role === "user"
                          ? "bg-ink text-paper"
                          : "bg-white text-ink"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white brutal-border-2 px-4 py-3">
                    <div className="flex gap-1.5 items-center h-3">
                      <motion.span
                        className="w-2 h-2 bg-ink"
                        animate={{ y: [0, -7, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-ink"
                        animate={{ y: [0, -7, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.12 }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-ink"
                        animate={{ y: [0, -7, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.24 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="brutal-border-t p-3 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Preguntá sobre tu estudio..."
                  className="flex-1 brutal-input text-sm"
                  disabled={sending}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 brutal-btn flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/40 flex-shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p className="text-[10px] font-mono text-ink/40">
                  Información educativa. No reemplaza una consulta médica.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
