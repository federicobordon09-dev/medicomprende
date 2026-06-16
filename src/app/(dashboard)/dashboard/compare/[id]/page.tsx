"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import type { ComparisonResult } from "@/lib/types";

export default function CompareResultPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/compare/${params.id}`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((d) => setData(d))
      .catch(() => setError("Error al cargar la comparación."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="space-y-6 max-w-3xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-60 w-full" />
    </div>;
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-warm-600">{error || "Comparación no encontrada."}</p>
        <button onClick={() => router.push("/dashboard/compare")} className="text-cta-500 font-medium mt-4">
          Volver a comparar
        </button>
      </div>
    );
  }

  const severityColor = (significance: string) => {
    switch (significance) {
      case "mejora": return "text-celeste-600 bg-celeste-50";
      case "empeoramiento": return "text-red-600 bg-red-50";
      default: return "text-warm-600 bg-azul-50";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-warm-950">Resultado de la comparación</h1>
          <p className="text-warm-500 text-sm mt-1">{formatDate(new Date().toISOString())}</p>
        </div>
        <button onClick={() => router.push("/dashboard/compare")} className="text-sm text-warm-500 hover:text-warm-700">
          ← Nueva comparación
        </button>
      </div>

      <div className="bg-gradient-to-br from-azul-800 to-azul-950 rounded-2xl p-6 md:p-8 shadow-lg">
        <p className="text-azul-100 leading-relaxed">{data.summary}</p>
      </div>

      {data.changes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
          <h3 className="font-display font-semibold text-lg text-warm-950 mb-4">Cambios detectados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-azul-100">
                  <th className="text-left py-3 px-2 font-medium text-warm-500">Parámetro</th>
                  <th className="text-left py-3 px-2 font-medium text-warm-500">Valor previo</th>
                  <th className="text-left py-3 px-2 font-medium text-warm-500">Valor actual</th>
                  <th className="text-left py-3 px-2 font-medium text-warm-500">Cambio</th>
                  <th className="text-left py-3 px-2 font-medium text-warm-500">Significancia</th>
                </tr>
              </thead>
              <tbody>
                {data.changes.map((c, i) => (
                  <tr key={i} className="border-b border-azul-50 hover:bg-azul-50/50">
                    <td className="py-3 px-2 font-medium text-warm-900">{c.parameter}</td>
                    <td className="py-3 px-2 text-warm-600">{c.previousValue}</td>
                    <td className="py-3 px-2 text-warm-900 font-medium">{c.currentValue}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.change === "aumentó" ? "bg-amber-100 text-amber-700"
                        : c.change === "disminuyó" ? "bg-blue-100 text-blue-700"
                        : "bg-azul-100 text-azul-600"
                      }`}>
                        {c.change === "aumentó" ? "↑" : c.change === "disminuyó" ? "↓" : "→"} {c.change}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${severityColor(c.significance)}`}>
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

      {data.trends.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
          <h3 className="font-display font-semibold text-lg text-warm-950 mb-4">Tendencias</h3>
          <div className="space-y-4">
            {data.trends.map((t, i) => (
              <div key={i} className={`rounded-xl p-4 ${
                t.trend === "empeorando" ? "bg-red-50 border border-red-200"
                : t.trend === "mejorando" ? "bg-celeste-50 border border-celeste-200"
                : "bg-azul-50 border border-azul-200"
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-warm-950">{t.parameter}</h4>
                    <p className="text-sm text-warm-500 mt-1">
                      Valores: {t.values.join(" → ")}
                    </p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    t.trend === "empeorando" ? "bg-red-200 text-red-800"
                    : t.trend === "mejorando" ? "bg-celeste-200 text-celeste-800"
                    : "bg-azul-200 text-azul-700"
                  }`}>
                    {t.trend === "empeorando" ? "📈 Empeorando" : t.trend === "mejorando" ? "📉 Mejorando" : "➡️ Estable"}
                  </span>
                </div>
                {t.warning && (
                  <p className="text-xs text-red-600 mt-2">⚠️ {t.warning}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.overallAssessment && (
        <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-md border-l-4 border-celeste-400">
          <h3 className="font-display font-semibold text-lg text-warm-950 mb-3">Evaluación general</h3>
          <p className="text-warm-700 leading-relaxed">{data.overallAssessment}</p>
        </div>
      )}

      {data.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border-l-4 border-cta-400">
          <h3 className="font-display font-semibold text-lg text-warm-950 mb-3">Recomendaciones</h3>
          <ul className="space-y-2">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-warm-700">
                <span className="text-cta-500">💡</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
        ⚕️ Esta comparación es educativa. Mostrásela a tu médico para una interpretación profesional.
      </div>
    </div>
  );
}
