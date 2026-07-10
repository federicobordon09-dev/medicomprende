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
    <section ref={sectionRef} id="planes" className="py-20 md:py-28 px-4 sm:px-6 bg-white border-t-[3px] border-ink relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="brutal-tag">{planes.eyebrow}</span>
          <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,3rem)] text-ink uppercase mt-4 mb-3">
            {planes.title}
          </h2>
          <p className="text-base md:text-lg text-ink/60 max-w-xl mx-auto px-2 font-mono">{planes.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-2xl mx-auto">
          {planes.planes.map((plan, i) => (
            <div
              key={i}
              className={`reveal brutal-card p-7 sm:p-8 ${
                plan.highlighted ? "bg-accent text-ink" : "bg-white text-ink"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <h3 className="font-display font-bold text-xl mb-1 uppercase">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display font-extrabold text-4xl">
                  {plan.price}
                </span>
                <span className="text-sm font-mono">{plan.period}</span>
              </div>
              <p className="text-sm mb-6 font-mono">
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 mt-0.5 text-ink">
                      <CheckIcon />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full text-center text-sm ${plan.highlighted ? "brutal-btn brutal-btn--ink" : "brutal-btn"}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs sm:text-sm text-ink/50 mt-8 max-w-md mx-auto font-mono">
          Cancelá cuando quierias, sin multas ni preguntas. Todos los precios en pesos argentinos.
        </p>
      </div>
    </section>
  );
}
