"use client";

import { useState, useCallback, useRef } from "react";
import type { ReportResult, PageState } from "@/lib/types";
import { hero, error as errorCopy } from "@/data/contenido";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import HeroUpload from "@/components/HeroUpload";
import LoadingState from "@/components/LoadingState";
import ResultAnalysis from "@/components/ResultAnalysis";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import ComoFunciona from "@/components/ComoFunciona";
import TiposInformes from "@/components/TiposInformes";
import Preguntas from "@/components/Preguntas";

export default function HomePage() {
  const [state, setState] = useState<PageState>("idle");
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useScrollReveal(".reveal, .reveal-left, .reveal-right, .reveal-scale");

  const handleAnalyze = useCallback(async (file: File) => {
    setState("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Ocurrió un error al analizar el informe.");
        setState("error");
        return;
      }

      setResult(data as ReportResult);
      setState("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMsg("Error de conexión. Verificá tu internet e intentá de nuevo.");
      setState("error");
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      {state === "idle" && <HeroUpload onAnalyze={handleAnalyze} disabled={false} />}

      {state === "loading" && <LoadingState />}

      {state === "error" && (
        <section className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-sk-900 via-sk-800 to-sk-950">
          <div className="max-w-lg mx-auto text-center py-16 animate-[scaleIn_0.4s_ease-out]">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="font-display font-semibold text-2xl text-white mb-2">{errorCopy.title}</h2>
            <p className="text-base text-sk-300 mb-8">{errorMsg || errorCopy.message}</p>
            <button
              className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl text-base min-h-[48px] active:scale-[0.97] transition-transform duration-150 ease-out"
              onClick={handleReset}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {errorCopy.retry}
            </button>
          </div>
        </section>
      )}

      {state === "result" && result && (
        <>
          <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-sk-900 via-sk-800 to-sk-950" ref={resultRef}>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display font-bold text-[clamp(1.6rem,3.5vw,2.6rem)] text-white mb-3 animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
                  Todo lo que necesitás saber
                </h2>
                <p className="text-base text-sk-300 max-w-lg mx-auto animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
                  Explicado en palabras simples para que entiendas cada parte de tu estudio.
                </p>
              </div>

              <div className="animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
                <ResultAnalysis result={result} />
              </div>

              <div className="text-center mt-10 animate-[fadeInUp_0.6s_ease-out_0.5s_both]">
                <button
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 font-semibold px-8 py-3.5 rounded-xl text-base min-h-[48px] active:scale-[0.97] transition-all duration-150 ease-out backdrop-blur-sm"
                  onClick={handleReset}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {hero.ctaReset}
                </button>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 px-6 bg-gradient-to-b from-white to-sk-50">
            <div className="max-w-2xl mx-auto">
              <DisclaimerBanner />
            </div>
          </section>
        </>
      )}

      {state !== "result" && (
        <>
          <TiposInformes />
          <Preguntas />
          <section className="py-12 md:py-16 px-6 bg-white">
            <div className="max-w-2xl mx-auto">
              <DisclaimerBanner />
            </div>
          </section>
        </>
      )}

      {state === "idle" && <ComoFunciona />}
    </>
  );
}
