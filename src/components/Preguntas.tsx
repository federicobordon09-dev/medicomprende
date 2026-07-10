"use client";

import { useState } from "react";
import { preguntas } from "@/data/contenido";

export default function Preguntas() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-20 md:py-28 px-4 sm:px-6 bg-paper border-t-[3px] border-ink relative overflow-hidden">
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="brutal-tag mb-4">FAQ</span>
          <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,3rem)] text-ink uppercase mt-4">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {preguntas.map((faq, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <div
                key={i}
                className={`brutal-card overflow-hidden transition-all duration-300 ${isOpen ? "bg-accent" : "bg-white"}`}
              >
                <button
                  id={buttonId}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 font-bold text-sm sm:text-base text-ink text-left gap-3 hover:bg-ink hover:text-paper transition-colors min-h-[52px] font-mono uppercase"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="flex-1">{faq.pregunta}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`flex-shrink-0 transition-transform duration-300 sm:w-[18px] sm:h-[18px] ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-[500px]" : "max-h-0"}`}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                    <div className="w-10 h-1 bg-ink mb-4" />
                    <p className="text-sm sm:text-base text-ink leading-relaxed">{faq.respuesta}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
