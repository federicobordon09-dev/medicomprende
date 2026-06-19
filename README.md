# MediComprende

**Tu informe médico, en palabras que entendés.**

MediComprende es una aplicación web que traduce informes médicos complejos (PDFs e imágenes) a lenguaje claro y cotidiano usando inteligencia artificial. Pensada para personas sin formación médica que quieren entender sus análisis clínicos.

## Estado del proyecto — En producción (MVP funcional) 🚀

Próximo foco: mejorar la confiabilidad de `parameterExplanations` en la respuesta de Gemini, pulir edge cases de UI responsive, y agregar tests faltantes.

## Funcionalidades implementadas

- **Autenticación** con Google OAuth via NextAuth v5 + email/contraseña
- **Dashboard** con cards de resumen, estudios recientes y alertas inteligentes
- **Subida de estudios** (PDF o imagen PNG/JPG/WEBP hasta 15MB)
- **Análisis con IA** usando Google Gemini — resumen, hallazgos, términos médicos, valores fuera de rango (`outOfRangeValues`), explicación de parámetros (`parameterExplanations`), interpretación general, recomendaciones y preguntas sugeridas
- **Prompt adaptativo por tipo de informe** — laboratorio (tablas numéricas), imágenes (hallazgos descriptivos), epicrisis (resumen clínico), ECG (mediciones eléctricas)
- **Pipeline de análisis sin OCR**: Gemini procesa imágenes directamente; para PDFs extrae texto con pdf-parse (pdf.js) y lo envía como texto — no depende de Tesseract.js ni OCR server-side
- **Re-análisis**: botón "Analizar ahora" para estudios guardados sin análisis
- **Comparación entre estudios**: seleccioná 2+ estudios y compará cambios — con validación de compatibilidad (no permite mezclar tipos distintos como laboratorio con imágenes)
- **Alertas inteligentes**: detección automática de cambios significativos entre estudios, con generación por IA
- **Perfiles familiares**: múltiples perfiles para distintos miembros de la familia
- **Chat contextual**: conversación con la IA sobre tus estudios con datos en contexto
- **Widget de feedback**: botón flotante para enviar ideas, bugs o sugerencias via SMTP
- **Tono argentino (voseo)**: todo el análisis usa "vos", "tenés" y español rioplatense
- **Eliminación masiva**: botón "Eliminar todos los estudios" en Configuración con invalidación de caché
- **Optimizaciones de rendimiento**: `staleTime`/`gcTime` en React Query, `React.memo` en listas, `useCallback` en handlers, `cancelAnimationFrame` en animaciones

## Tecnología

- **Frontend:** Next.js 17 (App Router), React 19, Tailwind CSS v4, TypeScript
- **Backend:** Next.js API Routes (serverless en Vercel)
- **ORM:** Prisma 7 + PostgreSQL (Neon)
- **Base de datos:** PostgreSQL vía Neon (serverless)
- **IA:** Google Generative AI (`@google/generative-ai`) — modelo `gemini-2.5-flash-lite`
- **Estado del cliente:** TanStack Query v5 (React Query) con hooks tipados
- **Testing:** Vitest
- **Almacenamiento:** Vercel Blob (producción) / local `public/uploads/` (desarrollo)
- **Autenticación:** NextAuth v5 (Auth.js) con adaptador de Prisma
- **Email:** Nodemailer + Gmail SMTP para feedback y notificaciones
- **PDF:** pdf-parse v2 (Mozilla pdf.js) para extracción de texto de PDFs

## Pipeline de análisis

```
PDF/imagen subido → buffer → analyzeReport(buffer, mimeType)
  ├─ imagen (PNG/JPG/WEBP) → inlineData → Gemini
  └─ PDF → pdf-parse extrae texto → Gemini con texto
```

