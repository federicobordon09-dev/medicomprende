"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/data/contenido";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-sk-950/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
      aria-label="Navegación principal"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group min-h-11" aria-label="Ir al inicio">
          <Image
            src="/assets/images/logo_01.png"
            alt={site.name}
            width={36}
            height={36}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-display font-semibold text-base sm:text-lg text-white">
            {site.name}
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="#como-funciona"
            className="text-xs sm:text-sm font-medium px-3 py-2.5 min-h-11 flex items-center rounded-lg text-white/80 hover:text-white transition-colors"
          >
            Cómo funciona
          </a>
          <a
            href="#faq"
            className="text-xs sm:text-sm font-medium px-3 py-2.5 min-h-11 flex items-center rounded-lg text-white/80 hover:text-white transition-colors"
          >
            FAQ
          </a>
        </div>
      </div>
    </nav>
  );
}
