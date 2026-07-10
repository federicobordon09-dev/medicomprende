import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: `${siteUrl}/privacidad` },
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <Link href="/" className="text-sm font-mono font-bold uppercase text-accent-2 hover:underline mb-8 inline-block">&larr; Volver al inicio</Link>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink uppercase tracking-tight mb-8">Política de privacidad</h1>

        <div className="space-y-6 text-ink/70 text-sm font-mono leading-relaxed">
          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">1. Información que recopilamos</h2>
          <p>Recopilamos tu nombre, email, y los estudios médicos que subís voluntariamente. No recopilamos información de salud sin tu consentimiento explícito.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">2. Uso de la información</h2>
          <p>Usamos tus datos para analizar tus estudios, mejorar el servicio, y comunicarnos con vos si es necesario. No vendemos tu información a terceros.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">3. Almacenamiento y seguridad</h2>
          <p>Tus datos se almacenan de forma segura en servidores cifrados. Podés eliminar tu cuenta y todos tus datos en cualquier momento.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">4. Google Gemini API</h2>
          <p>Usamos la API de Google Gemini para analizar los estudios. Google no usa tus datos para entrenar sus modelos. Más información en <a href="https://policies.google.com/privacy" className="text-accent-2 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">5. Mercado Pago</h2>
          <p>Los pagos se procesan a través de Mercado Pago. No almacenamos información de tarjetas de crédito ni datos bancarios. Ver <a href="https://www.mercadopago.com.ar/ayuda/terminos-y-condiciones_299" className="text-accent-2 hover:underline" target="_blank" rel="noopener noreferrer">términos de Mercado Pago</a>.</p>

          <h2 className="font-display font-bold text-xl text-ink uppercase tracking-tight mt-8 mb-3">6. Tus derechos</h2>
          <p>Podés acceder, modificar o eliminar tus datos personales en cualquier momento desde la configuración de tu cuenta. Para consultas: <a href="mailto:privacidad@medicomprende.com" className="text-accent-2 hover:underline">privacidad@medicomprende.com</a>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
