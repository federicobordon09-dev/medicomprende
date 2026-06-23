import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HeroLanding from "@/components/HeroLanding";
import ComoFunciona from "@/components/ComoFunciona";
import TiposInformes from "@/components/TiposInformes";
import Testimonios from "@/components/Testimonios";
import PlanesPreview from "@/components/PlanesPreview";
import Preguntas from "@/components/Preguntas";

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
