import type { MedicalTerm } from "@/lib/types";

interface Props {
  terms: MedicalTerm[];
}

const BORDER_COLORS = [
  "border-l-accent",
  "border-l-accent-2",
  "border-l-ink",
];

export function MedicalTermsGrid({ terms }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {terms.map((term, i) => (
        <div
          key={i}
          className={`brutal-border-2 p-4 border-l-4 ${BORDER_COLORS[i % BORDER_COLORS.length]} hover:bg-accent/10 transition-colors`}
        >
          <p className="font-mono font-bold uppercase text-ink text-sm mb-1">{term.term}</p>
          <p className="text-sm font-mono text-ink/70 leading-relaxed">{term.definition}</p>
        </div>
      ))}
    </div>
  );
}
