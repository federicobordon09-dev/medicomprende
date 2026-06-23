---

description: "Tasks for landing page marketing feature"
---

# Tasks: Landing Page Marketing

**Input**: Design documents from `specs/001-landing-page-marketing/`

**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Agregar data de testimonios y planes a `src/data/contenido.ts`
- [ ] T002 [P] Modificar Navbar para mostrar links de navegación en landing en `src/components/Navbar.tsx`

---

## Phase 2: Core Components (User Story 1 - P1) 🎯 MVP

**Goal**: Landing page completa con todas las secciones funcionando

- [ ] T003 [P] [US1] Crear componente Testimonios en `src/components/Testimonios.tsx` con cards de testimonio y estrellas
- [ ] T004 [P] [US1] Crear componente PlanesPreview en `src/components/PlanesPreview.tsx` con cards comparativas Gratis vs Pro
- [ ] T005 [US1] Crear HeroLanding en `src/components/HeroLanding.tsx` para la landing (sin upload funcional, con CTA a register)
- [ ] T006 [US1] Escribir landing page en `src/app/page.tsx` importando todas las secciones
- [ ] T007 [US1] Verificar que todas las secciones tienen IDs para scroll (hero solo visual, como-funciona, tipos-informes, planes, faq)

---

## Phase 3: Polish & Cross-Cutting

- [ ] T008 Verificar responsive mobile: todas las secciones se ven bien en viewports <768px
- [ ] T009 Verificar que el build no tiene errores con `npm run build`

## Dependencies & Execution Order

- **Setup (Phase 1)**: T001 y T002 pueden correr en paralelo
- **Core (Phase 2)**: T003, T004, T005 pueden correr en paralelo. T006 depende de T003-T005. T007 depende de T006
- **Polish (Phase 3)**: Depende de todas las anteriores
