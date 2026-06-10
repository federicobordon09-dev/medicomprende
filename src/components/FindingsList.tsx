"use client";

import type { Finding } from "@/lib/types";

interface Props {
  findings: Finding[];
}

function FindingCard({ finding, severity, delay }: { finding: Finding; severity: { color: string; card: string; label: string; dot: string }; delay: number }) {
  return (
    <div
      className={`p-5 rounded-xl border-2 ${severity.card} hover:shadow-lg transition-all duration-300 reveal`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${severity.dot} shadow-sm`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${severity.color}`}>
          {severity.label}
        </span>
      </div>
      <div className="mb-2.5">
        <span className="text-xs font-semibold text-warm-600 uppercase tracking-wide">Hallazgo original</span>
        <p className="text-sm font-medium text-warm-900 mt-0.5">{finding.original}</p>
      </div>
      <div className="flex items-start gap-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p className="text-sm text-warm-700 leading-relaxed">{finding.simplified}</p>
      </div>
    </div>
  );
}

export default function FindingsList({ findings }: Props) {
  const getSeverity = (text: string) => {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    const joined = words.join(" ");

    const negativePatterns = [
      /\banormal\b/, /\bpatolog[ió]\b/, /\bgrave\b/,
      /\balterad[ao]\b/, /\b(?:lesi[oó]n|tumor|neoplasia)\b/,
      /\bpositiv[ao]\b/, /\ban[oó]mal[ao]\b/,
    ];
    const warnPatterns = [
      /\bleve\b/, /\bm[íi]nima?\b/, /\bsospech[ao]\b/,
      /\bsugerente\b/, /\bdiscreto\b/, /\bm[oó]dica?\b/,
    ];
    const normalPatterns = [
      /\bnormal\b/, /\bsin\s+alteracion(?:es)?\b/, /\bsin\s+hallazgos?\b/,
      /\bconservad[ao]\b/, /\bhabitual\b/, /\bfisiol[oó]gic[ao]\b/,
      /\bsin\s+particularidades\b/, /\bdentro\s+de\s+lo\s+esperable\b/,
    ];

    for (const p of negativePatterns) {
      if (p.test(joined)) {
        return { color: "bg-red-100 text-red-700 border-red-200", card: "bg-red-50/80 border-red-200", label: "Consultar con médico", dot: "bg-red-500" };
      }
    }

    for (const p of warnPatterns) {
      if (p.test(joined)) {
        return { color: "bg-amber-100 text-amber-700 border-amber-200", card: "bg-amber-50/80 border-amber-200", label: "Requiere atención", dot: "bg-amber-500" };
      }
    }

    for (const p of normalPatterns) {
      if (p.test(joined)) {
        return { color: "bg-mint-100 text-mint-700 border-mint-200", card: "bg-mint-50/80 border-mint-200", label: "Normal", dot: "bg-mint-500" };
      }
    }

    return { color: "bg-sk-100 text-sk-700 border-sk-200", card: "bg-sk-50/80 border-sk-200", label: "Hallazgo", dot: "bg-sk-500" };
  };

  return (
    <div className="space-y-4">
      {findings.map((finding, i) => {
        const severity = getSeverity(finding.original);
        return (
          <FindingCard key={i} finding={finding} severity={severity} delay={i * 80} />
        );
      })}
    </div>
  );
}
