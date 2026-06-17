"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

export function OnboardingModal() {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user && !session.user.firstName) {
      const googleName = session.user.name || "";
      const parts = googleName.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setOpen(true);
    }
  }, [session]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") return; };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), age: age ? Number(age) : null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      await update({ firstName: firstName.trim(), lastName: lastName.trim(), age: age ? Number(age) : null });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-warm-950/40 backdrop-blur-sm" onClick={() => {}} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-xl border border-sk-200 w-full max-w-sm mx-4 p-6 md:p-8 animate-fadeInScale focus:outline-none"
        role="dialog"
        aria-modal="true"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-100 to-coral-200 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.5" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-warm-950">Completá tu perfil</h2>
          <p className="text-warm-600 text-sm mt-1.5">Decinos cómo querés que te llamemos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-warm-700 mb-1.5">Nombre *</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sk-200 bg-white text-warm-950 text-sm placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500 transition-all"
              placeholder="Ej: Federico"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-warm-700 mb-1.5">Apellido</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sk-200 bg-white text-warm-950 text-sm placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500 transition-all"
              placeholder="Ej: Bordon"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-warm-700 mb-1.5">Edad</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={1}
              max={150}
              className="w-full px-4 py-2.5 rounded-xl border border-sk-200 bg-white text-warm-950 text-sm placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500 transition-all"
              placeholder="Ej: 30"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-coral-500/25 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="40" />
              </svg>
            ) : null}
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}
