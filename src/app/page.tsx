import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { site } from "@/data/contenido";
import HeroLanding from "@/components/HeroLanding";
import ComoFunciona from "@/components/ComoFunciona";
import TiposInformes from "@/components/TiposInformes";
import Testimonios from "@/components/Testimonios";
import PlanesPreview from "@/components/PlanesPreview";
import Preguntas from "@/components/Preguntas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  alternates: { canonical: siteUrl },
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: siteUrl,
  },
};

export default async function RootPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <>
      <HeroLanding />
      <ComoFunciona />
      <TiposInformes />
      <Testimonios />
      <PlanesPreview />
      <Preguntas />
    </>
  );
}
