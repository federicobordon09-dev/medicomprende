"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Study {
  id: string;
  title: string;
  studyType: string | null;
  studyDate: string | null;
  analysis: { summary: string; id: string } | null;
  createdAt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Explicame este estudio en palabras simples",
  "¿Qué valores están fuera de rango?",
  "¿Qué debería preguntarle a mi médico?",
  "¿Este resultado es preocupante?",
  "Resumime los hallazgos principales",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

function StudyIcon({ type }: { type: string | null }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export default function ChatPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((data) => setUserPlan(data.plan || "free"))
      .catch(() => setUserPlan("free"));

    fetch("/api/studies?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.studies || [];
        setStudies(list.filter((s: Study) => s.analysis));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectStudy = (study: Study) => {
    setSelectedStudy(study);
    setMessages([]);
    setShowUpgrade(false);
  };

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
          studyIds: selectedStudy ? [selectedStudy.id] : [],
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
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-2xl text-warm-950">Chat con IA</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-warm-500 hover:text-warm-700 hover:bg-warm-100 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex-shrink-0 bg-white rounded-2xl border border-azul-200/60 overflow-hidden shadow-sm lg:block hidden"
            >
              <div className="flex flex-col h-full">
                <div className="px-4 py-3.5 border-b border-azul-100">
                  <p className="font-semibold text-sm text-warm-950">Tus estudios</p>
                  <p className="text-xs text-warm-400 mt-0.5">{studies.length} con análisis</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {studies.length === 0 && (
                    <p className="text-xs text-warm-400 text-center py-8">Subí un estudio para empezar</p>
                  )}
                  {studies.map((study) => (
                    <button
                      key={study.id}
                      onClick={() => selectStudy(study)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        selectedStudy?.id === study.id
                          ? "bg-cta-50 border border-cta-200 text-cta-900"
                          : "hover:bg-azul-50 text-warm-700 border border-transparent"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedStudy?.id === study.id ? "bg-cta-500 text-white" : "bg-azul-100 text-azul-600"
                      }`}>
                        <StudyIcon type={study.studyType} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{study.title}</p>
                        <p className="text-xs text-warm-400 truncate">{formatDate(study.createdAt)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 bg-white rounded-2xl border border-azul-200/60 flex flex-col overflow-hidden shadow-sm min-w-0">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-azul-100 bg-gradient-to-r from-cta-50 to-azul-50">
            <div className="w-9 h-9 rounded-xl bg-cta-500 flex items-center justify-center text-white flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-warm-950">Doctor IA</p>
              <p className="text-xs text-warm-500">
                {selectedStudy ? `Consultando sobre: ${selectedStudy.title}` : "Seleccioná un estudio para empezar"}
              </p>
            </div>
            {userPlan && userPlan !== "pro" && (
              <a href="/pricing" className="text-xs font-semibold text-cta-600 hover:text-cta-500 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-all">
                Pro
              </a>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F8F9FB]">
            {!selectedStudy && !showUpgrade && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-cta-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-warm-600 font-medium">Seleccioná un estudio de tu historial</p>
                <p className="text-sm text-warm-400 mt-2 max-w-sm mx-auto">
                  Elegí un estudio analizado para conversar con la IA. Puedo ayudarte a entender resultados, términos y preparar preguntas para tu médico.
                </p>
              </div>
            )}

            {selectedStudy && messages.length === 0 && !showUpgrade && (
              <div className="space-y-4 py-4">
                <div className="bg-white border border-azul-200/50 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-warm-700 leading-relaxed">
                    Analicé el estudio <strong>{selectedStudy.title}</strong>. ¿Qué querés saber? Podés preguntarme lo que necesites o elegir una de estas preguntas:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => handleSend(q)}
                      disabled={sending}
                      className="text-left text-sm px-4 py-3 rounded-xl bg-white border border-azul-200/50 hover:border-cta-300 hover:bg-cta-50/30 text-warm-700 hover:text-cta-900 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 text-cta-500">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {q}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {showUpgrade && (
              <div className="bg-cta-50 border border-cta-200 rounded-xl p-6 text-center max-w-sm mx-auto my-8">
                <div className="w-12 h-12 rounded-xl bg-cta-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <p className="font-semibold text-cta-900 mb-1">Chat con IA exclusivo de Pro</p>
                <p className="text-sm text-cta-700 mb-4">Actualizá a Pro para conversar con la IA sobre tus estudios.</p>
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl bg-cta-500 hover:bg-cta-600 text-white transition-all"
                >
                  Ver planes
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="block mx-auto mt-3 text-sm text-cta-600 hover:text-cta-700"
                >
                  Cerrar
                </button>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cta-500 text-white rounded-br-md"
                        : "bg-white border border-azul-200/50 text-warm-800 rounded-bl-md shadow-sm"
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
                <div className="bg-white border border-azul-200/50 rounded-xl rounded-bl-md px-5 py-4 shadow-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    <motion.span
                      className="w-2 h-2 rounded-full bg-cta-500"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                    />
                    <motion.span
                      className="w-2 h-2 rounded-full bg-cta-500"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                    />
                    <motion.span
                      className="w-2 h-2 rounded-full bg-cta-500"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-azul-100 p-4 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={!selectedStudy ? "Seleccioná un estudio primero" : userPlan === "pro" ? "Preguntá sobre tu estudio..." : "Disponible en plan Pro"}
                className="flex-1 px-4 py-2.5 border border-azul-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all"
                disabled={sending || userPlan !== "pro" || !selectedStudy}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending || userPlan !== "pro" || !selectedStudy}
                className="w-11 h-11 rounded-xl bg-cta-500 hover:bg-cta-600 disabled:bg-azul-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-[0.95] flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400 flex-shrink-0">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-[11px] text-warm-400">
                Información educativa. No reemplaza una consulta médica profesional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
