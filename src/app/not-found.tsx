import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "@/data/contenido";

export const metadata: Metadata = {
  title: notFound.title,
};

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <div className="w-20 h-20 rounded-2xl bg-sk-100 flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        <div className="font-display font-bold text-[clamp(4rem,15vw,8rem)] leading-none text-sk-200 mb-2">
          {notFound.code}
        </div>
        <h1 className="font-display font-semibold text-[clamp(1.5rem,3vw,2.4rem)] text-warm-950 mb-2">
          {notFound.subtitle}
        </h1>
        <p className="text-base text-warm-500 max-w-md mx-auto mb-8 leading-relaxed">
          {notFound.message}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-sk-600 hover:bg-sk-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-base min-h-[48px] active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          {notFound.cta}
        </Link>
      </div>
    </section>
  );
}
