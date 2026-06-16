# MediComprende

**Tu informe médico, en palabras que entendés.**

MediComprende es una aplicación web que traduce informes médicos complejos a lenguaje claro y cotidiano con ayuda de inteligencia artificial.

## Estado del proyecto — Fase 2 completada ✅

## Funcionalidades implementadas

- **Autenticación** con Google OAuth via NextAuth v5
- **Dashboard** con cards de resumen, estudios recientes y alertas
- **Subida de estudios** (PDF/imagen) con extracción de texto (PDF nativo + OCR con Tesseract.js)
- **Análisis con IA** usando Google Gemini 2.5 Flash Lite — resumen, hallazgos, términos médicos, valores fuera de rango
- **Comparación entre estudios** — seleccioná 2+ estudios y compará cambios en tus resultados
- **Alertas inteligentes** — detección automática de cambios significativos entre estudios
- **Perfiles familiares** — múltiples perfiles para distintos miembros de la familia
- **Chat contextual** — conversación con la IA sobre tus estudios
- **Widget de feedback** — botón flotante para enviar ideas, bugs o sugerencias (se envía a federicobordon.dev@gmail.com vía SMTP)

## Tecnología

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend:** Next.js API Routes, Prisma 7 + PostgreSQL, NextAuth v5
- **IA:** Google Generative AI (`@google/generative-ai`)
- **OCR:** Tesseract.js (español)
- **Almacenamiento:** Vercel Blob (producción) / local `public/uploads/` (desarrollo)
- **Email:** Nodemailer + Gmail SMTP

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/            # Login, register
│   ├── (dashboard)/       # Dashboard, estudios, upload, compare, alerts, family, settings
│   └── api/               # API routes: auth, studies, analyze, compare, chat, alerts, feedback, profiles, register
├── components/
│   ├── layout/            # Sidebar, DashboardHeader, AuthGuard
│   └── ui/                # Card, Button, Badge, Toast, Skeleton, EmptyState
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client singleton
│   ├── geminiClient.ts    # Gemini API client
│   ├── geminiChat.ts      # Chat analysis
│   ├── geminiCompare.ts   # Study comparison
│   ├── geminiAlerts.ts    # Alert generation
│   ├── blob.ts            # Vercel Blob / local storage
│   ├── pdfExtractor.ts    # PDF text extraction
│   ├── ocrExtractor.ts    # OCR extraction
│   └── utils.ts           # FormatDate, hash, etc.
└── generated/
    └── prisma/            # Generated Prisma client (committed)
```

## Próximos pasos (Fase 3)

- Mejoras en la UI/UX
- Más tipos de análisis
- Exportación de resultados
- Notificaciones por email
- Mejoras en OCR

## Desarrollo local

```bash
npm install
npx prisma generate
# configurá .env.local con:
# DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, GEMINI_API_KEY
npm run dev
```

## Deploy

```bash
git push origin master
# Vercel hace deploy automático
# Configurar env vars en Vercel: DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID,
# AUTH_GOOGLE_SECRET, GEMINI_API_KEY, BLOB_READ_WRITE_TOKEN, NEXTAUTH_URL,
# SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
```
