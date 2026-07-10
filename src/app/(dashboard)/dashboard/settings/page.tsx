"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import Link from "next/link";

interface SubscriptionData {
  plan: "free" | "pro";
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
    currentPeriodStart: string;
    cancelledAt: string | null;
  } | null;
  usage: {
    analysesCount: number;
    comparisonsCount: number;
    studiesCount: number;
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [deletingStudies, setDeletingStudies] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmStudies, setConfirmStudies] = useState(false);
  const [confirmAccount, setConfirmAccount] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failure" | "pending" | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentHandledRef = useRef(false);

  const paymentParam = searchParams?.get("payment");

  useEffect(() => {
    if (!session) return;
    setLoadingSub(true);

    const payment = paymentParam;
    if (payment === "success" && !paymentHandledRef.current) {
      paymentHandledRef.current = true;
      setPaymentStatus("success");

      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/user/subscription");
          const data = await res.json();
          if (data.plan === "pro") {
            setSubData(data);
            setPaymentStatus(null);
            if (pollingRef.current) clearInterval(pollingRef.current);
            queryClient.invalidateQueries({ queryKey: ["studies"] });
            const url = new URL(window.location.href);
            url.searchParams.delete("payment");
            window.history.replaceState({}, "", url.toString());
          }
        } catch {
          /* retry */
        }
      }, 2000);

      setTimeout(() => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          setPaymentStatus(null);
        }
      }, 30000);
    } else if (payment === "failure") {
      setPaymentStatus("failure");
      paymentHandledRef.current = true;
    } else if (payment === "pending") {
      setPaymentStatus("pending");
      paymentHandledRef.current = true;
    }

    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((data) => setSubData(data))
      .catch(() => {})
      .finally(() => setLoadingSub(false));

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [session, paymentParam, queryClient]);

  const handleUpgrade = useCallback(async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/payments/create", { method: "POST" });
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    } catch {
      setError("Error al iniciar el pago.");
    } finally {
      setUpgrading(false);
    }
  }, []);

  const handleCancelSubscription = useCallback(async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/user/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) throw new Error("Error al cancelar");
      setSubData((prev) => prev ? { ...prev, plan: "free", subscription: prev.subscription ? { ...prev.subscription, status: "cancelled" } : null } : prev);
      setConfirmCancel(false);
    } catch {
      setError("Error al cancelar la suscripción.");
    } finally {
      setCancelling(false);
    }
  }, []);

  const handleDeleteStudies = async () => {
    setDeletingStudies(true);
    setError("");
    try {
      const res = await fetch("/api/studies", { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(err.error || "Error al eliminar");
      }
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setConfirmStudies(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar estudios");
    } finally {
      setDeletingStudies(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setError("");
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(err.error || "Error al eliminar");
      }
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: "/login" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar cuenta");
    } finally {
      setDeletingAccount(false);
    }
  };

  const isPro = subData?.plan === "pro";
  const usage = subData?.usage;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {paymentStatus === "success" && (
        <div className="bg-accent/10 brutal-border-2 p-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-ink" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div>
            <p className="font-mono font-bold uppercase text-ink text-sm">¡Pago exitoso!</p>
            <p className="text-ink/60 text-xs mt-0.5 font-mono">Estamos activando tu plan Pro. Esto puede tomar unos segundos…</p>
          </div>
          <div className="flex-shrink-0 ml-auto">
            <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
      {paymentStatus === "failure" && (
        <div className="bg-accent-2/10 brutal-border-2 p-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-accent-2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <div>
            <p className="font-mono font-bold uppercase text-ink text-sm">El pago no se pudo completar</p>
            <p className="text-ink/60 text-xs mt-0.5 font-mono">Intentá de nuevo desde la sección de planes.</p>
          </div>
          <Link href="/pricing" className="flex-shrink-0 text-xs font-mono font-bold uppercase text-accent-2 hover:underline ml-auto self-center">
            Ver planes
          </Link>
        </div>
      )}
      {paymentStatus === "pending" && (
        <div className="bg-accent/10 brutal-border-2 p-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-ink" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <p className="font-mono font-bold uppercase text-ink text-sm">Pago pendiente</p>
            <p className="text-ink/60 text-xs mt-0.5 font-mono">Estamos esperando la confirmación de Mercado Pago.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">Configuración</h1>
        <p className="text-ink/60 mt-1 font-mono">Administrá tu cuenta y preferencias.</p>
      </div>

      <div className="bg-white brutal-border-2 brutal-shadow p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight">Tu cuenta</h3>
        <div className="flex items-center gap-4 pb-4 brutal-border-b">
          <div className="w-14 h-14 bg-accent text-ink brutal-border-2 flex items-center justify-center text-xl font-mono font-bold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-mono font-bold uppercase text-ink">{session?.user?.name || "Usuario"}</p>
            <p className="text-sm font-mono text-ink/60">{session?.user?.email}</p>
          </div>
        </div>

        <div className="text-sm font-mono text-ink/60 space-y-2">
          <div className="flex justify-between py-2">
            <span className="font-bold uppercase text-ink">Plan actual</span>
            {loadingSub ? (
              <span className="text-xs text-ink/40">Cargando…</span>
            ) : isPro ? (
              <span className="font-bold uppercase text-xs bg-accent text-ink brutal-border-2 px-2 py-0.5">Pro</span>
            ) : (
              <span className="font-bold uppercase text-xs bg-ink/10 text-ink brutal-border-2 px-2 py-0.5">Gratuito</span>
            )}
          </div>
          {isPro && subData?.subscription?.currentPeriodEnd && (
            <div className="flex justify-between py-2">
              <span className="font-bold uppercase text-ink">Próximo vencimiento</span>
              <span className="font-bold text-ink">
                {new Date(subData.subscription.currentPeriodEnd).toLocaleDateString("es-AR")}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {isPro ? (
            <button
              onClick={() => setConfirmCancel(true)}
              disabled={cancelling || subData?.subscription?.status === "cancelled"}
              className="brutal-btn brutal-btn--red text-sm"
            >
              {subData?.subscription?.status === "cancelled" ? "Cancelación solicitada" : "Cancelar suscripción"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="brutal-btn text-sm"
            >
              {upgrading ? "Procesando…" : `Actualizar a Pro — $${process.env.NEXT_PUBLIC_PRO_PLAN_PRICE || "3000"}/mes`}
            </button>
          )}
        </div>
      </div>

      {usage && !isPro && (
        <div className="bg-white brutal-border-2 p-6">
          <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-4">Uso del mes</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-paper-2 brutal-border-2 p-4">
              <p className="text-2xl font-display font-bold text-ink">{usage.analysesCount}/3</p>
              <p className="text-xs font-mono text-ink/60 mt-1 uppercase">Análisis</p>
            </div>
            <div className="bg-paper-2 brutal-border-2 p-4">
              <p className="text-2xl font-display font-bold text-ink">{usage.comparisonsCount}/2</p>
              <p className="text-xs font-mono text-ink/60 mt-1 uppercase">Comparaciones</p>
            </div>
            <div className="bg-paper-2 brutal-border-2 p-4">
              <p className="text-2xl font-display font-bold text-ink">{usage.studiesCount}/10</p>
              <p className="text-xs font-mono text-ink/60 mt-1 uppercase">Estudios</p>
            </div>
          </div>
          {(usage.analysesCount >= 2 || usage.comparisonsCount >= 1 || usage.studiesCount >= 8) && (
            <div className="mt-4 bg-accent/10 brutal-border-2 p-3 text-sm font-mono text-ink">
              <p className="font-bold uppercase">Estás por llegar al límite de tu plan Gratuito</p>
              <Link href="/pricing" className="text-accent-2 font-bold uppercase hover:underline mt-1 inline-block">
                Actualizá a Pro para análisis ilimitados →
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="bg-white brutal-border-2 p-6">
        <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-4">Información legal</h3>
        <div className="space-y-3 text-sm font-mono text-ink/70">
          <p>
            MediComprende es una herramienta educativa que utiliza inteligencia artificial
            para ayudar a los pacientes a comprender mejor sus estudios médicos.
          </p>
          <p>
            <strong>No reemplaza la consulta médica.</strong> Toda la información proporcionada
            es únicamente con fines informativos y educativos.
          </p>
          <p>
            Tus datos se almacenan de forma segura y no se comparten con terceros.
            Podés eliminar tu cuenta y todos tus datos en cualquier momento.
          </p>
        </div>
      </div>

      <div className="bg-white brutal-border-2 border-accent-2 p-6">
        <h3 className="font-display font-bold text-lg text-accent-2 uppercase tracking-tight mb-2">Zona de peligro</h3>
        <p className="text-sm font-mono text-ink/60 mb-4">
          Estas acciones son irreversibles. Eliminar tu cuenta borrará todos tus estudios, análisis y datos.
        </p>
        {error && (
          <p className="text-accent-2 text-sm font-mono mb-3">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmStudies(true)}
            disabled={deletingStudies}
            className="bg-white border-2 border-accent-2 text-accent-2 hover:bg-accent-2 hover:text-white font-mono font-bold uppercase px-4 py-2 text-sm transition-all disabled:opacity-50"
          >
            {deletingStudies ? "Eliminando…" : "Eliminar todos los estudios"}
          </button>
          <button
            onClick={() => setConfirmAccount(true)}
            disabled={deletingAccount}
            className="bg-accent-2 hover:bg-accent-2/80 disabled:opacity-50 text-white font-mono font-bold uppercase px-4 py-2 text-sm transition-all"
          >
            {deletingAccount ? "Eliminando…" : "Eliminar cuenta"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar suscripción"
        message="¿Estás seguro? Tu plan Pro seguirá activo hasta el final del período de facturación actual y luego volverás al plan Gratuito."
        confirmLabel={cancelling ? "Cancelando…" : "Cancelar suscripción"}
        cancelLabel="Seguir con Pro"
        variant="danger"
        onConfirm={handleCancelSubscription}
        onCancel={() => { if (!cancelling) setConfirmCancel(false); }}
      />

      <ConfirmDialog
        open={confirmStudies}
        title="Eliminar todos los estudios"
        message="¿Estás seguro? Todos tus estudios y análisis se eliminarán permanentemente. Esta acción no se puede deshacer."
        confirmLabel={deletingStudies ? "Eliminando…" : "Eliminar todo"}
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteStudies}
        onCancel={() => { if (!deletingStudies) setConfirmStudies(false); }}
      />

      <ConfirmDialog
        open={confirmAccount}
        title="Eliminar cuenta"
        message="¿Estás seguro? Todos tus estudios, análisis y datos se eliminarán permanentemente. Esta acción NO se puede deshacer."
        confirmLabel={deletingAccount ? "Eliminando…" : "Eliminar cuenta"}
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => { if (!deletingAccount) setConfirmAccount(false); }}
      />
    </div>
  );
}
