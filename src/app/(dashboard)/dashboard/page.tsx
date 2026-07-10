"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStudies, useAlerts, useDeleteStudy } from "@/lib/api-hooks";
import { EmptyState } from "@/components/ui/EmptyState";
import { StudyCardSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { OutOfRangeValue, StudyWithAnalysis } from "@/lib/types";

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || target === 0) return;
    let rafId: number;
    const startTime = performance.now() + delay;
    function update(now: number) {
      if (now < startTime) { rafId = requestAnimationFrame(update); return; }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(target * eased));
      if (progress < 1) rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [started, target, duration, delay]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { count, ref };
}

function StatCard({ value, label, sublabel, color }: { value: number; label: string; sublabel?: string; color: "teal" | "amber" | "cta" }) {
  const { count, ref } = useCountUp(value);
  const colors = {
    teal: "bg-white",
    amber: "bg-accent",
    cta: "bg-ink text-paper",
  };
  const valueColors = {
    teal: "text-ink",
    amber: "text-ink",
    cta: "text-accent",
  };
  const labelColors = {
    teal: "text-ink/70",
    amber: "text-ink/80",
    cta: "text-paper/70",
  };

  const showValue = value > 0;

  return (
    <div ref={ref} className={`brutal-card ${colors[color]} p-5`}>
      {showValue ? (
        <p className={`text-4xl font-display font-bold count-up ${valueColors[color]}`}>
          {count}
        </p>
      ) : (
        <div className="flex items-center gap-2 h-10">
          <svg className="w-5 h-5 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-ink/50 font-mono uppercase">Sin datos</span>
        </div>
      )}
      <p className={`text-sm mt-2 font-mono uppercase font-bold ${labelColors[color]}`}>{label}</p>
      {sublabel && <p className="text-xs text-ink/50 mt-0.5 font-mono">{sublabel}</p>}
    </div>
  );
}

const StudyListItem = memo(function StudyListItem({
  study, index, onDeleteClick
}: {
  study: StudyWithAnalysis;
  index: number;
  onDeleteClick: (id: string | null) => void;
}) {
  const severityCount = study.analysis?.outOfRangeValues?.filter(
    (v: OutOfRangeValue) => v.status !== "normal"
  ).length || 0;

  return (
    <Link
      href={`/dashboard/studies/${study.id}`}
      className="block brutal-card bg-white p-5"
      style={{ animation: `slideUp 0.4s var(--ease-out-expo) ${index * 80}ms both` }}
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-accent text-ink flex items-center justify-center flex-shrink-0 brutal-border-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink truncate">
            {study.title}
          </p>
          <p className="text-sm text-ink/60 font-mono">
            {study.studyType || "Estudio médico"} &middot; {formatDate(study.createdAt)} &middot; {formatFileSize(study.fileSize)}
          </p>
          {study.profile && (
            <span className="inline-flex items-center gap-1.5 mt-1 text-xs text-ink/70 font-mono">
              <span className="w-2 h-2 brutal-border" style={{ backgroundColor: study.profile.color }} />
              {study.profile.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {severityCount > 0 && (
            <span className="brutal-tag brutal-tag--red">
              {severityCount} alerta{severityCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteClick(study.id);
            }}
            className="p-1.5 text-ink/50 hover:text-white hover:bg-accent-2 brutal-border-2 transition-all flex-shrink-0"
            title="Eliminar estudio"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ink group-hover:translate-x-1 transition-transform flex-shrink-0">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
      {study.analysis?.summary && (
        <p className="mt-3 text-sm text-ink/70 line-clamp-2 border-l-4 border-accent pl-3">
          {study.analysis.summary}
        </p>
      )}
    </Link>
  );
});

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: studiesData, isLoading: studiesLoading, error: studiesError } = useStudies(10);
  const { data: alertsData } = useAlerts(false);
  const deleteStudy = useDeleteStudy();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const studies = studiesData?.studies || [];
  const unreadAlerts = alertsData?.unreadCount || 0;

  const handleDelete = useCallback(async (studyId: string) => {
    try {
      await deleteStudy.mutateAsync(studyId);
      setDeleteConfirm(null);
    } catch {
      // Error handled by React Query
    }
  }, [deleteStudy]);

  const userName = session?.user?.name?.split(" ")[0] || "bienvenido";

  const outOfRangeCount = studies.reduce(
    (acc, s) => acc + (s.analysis?.outOfRangeValues?.length || 0),
    0
  );

  if (studiesLoading) {
    return (
      <div className="page-enter space-y-6">
        <div className="h-8 w-48 skeleton-shimmer brutal-border-2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 skeleton-shimmer brutal-border-2" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <StudyCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (studies.length === 0) {
    return (
      <EmptyState
        icon="upload"
        title="Todavía no tenés ningún estudio"
        description="Subí tu primer informe médico y te lo explicamos en lenguaje claro, sin tecnicismos."
        actionLabel="Empezar ahora"
        actionHref="/dashboard/upload"
      />
    );
  }

  return (
    <div className="space-y-6">
      {studiesError && (
        <div className="brutal-border-2 bg-accent-2 text-white px-4 py-3 text-sm font-mono">
          {studiesError.message}
        </div>
      )}

      <div className="brutal-border-b pb-4">
        <h2 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">
          Hola, {userName}
        </h2>
        <p className="text-ink/60 mt-1 text-sm font-mono">
          {studies.length > 0
            ? `Tenés ${studies.length} estudio${studies.length !== 1 ? "s" : ""} guardado${studies.length !== 1 ? "s" : ""}.`
            : "Empezá subiendo tu primer estudio médico."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard value={studies.length} label="Estudios guardados" color="teal" />
        <StatCard value={unreadAlerts} label="Alertas sin revisar" color="amber" />
        <StatCard value={outOfRangeCount} label="Valores fuera de rango" color="cta" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-ink uppercase tracking-tight">
            Tus últimos estudios
          </h2>
          <Link
            href="/dashboard/upload"
            className="text-sm font-mono font-bold text-ink underline decoration-2 underline-offset-4 hover:bg-accent hover:no-underline px-1"
          >
            + Agregar
          </Link>
        </div>

        {studies.length >= 2 && (
          <div className="brutal-card bg-accent p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-ink flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <p className="text-sm text-ink font-mono flex-1">
              Tenés estudios del mismo tipo. <Link href="/dashboard/compare" className="font-bold underline">Comparalos ahora</Link> para ver tu evolución.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {studies.map((study, i) => (
            <StudyListItem
              key={study.id}
              study={study}
              index={i}
              onDeleteClick={setDeleteConfirm}
            />
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Eliminar estudio"
        message="¿Estás seguro de eliminar este estudio? No se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
