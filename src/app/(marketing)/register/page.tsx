import type { Metadata } from "next";
import { site } from "@/data/contenido";
import RegisterClient from "./register-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta gratis en MediComprende y empezá a entender tus informes médicos con la ayuda de IA.",
  alternates: { canonical: `${siteUrl}/register` },
  openGraph: {
    title: "Crear cuenta — MediComprende",
    description: "Creá tu cuenta gratis y empezá a entender tus informes médicos.",
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
