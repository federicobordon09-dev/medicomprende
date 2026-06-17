"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { formatFileSize } from "@/lib/utils";

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

function StepIcon({ step, current }: { step: number; current: number }) {
  const done = current > step;
  const active = current === step;

  if (done) {
    return (
      <div className="w-7 h-7 rounded-full bg-celeste-500 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }

  if (active) {
    return (
      <div className="w-7 h-7 rounded-full bg-cta-500 flex items-center justify-center flex-shrink-0 animate-pulse">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-7 h-7 rounded-full bg-azul-200 flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
  );
}

function LoadingOverlay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 1800 : 2200);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center px-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-cta-100 flex items-center justify-center animate-pulse-glow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <p className="font-display font-semibold text-lg text-warm-950">Analizando informe</p>
        <p className="text-sm text-warm-500 text-center max-w-xs">
          Esto puede tomar unos segundos. No cerrés esta página.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2.5">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
              i <= step ? "opacity-100" : "opacity-30"
            }`}
          >
            <StepIcon step={i} current={step} />
            <span
              className={`text-sm font-medium transition-colors duration-500 ${
                i === step ? "text-warm-950" : i < step ? "text-warm-600" : "text-warm-400"
              }`}
            >
              {s.label}
            </span>
            {i === step && (
              <div className="ml-auto">
                <div className="w-4 h-4 rounded-full border-2 border-cta-500 border-t-transparent animate-spin" />
              </div>
            )}
            {i < step && (
              <span className="ml-auto text-celeste-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm mt-5 h-1.5 bg-azul-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-cta-500 rounded-full transition-all duration-700 ease-out"
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
      const formData = new FormData();
      formData.append("file", file);
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
      router.push(`/dashboard/studies/${data.study.id}`);
    } catch {
      setError("Error de conexión. Verificá tu internet e intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-4">
        <h1 className="font-display font-bold text-xl text-warm-950">Subir estudio</h1>
        <p className="text-warm-500 text-sm mt-0.5">Completá los datos y seleccioná el archivo.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="relative bg-white rounded-xl border border-azul-200/60 p-5 space-y-4">
        {loading && <LoadingOverlay />}

        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">Tipo de estudio</label>
          <select
            value={studyType}
            onChange={(e) => setStudyType(e.target.value as StudyType)}
            className="w-full px-3.5 py-2 bg-white border border-azul-200 rounded-xl text-warm-900 text-sm focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500"
          >
            {STUDY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">Fecha del estudio</label>
            <input
              type="date"
              value={studyDate}
              onChange={(e) => setStudyDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-azul-200 rounded-xl text-warm-900 text-sm focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500"
            />
          </div>
          {profiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">Perfil</label>
              <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-azul-200 rounded-xl text-warm-900 text-sm focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500"
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
            <label className="block text-sm font-medium text-warm-700 mb-1.5">Título</label>
            <p className="w-full px-3.5 py-2 bg-azul-50 border border-azul-200 rounded-xl text-warm-900 text-sm">
              {title}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">Archivo</label>
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
              className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-cta-400 bg-cta-50"
                  : "border-azul-300 bg-azul-50 hover:bg-azul-100 hover:border-azul-400"
              }`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" className="mx-auto mb-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="font-semibold text-warm-700 text-sm">Seleccioná o arrastrá tu archivo</p>
              <p className="text-xs text-warm-500 mt-0.5">PDF, PNG, JPG o WEBP · máx 15 MB</p>
            </button>
          ) : (
            <div className="bg-azul-50 rounded-xl p-4 border border-azul-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cta-100 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-warm-900 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-warm-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="w-8 h-8 rounded-full bg-white border border-azul-200 flex items-center justify-center text-warm-400 hover:text-warm-600 transition-all flex-shrink-0"
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
          className="w-full bg-cta-500 hover:bg-cta-600 disabled:bg-azul-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.97]"
        >
          {loading ? "Procesando..." : "Analizar informe"}
        </button>
      </div>
    </div>
  );
}
