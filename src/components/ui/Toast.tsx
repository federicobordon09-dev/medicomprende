"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setExiting((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        setExiting((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }, 300);
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }, 300);
  };

  const colors: Record<string, string> = {
    success: "bg-ink text-paper",
    error: "bg-accent-2 text-white",
    info: "bg-ink text-paper",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${colors[t.type]} brutal-border-2 px-4 py-3 flex items-center gap-3 relative overflow-hidden ${exiting.has(t.id) ? "toast-exit" : ""}`}
            style={{ animation: exiting.has(t.id) ? "none" : "toastSlideIn 0.4s var(--ease-out-expo) forwards" }}
          >
            <span className="text-sm font-mono flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="opacity-70 hover:opacity-100"
              aria-label="Cerrar"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 h-0.5 bg-white/30" style={{ animation: "toastProgress 4s linear forwards" }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
