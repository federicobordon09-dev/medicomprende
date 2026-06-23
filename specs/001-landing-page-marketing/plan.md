# Implementation Plan: Landing Page Marketing

**Branch**: `001-landing-page-marketing` | **Date**: 2026-06-23 | **Spec**: `specs/001-landing-page-marketing/spec.md`

## Summary

Crear landing page pública en `/` para MediComprende que muestre el producto, cómo funciona, tipos de informes, testimonios, planes y FAQ. La landing debe funcionar sin autenticación y usar componentes existentes.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.2.7

**Primary Dependencies**: Tailwind CSS v4, Framer Motion, AOS (animate on scroll)

**Storage**: N/A (landing page estática, sin DB)

**Testing**: Vitest (si se agregan tests)

**Target Platform**: Web (responsive mobile-first)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: Lighthouse score >90, carga <3s en 4G

**Constraints**: Sin sesión requerida, responsive, WCAG AA

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution violations. Proyecto existente, cambios puramente frontend.

## Project Structure

### Documentation (this feature)

```text
specs/001-landing-page-marketing/
├── spec.md              # Feature specification
├── plan.md              # This file
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                    # MODIFICAR: landing page
│   └── (marketing)/layout.tsx      # YA EXISTE: Navbar + Footer wrapper
├── components/
│   ├── Navbar.tsx                  # MODIFICAR: agregar links landing
│   ├── HeroUpload.tsx              # REUTILIZAR en sección Hero
│   ├── ComoFunciona.tsx            # REUTILIZAR (id="como-funciona")
│   ├── TiposInformes.tsx           # REUTILIZAR
│   ├── Testimonios.tsx             # CREAR nuevo componente
│   ├── PlanesPreview.tsx           # CREAR nuevo componente
│   ├── Preguntas.tsx               # REUTILIZAR (id="faq")
│   └── Footer.tsx                  # YA EXISTE
└── data/
    └── contenido.ts               # MODIFICAR: agregar testimonios, planes
```

## Complexity Tracking

No violations. Proyecto simple, componentes existentes reutilizados.

## Phases

### Phase 0: Research
No se necesita research adicional. Stack conocido, componentes existentes.

### Phase 1: Design
- Estructura de la landing: Hero → Cómo funciona → Tipos de informes → Testimonios → Planes → FAQ → Footer
- Navbar con navegación interna visible solo en landing
- Reutilizar paleta de colores existente (sk-*, azul-*, cta-*, coral-*, mint-*)
- Animaciones con AOS (ya presente en login page)

### Phase 2: Tasks
Ver `tasks.md`
