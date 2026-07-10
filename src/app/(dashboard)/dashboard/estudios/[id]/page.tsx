"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";

const ChatIA = lazy(() => import("@/components/ChatIA"));
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
  const [exporting, setExporting] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);

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

    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((data) => setUserPlan(data.plan || "free"))
      .catch(() => setUserPlan("free"));
  }, [params.id]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/studies/${study?.id}/export`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al exportar" }));
        if (res.status === 403) {
          setShowUpgradePrompt(true);
          return;
        }
        throw new Error(err.error);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analisis-${study?.title?.replace(/[^a-zA-Z0-9]/g, "-") || "estudio"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Error al descargar el PDF");
    } finally {
      setExporting(false);
    }
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
        <p className="text-ink/60 font-mono mb-4">{error || "Estudio no encontrado."}</p>
        <button onClick={() => router.push("/dashboard")} className="brutal-btn">Volver al dashboard</button>
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

  const statusBadge = (status: string) => {
    if (status === "normal") return "bg-accent text-ink";
    if (status === "borderline") return "bg-accent text-ink";
    return "bg-accent-2 text-white";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">{study.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm font-mono text-ink/60">
            <span>{study.studyType || "Estudio médico"}</span>
            <span>·</span>
            <span>{formatDate(study.createdAt)}</span>
            {study.profile && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 brutal-border" style={{ backgroundColor: study.profile.color }} />
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
            className="p-2 text-ink/40 hover:text-accent-2 hover:bg-accent-2/10 brutal-border-2 transition-all"
            title="Eliminar estudio"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-mono font-bold uppercase text-ink/60 hover:text-ink"
          >
            ← Volver
          </button>
          {analysis && (
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="brutal-btn text-xs"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting ? "Descargando…" : "Descargar PDF"}
            </button>
          )}
        </div>
      </div>

      {showUpgradePrompt && (
        <div className="bg-accent/10 brutal-border-2 p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-accent-2 text-white brutal-border-2 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono font-bold uppercase text-ink text-sm">Exportación PDF exclusiva de Pro</p>
            <p className="text-ink/60 text-xs mt-1 font-mono">Actualizá a Pro para descargar tus análisis en PDF.</p>
            <div className="flex gap-3 mt-3">
              <a href="/pricing" className="brutal-btn text-xs">
                Ver planes
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="text-xs font-mono font-bold uppercase text-ink/60 hover:text-ink px-3 py-2 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
          <button onClick={() => setShowUpgradePrompt(false)} className="flex-shrink-0 text-ink/40 hover:text-ink" aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {analysis ? (
        <>
          <div className="flex gap-1 bg-ink/5 brutal-border-2 p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-mono font-bold uppercase whitespace-nowrap transition-all brutal-border-2 ${
                  activeTab === tab.id
                    ? "bg-ink text-paper"
                    : "text-ink/60 hover:bg-accent"
                }`}
              >
                {tab.label}
                {tab.count && tab.count > 0 ? (
                  <span className="w-5 h-5 bg-accent-2 text-white text-[10px] flex items-center justify-center brutal-border-2">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="space-y-6 animate-[fadeInUp_0.3s_ease-out]">
            {activeTab === "summary" && (
              <>
                <div className="bg-ink text-paper brutal-border brutal-shadow p-6 md:p-8">
                  <h3 className="font-display font-bold text-lg text-accent uppercase tracking-tight mb-3">Resumen</h3>
                  <p className="text-paper/80 font-mono leading-relaxed">{analysis.summary}</p>
                </div>

                {analysis.overallInterpretation && (
                  <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
                    <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-3">Interpretación general</h3>
                    <p className="text-ink/70 font-mono leading-relaxed">{analysis.overallInterpretation}</p>
                  </div>
                )}

                {analysis.possibleCauses.length > 0 && (
                  <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
                    <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-3">Causas posibles</h3>
                    <p className="text-xs font-mono text-accent-2 mb-3">Información educativa. Consultá a tu médico para un diagnóstico.</p>
                    <ul className="space-y-2">
                      {analysis.possibleCauses.map((cause, i) => (
                        <li key={i} className="flex items-start gap-2 text-ink/70 font-mono">
                          <span className="text-accent-2 mt-1">•</span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div className="bg-accent brutal-border-2 brutal-shadow p-6 md:p-8">
                    <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-3">Recomendaciones</h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-ink/80 font-mono">
                          <span className="text-ink font-bold">💡</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === "values" && (
              <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
                <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-4">Valores fuera de rango</h3>
                {analysis.outOfRangeValues.length === 0 ? (
                  <p className="text-ink/60 font-mono">No se detectaron valores fuera de rango en este estudio.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-mono">
                      <thead>
                        <tr className="brutal-border-b">
                          <th className="text-left py-3 px-2 font-bold text-ink/60 uppercase">Parámetro</th>
                          <th className="text-left py-3 px-2 font-bold text-ink/60 uppercase">Valor</th>
                          <th className="text-left py-3 px-2 font-bold text-ink/60 uppercase">Rango ref.</th>
                          <th className="text-left py-3 px-2 font-bold text-ink/60 uppercase">Estado</th>
                          <th className="text-left py-3 px-2 font-bold text-ink/60 uppercase">Explicación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.outOfRangeValues.map((v, i) => (
                          <tr key={i} className="brutal-border-b hover:bg-accent/10">
                            <td className="py-3 px-2 font-bold text-ink">{v.parameter}</td>
                            <td className="py-3 px-2 text-ink/70">{v.value}</td>
                            <td className="py-3 px-2 text-ink/60">{v.referenceRange}</td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-mono font-bold uppercase brutal-border-2 ${statusBadge(v.status)}`}>
                                {v.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-ink/60 text-xs">{v.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "parameters" && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight">Explicación de parámetros</h3>
                {analysis.parameterExplanations.length === 0 ? (
                  <p className="text-ink/60 font-mono">No hay parámetros adicionales para explicar.</p>
                ) : (
                  analysis.parameterExplanations.map((p, i) => (
                    <div key={i} className="bg-white brutal-border-2 brutal-shadow p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-accent text-ink brutal-border-2 flex items-center justify-center font-mono font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-mono font-bold uppercase text-ink">{p.parameter}</h4>
                          <p className="text-sm font-mono text-ink/60">Valor: {p.value}</p>
                        </div>
                      </div>
                      <p className="text-ink/70 font-mono leading-relaxed">{p.explanation}</p>
                      {p.possibleCauses.length > 0 && (
                        <div className="mt-3 pt-3 brutal-border-t">
                          <p className="text-xs font-mono font-bold uppercase text-ink/60 mb-1">Posibles causas (información educativa):</p>
                          <ul className="space-y-1">
                            {p.possibleCauses.map((c, j) => (
                              <li key={j} className="text-sm font-mono text-ink/60 flex items-start gap-1">
                                <span className="text-ink/40">•</span>
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
              <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
                <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-4">Hallazgos principales</h3>
                {analysis.findings.length === 0 ? (
                  <p className="text-ink/60 font-mono">No se encontraron hallazgos relevantes.</p>
                ) : (
                  <div className="space-y-4">
                    {analysis.findings.map((f, i) => (
                      <div key={i} className="bg-paper-2 brutal-border-2 p-4">
                        <p className="text-xs font-mono font-bold uppercase text-ink/60 mb-1">Original:</p>
                        <p className="text-ink/70 text-sm font-mono mb-3 italic">{f.original}</p>
                        <p className="text-xs font-mono font-bold uppercase text-accent-2 mb-1">Simplificado:</p>
                        <p className="text-ink font-mono">{f.simplified}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "questions" && (
              <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
                <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-2">Preguntas para tu médico</h3>
                <p className="text-sm font-mono text-ink/60 mb-5">
                  Estas preguntas fueron generadas según tu estudio. Lleválas a tu próxima consulta.
                </p>
                {analysis.suggestedQuestions.length === 0 ? (
                  <p className="text-ink/60 font-mono">No se generaron preguntas automáticas.</p>
                ) : (
                  <div className="space-y-3">
                    {analysis.suggestedQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-3 bg-paper-2 brutal-border-2 p-4 group">
                        <span className="text-ink mt-0.5">❓</span>
                        <p className="flex-1 text-ink font-mono">{q}</p>
                        <button
                          onClick={() => copyText(q, `q-${i}`)}
                          className="flex-shrink-0 text-xs font-mono font-bold uppercase text-accent-2 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
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
                      className="w-full mt-2 text-sm font-mono font-bold uppercase text-accent-2 hover:underline py-2"
                    >
                      {copied === "all-questions" ? "✓ Todas copiadas" : "Copiar todas las preguntas"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "terms" && (
              <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
                <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-4">Términos médicos</h3>
                {analysis.medicalTerms.length === 0 ? (
                  <p className="text-ink/60 font-mono">No se encontraron términos médicos para explicar.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.medicalTerms.map((t, i) => (
                      <div key={i} className="brutal-border-2 p-4 hover:bg-accent/10 transition-colors">
                        <p className="font-mono font-bold uppercase text-ink text-sm">{t.term}</p>
                        <p className="text-sm font-mono text-ink/60 mt-1">{t.definition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-paper-2 brutal-border-2 px-4 py-3 text-xs font-mono text-ink/60">
            ⚕️ La información proporcionada es únicamente educativa y no constituye diagnóstico,
            recomendación ni reemplaza la consulta con un profesional de la salud.
            Siempre consultá a tu médico para interpretar tus resultados.
          </div>
        </>
      ) : (
        <div className="bg-white brutal-border-2 brutal-shadow p-8 text-center">
          <p className="text-ink/60 font-mono mb-4">Este estudio aún no tiene análisis disponible.</p>
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
            className="brutal-btn"
          >
            {analyzing ? "Analizando…" : "Analizar ahora"}
          </button>
          {analyzeError && (
            <p className="text-accent-2 text-sm font-mono mt-3">{analyzeError}</p>
          )}
        </div>
      )}

      {analysis && (
        <Suspense fallback={null}>
          <ChatIA studyId={study.id} studyTitle={study.title} userPlan={userPlan} />
        </Suspense>
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
