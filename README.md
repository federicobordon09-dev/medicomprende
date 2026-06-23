# MediComprende

**Tu informe médico, en palabras que entendés.**

MediComprende es una aplicación web que traduce informes médicos complejos (PDFs) a lenguaje claro y cotidiano usando inteligencia artificial. Pensada para personas sin formación médica que quieren entender sus análisis clínicos.

Cuenta con un modelo **freemium**: plan Gratuito con límites mensuales y plan **Pro ($3.000 ARS/mes)** con acceso ilimitado, exportación PDF y modelo de IA premium.

## Estado del proyecto — En producción 🚀

### ✅ Implementado

- **Autenticación** con Google OAuth via NextAuth v5
- **Dashboard** con cards de resumen, estudios recientes y alertas inteligentes
- **Subida de estudios** (PDF con texto seleccionable, hasta 10 MB)
- **Análisis con IA** usando Google Gemini — resumen, hallazgos, términos médicos, valores fuera de rango, interpretación general, recomendaciones y preguntas sugeridas
- **Prompt adaptativo por tipo de informe** — laboratorio (tablas numéricas), imágenes (hallazgos descriptivos), epicrisis (resumen clínico), ECG (mediciones eléctricas)
- **Comparación entre estudios** — seleccioná 2+ estudios y compará cambios con validación de compatibilidad
- **Alertas inteligentes** — detección automática de cambios significativos entre estudios con generación por IA
- **Perfiles familiares** — múltiples perfiles para distintos miembros de la familia
- **Chat contextual** — conversación con la IA sobre tus estudios con datos en contexto
- **Widget de feedback** — botón flotante para enviar ideas, bugs o sugerencias
- **Tono argentino (voseo)** — todo el análisis usa "vos", "tenés" y español rioplatense
- **Pagos con Mercado Pago (Checkout Pro)** — preferencias de pago, webhooks IPN, upsert de suscripciones en DB
- **Modelo freemium** — plan Gratuito (2 análisis/mes, 1 comparación/mes, 5 estudios guardados) vs Pro ($3.000 ARS/mes, ilimitado)
- **Exportación de análisis en PDF** — gated detrás del plan Pro, generado con PDFKit
- **Modelo de IA por plan** — `gemini-2.5-flash-lite` (Gratuito) / `gemini-2.5-flash` (Pro)
- **Página de precios** (`/pricing`) con cards comparativas
- **Badge de plan** en la Sidebar (PRO / GRATIS)
- **Banner de upgrade** cuando el usuario está cerca del límite gratuito
- **Gestión de suscripción** en Configuración — upgrade, cancelación, ver uso del mes
- **Webhook de Mercado Pago** — actualiza estado de suscripción al recibir `payment.approved`
- **Fallback de búsqueda de usuario en webhook** — por `external_reference`, `preference_id` y `mpSubscriptionId`
- **Eliminación masiva** — botón "Eliminar todos los estudios" en Configuración
- **Optimizaciones de rendimiento** — React Query con `staleTime`/`gcTime`, `React.memo`, `useCallback`

### 📋 Pendientes / Próximas tareas

1. **Fix redirect post-pago** — Al volver de Mercado Pago, el usuario se redirige a una URL de preview de Vercel en vez de al dominio de producción, perdiendo la sesión. Ya se seteó `NEXT_PUBLIC_SITE_URL` en Vercel; falta que el usuario haga un nuevo pago para que tome la URL correcta. También agregar banner de éxito al detectar `?payment=success` y polling de suscripción hasta que se active.

2. **Chat contextual con IA — mejorar** — El chat ya existe pero hay que pulirlo: mejor UI, historial de mensajes persistente, límite de mensajes en plan gratuito.

3. **Exportación PDF — formato imprimible** — Mejorar el PDF actual: agregar número de página, header/footer con logo, mejor tipografía y espaciado, disclaimer más visible para que sea apto para impresión.

4. **Onboarding de nuevo usuario** — Tutorial interactivo al primer ingreso.

5. **Modo oscuro** — Toggle de tema claro/oscuro.

6. **Tests** — Agregar tests unitarios e integración para flujo de pagos, webhooks y límites de uso.

7. **Manejo de Gemini API Free Tier** — La cuenta gratuita de Gemini tiene límite de 20 requests/día. Mejorar el manejo de errores cuando se excede el límite.

## Tecnología

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript
- **Backend:** Next.js API Routes (serverless en Vercel)
- **ORM:** Prisma 7 + PostgreSQL (Neon)
- **Base de datos:** PostgreSQL vía Neon (serverless)
- **IA:** Google Generative AI (`@google/generative-ai`) — `gemini-2.5-flash-lite` / `gemini-2.5-flash`
- **Pagos:** Mercado Pago Checkout Pro (vía REST API con `fetch`)
- **Estado del cliente:** TanStack Query v5 (React Query)
- **PDF (lectura):** pdf-parse v2 (Mozilla pdf.js)
- **PDF (generación):** PDFKit
- **Autenticación:** NextAuth v5 (Auth.js) con Prisma adapter
- **Email:** Nodemailer + Gmail SMTP
- **Almacenamiento:** `public/uploads/` (local)

