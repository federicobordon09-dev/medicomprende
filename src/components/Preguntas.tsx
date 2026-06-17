"use client";

import { useState } from "react";
import { preguntas } from "@/data/contenido";

export default function Preguntas() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-azul-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--color-azul-100)_0%,_transparent_60%)] pointer-events-none" />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] text-warm-950">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {preguntas.map((faq, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <div
                key={i}
                className={`bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                  isOpen ? "border-azul-400 shadow-lg shadow-azul-200/30" : "border-warm-200 hover:border-azul-300 hover:shadow-md"
                }`}
              >
                <button
                  id={buttonId}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 font-semibold text-sm sm:text-base text-warm-950 text-left gap-3 hover:bg-azul-50/50 transition-colors min-h-[52px]"
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
                    className={`text-azul-500 flex-shrink-0 transition-transform duration-300 sm:w-[18px] sm:h-[18px] ${isOpen ? "rotate-180 text-azul-700" : ""}`}
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
                    <div className="w-10 h-0.5 bg-azul-200 rounded-full mb-4" />
                    <p className="text-sm sm:text-base text-warm-600 leading-relaxed">{faq.respuesta}</p>
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
