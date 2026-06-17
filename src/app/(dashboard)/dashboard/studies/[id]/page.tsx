"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import type { OutOfRangeValue, Finding, MedicalTerm } from "@/lib/types";

interface AnalysisData {
  id: string;
  summary: string;
  overallInterpretation: string;
  findings: Finding[];
  medicalTerms: MedicalTerm[];
  outOfRangeValues: OutOfRangeValue[];
  parameterExplanations: { parameter: string; value: string; explanation: string; possibleCauses: string[] }[];
  possibleCauses: string[];
  recommendations: string[];
  suggestedQuestions: string[];
  createdAt: string;
}

interface StudyData {
  id: string;
  title: string;
  studyType: string | null;
  studyDate: string | null;
  fileUrl: string;
  fileSize: number;
  ocrApplied: boolean;
  profile: { name: string; color: string } | null;
  analysis: AnalysisData | null;
  createdAt: string;
}

export default function StudyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<StudyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [copied, setCopied] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/studies/${params.id}`);
        if (!res.ok) { setError("Estudio no encontrado."); return; }
        const data = await res.json();
        setStudy(data);
      } catch {
        setError("Error al cargar el estudio.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/studies/${study?.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      setDeleteConfirm(false);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !study) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-warm-600 mb-4">{error || "Estudio no encontrado."}</p>
        <button onClick={() => router.push("/dashboard")} className="text-cta-500 font-medium">Volver al dashboard</button>
      </div>
    );
  }

  const analysis = study.analysis;
  const tabs = [
    { id: "summary", label: "Resumen" },
    { id: "values", label: "Valores fuera de rango", count: analysis?.outOfRangeValues?.filter(v => v.status !== "normal").length },
    { id: "parameters", label: "Explicación" },
    { id: "findings", label: "Hallazgos" },
    { id: "questions", label: "Preguntas" },
    { id: "terms", label: "Términos" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-warm-950">{study.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-warm-500">
            <span>{study.studyType || "Estudio médico"}</span>
            <span>·</span>
            <span>{formatDate(study.createdAt)}</span>
            {study.profile && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: study.profile.color }} />
                  {study.profile.name}
                </span>
              </>
            )}
            {study.ocrApplied && <Badge variant="warning">OCR</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeleteConfirm(true)}
            className="p-2 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Eliminar estudio"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-warm-500 hover:text-warm-700"
          >
            ← Volver
          </button>
        </div>
      </div>

      {analysis ? (
        <>
          <div className="flex gap-1 bg-azul-100 rounded-xl p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-warm-950 shadow-sm"
                    : "text-warm-500 hover:text-warm-700"
                }`}
              >
                {tab.label}
                {tab.count && tab.count > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-cta-500 text-white text-[10px] flex items-center justify-center">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="space-y-6 animate-[fadeInUp_0.3s_ease-out]">
            {activeTab === "summary" && (
              <>
                <div className="bg-gradient-to-br from-azul-800 to-azul-950 rounded-2xl p-6 md:p-8 shadow-lg">
                  <h3 className="font-display font-semibold text-lg text-white mb-3">Resumen</h3>
                  <p className="text-azul-100 leading-relaxed">{analysis.summary}</p>
                </div>

                {analysis.overallInterpretation && (
                  <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-md border-l-4 border-celeste-400">
                    <h3 className="font-display font-semibold text-lg text-warm-950 mb-3">Interpretación general</h3>
                    <p className="text-warm-700 leading-relaxed">{analysis.overallInterpretation}</p>
                  </div>
                )}

                {analysis.possibleCauses.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-amber-200">
                    <h3 className="font-display font-semibold text-lg text-warm-950 mb-3">Causas posibles</h3>
                    <p className="text-xs text-amber-600 mb-3">Información educativa. Consultá a tu médico para un diagnóstico.</p>
                    <ul className="space-y-2">
                      {analysis.possibleCauses.map((cause, i) => (
                        <li key={i} className="flex items-start gap-2 text-warm-700">
                          <span className="text-amber-500 mt-1">•</span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border-l-4 border-cta-400">
                    <h3 className="font-display font-semibold text-lg text-warm-950 mb-3">Recomendaciones</h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-warm-700">
                          <span className="text-cta-500 mt-1">💡</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === "values" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
                <h3 className="font-display font-semibold text-lg text-warm-950 mb-4">Valores fuera de rango</h3>
                {analysis.outOfRangeValues.length === 0 ? (
                  <p className="text-warm-500">No se detectaron valores fuera de rango en este estudio.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-azul-100">
                          <th className="text-left py-3 px-2 font-medium text-warm-500">Parámetro</th>
                          <th className="text-left py-3 px-2 font-medium text-warm-500">Valor</th>
                          <th className="text-left py-3 px-2 font-medium text-warm-500">Rango ref.</th>
                          <th className="text-left py-3 px-2 font-medium text-warm-500">Estado</th>
                          <th className="text-left py-3 px-2 font-medium text-warm-500">Explicación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.outOfRangeValues.map((v, i) => {
                          const statusColor = v.status === "normal" ? "bg-celeste-100 text-celeste-700"
                            : v.status === "borderline" ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700";
                          return (
                            <tr key={i} className="border-b border-azul-50 hover:bg-azul-50/50">
                              <td className="py-3 px-2 font-medium text-warm-900">{v.parameter}</td>
                              <td className="py-3 px-2 text-warm-700">{v.value}</td>
                              <td className="py-3 px-2 text-warm-500">{v.referenceRange}</td>
                              <td className="py-3 px-2">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-warm-600 text-xs">{v.explanation}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "parameters" && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg text-warm-950">Explicación de parámetros</h3>
                {analysis.parameterExplanations.length === 0 ? (
                  <p className="text-warm-500">No hay parámetros adicionales para explicar.</p>
                ) : (
                  analysis.parameterExplanations.map((p, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-azul-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-azul-100 flex items-center justify-center font-bold text-azul-600">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-warm-950">{p.parameter}</h4>
                          <p className="text-sm text-warm-500">Valor: {p.value}</p>
                        </div>
                      </div>
                      <p className="text-warm-700 leading-relaxed">{p.explanation}</p>
                      {p.possibleCauses.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-azul-100">
                          <p className="text-xs font-medium text-warm-500 mb-1">Posibles causas (información educativa):</p>
                          <ul className="space-y-1">
                            {p.possibleCauses.map((c, j) => (
                              <li key={j} className="text-sm text-warm-600 flex items-start gap-1">
                                <span className="text-warm-400">•</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "findings" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
                <h3 className="font-display font-semibold text-lg text-warm-950 mb-4">Hallazgos principales</h3>
                {analysis.findings.length === 0 ? (
                  <p className="text-warm-500">No se encontraron hallazgos relevantes.</p>
                ) : (
                  <div className="space-y-4">
                    {analysis.findings.map((f, i) => (
                      <div key={i} className="bg-azul-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-warm-500 mb-1">Original:</p>
                        <p className="text-warm-700 text-sm mb-3 italic">{f.original}</p>
                        <p className="text-sm font-medium text-celeste-700 mb-1">Simplificado:</p>
                        <p className="text-warm-900">{f.simplified}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "questions" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-cta-100">
                <h3 className="font-display font-semibold text-lg text-warm-950 mb-2">Preguntas para tu médico</h3>
                <p className="text-sm text-warm-500 mb-5">
                  Estas preguntas fueron generadas según tu estudio. Lleválas a tu próxima consulta.
                </p>
                {analysis.suggestedQuestions.length === 0 ? (
                  <p className="text-warm-500">No se generaron preguntas automáticas.</p>
                ) : (
                  <div className="space-y-3">
                    {analysis.suggestedQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-3 bg-azul-50 rounded-xl p-4 group">
                        <span className="text-cta-500 mt-0.5">❓</span>
                        <p className="flex-1 text-warm-900">{q}</p>
                        <button
                          onClick={() => copyText(q, `q-${i}`)}
                          className="flex-shrink-0 text-xs text-cta-500 hover:text-cta-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copied === `q-${i}` ? "✓ Copiado" : "Copiar"}
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const text = analysis.suggestedQuestions.join("\n\n");
                        copyText(text, "all-questions");
                      }}
                      className="w-full mt-2 text-sm text-cta-500 hover:text-cta-600 font-medium py-2"
                    >
                      {copied === "all-questions" ? "✓ Todas copiadas" : "Copiar todas las preguntas"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "terms" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
                <h3 className="font-display font-semibold text-lg text-warm-950 mb-4">Términos médicos</h3>
                {analysis.medicalTerms.length === 0 ? (
                  <p className="text-warm-500">No se encontraron términos médicos para explicar.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.medicalTerms.map((t, i) => (
                      <div key={i} className="border border-azul-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <p className="font-semibold text-warm-950 text-sm">{t.term}</p>
                        <p className="text-sm text-warm-600 mt-1">{t.definition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            ⚕️ La información proporcionada es únicamente educativa y no constituye diagnóstico,
            recomendación ni reemplaza la consulta con un profesional de la salud.
            Siempre consultá a tu médico para interpretar tus resultados.
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center shadow-md">
          <p className="text-warm-600 mb-4">Este estudio aún no tiene análisis disponible.</p>
          <button
            onClick={async () => {
              if (analyzing) return;
              setAnalyzing(true);
              setAnalyzeError("");

              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 90000);

              try {
                const res = await fetch(`/api/studies/${study.id}/analysis`, {
                  method: "POST",
                  signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!res.ok) {
                  const err = await res.json().catch(() => ({ error: "Error desconocido" }));
                  throw new Error(err.error || `Error ${res.status}`);
                }
                window.location.reload();
              } catch (e) {
                clearTimeout(timeoutId);
                if (e instanceof DOMException && e.name === "AbortError") {
                  setAnalyzeError("El análisis está tardando demasiado. Probá de nuevo más tarde.");
                } else {
                  setAnalyzeError(e instanceof Error ? e.message : "Error al analizar el estudio");
                }
              } finally {
                setAnalyzing(false);
              }
            }}
            disabled={analyzing}
            className="bg-cta-500 hover:bg-cta-600 disabled:bg-cta-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.97] disabled:active:scale-100"
          >
            {analyzing ? "Analizando…" : "Analizar ahora"}
          </button>
          {analyzeError && (
            <p className="text-red-600 text-sm mt-3">{analyzeError}</p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm}
        title="Eliminar estudio"
        message="¿Estás seguro de eliminar este estudio? No se puede deshacer."
        confirmLabel={deleting ? "Eliminando…" : "Eliminar"}
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { if (!deleting) setDeleteConfirm(false); }}
      />
    </div>
  );
}
