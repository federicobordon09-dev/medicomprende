"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);

  useEffect(() => { onCancelRef.current = onCancel; }, [onCancel]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancelRef.current(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancel} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-paper brutal-border-2 brutal-shadow w-full max-w-sm mx-4 p-6 animate-fadeInScale focus:outline-none"
        role="alertdialog"
        aria-modal="true"
      >
        <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-ink/60 font-mono text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-mono font-bold uppercase text-ink/60 hover:text-ink brutal-border-2 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 brutal-btn text-sm ${
              variant === "danger" ? "brutal-btn--red" : ""
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
