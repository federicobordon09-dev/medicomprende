"use client";

import { useEffect, useRef } from "react";
import { tiposInformes } from "@/data/contenido";

const iconStyles = [
  { bg: "bg-coral-100 text-coral-600", card: "bg-coral-50/40 border-coral-200 hover:border-coral-300" },
  { bg: "bg-sk-100 text-sk-600", card: "bg-sk-50/40 border-sk-200 hover:border-sk-300" },
  { bg: "bg-mint-100 text-mint-600", card: "bg-mint-50/40 border-mint-200 hover:border-mint-300" },
  { bg: "bg-amber-100 text-amber-500", card: "bg-amber-50/40 border-amber-200 hover:border-amber-300" },
  { bg: "bg-coral-100 text-coral-600", card: "bg-coral-50/40 border-coral-200 hover:border-coral-300" },
  { bg: "bg-sk-100 text-sk-600", card: "bg-sk-50/40 border-sk-200 hover:border-sk-300" },
];

const icons: Record<string, React.ReactNode> = {
  brain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
    </svg>
  ),
  bone: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 10a3 3 0 0 1 0-6 3 3 0 0 1 0 6Z" />
      <path d="M7 10a3 3 0 0 1 0-6 3 3 0 0 1 0 6Z" />
      <path d="M17 14a3 3 0 0 1 0 6 3 3 0 0 1 0-6Z" />
      <path d="M7 14a3 3 0 0 1 0 6 3 3 0 0 1 0-6Z" />
    </svg>
  ),
  droplet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  heart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  microscope: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  ),
  file: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
};

export default function TiposInformes() {
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
    <section ref={sectionRef} className="py-20 md:py-28 px-4 sm:px-6 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-sk-50)_0%,_transparent_70%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12 reveal">
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] text-warm-950 mb-3">
            {tiposInformes.title}
          </h2>
          <p className="text-base md:text-lg text-warm-500 max-w-xl mx-auto px-2">{tiposInformes.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {tiposInformes.tipos.map((tipo, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 ${iconStyles[i].card} transition-all duration-300 group reveal`}
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconStyles[i].bg} group-hover:scale-110 transition-transform duration-300`}>
                {icons[tipo.icon] || icons.file}
              </div>
              <span className="font-semibold text-sm sm:text-base text-warm-900 leading-tight">{tipo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
