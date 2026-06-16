"use client";

import { SessionProvider } from "next-auth/react";
import Image from "next/image";
import { site } from "@/data/contenido";

export default function AuthClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-12 bg-warm-50 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sk-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-coral-100/50 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-sk-50 blur-2xl" />

        <div className="relative w-full max-w-[420px]">
          <div className="text-center mb-8 animate-[fadeInUp_0.5s_ease-out]">
            <div className="inline-flex items-center gap-2.5 mb-5">
              <Image
                src="/assets/images/logo_01.png"
                alt={site.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl"
              />
              <span className="font-display font-bold text-xl text-warm-950">
                {site.name}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.04)] border border-warm-200 p-6 sm:p-8 animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
            {children}
          </div>

          <p className="text-center text-xs text-warm-400 mt-6 animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
            Información educativa — no reemplaza una consulta médica
          </p>
        </div>
      </div>
    </SessionProvider>
  );
}
