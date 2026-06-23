import type { Metadata } from "next";
import { site } from "@/data/contenido";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  title: "Términos de servicio",
  description: "Términos y condiciones de uso de MediComprende. Al usar el servicio aceptás estos términos.",
  alternates: { canonical: `${siteUrl}/terminos` },
  openGraph: {
    title: "Términos de servicio — MediComprende",
    description: "Términos y condiciones de uso de MediComprende.",
  },
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-azul-50 to-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-sm text-cta-600 hover:underline mb-8 inline-block">&larr; Volver al inicio</Link>

        <h1 className="font-display font-bold text-3xl sm:text-4xl text-warm-950 mb-8">Términos de servicio</h1>

        <div className="prose prose-warm max-w-none space-y-6 text-warm-700 text-sm leading-relaxed">
          <p><strong>Última actualización:</strong> Junio 2026</p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">1. Aceptación de los términos</h2>
          <p>
            Al usar MediComprende aceptás estos términos. Si no estás de acuerdo, no uses el servicio.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">2. Descripción del servicio</h2>
          <p>
            MediComprende es una herramienta educativa que utiliza inteligencia artificial para ayudar 
            a los usuarios a comprender sus informes médicos en lenguaje simple.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">3. Naturaleza educativa</h2>
          <p>
            <strong>IMPORTANTE:</strong> MediComprende es una herramienta educativa y no reemplaza la 
            consulta, el diagnóstico ni el tratamiento por parte de un profesional de la salud habilitado. 
            Siempre consultá a tu médico para interpretar tus resultados.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">4. Precisión de la IA</h2>
          <p>
            Utilizamos inteligencia artificial de última generación (Gemini de Google), pero la misma 
            puede cometer errores. No garantizamos la precisión absoluta de las explicaciones generadas. 
            Verificá siempre la información con un profesional de la salud.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">5. Responsabilidad del usuario</h2>
          <p>
            El usuario es responsable de la veracidad de los datos proporcionados y del uso que haga 
            de la información obtenida a través del servicio.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">6. Planes y pagos</h2>
          <p>
            El plan gratuito tiene límites de uso. El plan Pro es una suscripción mensual que se renueva 
            automáticamente. Podés cancelar en cualquier momento desde la configuración de tu cuenta. 
            Los pagos se procesan a través de Mercado Pago.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">7. Cancelación</h2>
          <p>
            Podés cancelar tu suscripción Pro en cualquier momento. El acceso a las funciones Pro 
            continúa hasta el final del período facturado. Podés eliminar tu cuenta completamente 
            desde la configuración.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">8. Contacto</h2>
          <p>
            Si tenés preguntas sobre estos términos, escribinos a{" "}
            <a href="mailto:legal@medicomprende.com" className="text-cta-600 hover:underline">legal@medicomprende.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
