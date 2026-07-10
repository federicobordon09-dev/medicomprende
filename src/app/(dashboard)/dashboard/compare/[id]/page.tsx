"use client";

import { useParams, useRouter } from "next/navigation";
import { useComparison } from "@/lib/api-hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

export default function CompareResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading, error } = useComparison(id);

  if (isLoading) {
    return <div className="space-y-6 max-w-3xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-60 w-full" />
    </div>;
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-ink/60 font-mono">{error instanceof Error ? error.message : "Comparación no encontrada."}</p>
        <button onClick={() => router.push("/dashboard/compare")} className="brutal-btn mt-4">
          Volver a comparar
        </button>
      </div>
    );
  }

  const severityColor = (significance: string) => {
    switch (significance) {
      case "mejora": return "bg-accent text-ink";
      case "empeoramiento": return "bg-accent-2 text-white";
      default: return "bg-ink/10 text-ink";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">Resultado de la comparación</h1>
          <p className="text-ink/60 text-sm font-mono mt-1">{formatDate(new Date().toISOString())}</p>
        </div>
        <button onClick={() => router.push("/dashboard/compare")} className="text-sm font-mono font-bold uppercase text-ink/60 hover:text-ink">
          ← Nueva comparación
        </button>
      </div>

      <div className="bg-ink text-paper brutal-border brutal-shadow p-6 md:p-8">
        <p className="text-paper/80 font-mono leading-relaxed">{data.summary}</p>
      </div>

      {data.changes && data.changes.length > 0 && (
        <div className="bg-white brutal-border-2 p-6 md:p-8">
          <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-4">Cambios detectados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="brutal-border-b">
                  <th className="text-left py-3 px-2 font-bold text-ink/60">Parámetro</th>
                  <th className="text-left py-3 px-2 font-bold text-ink/60">Valor previo</th>
                  <th className="text-left py-3 px-2 font-bold text-ink/60">Valor actual</th>
                  <th className="text-left py-3 px-2 font-bold text-ink/60">Cambio</th>
                  <th className="text-left py-3 px-2 font-bold text-ink/60">Significancia</th>
                </tr>
              </thead>
              <tbody>
                {data.changes.map((c, i) => (
                  <tr key={i} className="brutal-border-b hover:bg-accent/10">
                    <td className="py-3 px-2 font-bold text-ink">{c.parameter}</td>
                    <td className="py-3 px-2 text-ink/60">{c.previousValue}</td>
                    <td className="py-3 px-2 text-ink font-bold">{c.currentValue}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-mono font-bold uppercase brutal-border-2 ${
                        c.change === "aumentó" ? "bg-accent-2 text-white"
                        : c.change === "disminuyó" ? "bg-accent text-ink"
                        : "bg-ink/10 text-ink"
                      }`}>
                        {c.change === "aumentó" ? "↑" : c.change === "disminuyó" ? "↓" : "→"} {c.change}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-mono font-bold uppercase brutal-border-2 ${severityColor(c.significance)}`}>
                        {c.significance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.trends && data.trends.length > 0 && (
        <div className="bg-white brutal-border-2 p-6 md:p-8">
          <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-4">Tendencias</h3>
          <div className="space-y-4">
            {data.trends.map((t, i) => (
              <div key={i} className={`brutal-border-2 p-4 ${
                t.trend === "empeorando" ? "bg-accent-2/10"
                : t.trend === "mejorando" ? "bg-accent/10"
                : "bg-ink/5"
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-mono font-bold uppercase text-ink">{t.parameter}</h4>
                    <p className="text-sm font-mono text-ink/60 mt-1">
                      Valores: {t.values.join(" → ")}
                    </p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-mono font-bold uppercase brutal-border-2 ${
                    t.trend === "empeorando" ? "bg-accent-2 text-white"
                    : t.trend === "mejorando" ? "bg-accent text-ink"
                    : "bg-ink/10 text-ink"
                  }`}>
                    {t.trend === "empeorando" ? "↑ Empeorando" : t.trend === "mejorando" ? "↓ Mejorando" : "→ Estable"}
                  </span>
                </div>
                {t.warning && (
                  <p className="text-xs font-mono text-accent-2 mt-2">⚠️ {t.warning}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.overallAssessment && (
        <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
          <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-3">Evaluación general</h3>
          <p className="text-ink/70 font-mono leading-relaxed">{data.overallAssessment}</p>
        </div>
      )}

      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-accent brutal-border-2 p-6 md:p-8">
          <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-3">Recomendaciones</h3>
          <ul className="space-y-2">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-ink/80 font-mono">
                <span className="text-ink font-bold">💡</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-paper-2 brutal-border-2 px-4 py-3 text-xs font-mono text-ink/60">
        ⚕️ Esta comparación es educativa. Mostrásela a tu médico para una interpretación profesional.
      </div>
    </div>
  );
}
