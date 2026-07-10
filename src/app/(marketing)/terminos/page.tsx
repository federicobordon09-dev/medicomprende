import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  title: "Términos de servicio",
  alternates: { canonical: `${siteUrl}/terminos` },
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <Link href="/" className="text-sm font-mono font-bold uppercase text-accent-2 hover:underline mb-8 inline-block">&larr; Volver al inicio</Link>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink uppercase tracking-tight mb-8">Términos de servicio</h1>

        <div className="space-y-6 text-ink/70 text-sm font-mono leading-relaxed">
          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">1. Aceptación de los términos</h2>
          <p>Al usar MediComprende aceptás estos términos. Si no estás de acuerdo, no uses el servicio.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">2. Descripción del servicio</h2>
          <p>MediComprende utiliza inteligencia artificial para analizar estudios médicos y proporcionar explicaciones en lenguaje claro. No es un servicio de diagnóstico médico.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">3. Naturaleza educativa</h2>
          <p>Todo el contenido generado por MediComprende tiene fines educativos e informativos. No reemplaza la consulta con un profesional de la salud. Siempre consultá a tu médico para interpretar tus resultados.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">4. Precisión de la IA</h2>
          <p>La IA puede cometer errores. Verificá siempre la información con un profesional. No nos hacemos responsables por decisiones tomadas basándose en el análisis automático.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">5. Responsabilidad del usuario</h2>
          <p>Sos responsable de la veracidad de los datos que subís. No subas estudios que no te pertenezcan.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">6. Planes y pagos</h2>
          <p>Ofrecemos planes gratuitos y de pago. Los precios pueden cambiar con aviso previo. Los pagos se procesan a través de Mercado Pago.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">7. Cancelación</h2>
          <p>Podés cancelar tu suscripción en cualquier momento. El plan Pro sigue activo hasta el final del período facturado.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">8. Contacto</h2>
          <p>Para consultas legales: <a href="mailto:legal@medicomprende.com" className="text-accent-2 hover:underline">legal@medicomprende.com</a>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
