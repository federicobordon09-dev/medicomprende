"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { hero } from "@/data/contenido";

interface Props {
  onAnalyze: (file: File) => void;
  disabled?: boolean;
}

export default function HeroUpload({ onAnalyze, disabled }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      alert("Solo aceptamos archivos PDF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert("El archivo es muy grande. Máximo 10 MB.");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const handleSubmit = () => { if (file) onAnalyze(file); };
  const handleRemove = () => setFile(null);

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-sk-950 via-sk-900 to-sk-950">
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <Image
          src="/assets/images/banner_01.png"
          alt=""
          fill
          className="object-cover opacity-[0.04]"
          sizes="100vw"
          priority
        />
      </div>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[12%] left-[8%] w-64 h-64 rounded-full bg-coral-500/10 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[5%] w-80 h-80 rounded-full bg-mint-500/8 blur-[120px] animate-float-slow" />
        <div className="absolute top-[40%] right-[20%] w-2 h-2 rounded-full bg-coral-300/40 animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-[30%] left-[15%] w-1.5 h-1.5 rounded-full bg-mint-300/40 animate-float-delayed" />
        <div className="absolute top-[60%] left-[5%] w-1 h-1 rounded-full bg-white/30 animate-float" style={{ animationDelay: "1.2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 text-center lg:text-left max-w-xl">
          <div
            className={`inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 rounded-full px-3.5 py-1.5 mb-6 transition-all duration-700 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
            <span className="text-xs font-medium text-sk-200 tracking-wide">{hero.badge}</span>
          </div>

          <h1
            className={`font-display font-extrabold text-[clamp(2rem,5vw,3.8rem)] leading-[1.08] text-white mb-4 transition-all duration-700 delay-100 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {(() => {
              const parts = hero.title.match(/^(.*?)<em>(.*?)<\/em>(.*?)$/);
              if (!parts) return hero.title;
              return (
                <>
                  {parts[1]}
                  <span className="relative inline-block">
                    <span className="text-coral-400 relative z-10">{parts[2]}</span>
                    <span className="absolute bottom-1 left-0 right-0 h-3 bg-coral-500/20 rounded-full blur-sm -z-0" />
                  </span>
                  {parts[3]}
                </>
              );
            })()}
          </h1>

          <p
            className={`text-base sm:text-lg text-sk-200/80 leading-relaxed mb-8 max-w-lg transition-all duration-700 delay-200 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {hero.subtitle}
          </p>
        </div>

        <div
          className={`w-full max-w-md flex-shrink-0 transition-all duration-700 delay-300 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            hidden
            aria-hidden="true"
          />

          {!file ? (
            <button
              className={`w-full border-2 border-dashed rounded-2xl p-8 sm:p-10 cursor-pointer transition-all duration-300 text-center touch-manipulation ${
                dragOver
                  ? "border-coral-400 bg-coral-500/10 scale-[1.02] shadow-2xl shadow-coral-500/20"
                  : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 hover:shadow-xl"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
              aria-label="Seleccionar archivo PDF para analizar"
            >
              <div className={`mb-5 transition-all duration-500 ${dragOver ? "scale-110 -translate-y-1" : ""}`}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#99F6E4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto sm:w-[52px] sm:h-[52px]" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="font-semibold text-white text-base sm:text-lg mb-1">{hero.uploadText}</p>
              <p className="text-xs sm:text-sm text-sk-300">{hero.uploadHint}</p>
            </button>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-3 sm:gap-4 bg-white/10 rounded-xl p-3 mb-5">
                <div className="flex-shrink-0 w-10 h-10 bg-coral-500/20 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6" aria-hidden="true">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                  <p className="text-xs text-sk-300">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button
                  onClick={handleRemove}
                  className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
                  aria-label="Quitar archivo"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <button
                className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[48px] sm:min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] transition-transform duration-150 ease-out touch-manipulation"
                onClick={handleSubmit}
                disabled={disabled}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {hero.cta}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
