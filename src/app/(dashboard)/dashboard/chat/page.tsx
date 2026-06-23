"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((data) => setUserPlan(data.plan || "free"))
      .catch(() => setUserPlan("free"));
  }, []);

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
          studyIds: [],
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
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="font-display font-bold text-2xl text-warm-950">Chat con IA</h1>
        <p className="text-warm-500 text-sm mt-0.5">Conversá con la IA sobre tus estudios médicos.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-azul-200/60 flex flex-col overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-azul-100 bg-gradient-to-r from-cta-50 to-azul-50">
          <div className="w-9 h-9 rounded-xl bg-cta-500 flex items-center justify-center text-white flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-warm-950">Doctor IA</p>
            <p className="text-xs text-warm-500">Respondo preguntas sobre tus estudios médicos</p>
          </div>
          {userPlan && userPlan !== "pro" && (
            <a href="/pricing" className="text-xs font-semibold text-cta-600 hover:text-cta-500 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-all">
              Pro
            </a>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-azul-50/20">
          {messages.length === 0 && !showUpgrade && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-cta-100 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
                </svg>
              </div>
              <p className="text-warm-600 font-medium">Preguntale a la IA sobre tus estudios</p>
              <p className="text-sm text-warm-400 mt-2 max-w-sm mx-auto">
                Puedo ayudarte a entender términos médicos, interpretar resultados y preparar preguntas para tu médico.
              </p>
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

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-cta-500 text-white rounded-br-md"
                    : "bg-white border border-azul-200/50 text-warm-800 rounded-bl-md shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-azul-200/50 rounded-xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-azul-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-azul-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-azul-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
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
              placeholder={userPlan === "pro" ? "Preguntá sobre tus estudios..." : "Disponible en plan Pro"}
              className="flex-1 px-4 py-2.5 border border-azul-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all"
              disabled={sending || userPlan !== "pro"}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || userPlan !== "pro"}
              className="w-11 h-11 rounded-xl bg-cta-500 hover:bg-cta-600 disabled:bg-azul-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-[0.95] flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-warm-400 mt-2 text-center">
            Información educativa. No reemplaza una consulta médica.
          </p>
        </div>
      </div>
    </div>
  );
}
