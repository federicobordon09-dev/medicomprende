"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudyCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { StudyWithAnalysis } from "@/lib/types";

export default function ComparePage() {
  const router = useRouter();
  const [studies, setStudies] = useState<StudyWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/studies?limit=50")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setStudies(data.studies || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleStudy = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setComparing(true);
    setError("");

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al comparar.");
        setComparing(false);
        return;
      }
      router.push(`/dashboard/compare/${data.id}`);
    } catch {
      setError("Error de conexión.");
      setComparing(false);
    }
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <StudyCardSkeleton key={i} />)}</div>;
  }

  if (studies.length < 2) {
    return (
      <EmptyState
        icon="search"
        title="Se necesitan al menos 2 estudios"
        description="Subí más estudios médicos para poder compararlos."
        actionLabel="Subir estudio"
        actionHref="/dashboard/upload"
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-warm-950">Comparar estudios</h1>
        <p className="text-warm-600 mt-1">Seleccioná 2 o más estudios para ver los cambios en tus resultados.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-2">
        {studies.map((study) => {
          const isSelected = selectedIds.includes(study.id);
          return (
            <button
              key={study.id}
              onClick={() => toggleStudy(study.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-cta-500 bg-cta-50"
                  : "border-azul-200 bg-white hover:border-azul-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected ? "border-cta-500 bg-cta-500" : "border-azul-300"
              }`}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-warm-950">{study.title}</p>
                <p className="text-sm text-warm-500">{study.studyType || "Estudio"} · {formatDate(study.createdAt)}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-500">{selectedIds.length} estudio{selectedIds.length !== 1 ? "s" : ""} seleccionado{selectedIds.length !== 1 ? "s" : ""}</p>
        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2 || comparing}
          className="bg-cta-500 hover:bg-cta-600 disabled:bg-azul-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.97]"
        >
          {comparing ? "Comparando..." : "Comparar"}
        </button>
      </div>
    </div>
  );
}
