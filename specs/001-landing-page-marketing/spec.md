# Feature Specification: Landing Page Marketing

**Feature Branch**: `001-landing-page-marketing`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Crear landing page pública en / para MediComprende"

## User Scenarios & Testing

### User Story 1 - Landing completa y navegable (Priority: P1)

Como visitante que llega a medicomprende.vercel.app, quiero ver una landing page que me explique el producto, cómo funciona, qué informes soporta, testimonios reales, los planes disponibles y preguntas frecuentes, para decidir si registrarme.

**Why this priority**: Sin landing page, el usuario cae directo al login sin entender el valor del producto. Esto impacta conversión directamente.

**Independent Test**: Se puede probar navegando a `/` y verificando que todas las secciones se renderizan sin necesidad de autenticación.

**Acceptance Scenarios**:
1. **Given** que entro a la raíz `/`, **When** la página carga, **Then** veo el Hero con título, badge "Sin registro • Sin costo" y CTA "Crear cuenta gratis"
2. **Given** que estoy en la landing, **When** hago scroll, **Then** veo en orden: Hero → Cómo funciona → Tipos de informes → Testimonios → Planes → FAQ → Footer
3. **Given** que hago clic en "Crear cuenta gratis" en el Hero, **Then** navego a `/register`
4. **Given** que hago clic en "Iniciar sesión" en la Navbar, **Then** navego a `/login`
5. **Given** que estoy en la landing, **When** toco "Ver planes" en la sección Planes, **Then** navego a `/pricing`

---

### User Story 2 - Navegación interna por secciones (Priority: P2)

Como visitante, quiero poder navegar entre las secciones de la landing desde la Navbar, para encontrar rápido lo que me interesa.

**Why this priority**: Mejora la experiencia de usuario y aumenta retención en la página.

**Independent Test**: Click en cada link de la Navbar y verificar scroll suave a la sección correspondiente.

**Acceptance Scenarios**:
1. **Given** la Navbar en la landing, **When** hago clic en "Cómo funciona", **Then** hago scroll suave a `#como-funciona`
2. **Given** la Navbar en la landing, **When** hago clic en "Planes", **Then** hago scroll suave a `#planes`
3. **Given** la Navbar en la landing, **When** hago clic en "FAQ", **Then** hago scroll suave a `#faq`

---

### User Story 3 - Hero con upload preview (Priority: P3)

Como visitante, quiero ver desde el Hero un preview de cómo funciona la subida de PDF, para entender el flujo sin tener que registrarme.

**Why this priority**: No crítico, pero reduce fricción. El usuario ve el upload zone y entiende el mecanismo antes de registrarse.

**Independent Test**: Verificar que el Hero muestra un área de upload visual (no funcional sin login).

**Acceptance Scenarios**:
1. **Given** la landing, **When** veo el Hero, **Then** hay un área de upload visual con icono de PDF y texto "Elegí tu PDF o arrastralo acá"

### Edge Cases

- ¿Qué pasa cuando el usuario ya está logueado y visita `/`? Debería redirigir a `/dashboard`
- ¿Qué pasa en mobile? Todas las secciones deben ser responsivas y mantener legibilidad

## Requirements

### Functional Requirements

- **FR-001**: La landing debe servirse en `/` sin redirect cuando el usuario no está autenticado
- **FR-002**: El root layout (`src/app/page.tsx`) debe renderizar la landing en vez de redirigir a `/login`
- **FR-003**: La landing debe contener Hero + Cómo funciona + Tipos de informes + Testimonios + Planes + FAQ + Footer
- **FR-004**: La Navbar debe mostrar links de navegación interna en la landing (Cómo funciona, Planes, FAQ)
- **FR-005**: Los CTA deben apuntar a rutas válidas (`/register`, `/login`, `/pricing`)
- **FR-006**: La landing debe ser completamente pública (sin sesión requerida)
- **FR-007**: Usuario autenticado en `/` debe redirigir a `/dashboard`
- **FR-008**: Cada sección debe tener un `id` para scroll suave y tracking

### Key Entities

- **PageSection**: Hero, ComoFunciona, TiposInformes, Testimonios, PlanesPreview, FAQ, Footer
- **ContentData**: Textos, testimonios, planes desde `src/data/contenido.ts`

## Success Criteria

### Measurable Outcomes

- **SC-001**: La landing carga en menos de 3 segundos en conexión 4G
- **SC-002**: 100% de las secciones son visibles sin autenticación
- **SC-003**: Los links de navegación hacen scroll suave a la sección correcta
- **SC-004**: No hay errores de consola ni warnings en Lighthouse

## Assumptions

- El layout de marketing (`(marketing)/layout.tsx`) con Navbar + Footer se reutiliza
- Los componentes existentes (`ComoFunciona`, `TiposInformes`, `Preguntas`, `HeroUpload`) se reutilizan con mínimos cambios
- La data de contenido vive en `src/data/contenido.ts` y se extiende para testimonios y planes
