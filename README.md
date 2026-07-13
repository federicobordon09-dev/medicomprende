# 🫀 MediComprende

**Tu informe médico, en palabras que entendés.**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)
![Mercado Pago](https://img.shields.io/badge/Mercado_Pago-009EE3?style=for-the-badge&logo=mercadopago&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

> MediComprende traduce informes médicos complejos (PDFs) a lenguaje claro y cotidiano usando inteligencia artificial. Pensada para personas sin formación médica que quieren entender sus análisis clínicos.

---

## 📖 Sobre el proyecto

Plataforma web que elimina la barrera del vocabulario médico. Subís tu PDF (análisis de sangre, resonancia, tomografía, epicrisis, electrocardiograma) y la IA lo interpreta en lenguaje simple: qué significa cada valor, qué está fuera de rango, y qué preguntas llevarle a tu médico.

Diseñada con una estética **cálida y clara** — lejos del blanco quirúrgico y las interfaces frías. Voz cercana pero profesional, como un amigo que sabe de medicina y te explica con paciencia.

Modelo **freemium**: plan Gratuito con límites mensuales y plan **Pro ($3.000 ARS/mes)** con acceso ilimitado, exportación PDF y modelo de IA premium.

---

## ✨ Funcionalidades

### 🏠 Landing (`/`)
- **Hero** con upload directo y tagline
- **Cómo funciona** — paso a paso del servicio
- **Tipos de informes** — laboratorio, imágenes, epicrisis, ECG
- **Planes y precios** — cards comparativas
- **Testimonios** y **FAQ**

### 📊 Dashboard (`/dashboard`)
- **Cards de resumen** con contadores animados
- **Estudios recientes** con vista rápida
- **Alertas inteligentes** de cambios significativos

### 📄 Análisis de estudios (`/dashboard/subir`)
- Subida de PDF (texto seleccionable, hasta 15 MB)
- **Prompt adaptativo por tipo de informe**:
  - 🧪 **Laboratorio** — tablas numéricas con valores y rangos
  - 🖼️ **Imagen** — hallazgos descriptivos
  - 📋 **Epicrisis** — resumen clínico
  - ❤️ **ECG** — mediciones eléctricas
- Resumen, hallazgos, términos médicos, valores fuera de rango, recomendaciones y preguntas sugeridas
- **Tono argentino (voseo)** — "vos", "tenés", español rioplatense

### 🔍 Comparación (`/dashboard/comparar`)
- Seleccioná 2+ estudios del mismo tipo
- Comparación de cambios con validación de compatibilidad
- Detección de diferencias significativas generada por IA

### 🔔 Alertas inteligentes (`/dashboard/alertas`)
- Detección automática de cambios significativos entre estudios
- Alertas generadas por IA con análisis contextual

### 👨‍👩‍👧 Perfiles familiares (`/dashboard/familia`)
- Múltiples perfiles dentro de una misma cuenta
- 1 perfil en plan Gratuito, ilimitados en Pro

### 🤖 Chat con Doctor IA (`/dashboard/chatear`)
- Chat contextual con los estudios guardados
- Selector de estudios para elegir sobre qué hablar
- Preguntas sugeridas clickeables
- Animación de typing fluida
- Disclaimer médico siempre visible
- Exclusivo Pro

### ⚙️ Configuración (`/dashboard/configuracion`)
- Gestión de suscripción (upgrade, cancelación, uso del mes)
- Eliminación masiva de estudios
- Datos de cuenta

### 📤 Exportación PDF
- Análisis completo en PDF descargable
- Exclusivo Pro — generado con `pdf-lib`

### 🔐 Autenticación
- Google OAuth via NextAuth v5
- Páginas de login y registro con diseño premium

### 💳 Pagos (Mercado Pago)
- Checkout Pro integrado
- Webhooks IPN con actualización de suscripción
- Polling post-pago con banner de éxito

---

## 🛠 Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework con App Router |
| **TypeScript** | Tipado estricto |
| **React 19** | UI components |
| **Tailwind CSS v4** | Estilos utilitarios |
| **Prisma 7** | ORM con PostgreSQL (Neon) |
| **Google Gemini** | IA generativa (`gemini-2.5-flash-lite` / `gemini-2.5-flash`) |
| **Mercado Pago** | Checkout Pro + Webhooks |
| **NextAuth v5** | Autenticación Google OAuth |
| **TanStack Query v5** | Estado del cliente y caché |
| **pdf-parse** | Extracción de texto de PDFs |
| **pdf-lib** | Generación de PDFs |
| **Nodemailer** | Envío de emails (feedback) |
| **Vitest** | Tests unitarios |

---

## 📊 Modelo freemium

| Recurso | Gratuito | Pro ($3.000 ARS/mes) |
|---|---|---|
| Análisis por mes | 3 | Ilimitado |
| Comparaciones por mes | 2 | Ilimitado |
| Estudios guardados | 10 | Ilimitado |
| Chat con Doctor IA | ✘ | ✔️ |
| Exportación PDF | ✘ | ✔️ |
| Modelo IA | Flash-Lite | Flash |
| Perfiles familiares | 1 | Ilimitados |
| Alertas inteligentes | Básicas | Avanzadas |

---

## 🏗️ Pipeline de análisis

```
PDF subido → buffer → analyzeReport(buffer, mimeType)
  └─ PDF → pdf-parse extrae texto → Gemini con prompt adaptativo
       └─ Laboratorio → extrae parámetros, valores, rangos, estado
       └─ Imagen → hallazgos detallados + términos
       └─ ECG → mediciones + hallazgos + términos
       └─ Epicrisis → resumen clínico + hallazgos clave
```

No se usa OCR. PDFs escaneados (sin texto seleccionable) muestran error claro.

---

## 🗄️ Estructura del proyecto

```
src/
├── app/
│   ├── (marketing)/        # Landing, login, register, pricing, términos, privacidad
│   ├── (dashboard)/        # Dashboard, estudios, comparar, alertas, familia, chat
│   └── api/                # auth, payments, studies, compare, chat, alerts, profiles, feedback
├── components/
│   ├── layout/             # Sidebar, Navbar, AuthGuard, UpgradeBanner
│   ├── ui/                 # Card, Button, Badge, Skeleton, Toast, ConfirmDialog
│   ├── HeroLanding.tsx     # Hero con upload
│   ├── PricingCard.tsx     # Card de plan
│   └── ...
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client singleton
│   ├── geminiClient.ts     # Gemini — prompt adaptativo + selección de modelo
│   ├── mercadopago.ts      # MP API (createPreference, getPayment)
│   ├── subscription.ts     # Helpers: getUserPlan, canPerformAnalysis, FREE_LIMITS
│   ├── pdfExport.ts        # Generación de PDF con pdf-lib
│   ├── api-error.ts        # AppError class hierarchy
│   ├── api-hooks.ts        # TanStack Query hooks tipados
│   └── types.ts            # Tipos compartidos
└── data/
    └── contenido.ts        # Textos, FAQ con info de precios
```

---

## 🚀 Deploy

```bash
git push origin main
# Vercel detecta el push y deploya automáticamente
```

Deployado en **Vercel** (Hobby plan) con base de datos **Neon PostgreSQL**.

---

## 🏆 Créditos

- Proyecto independiente de portafolio
- IA: **Google Gemini**
- Pagos: **Mercado Pago**
- Deploy: **Vercel**

---

<p align="center">
  <i>Next.js 16 · TypeScript · React 19 · Tailwind CSS · Prisma · PostgreSQL · Gemini</i>
</p>
