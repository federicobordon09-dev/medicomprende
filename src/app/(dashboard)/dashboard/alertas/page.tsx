"use client";

import { useEffect, useState, useCallback } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface AlertItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  parameter: string | null;
  trend: string | null;
  acknowledged: boolean;
  createdAt: string;
}

const severityColors: Record<string, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

const severityLabels: Record<string, string> = {
  critical: "Crítica",
  warning: "Advertencia",
  info: "Informativa",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("unread");

  useEffect(() => {
    const controller = new AbortController();
    const ack = filter === "all" ? "" : filter === "unread" ? "false" : "true";
    setLoading(true);
    fetch(`/api/alerts?acknowledged=${ack}&limit=50`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setAlerts(data.alerts || []); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filter]);

  const refetch = useCallback(async () => {
    const ack = filter === "all" ? "" : filter === "unread" ? "false" : "true";
    try {
      const res = await fetch(`/api/alerts?acknowledged=${ack}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch {
      // ignore
    }
  }, [filter]);

  const markRead = async (ids: string[]) => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, acknowledged: true }),
    });
    refetch();
  };

  const markAllRead = async () => {
    const unreadIds = alerts.filter((a) => !a.acknowledged).map((a) => a.id);
    if (unreadIds.length > 0) await markRead(unreadIds);
  };

  const unreadCount = loading ? 0 : alerts.filter((a) => !a.acknowledged).length;

  if (!loading && alerts.length === 0) {
    return (
      <div className="page-enter">
        <EmptyState
          icon="alert"
          title="No hay alertas"
          description="No se detectaron patrones preocupantes en tus estudios. Las alertas aparecen cuando hay cambios significativos."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">Alertas</h1>
          {!loading && (
            <p className="text-ink/60 font-mono text-sm mt-1">
              {unreadCount > 0
                ? `Tenés ${unreadCount} alerta${unreadCount !== 1 ? "s" : ""} sin leer.`
                : "No tenés alertas pendientes."}
            </p>
          )}
        </div>
        {!loading && unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-mono font-bold uppercase text-accent-2 hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(["unread", "all", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-mono font-bold uppercase transition-all brutal-border-2 ${
              filter === f
                ? "bg-ink text-paper"
                : "bg-white text-ink/60 hover:bg-accent"
            }`}
          >
            {f === "unread" ? "Sin leer" : f === "all" ? "Todas" : "Leídas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-paper-2 brutal-border-2 p-5 animate-pulse">
              <div className="h-5 w-48 skeleton-shimmer brutal-border-2 mb-2" />
              <div className="h-4 w-full skeleton-shimmer brutal-border-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div
              key={alert.id}
              className={`brutal-border-2 p-5 transition-all ${
                !alert.acknowledged
                  ? "bg-white brutal-shadow-sm"
                  : "bg-paper-2 opacity-60"
              }`}
              style={{ animation: `slideUp 0.4s var(--ease-out-expo) ${i * 60}ms both` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={severityColors[alert.severity] || "warning"}>
                      {severityLabels[alert.severity] || alert.severity}
                    </Badge>
                    <span className="text-xs font-mono text-ink/40">{formatDate(alert.createdAt)}</span>
                  </div>
                  <h3 className="font-mono font-bold uppercase text-ink">{alert.title}</h3>
                  <p className="text-sm font-mono text-ink/60 mt-1">{alert.description}</p>
                  {alert.parameter && (
                    <p className="text-xs font-mono text-ink/40 mt-2">
                      Parámetro: {alert.parameter} · Tendencia: {alert.trend}
                    </p>
                  )}
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => markRead([alert.id])}
                    className="flex-shrink-0 text-xs font-mono font-bold uppercase text-accent-2 hover:underline"
                  >
                    Leída
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
