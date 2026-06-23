import type { Metadata } from "next";
import { site } from "@/data/contenido";
import PricingClient from "./pricing-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  title: "Planes",
  description: "Empezá gratis y upgradeá cuando quieras. Plan Pro desde $3.000 ARS/mes con análisis ilimitados, exportación PDF y modelo IA premium.",
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: "Planes — MediComprende",
    description: "Empezá gratis y upgradeá cuando quieras.",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
