"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PricingCard } from "@/components/PricingCard";
import { site } from "@/data/contenido";

const FREE_FEATURES = [
  "3 análisis por mes",
  "3 comparaciones por mes",
  "Hasta 10 estudios guardados",
  "Análisis con IA (Gemini)",
  "Perfiles familiares",
  "Alertas inteligentes",
  "Chat contextual con IA",
];

const PRO_FEATURES = [
  "Análisis ilimitados",
  "Comparaciones ilimitadas",
  "Historial completo sin límite",
  "Exportación de análisis en PDF",
  "Modelo de IA premium (Gemini Flash)",
  "Perfiles familiares",
  "Alertas inteligentes",
  "Chat contextual con IA",
  "Prioridad en procesamiento",
];

const PRO_PRICE = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
}).format(parseInt(process.env.NEXT_PUBLIC_PRO_PLAN_PRICE || "3000"));

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "loading">("loading");

  useEffect(() => {
    if (!session) {
      setUserPlan("free");
      return;
    }
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((data) => setUserPlan(data.plan || "free"))
      .catch(() => setUserPlan("free"));
  }, [session]);

  const handleSelectPro = useCallback(async () => {
    if (!session) {
      router.push("/register?redirect=/pricing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/create", { method: "POST" });
      const data = await res.json();

      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else if (data.message) {
        alert(data.message);
      }
    } catch {
      alert("Error al iniciar el pago. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [session, router]);

  const handleSelectFree = useCallback(() => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  }, [session, router]);

  const isAlreadyPro = userPlan === "pro";

  return (
    <div className="min-h-screen bg-gradient-to-b from-azul-50 to-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-cta-600 uppercase tracking-wider mb-2">
            Planes
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-warm-950 mb-3">
            Empezá gratis, upgradeá cuando quieras
          </h1>
          <p className="text-warm-600 max-w-xl mx-auto">
            {site.name} es gratis para empezar. Cuando necesites más, elegí el plan Pro por un precio accesible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto items-start">
          <PricingCard
            name="Gratuito"
            price="$0"
            priceSublabel="/ mes"
            features={FREE_FEATURES}
            cta={session ? "Ir al dashboard" : "Empezar gratis"}
            ctaAction={handleSelectFree}
          />

          <PricingCard
            name="Pro"
            price={PRO_PRICE}
            priceSublabel="/ mes"
            features={PRO_FEATURES}
            highlighted
            badge="Recomendado"
            cta={isAlreadyPro ? "Ya sos Pro" : session ? "Elegir Pro" : "Iniciar sesión y elegir Pro"}
            ctaAction={isAlreadyPro ? undefined : handleSelectPro}
            disabled={isAlreadyPro}
            disabledReason="Ya tenés el plan Pro"
            ctaLoading={loading}
          />
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-warm-500">
            Pagás una vez al mes. Podés cancelar cuando quieras. {/* TODO: MP recurrencia */}
          </p>
          <p className="text-xs text-warm-400 mt-2">
            El pago se procesa a través de Mercado Pago. No almacenamos datos de tu tarjeta.
          </p>
        </div>
      </div>
    </div>
  );
}
