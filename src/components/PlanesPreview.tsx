"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { planes } from "@/data/contenido";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function PlanesPreview() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.querySelectorAll(".reveal").forEach((c) => c.classList.add("visible"));
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="planes" className="py-20 md:py-28 px-4 sm:px-6 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-sk-50)_0%,_transparent_70%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-cta-600 mb-3">
            {planes.eyebrow}
          </span>
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] text-warm-950 mb-3">
            {planes.title}
          </h2>
          <p className="text-base md:text-lg text-warm-500 max-w-xl mx-auto px-2">{planes.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-2xl mx-auto">
          {planes.planes.map((plan, i) => (
            <div
              key={i}
              className={`reveal rounded-2xl p-7 sm:p-8 border-2 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-cta-500 to-cta-600 border-cta-500 text-white shadow-xl shadow-cta-500/20 scale-[1.02]"
                  : "bg-white border-azul-200 text-warm-950 hover:border-azul-300 hover:shadow-lg"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <h3 className={`font-display font-bold text-xl mb-1 ${plan.highlighted ? "text-white" : "text-warm-950"}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`font-display font-extrabold text-4xl ${plan.highlighted ? "text-white" : "text-warm-950"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? "text-white/80" : "text-warm-500"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-white/80" : "text-warm-500"}`}>
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm">
                    <span className={`flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-celeste-300" : "text-cta-500"}`}>
                      <CheckIcon />
                    </span>
                    <span className={plan.highlighted ? "text-white/90" : "text-warm-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full text-center font-bold px-5 py-3 rounded-xl text-sm transition-all active:scale-[0.97] ${
                  plan.highlighted
                    ? "bg-white text-cta-600 hover:bg-white/90 shadow-lg"
                    : "bg-cta-500 hover:bg-cta-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs sm:text-sm text-warm-500 mt-8 max-w-md mx-auto">
          Cancelá cuando quieras, sin multas ni preguntas. Todos los precios en pesos argentinos.
        </p>
      </div>
    </section>
  );
}
