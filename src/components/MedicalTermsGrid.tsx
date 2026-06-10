"use client";

import type { MedicalTerm } from "@/lib/types";

interface Props {
  terms: MedicalTerm[];
}

const cardStyles = [
  "border-l-coral-400 bg-coral-50/50",
  "border-l-sk-400 bg-sk-50/50",
  "border-l-mint-400 bg-mint-50/50",
  "border-l-amber-400 bg-amber-50/50",
];

function TermCard({ term, styleIdx, delay }: { term: MedicalTerm; styleIdx: number; delay: number }) {
  return (
    <div
      className={`group p-4 rounded-xl border border-warm-200 border-l-[3px] hover:shadow-md transition-all duration-300 reveal`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={cardStyles[styleIdx]}>
        <p className="font-display font-semibold text-base text-warm-950 mb-1">{term.term}</p>
      </div>
      <p className="text-sm text-warm-700 leading-relaxed">{term.definition}</p>
    </div>
  );
}

export default function MedicalTermsGrid({ terms }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {terms.map((term, i) => {
        const styleIdx = i % cardStyles.length;
        return (
          <TermCard key={i} term={term} styleIdx={styleIdx} delay={i * 60} />
        );
      })}
    </div>
  );
}
