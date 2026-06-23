import type { Metadata } from "next";
import { site } from "@/data/contenido";
import LoginClient from "./login-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Iniciá sesión en MediComprende para acceder a tus informes médicos explicados y análisis guardados.",
  alternates: { canonical: `${siteUrl}/login` },
  openGraph: {
    title: "Iniciar sesión — MediComprende",
    description: "Accedé a tu cuenta y revisá tus informes médicos explicados.",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
