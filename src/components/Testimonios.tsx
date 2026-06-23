"use client";

import { useEffect, useRef } from "react";
import { testimonials } from "@/data/contenido";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: rating }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonios() {
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
    <section ref={sectionRef} className="py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-white to-azul-50/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-azul-100)_0%,_transparent_60%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] text-warm-950 mb-3">
            Lo que dicen quienes ya lo usaron
          </h2>
          <p className="text-base md:text-lg text-warm-500 max-w-xl mx-auto px-2">
            Miles de personas ya entendieron sus informes. Esto es lo que nos cuentan.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="reveal bg-white rounded-xl p-6 sm:p-7 border border-azul-200/50 shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <StarRating rating={t.rating} />
              <p className="text-sm sm:text-base text-warm-700 leading-relaxed mt-4 mb-5">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cta-400 to-cta-600 flex items-center justify-center text-white text-xs font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-warm-950">{t.name}</p>
                  <p className="text-xs text-warm-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
