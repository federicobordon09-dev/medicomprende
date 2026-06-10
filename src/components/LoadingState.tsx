"use client";

import { useEffect, useState } from "react";
import { loading } from "@/data/contenido";

export default function LoadingState() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (loading.steps.length <= 1) return;
    const interval = setInterval(() => {
      setStepIdx((prev) => (prev < loading.steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-sk-900 via-sk-800 to-sk-950">
      <div className="max-w-md mx-auto text-center py-16 reveal visible">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-[4px] border-white/20" />
          <div className="absolute inset-0 rounded-full border-[4px] border-coral-400 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF7A66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
            </svg>
          </div>
        </div>

        <p className="font-display font-semibold text-2xl text-white mb-2">{loading.title}</p>
        <p className="text-sm text-sk-300 mb-8 max-w-sm mx-auto">{loading.subtitle}</p>

        <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden mb-8 ring-1 ring-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-coral-500 via-mint-400 to-coral-500 animate-[shimmer_2.5s_linear_infinite] origin-left"
            style={{
              transform: `scaleX(${(stepIdx + 1) / loading.steps.length})`,
              backgroundSize: "200% 100%",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          {loading.steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-500 ${
                i <= stepIdx ? "opacity-100 translate-x-0" : "opacity-30 -translate-x-2"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                  i < stepIdx
                    ? "bg-mint-400 text-white"
                    : i === stepIdx
                      ? "bg-coral-400 text-white ring-2 ring-coral-400/50"
                      : "bg-white/20 text-white/60"
                }`}
              >
                {i < stepIdx ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              <span className={`text-sm font-medium ${i <= stepIdx ? "text-sk-200" : "text-white/40"}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
