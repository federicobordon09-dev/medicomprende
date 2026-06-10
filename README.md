# MediComprende

**Tu informe médico, en palabras que entendés.**

MediComprende es una aplicación web que traduce informes médicos complejos a lenguaje claro y cotidiano. Subís tu PDF, la inteligencia artificial lo analiza, y recibís una explicación simple de cada hallazgo, término y resultado sin tecnicismos innecesarios.

## Cómo funciona

1. **Subí tu PDF** — Arrastrá o seleccioná tu informe de cualquier estudio (resonancia, tomografía, análisis de sangre, epicrisis, etc.).
2. **Analizamos con IA** — Gemini de Google procesa el texto y traduce cada hallazgo y término médico a palabras simples.
3. **Entendé todo** — Recibís un resumen claro, hallazgos explicados uno por uno, definiciones de términos médicos y una interpretación general sin alarmismo.

## Para quién es

- Pacientes que quieren entender sus estudios sin depender de un diccionario médico.
- Familiares que necesitan comprender informes de seres queridos.
- Cualquier persona que quiera tomar decisiones informadas sobre su salud.

## Características principales

- **Sin registro** — No pedimos datos personales, email ni tarjeta de crédito.
- **Confidencial** — Los informes se procesan en memoria y se descartan inmediatamente. No se almacenan.
- **Inmediato** — El análisis completo toma segundos.
- **Cálido y claro** — Las explicaciones usan español rioplatense con voseo, tono cercano y tranquilizador.
- **Disclaimers responsables** — La app aclara siempre que no reemplaza una consulta médica.

## Tecnología

- **Frontend:** Next.js 16 con Tailwind CSS v4 y TypeScript
- **Backend:** API Route de Next.js con extracción de texto PDF
- **IA:** Google Gemini (Gemini 2.5 Flash Lite) vía `@google/generative-ai`
- **Seguridad:** CSP estricto, rate limiting, validación de magic bytes, sanitización de errores
- **Deploy:** Listo para Vercel
