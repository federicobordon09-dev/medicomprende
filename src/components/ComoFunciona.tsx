"use client";

import { comoFunciona } from "@/data/contenido";

const stepBgColors = [
  "bg-ink text-accent",
  "bg-accent text-ink",
  "bg-ink text-accent-2",
];

function StepIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    upload: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    sparkles: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
      </svg>
    ),
    check: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  };

  return icons[icon] || icons.upload;
}

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20 md:py-32 px-4 sm:px-6 bg-paper border-t-[3px] border-ink relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="brutal-tag mb-4">{comoFunciona.eyebrow || "Cómo funciona"}</span>
          <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,3rem)] text-ink uppercase mt-4 mb-3">
            {comoFunciona.title}
          </h2>
          <p className="text-base md:text-lg text-ink/60 max-w-xl mx-auto px-2 font-mono">{comoFunciona.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {comoFunciona.steps.map((step, i) => (
            <div
              key={i}
              className="group relative brutal-card bg-white p-7 sm:p-8 text-center"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className={`w-14 h-14 ${stepBgColors[i]} flex items-center justify-center brutal-border-2 mx-auto mb-5`}>
                <StepIcon icon={step.icon} />
              </div>
              <h3 className="font-display font-bold text-xl text-ink mb-3 uppercase">
                <span className="text-accent-2 font-mono text-sm mr-2">0{i + 1}</span>
                {step.title}
              </h3>
              <p className="text-sm text-ink/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
