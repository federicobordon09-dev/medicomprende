"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStudies } from "@/lib/api-hooks";
import { StudyCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default function ComparePage() {
  const router = useRouter();
  const { data: studiesData, isLoading } = useStudies(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");

  const studies = studiesData?.studies || [];

  const toggleStudy = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

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
      router.push(`/dashboard/comparar/${data.id}`);
    } catch {
      setError("Error de conexión.");
      setComparing(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <StudyCardSkeleton key={i} />)}</div>;
  }

  if (studies.length < 2) {
    return (
      <EmptyState
        icon="search"
        title="Se necesitan al menos 2 estudios"
        description="Subí más estudios médicos para poder compararlos."
        actionLabel="Subir estudio"
        actionHref="/dashboard/subir"
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">Comparar estudios</h1>
        <p className="text-ink/60 font-mono mt-1">Seleccioná 2 o más estudios para ver los cambios en tus resultados.</p>
      </div>

      {error && (
        <div className="bg-accent-2 text-white px-4 py-3 text-sm font-mono font-bold uppercase brutal-border-2">{error}</div>
      )}

      <div className="space-y-2">
        {studies.map((study) => {
          const isSelected = selectedIds.includes(study.id);
          return (
            <button
              key={study.id}
              onClick={() => toggleStudy(study.id)}
              className={`w-full flex items-center gap-4 p-4 brutal-border-2 text-left transition-all ${
                isSelected
                  ? "bg-accent text-ink"
                  : "bg-white text-ink/70 hover:bg-accent/30"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 brutal-border-2 ${
                isSelected ? "bg-ink border-ink" : "border-ink/30"
              }`}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold uppercase text-sm">{study.title}</p>
                <p className="text-xs font-mono text-ink/60">{study.studyType || "Estudio"} · {formatDate(study.createdAt)}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-mono text-ink/60">{selectedIds.length} estudio{selectedIds.length !== 1 ? "s" : ""} seleccionado{selectedIds.length !== 1 ? "s" : ""}</p>
        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2 || comparing}
          className="brutal-btn"
        >
          {comparing ? "Comparando..." : "Comparar"}
        </button>
      </div>
    </div>
  );
}
