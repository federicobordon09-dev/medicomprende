import type { Metadata } from "next";
import { site } from "@/data/contenido";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de MediComprende. Conocé cómo manejamos tus datos personales e informes médicos.",
  alternates: { canonical: `${siteUrl}/privacidad` },
  openGraph: {
    title: "Política de privacidad — MediComprende",
    description: "Conocé cómo manejamos tus datos personales e informes médicos.",
  },
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-azul-50 to-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-sm text-cta-600 hover:underline mb-8 inline-block">&larr; Volver al inicio</Link>

        <h1 className="font-display font-bold text-3xl sm:text-4xl text-warm-950 mb-8">Política de privacidad</h1>

        <div className="prose prose-warm max-w-none space-y-6 text-warm-700 text-sm leading-relaxed">
          <p><strong>Última actualización:</strong> Junio 2026</p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">1. Información que recopilamos</h2>
          <p>
            Recopilamos la información necesaria para brindarte el servicio: tu nombre y correo electrónico 
            (a través de Google al iniciar sesión) y los archivos PDF de informes médicos que subís voluntariamente.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">2. Uso de la información</h2>
          <p>
            Usamos tu información únicamente para procesar y explicar tus informes médicos, 
            mejorar nuestros servicios y comunicarnos con vos sobre tu cuenta. No usamos tus informes 
            para entrenar modelos de IA ni los compartimos con terceros.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">3. Almacenamiento y seguridad</h2>
          <p>
            Tus informes se procesan en memoria y se almacenan de forma segura en nuestra base de datos 
            solo si creás una cuenta. Podés eliminar tus informes y tu cuenta en cualquier momento 
            desde la configuración.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">4. Google Gemini API</h2>
          <p>
            Utilizamos la API de Gemini de Google para analizar los informes médicos. Los datos enviados 
            a Google se manejan según sus términos de servicio y no se usan para entrenar sus modelos. 
            Consultá la{" "}
            <a href="https://policies.google.com/privacy" className="text-cta-600 hover:underline" target="_blank" rel="noopener noreferrer">
              política de privacidad de Google
            </a>{" "}
            para más información.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">5. Mercado Pago</h2>
          <p>
            Los pagos del plan Pro se procesan a través de Mercado Pago. No almacenamos ni tenemos acceso 
            a los datos de tu tarjeta. Consultá la{" "}
            <a href="https://www.mercadopago.com.ar/ayuda/terminos-y-condiciones_299" className="text-cta-600 hover:underline" target="_blank" rel="noopener noreferrer">
              política de Mercado Pago
            </a>{" "}
            para más información.
          </p>

          <h2 className="font-display font-semibold text-xl text-warm-950 mt-8 mb-3">6. Tus derechos</h2>
          <p>
            Podés solicitar la descarga, modificación o eliminación de tus datos personales en 
            cualquier momento escribiéndonos a{" "}
            <a href="mailto:privacidad@medicomprende.com" className="text-cta-600 hover:underline">privacidad@medicomprende.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
