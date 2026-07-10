import type { Finding, OutOfRangeValue } from "@/lib/types";

interface FindingsListProps {
  findings?: Finding[];
  outOfRangeValues?: OutOfRangeValue[];
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="brutal-border-2 p-4 bg-paper-2">
      <div className="space-y-2">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-ink/60">Hallazgo original</span>
          <p className="text-sm font-mono text-ink/70 mt-0.5 italic">{finding.original}</p>
        </div>
        <div>
          <span className="text-xs font-mono font-bold uppercase text-accent-2">Simplificado</span>
          <p className="text-sm font-mono text-ink leading-relaxed">{finding.simplified}</p>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ value }: { value: OutOfRangeValue }) {
  const isNormal = value.status === "normal";
  const isBorderline = value.status === "borderline";

  return (
    <div className={`brutal-border-2 p-4 ${isNormal ? "bg-accent/10" : isBorderline ? "bg-accent/20" : "bg-accent-2/10"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-bold uppercase text-ink text-sm">{value.parameter}</span>
        <span className={`text-xs font-mono font-bold uppercase brutal-border-2 px-2 py-0.5 ${
          isNormal ? "bg-accent text-ink" : isBorderline ? "bg-accent text-ink" : "bg-accent-2 text-white"
        }`}>
          {value.status}
        </span>
      </div>
      <p className="text-sm font-mono text-ink/70">
        Valor: {value.value} &middot; Rango ref: {value.referenceRange}
      </p>
      {value.explanation && (
        <p className="text-xs font-mono text-ink/60 mt-1">{value.explanation}</p>
      )}
    </div>
  );
}

export function FindingsList({ findings, outOfRangeValues }: FindingsListProps) {
  return (
    <div className="space-y-4">
      {outOfRangeValues && outOfRangeValues.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-mono font-bold uppercase text-sm text-ink/70">Valores fuera de rango</h4>
          {outOfRangeValues.map((v, i) => (
            <ValueCard key={i} value={v} />
          ))}
        </div>
      )}
      {findings && findings.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-mono font-bold uppercase text-sm text-ink/70">Hallazgos</h4>
          {findings.map((f, i) => (
            <FindingCard key={i} finding={f} />
          ))}
        </div>
      )}
    </div>
  );
}
