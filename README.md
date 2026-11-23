# web-portfolio

Portafolio de Benjamín González, desarrollador full stack.
Next.js 16 (Pages Router) + React 19 + TypeScript + Tailwind CSS v4, con una sección de proyectos hecha de burbujas con física.

## Scripts

```bash
npm install
npm run dev          # desarrollo en http://localhost:3000
npm run build        # genera el sitio estático en out/
npm run start        # sirve out/ en http://localhost:3000
npm run lint
npm run screenshots  # captura cada proyecto en public/projects/<id>.jpg
```

## Estructura

```
src/
  pages/
    _app.tsx           # estilos globales y fuente Roboto Condensed (next/font)
    _document.tsx      # <html lang="es">, favicon
    index.tsx          # página principal y metadatos (<Head>)
  data/
    projects.ts        # proyectos del CV
    stack.ts           # grupos de la sección Tecnologías
    techIcons.ts       # nombre de tecnología → ícono + color
  components/
    NavBar.tsx  SectionTitle.tsx  StackCard.tsx  ProfilePhoto.tsx
    projects/
      ProjectBubbles.tsx  ProjectBubbles.module.css
      ProjectPreview.tsx  ProjectVisual.tsx  BubbleField.tsx
  hooks/
    useActiveSection.ts  usePrefersReducedMotion.ts
  sections/
    AboutSection.tsx  TechSections.tsx  WorkSection.tsx  ContactSection.tsx
  styles/
    globals.css
  metadata.ts          # textos de "Sobre mí", enlaces, foto y CV
public/
  CV.pdf  favicon.svg  projects/*.jpg
scripts/
  screenshots.mjs
```

Los imports usan el alias `@/` → `src/`.

## Sitio estático

`next.config.ts` usa `output: "export"`, así que `npm run build` deja el sitio completo en `out/` (HTML, JS, CSS, fuentes e imágenes). Esa carpeta se sube tal cual a cualquier servidor de archivos estáticos (Nginx, GitHub Pages, Netlify, etc.). Las imágenes no se optimizan en el build (`images.unoptimized`), porque un sitio estático no tiene servidor que las procese.

## Archivos que faltan agregar

| Archivo | Para qué |
| --- | --- |
| `public/profile.jpg` | Foto de perfil (cuadrada, mínimo 640×640). Mientras no exista se muestran las iniciales. |

## Variables de entorno

Copia `.env.example` a `.env.local`. `NEXT_PUBLIC_URL` se usa para la etiqueta `og:url`.
