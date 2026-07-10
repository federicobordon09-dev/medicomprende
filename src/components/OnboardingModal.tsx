"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";

export default function OnboardingModal() {
  const { data: session, update } = useSession();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user && !session.user.firstName && !session.user.age) {
      setOpen(true);
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() || null, age: age ? parseInt(age) : null }),
      });

      if (!res.ok) throw new Error();

      await update({ firstName: firstName.trim(), lastName: lastName.trim(), age: age ? parseInt(age) : null });
      showToast("Perfil actualizado", "success");
      setOpen(false);
    } catch {
      showToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
      <div className="relative bg-paper brutal-border-2 brutal-shadow w-full max-w-md mx-4 p-6 animate-fadeInScale">
        <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight">Completá tu perfil</h2>
        <p className="text-ink/60 font-mono text-sm mt-1.5">Decinos cómo querés que te llamemos</p>
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">Nombre *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Tu nombre"
              className="brutal-input"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Tu apellido"
              className="brutal-input"
            />
          </div>
          <div>
            <label className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">Edad</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Tu edad"
              min={0}
              max={150}
              className="brutal-input"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !firstName.trim()}
            className="w-full brutal-btn"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
}
