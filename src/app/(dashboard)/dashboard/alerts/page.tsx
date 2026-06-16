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

  if (!loading && alerts.length === 0) {
    return (
      <EmptyState
        icon="alert"
        title="No hay alertas"
        description="No se detectaron patrones preocupantes en tus estudios. Las alertas aparecen cuando hay cambios significativos."
      />
    );
  }

  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-warm-950">Alertas</h1>
          <p className="text-warm-600 text-sm mt-1">
            {unreadCount > 0
              ? `Tenés ${unreadCount} alerta${unreadCount !== 1 ? "s" : ""} sin leer.`
              : "No tenés alertas pendientes."}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-coral-500 hover:text-coral-600"
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
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? "bg-sk-900 text-white"
                : "bg-white text-warm-600 hover:bg-sk-100"
            }`}
          >
            {f === "unread" ? "Sin leer" : f === "all" ? "Todas" : "Leídas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="h-5 w-48 bg-sk-200 rounded mb-2" />
              <div className="h-4 w-full bg-sk-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl p-5 border transition-all ${
                !alert.acknowledged
                  ? "border-coral-200 shadow-sm"
                  : "border-sk-200/60 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={severityColors[alert.severity] || "warning"}>
                      {severityLabels[alert.severity] || alert.severity}
                    </Badge>
                    <span className="text-xs text-warm-400">{formatDate(alert.createdAt)}</span>
                  </div>
                  <h3 className="font-semibold text-warm-950">{alert.title}</h3>
                  <p className="text-sm text-warm-600 mt-1">{alert.description}</p>
                  {alert.parameter && (
                    <p className="text-xs text-warm-400 mt-2 font-mono">
                      Parámetro: {alert.parameter} · Tendencia: {alert.trend}
                    </p>
                  )}
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => markRead([alert.id])}
                    className="flex-shrink-0 text-xs text-coral-500 hover:text-coral-600 font-medium"
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
