# MediComprende

**Tu informe médico, en palabras que entendés.**

MediComprende es una aplicación web que traduce informes médicos complejos (PDFs e imágenes) a lenguaje claro y cotidiano usando inteligencia artificial. Pensada para personas sin formación médica que quieren entender sus análisis clínicos.

## Estado del proyecto — En producción (MVP funcional) 🚀

## Funcionalidades implementadas

- **Autenticación** con Google OAuth via NextAuth v5 + email/contraseña
- **Dashboard** con cards de resumen, estudios recientes y alertas inteligentes
- **Subida de estudios** (PDF o imagen PNG/JPG) con análisis automático
- **Análisis con IA** usando Google Gemini — resumen, hallazgos, términos médicos, valores fuera de rango, explicación de parámetros, interpretación general, recomendaciones y preguntas sugeridas
- **Pipeline de análisis sin OCR**: Gemini procesa imágenes directamente; para PDFs extrae texto con pdf-parse (pdf.js) y lo envía como texto — no depende de Tesseract.js ni OCR server-side
- **Re-análisis**: botón "Analizar ahora" para estudios guardados sin análisis
- **Comparación entre estudios**: seleccioná 2+ estudios y compará cambios en tus resultados a lo largo del tiempo
- **Alertas inteligentes**: detección automática de cambios significativos entre estudios, con generación por IA
- **Perfiles familiares**: múltiples perfiles para distintos miembros de la familia (ej: hijes, adultos mayores)
- **Chat contextual**: conversación con la IA sobre tus estudios con datos en contexto
- **Widget de feedback**: botón flotante para enviar ideas, bugs o sugerencias a federicobordon.dev@gmail.com via SMTP
- **Tono argentino (voseo)**: todo el análisis usa "vos", "tenés" y español rioplatense

## Tecnología

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript
- **Backend:** Next.js API Routes (serverless en Vercel)
- **ORM:** Prisma 7 + PostgreSQL (Neon)
- **Base de datos:** PostgreSQL vía Neon (serverless)
- **IA:** Google Generative AI (`@google/generative-ai`) — modelo `gemini-2.5-flash-lite`
- **Almacenamiento:** Vercel Blob (producción) / local `public/uploads/` (desarrollo)
- **Autenticación:** NextAuth v5 (Auth.js) con adaptador de Prisma
- **Email:** Nodemailer + Gmail SMTP para feedback y notificaciones
- **PDF:** pdf-parse v2 (Mozilla pdf.js) para extracción de texto de PDFs

## Pipeline de análisis

```
PDF subido → buffer → analyzeReport(buffer, mimeType)
  ├─ inlineData → Gemini (funciona para imágenes JPG/PNG)
  └─ fallback → pdf-parse extrae texto → Gemini con texto
                (funciona para PDFs con texto seleccionable)
```

No se usa OCR server-side. Las imágenes se mandan directo a Gemini via inlineData. Los PDFs con texto seleccionable se extraen con pdf-parse. PDFs escaneados (sin texto seleccionable) muestran error claro.

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/                  # Login, register
│   ├── (dashboard)/             # Dashboard, estudios, upload, compare, alerts, family, settings
│   │   ├── dashboard/upload/    # Subida de PDF/imagen con arrastrar y soltar
│   │   ├── dashboard/studies/   # Listado + detalle con botón "Analizar ahora"
│   │   └── dashboard/compare/   # Comparación visual entre estudios
│   └── api/
│       ├── auth/                # NextAuth route handler
│       ├── studies/             # CRUD de estudios + upload + re-análisis
│       ├── analyze/             # Endpoint público legacy (con rate limit)
│       ├── compare/             # Comparación de estudios
│       ├── chat/                # Chat contextual con IA
│       ├── alerts/              # Alertas inteligentes + generación
│       ├── feedback/            # Widget de feedback por email
│       ├── profiles/            # CRUD de perfiles familiares
│       └── user/                # Cuenta y perfil de usuario
├── components/
│   ├── layout/                  # Sidebar, DashboardHeader, AuthGuard
│   └── ui/                      # Card, Button, Badge, Toast, Skeleton, EmptyState
└── lib/
    ├── auth.ts                  # NextAuth configuration con Prisma adapter
    ├── prisma.ts                # Prisma client singleton
    ├── geminiClient.ts          # Gemini API client (V2 con análisis estructurado)
    ├── geminiChat.ts            # Chat contextual
    ├── geminiCompare.ts         # Comparación entre estudios
    ├── geminiAlerts.ts          # Generación de alertas por IA
    ├── blob.ts                  # Vercel Blov / local storage
    ├── pdfExtractor.ts          # Extracción de texto (pdf2json + pdf-parse fallback)
    ├── ocrExtractor.ts          # OCR con Tesseract.js (solo local, no usado en Vercel)
    └── types.ts                 # Tipos compartidos (ReportResult, etc.)
```

## Variables de entorno

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/medicomprende?sslmode=verify-full

# NextAuth
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
NEXTAUTH_URL=https://medicomprende.vercel.app

# Gemini AI
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite

# Vercel Blob
BLOB_READ_WRITE_TOKEN=...

# SMTP (feedback widget)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

## Desarrollo local

```bash
npm install
npx prisma generate
# configurá .env.local con las variables de entorno
npm run dev
```

## Deploy

```bash
git push origin master
# Vercel detecta el push y deploya automáticamente
```

El proyecto está deployado en Vercel (Pro plan) con base de datos Neon PostgreSQL.

## Límites conocidos

- **Gemini API Free Tier**: 20 requests/día. Si se excede, la app muestra "Límite diario alcanzado". Para producción con uso intensivo, upgradear a plan pago en Google Cloud.
- **PDFs escaneados**: no tienen texto seleccionable → no se pueden analizar. No hay OCR server-side implementado.
- **SSL mode**: la DB usa `sslmode=verify-full` (requerido por Neon, configurar en Vercel env vars).
- **@napi-rs/canvas**: pdfjs-dist muestra warning en Vercel porque el canvas nativo no está disponible, pero text extraction funciona correctamente sin él.
