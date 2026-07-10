"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { formatFileSize, compressImage } from "@/lib/utils";

type StudyType = "resonancia" | "tomografia" | "sangre" | "electrocardiograma" | "laboratorio" | "epicrisis" | "otro";

const STUDY_TYPES: { value: StudyType; label: string }[] = [
  { value: "resonancia", label: "Resonancia magnética (RMN)" },
  { value: "tomografia", label: "Tomografía computada (TC)" },
  { value: "sangre", label: "Análisis de sangre" },
  { value: "electrocardiograma", label: "Electrocardiograma" },
  { value: "laboratorio", label: "Estudios de laboratorio" },
  { value: "epicrisis", label: "Epicrisis e informes clínicos" },
  { value: "otro", label: "Otro tipo de estudio" },
];

const STEPS = [
  { label: "Recibiendo archivo", icon: "file" },
  { label: "Extrayendo texto", icon: "text" },
  { label: "Analizando con IA", icon: "ai" },
  { label: "Generando resultados", icon: "result" },
];

function LoadingOverlay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 1800 : 2200);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="absolute inset-0 bg-paper/95 z-10 flex flex-col items-center justify-center px-6 brutal-border-2 animate-[fadeIn_0.25s_ease]">
      <div className="flex flex-col items-center gap-4 mb-6 animate-[fadeInScale_0.35s_var(--ease-out-expo)]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-accent animate-pulse brutal-border-2" />
          <div className="absolute inset-0 bg-accent/50 animate-ping" style={{ animationDuration: "2.5s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-lg text-ink uppercase tracking-tight">Analizando informe</p>
          <p className="text-sm font-mono text-ink/60 mt-0.5 max-w-xs">
            Esto puede tomar unos segundos. No cerrés esta página.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-3 px-3 py-2 transition-opacity duration-[350ms]"
            style={{ opacity: i <= step ? 1 : 0.25 }}
          >
            <div
              className={`w-7 h-7 flex items-center justify-center flex-shrink-0 brutal-border-2 transition-all duration-300 ${
                i < step
                  ? "bg-ink text-paper"
                  : i === step
                    ? "bg-accent text-ink animate-pulse"
                    : "bg-paper-2 text-ink/40"
              }`}
            >
              {i < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <div className="w-3 h-3 border-2 border-current" />
              )}
            </div>
            <span className={`text-sm font-mono font-bold uppercase transition-colors duration-300 ${
              i === step ? "text-ink" : i < step ? "text-ink/60" : "text-ink/30"
            }`}>
              {s.label}
            </span>
            {i === step && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-ink border-t-transparent animate-spin" />
              </div>
            )}
            {i < step && (
              <span className="ml-auto text-ink/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm mt-5 h-1.5 bg-ink/10 overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-[700ms] var(--ease-out-expo)"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studyType, setStudyType] = useState<StudyType>("otro");
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split("T")[0]);
  const [profiles, setProfiles] = useState<{ id: string; name: string; color: string }[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => res.ok && res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProfiles(data);
          if (data.length > 0) setSelectedProfile(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleFile = useCallback((f: File) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(f.type)) {
      setError("Solo aceptamos PDF, PNG, JPG o WEBP.");
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setError("El archivo es muy grande. Máximo 15 MB.");
      return;
    }
    setError("");
    setFile(f);
    setTitle(f.name.replace(/\.[^/.]+$/, ""));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const uploadFile = file.type.startsWith("image/") ? await compressImage(file) : file;

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("studyType", studyType);
      formData.append("studyDate", studyDate);
      formData.append("title", title || file.name);
      if (selectedProfile) formData.append("profileId", selectedProfile);

      const res = await fetch("/api/studies", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al subir el archivo.");
        setLoading(false);
        return;
      }

      showToast("Estudio analizado con éxito", "success");
      router.push(`/dashboard/estudios/${data.study.id}`);
    } catch {
      setError("Error de conexión. Verificá tu internet e intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl text-ink uppercase tracking-tight">Subir estudio</h1>
        <p className="text-ink/60 text-sm font-mono">Completá los datos y seleccioná el archivo.</p>
      </div>

      {error && (
        <div className="bg-accent-2 text-white brutal-border-2 px-4 py-2.5 text-sm font-mono font-bold uppercase">
          {error}
        </div>
      )}

      <div className="relative bg-white brutal-border brutal-shadow p-6 space-y-5">
        {loading && <LoadingOverlay />}

        <div>
          <label className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">Tipo de estudio</label>
          <select
            value={studyType}
            onChange={(e) => setStudyType(e.target.value as StudyType)}
            className="brutal-input"
          >
            {STUDY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">Fecha del estudio</label>
            <input
              type="date"
              value={studyDate}
              onChange={(e) => setStudyDate(e.target.value)}
              className="brutal-input"
            />
          </div>
          {profiles.length > 0 && (
            <div>
              <label className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">Perfil</label>
              <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="brutal-input"
              >
                <option value="">Para mí</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {title && (
          <div>
            <label className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">Título</label>
            <p className="brutal-input bg-paper-2 cursor-default">{title}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-mono font-bold uppercase text-ink mb-1.5">Archivo</label>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            hidden
          />

          {!file ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`w-full brutal-border-2 p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? "bg-accent text-ink"
                  : "bg-white text-ink/70 hover:bg-accent/30"
              }`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="font-mono font-bold text-sm">Seleccioná o arrastrá tu archivo</p>
              <p className="text-xs font-mono mt-0.5 opacity-60">PDF, PNG, JPG o WEBP · máx 15 MB</p>
            </button>
          ) : (
            <div className="bg-paper-2 brutal-border-2 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent text-ink brutal-border-2 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-ink text-sm truncate">{file.name}</p>
                  <p className="text-xs font-mono text-ink/60">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="w-8 h-8 bg-white brutal-border-2 flex items-center justify-center text-ink/60 hover:text-ink transition-all flex-shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full brutal-btn"
        >
          {loading ? "Procesando..." : "Analizar informe"}
        </button>
      </div>
    </div>
  );
}
