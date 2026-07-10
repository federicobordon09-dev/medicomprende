"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { FamilyProfileData } from "@/lib/types";

const RELATIONS = [
  { value: "propio", label: "Propio" },
  { value: "hijo", label: "Hijo/a" },
  { value: "padre", label: "Padre" },
  { value: "madre", label: "Madre" },
  { value: "conyuge", label: "Cónyuge" },
  { value: "otro", label: "Otro" },
];

const COLORS = ["#0D9488", "#D04C3A", "#F59E0B", "#3B82F6", "#8B5CF6"];

export default function FamilyPage() {
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<FamilyProfileData[]>([]);
  const [maxProfiles, setMaxProfiles] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("propio");
  const [color, setColor] = useState(COLORS[0]);
  const [deleteTarget, setDeleteTarget] = useState<FamilyProfileData | null>(null);

  function extractProfiles(data: any): FamilyProfileData[] {
    if (Array.isArray(data)) return data;
    if (data?.profiles) return data.profiles;
    return [];
  }

  function extractMaxProfiles(data: any): number {
    if (data?.maxProfiles) return data.maxProfiles;
    return 5;
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/profiles", { signal: controller.signal })
      .then((res) => res.ok ? res.json() : [])
      .then((data: any) => {
        if (!controller.signal.aborted) {
          setProfiles(extractProfiles(data));
          setMaxProfiles(extractMaxProfiles(data));
        }
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const refetchProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const data = await res.json();
        setProfiles(extractProfiles(data));
        setMaxProfiles(extractMaxProfiles(data));
      }
    } catch {
      // ignore
    }
  }, []);

  const createProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), relation, color }),
      });
      if (res.ok) {
        showToast("Perfil creado", "success");
        setShowForm(false);
        setName("");
        refetchProfiles();
      } else {
        const data = await res.json();
        showToast(data.error || "Error al crear perfil", "error");
      }
    } catch {
      showToast("Error de conexión", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/profiles?id=${deleteTarget.id}`, { method: "DELETE" });
      showToast("Perfil eliminado", "success");
      setDeleteTarget(null);
      refetchProfiles();
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  if (!loading && profiles.length === 0 && !showForm) {
    return (
      <div className="page-enter">
        <EmptyState
          icon="profile"
          title="Creá perfiles familiares"
          description="Gestioná los estudios médicos de tu familia por separado. Cada perfil tiene su propio historial."
          actionLabel="Crear perfil"
          onAction={() => setShowForm(true)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">Perfiles familiares</h1>
          <p className="text-ink/60 text-sm font-mono mt-1">Gestioná los estudios de tu familia por separado.</p>
        </div>
        {profiles.length < maxProfiles && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="brutal-btn text-sm"
          >
            {showForm ? "Cancelar" : "Nuevo perfil"}
          </button>
        )}
        {profiles.length >= maxProfiles && maxProfiles < 999 && (
          <p className="text-xs font-mono text-ink/60">Actualizá a Pro para crear más perfiles</p>
        )}
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="h-8 w-64 skeleton-shimmer brutal-border-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-paper-2 brutal-border-2 p-5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ink/20 brutal-border-2" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-ink/20 brutal-border-2 mb-2" />
                    <div className="h-3 w-32 bg-ink/10 brutal-border-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && showForm && (
        <form onSubmit={createProfile} className="bg-white brutal-border-2 brutal-shadow p-6 space-y-5">
          <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight">Nuevo perfil</h3>
          <div>
            <label className="block text-sm font-mono font-bold uppercase text-ink mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Papá, Hijo, Abuela..."
              className="brutal-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-mono font-bold uppercase text-ink mb-1">Relación</label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="brutal-input"
            >
              {RELATIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-mono font-bold uppercase text-ink mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 brutal-border-2 transition-all ${color === c ? "ring-2 ring-offset-2 ring-ink scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full brutal-btn"
          >
            Crear perfil
          </button>
        </form>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((p, i) => (
            <div key={p.id} className="bg-white brutal-card p-5"
              style={{ animation: `slideUp 0.4s var(--ease-out-expo) ${i * 60}ms both` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center text-white font-mono font-bold text-sm brutal-border-2" style={{ backgroundColor: p.color }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-mono font-bold uppercase text-ink">{p.name}</h3>
                    <p className="text-xs font-mono text-ink/60">
                      {RELATIONS.find((r) => r.value === p.relation)?.label || p.relation}
                      {p.studyCount !== undefined && ` · ${p.studyCount} estudio${p.studyCount !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="text-ink/40 hover:text-accent-2 transition-colors"
                  title="Eliminar perfil"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar perfil"
        message={`¿Eliminar el perfil de "${deleteTarget?.name}"? Los estudios asociados se moverán a tu perfil principal.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