El prompt de Gemini se adapta según el tipo de informe:
- **Laboratorio**: extrae TODOS los parámetros con valores, rangos de referencia y estado (alto/bajo/normal). Genera `outOfRangeValues` + `parameterExplanations` 1:1.
- **Imagen**: findings detallados, medicalTerms. `outOfRangeValues` vacío.
- **ECG**: mediciones + hallazgos + términos.
- **Epicrisis**: resumen clínico + hallazgos clave + términos.

No se usa OCR server-side. PDFs escaneados (sin texto seleccionable) muestran error claro.

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/                  # Login, register
│   ├── (dashboard)/             # Dashboard, estudios, upload, compare, alerts, family, settings
│   │   ├── dashboard/upload/    # Subida con arrastrar y soltar
│   │   ├── dashboard/studies/   # Listado + detalle con botón "Analizar ahora"
│   │   ├── dashboard/compare/   # Comparación entre estudios
│   │   └── dashboard/settings/  # Configuración + eliminar todo
│   └── api/
│       ├── auth/                # NextAuth route handler
│       ├── studies/             # CRUD de estudios + upload + re-análisis
│       ├── analyze/             # Endpoint público legacy (con rate limit)
│       ├── compare/             # Comparación + validación de compatibilidad
│       ├── chat/                # Chat contextual con IA
│       ├── alerts/              # Alertas inteligentes + generación
│       ├── feedback/            # Widget de feedback por email
│       ├── profiles/            # CRUD de perfiles familiares
│       └── user/                # Cuenta y perfil de usuario
├── components/
│   ├── layout/                  # Sidebar, DashboardHeader, AuthGuard
│   └── ui/                      # Card, Button, Badge, Toast, Skeleton, EmptyState, ConfirmDialog
└── lib/
    ├── auth.ts                  # NextAuth configuration con Prisma adapter
    ├── prisma.ts                # Prisma client singleton
    ├── geminiClient.ts          # Gemini API — prompt adaptativo + Zod + sanitization + fallback
    ├── geminiChat.ts            # Chat contextual
    ├── geminiCompare.ts         # Comparación con normalize + sanitize + safeParse
    ├── geminiAlerts.ts          # Generación de alertas por IA
    ├── api-error.ts             # AppError class hierarchy (AuthError, NotFoundError, etc.)
    ├── api-response.ts          # requireAuth, apiSuccess, apiError helpers
    ├── api-hooks.ts             # TanStack Query hooks tipados (useStudies, useDeleteStudy, etc.)
    ├── query-provider.tsx       # React Query provider con staleTime default de 30s
    ├── logger.ts                # Structured logger wrapper
    ├── blob.ts                  # Vercel Blob / local storage
    ├── pdfExtractor.ts          # Extracción de texto (pdf2json + pdf-parse fallback)
    ├── ocrExtractor.ts          # OCR con Tesseract.js (solo local, no usado en Vercel)
    └── types.ts                 # Tipos compartidos (ReportResult, ComparisonResult, etc.)
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

### Tests

```bash
npx vitest run
```

## Deploy

```bash
git push origin master
# Vercel detecta el push y deploya automáticamente
```

El proyecto está deployado en Vercel (Pro plan) con base de datos Neon PostgreSQL.

## Límites conocidos

- **Gemini API Free Tier**: 20 requests/día. Si se excede, la app muestra "Límite diario alcanzado". Para producción con uso intensivo, upgradear a plan pago en Google Cloud.
- **`parameterExplanations`**: Gemini a veces devuelve el array vacío con mensaje "No hay parámetros adicionales para explicar" incluso cuando hay `outOfRangeValues`. Hay un fallback en código que lo genera automáticamente, pero el prompt sigue ajustándose para forzar la respuesta correcta desde la IA.
- **PDFs escaneados**: no tienen texto seleccionable → no se pueden analizar. No hay OCR server-side implementado.
- **SSL mode**: la DB usa `sslmode=verify-full` (requerido por Neon, configurar en Vercel env vars).
- **@napi-rs/canvas**: pdfjs-dist muestra warning en Vercel porque el canvas nativo no está disponible, pero text extraction funciona correctamente sin él.