## Pipeline de análisis

```
PDF subido → buffer → analyzeReport(buffer, mimeType)
  └─ PDF → pdf-parse extrae texto → Gemini con texto
```

El prompt de Gemini se adapta según el tipo de informe:
- **Laboratorio**: extrae TODOS los parámetros con valores, rangos de referencia y estado (alto/bajo/normal).
- **Imagen**: findings detallados, medicalTerms.
- **ECG**: mediciones + hallazgos + términos.
- **Epicrisis**: resumen clínico + hallazgos clave + términos.

No se usa OCR. PDFs escaneados (sin texto seleccionable) muestran error claro.

## Flujo de pagos

1. El usuario hace clic en "Actualizar a Pro" → `POST /api/payments/create`
2. Se crea una preferencia en Mercado Pago con `external_reference = userId`
3. Se guarda la suscripción con estado `pending` y `mpPreferenceId`
4. El usuario es redirigido a MP Checkout para pagar
5. MP envía webhook a `/api/payments/webhook` con el `payment.id`
6. El webhook busca el `userId` via `external_reference` (fallback por `preference_id` o `mpSubscriptionId`)
7. Se actualiza la suscripción a `active` con fecha de vencimiento a 30 días
8. Al volver a `/dashboard/settings?payment=success`, el plan ya aparece como Pro

## Estructura del proyecto

```
src/
├── app/
│   ├── (marketing)/          # Login, register, pricing
│   ├── (dashboard)/          # Dashboard, estudios, upload, compare, alerts, family, settings
│   └── api/
│       ├── auth/             # NextAuth route handler
│       ├── payments/         # create (preferencia), webhook (IPN)
│       ├── user/             # subscription (GET/PATCH), account
│       ├── studies/          # CRUD + upload + re-análisis + export PDF
│       ├── analyze/          # Endpoint público legacy
│       ├── compare/          # Comparación + validación
│       ├── chat/             # Chat contextual con IA
│       ├── alerts/           # Alertas inteligentes
│       ├── feedback/         # Widget de feedback
│       └── profiles/         # CRUD de perfiles familiares
├── components/
│   ├── layout/               # Sidebar, Navbar, AuthGuard, UpgradeBanner
│   ├── ui/                   # Card, Button, Badge, Skeleton, ConfirmDialog
│   ├── PricingCard.tsx       # Card de plan para /pricing
│   └── ...
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma client singleton
│   ├── geminiClient.ts       # Gemini API — prompt adaptativo + selección de modelo por plan
│   ├── mercadopago.ts        # Cliente MP API (createPreference, getPayment)
│   ├── subscription.ts       # Helpers: getUserPlan, canPerformAnalysis, FREE_LIMITS
│   ├── pdfExport.ts          # Generación de PDF con PDFKit
│   ├── api-error.ts          # AppError class hierarchy
│   ├── api-response.ts       # requireAuth, apiSuccess, apiError helpers
│   ├── api-hooks.ts          # TanStack Query hooks tipados
│   └── types.ts              # Tipos compartidos
└── data/
    └── contenido.ts          # Textos, FAQ con info de precios
```

## Modelo de datos (Prisma)

- **User** — cuenta de usuario con datos de perfil
- **Subscription** — suscripción activa/pending/expired con `mpPreferenceId`, `mpSubscriptionId`, fechas de período
- **UsageLimit** — contadores mensuales de análisis y comparaciones por usuario
- **Account / Session** — tablas de NextAuth
- **Study, Analysis, Profile, Alert, Feedback** — resto del dominio

## Variables de entorno

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/medicomprende?sslmode=verify-full

# NextAuth
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Gemini AI
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=...
NEXT_PUBLIC_PRO_PLAN_PRICE=3000

# URL del sitio (importante para webhooks de MP)
NEXT_PUBLIC_SITE_URL=https://medicomprende.vercel.app

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
# IMPORTANTE: prisma migrate deploy no corre en local si la DB ya tiene tablas; aplicá migraciones manualmente si es necesario
npm run dev
```

## Deploy

```bash
git push origin master
# Vercel detecta el push y deploya automáticamente
```

El proyecto está deployado en Vercel (Hobby plan) con base de datos Neon PostgreSQL.

## Límites del plan gratuito

| Recurso               | Gratuito      | Pro           |
|-----------------------|---------------|---------------|
| Análisis por mes      | 3             | Ilimitado     |
| Comparaciones por mes | 2             | Ilimitado     |
| Estudios guardados    | 10            | Ilimitado     |
| Chat con IA           | Limitado      | Ilimitado     |
| Exportación PDF       | ✘             | ✔️            |
| Modelo IA             | Flash-Lite    | Flash         |
| Perfiles familiares   | 1 perfil      | Ilimitados    |
| Alertas inteligentes  | Básicas       | Avanzadas     |
