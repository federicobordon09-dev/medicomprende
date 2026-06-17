"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al restablecer la contraseña.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-xl text-warm-950 mb-2">Link inválido</h2>
        <p className="text-warm-500 text-sm mb-6">El link de restablecimiento no es válido o falta el token.</p>
        <Link
          href="/login"
          className="text-cta-500 hover:text-cta-600 font-medium text-sm"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-celeste-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-celeste-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-xl text-warm-950 mb-2">Contraseña actualizada</h2>
        <p className="text-warm-500 text-sm mb-6">Tu contraseña se restableció correctamente.</p>
        <Link
          href="/login"
          className="inline-block bg-cta-500 hover:bg-cta-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] text-sm"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="font-display font-bold text-xl text-warm-950">Nueva contraseña</h2>
        <p className="text-sm text-warm-500 mt-1">Elegí una contraseña nueva para tu cuenta.</p>
      </div>

      <div>
        <label htmlFor="reset-password" className="block text-sm font-medium text-warm-700 mb-1.5">Nueva contraseña</label>
        <input
          id="reset-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
          placeholder="Mínimo 8 caracteres"
          required
          minLength={8}
        />
      </div>

      <div>
        <label htmlFor="reset-confirm" className="block text-sm font-medium text-warm-700 mb-1.5">Confirmar contraseña</label>
        <input
          id="reset-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
          placeholder="Repetí la contraseña"
          required
          minLength={8}
        />
      </div>

      {error && (
        <motion.p
          className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cta-500 hover:bg-cta-600 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
      >
        {loading ? "Actualizando…" : "Restablecer contraseña"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gradient-to-br from-warm-50 via-azul-50/60 to-white">
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-warm-200 p-7 sm:p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-cta-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </section>
  );
}
