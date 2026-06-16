"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StudyCardSkeleton } from "@/components/ui/Skeleton";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { StudyWithAnalysis, OutOfRangeValue } from "@/lib/types";

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || target === 0) return;
    const startTime = performance.now() + delay;
    function update(now: number) {
      if (now < startTime) { requestAnimationFrame(update); return; }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
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
    teal: "bg-white border border-azul-200/60",
    amber: "bg-amber-50 border border-amber-200",
    cta: "bg-cta-50 border border-cta-200",
  };
  const valueColors = {
    teal: "text-azul-700",
    amber: "text-amber-700",
    cta: "text-cta-700",
  };
  const labelColors = {
    teal: "text-azul-500",
    amber: "text-amber-600",
    cta: "text-cta-600",
  };

  const showValue = value > 0;

  return (
    <div ref={ref} className={`${colors[color]} rounded-xl p-5 card-hover`}>
      {showValue ? (
        <p className={`text-3xl font-bold count-up ${valueColors[color]}`}>
          {count}
        </p>
      ) : (
        <div className="flex items-center gap-2 h-9">
          <svg className="w-5 h-5 text-azul-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-azul-400">Sin datos</span>
        </div>
      )}
      <p className={`text-sm mt-1 ${labelColors[color]}`}>{label}</p>
      {sublabel && <p className="text-xs text-azul-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [studies, setStudies] = useState<StudyWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [studiesRes, alertsRes] = await Promise.all([
          fetch("/api/studies?limit=10"),
          fetch("/api/alerts?acknowledged=false&limit=1"),
        ]);

        if (studiesRes.ok) {
          const data = await studiesRes.json();
          setStudies(data.studies || []);
        }

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setUnreadAlerts(data.unreadCount || 0);
        }
      } catch {
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const userName = session?.user?.name?.split(" ")[0] || "bienvenido";

  const outOfRangeCount = studies.reduce(
    (acc, s) => acc + (s.analysis?.outOfRangeValues?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="page-enter space-y-6">
        <div className="h-8 w-48 skeleton-shimmer rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 skeleton-shimmer rounded-xl" />
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
      {error && (
        <div className="bg-cta-50 border border-cta-200 rounded-xl px-4 py-3 text-sm text-cta-700">
          {error}
        </div>
      )}

      <div>
        <h2 className="font-display font-bold text-xl text-warm-950">
          Hola, {userName}
        </h2>
        <p className="text-warm-500 mt-1 text-sm">
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
          <h2 className="font-display font-semibold text-lg text-warm-950">
            Tus últimos estudios
          </h2>
          <Link
            href="/dashboard/upload"
            className="text-sm font-medium text-cta-500 hover:text-cta-600 transition-colors"
          >
            Agregar estudio
          </Link>
        </div>

        {studies.length >= 2 && (
          <div className="bg-celeste-50 border border-celeste-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-celeste-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <p className="text-sm text-celeste-700 flex-1">
              Tenés estudios del mismo tipo. <Link href="/dashboard/compare" className="font-semibold underline">Comparalos ahora</Link> para ver tu evolución.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {studies.map((study, i) => {
            const severityCount = study.analysis?.outOfRangeValues?.filter(
              (v: OutOfRangeValue) => v.status !== "normal"
            ).length || 0;

            return (
              <Link
                key={study.id}
                href={`/dashboard/studies/${study.id}`}
                className="block bg-white rounded-xl border border-azul-200/60 p-5 card-hover"
                style={{ animation: `slideUp 0.4s var(--ease-out-expo) ${i * 80}ms both` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-azul-100 to-azul-200 flex items-center justify-center flex-shrink-0 text-azul-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-warm-950 truncate">
                      {study.title}
                    </p>
                    <p className="text-sm text-warm-500">
                      {study.studyType || "Estudio médico"} &middot; {formatDate(study.createdAt)} &middot; {formatFileSize(study.fileSize)}
                    </p>
                    {study.profile && (
                      <span className="inline-flex items-center gap-1.5 mt-1 text-xs text-warm-400">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: study.profile.color }} />
                        {study.profile.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {severityCount > 0 && (
                      <span className="inline-flex items-center gap-1 bg-cta-100 text-cta-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {severityCount} alerta{severityCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" className="group-hover:translate-x-1 transition-transform flex-shrink-0">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
                {study.analysis?.summary && (
                  <p className="mt-3 text-sm text-warm-600 line-clamp-2 pl-15">
                    {study.analysis.summary}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
