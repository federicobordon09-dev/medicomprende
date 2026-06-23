"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!session) return;
    setLoadingSub(true);
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((data) => setSubData(data))
      .catch(() => {})
      .finally(() => setLoadingSub(false));
  }, [session]);

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
      <div>
        <h1 className="font-display font-bold text-2xl text-warm-950">Configuración</h1>
        <p className="text-warm-600 mt-1">Administrá tu cuenta y preferencias.</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-azul-200/60 space-y-4">
        <h3 className="font-display font-semibold text-lg">Tu cuenta</h3>
        <div className="flex items-center gap-4 pb-4 border-b border-azul-100">
          <div className="w-14 h-14 rounded-full bg-cta-500 flex items-center justify-center text-white text-xl font-bold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-warm-950">{session?.user?.name || "Usuario"}</p>
            <p className="text-sm text-warm-500">{session?.user?.email}</p>
          </div>
        </div>

        <div className="text-sm text-warm-600 space-y-2">
          <div className="flex justify-between py-2">
            <span>Plan actual</span>
            {loadingSub ? (
              <span className="text-xs text-warm-400">Cargando…</span>
            ) : isPro ? (
              <span className="font-medium text-cta-600 bg-cta-50 px-2 py-0.5 rounded-full text-xs">Pro</span>
            ) : (
              <span className="font-medium text-celeste-600 bg-celeste-50 px-2 py-0.5 rounded-full text-xs">Gratuito</span>
            )}
          </div>
          {isPro && subData?.subscription?.currentPeriodEnd && (
            <div className="flex justify-between py-2">
              <span>Próximo vencimiento</span>
              <span className="font-medium text-warm-950">
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
              className="text-sm font-medium px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
            >
              {subData?.subscription?.status === "cancelled" ? "Cancelación solicitada" : "Cancelar suscripción"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-cta-500 hover:bg-cta-600 text-white transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {upgrading ? "Procesando…" : `Actualizar a Pro — $${process.env.NEXT_PUBLIC_PRO_PLAN_PRICE || "3000"}/mes`}
            </button>
          )}
        </div>
      </div>

      {usage && !isPro && (
        <div className="bg-white rounded-xl p-6 border border-azul-200/60">
          <h3 className="font-display font-semibold text-lg mb-4">Uso del mes</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-azul-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-warm-950">{usage.analysesCount}/3</p>
              <p className="text-xs text-warm-500 mt-1">Análisis</p>
            </div>
            <div className="bg-azul-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-warm-950">{usage.comparisonsCount}/3</p>
              <p className="text-xs text-warm-500 mt-1">Comparaciones</p>
            </div>
            <div className="bg-azul-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-warm-950">{usage.studiesCount}/10</p>
              <p className="text-xs text-warm-500 mt-1">Estudios</p>
            </div>
          </div>
          {(usage.analysesCount >= 2 || usage.comparisonsCount >= 2 || usage.studiesCount >= 8) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
              <p className="font-medium">Estás por llegar al límite de tu plan Gratuito</p>
              <Link href="/pricing" className="text-cta-600 font-medium hover:underline mt-1 inline-block">
                Actualizá a Pro para análisis ilimitados →
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-azul-200/60">
        <h3 className="font-display font-semibold text-lg mb-4">Información legal</h3>
        <div className="space-y-3 text-sm text-warm-600">
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

      <div className="bg-white rounded-xl p-6 border border-red-200">
        <h3 className="font-display font-semibold text-lg text-red-600 mb-2">Zona de peligro</h3>
        <p className="text-sm text-warm-600 mb-4">
          Estas acciones son irreversibles. Eliminar tu cuenta borrará todos tus estudios, análisis y datos.
        </p>
        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmStudies(true)}
            disabled={deletingStudies}
            className="bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {deletingStudies ? "Eliminando…" : "Eliminar todos los estudios"}
          </button>
          <button
            onClick={() => setConfirmAccount(true)}
            disabled={deletingAccount}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
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
