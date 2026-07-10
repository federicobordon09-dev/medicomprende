"use client";

import { useState, useRef, useEffect } from "react";
import { useStudies, useSubscription } from "@/lib/api-hooks";

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
  const { data: subData } = useSubscription();
  const { data: studiesData } = useStudies(50);

  useEffect(() => {
    if (subData?.plan) setUserPlan(subData.plan);
  }, [subData]);

  useEffect(() => {
    if (studiesData?.studies) {
      setStudies(studiesData.studies.filter((s) => s.analysis));
    }
  }, [studiesData]);

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
          <h1 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">Chat con IA</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 brutal-border-2 text-ink/60 hover:text-ink hover:bg-accent transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <aside
          className={`flex-shrink-0 bg-white brutal-border-2 overflow-hidden transition-all duration-200 var(--ease-out-expo) ${
            sidebarOpen ? "w-[280px] opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="flex flex-col h-full min-w-[280px]">
            <div className="px-4 py-3.5 brutal-border-b">
              <p className="font-mono font-bold uppercase text-sm text-ink">Tus estudios</p>
              <p className="text-xs font-mono text-ink/40 mt-0.5">{studies.length} con análisis</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {studies.length === 0 && (
                <p className="text-xs font-mono text-ink/40 text-center py-8">Subí un estudio para empezar</p>
              )}
              {studies.map((study) => (
                <button
                  key={study.id}
                  onClick={() => selectStudy(study)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm transition-all brutal-border-2 ${
                    selectedStudy?.id === study.id
                      ? "bg-accent text-ink"
                      : "bg-transparent text-ink/70 hover:bg-accent/30"
                  }`}
                >
                  <span className={`w-8 h-8 flex items-center justify-center flex-shrink-0 brutal-border-2 ${
                    selectedStudy?.id === study.id ? "bg-ink text-accent" : "bg-ink/10 text-ink/60"
                  }`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold uppercase text-xs truncate">{study.title}</p>
                    <p className="text-xs text-ink/40 truncate">{formatDate(study.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 bg-white brutal-border-2 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-3 px-5 py-3.5 brutal-border-b bg-accent/10">
            <div className="w-9 h-9 bg-accent text-ink brutal-border-2 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono font-bold uppercase text-sm text-ink">Doctor IA</p>
              <p className="text-xs font-mono text-ink/60">
                {selectedStudy ? `Consultando sobre: ${selectedStudy.title}` : "Seleccioná un estudio para empezar"}
              </p>
            </div>
            {userPlan && userPlan !== "pro" && (
              <a href="/pricing" className="text-xs font-mono font-bold uppercase text-accent-2 hover:underline px-3 py-1.5 transition-all">
                Pro
              </a>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-paper-2">
            {!selectedStudy && !showUpgrade && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-accent text-ink brutal-border-2 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-ink/70 font-mono font-bold uppercase">Seleccioná un estudio de tu historial</p>
                <p className="text-sm font-mono text-ink/50 mt-2 max-w-sm mx-auto">
                  Elegí un estudio analizado para conversar con la IA. Puedo ayudarte a entender resultados, términos y preparar preguntas para tu médico.
                </p>
              </div>
            )}

            {selectedStudy && messages.length === 0 && !showUpgrade && (
              <div className="space-y-4 py-4">
                <div className="bg-white brutal-border-2 p-4">
                  <p className="text-sm font-mono text-ink/70 leading-relaxed">
                    Analicé el estudio <strong>{selectedStudy.title}</strong>. ¿Qué querés saber? Podés preguntarme lo que necesites o elegir una de estas preguntas:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      disabled={sending}
                      className="text-left text-sm font-mono px-4 py-3 bg-white brutal-border-2 hover:bg-accent text-ink/70 hover:text-ink transition-all active:scale-[0.98] disabled:opacity-50 animate-[slideUp_0.3s_var(--ease-out-expo)_both]"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <span className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {q}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showUpgrade && (
              <div className="bg-accent/10 brutal-border-2 p-6 text-center max-w-sm mx-auto my-8">
                <div className="w-12 h-12 bg-accent-2 text-white brutal-border-2 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <p className="font-mono font-bold uppercase text-ink mb-1">Chat con IA exclusivo de Pro</p>
                <p className="text-sm font-mono text-ink/60 mb-4">Actualizá a Pro para conversar con la IA sobre tus estudios.</p>
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-sm font-mono font-bold uppercase brutal-btn"
                >
                  Ver planes
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="block mx-auto mt-3 text-sm font-mono font-bold uppercase text-ink/60 hover:text-ink"
                >
                  Cerrar
                </button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-[slideUp_0.3s_var(--ease-out-expo)_both]`}
              >
                <div
                  className={`max-w-[80%] brutal-border-2 px-4 py-3 text-sm font-mono leading-relaxed ${
                    msg.role === "user"
                      ? "bg-ink text-paper"
                      : "bg-white text-ink"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start animate-[slideUp_0.2s_var(--ease-out-expo)]">
                <div className="bg-white brutal-border-2 px-5 py-4">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-ink animate-[dotBounce_0.6s_ease-in-out_infinite]" />
                    <span className="w-2 h-2 bg-ink animate-[dotBounce_0.6s_ease-in-out_0.15s_infinite]" />
                    <span className="w-2 h-2 bg-ink animate-[dotBounce_0.6s_ease-in-out_0.3s_infinite]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="brutal-border-t p-4 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={!selectedStudy ? "Seleccioná un estudio primero" : userPlan === "pro" ? "Preguntá sobre tu estudio..." : "Disponible en plan Pro"}
                className="flex-1 brutal-input"
                disabled={sending || userPlan !== "pro" || !selectedStudy}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending || userPlan !== "pro" || !selectedStudy}
                className="w-11 h-11 brutal-btn flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/40 flex-shrink-0">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-[11px] font-mono text-ink/40">
                Información educativa. No reemplaza una consulta médica profesional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
