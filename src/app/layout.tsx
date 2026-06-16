import type { Metadata } from "next";
import { Figtree, Noto_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { site } from "@/data/contenido";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medicomprende.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: "Subí tu informe médico en PDF y recibí una explicación clara en lenguaje simple. Entendé tus estudios sin necesidad de ser médico.",
  keywords: ["informe médico", "explicar estudios", "resonancia", "tomografía", "análisis clínico", "IA médica", "traductor médico", "salud"],
  icons: {
    icon: [
      { url: "/assets/images/logo_01.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/logo_01.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/assets/images/logo_01.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: site.name,
    title: site.name,
    description: site.tagline,
    url: siteUrl,
    images: [{ url: "/assets/images/banner_01.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.tagline,
    images: [`${siteUrl}/assets/images/banner_01.png`],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.name,
      url: siteUrl,
      description: site.tagline,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${figtree.variable} ${notoSans.variable}`}>
      <body className="font-body text-warm-950 bg-sk-50 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-sk-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>
        <SessionProvider>
          <ErrorBoundary>
            <Navbar />
            <main id="main-content">{children}</main>
            <Footer />
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}
