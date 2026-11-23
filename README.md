# web-portfolio

Portafolio de Benjamín González, desarrollador full stack.
React 19 + TypeScript + Vite + Tailwind CSS v4, con una sección de proyectos hecha de burbujas con física.

## Scripts

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # tsc + build de producción en dist/
npm run preview   # sirve dist/
npm run lint
```

## Estructura

```
src/
  data/
    projects.ts        # proyectos del CV (edita aquí)
    stack.ts           # grupos de la sección Tecnologías
    techIcons.ts       # nombre de tecnología → ícono + color
  components/
    NavBar.tsx         # sección activa + menú móvil
    SectionTitle.tsx   # título "< Sección />"
    StackCard.tsx
    ProfilePhoto.tsx
    projects/
      ProjectBubbles.tsx         # escena con d3-force (burbujas, satélites, arrastre)
      ProjectBubbles.module.css  # vidrio iridiscente, animaciones
      ProjectPreview.tsx         # diálogo que se abre desde la burbuja
      ProjectVisual.tsx          # ventana de navegador con captura o vista generada
      BubbleField.tsx            # micro-burbujas en canvas
  hooks/
    useActiveSection.ts
    usePrefersReducedMotion.ts
  sections/
    AboutSection.tsx  TechSections.tsx  WorkSection.tsx  ContactSection.tsx
  metadata.ts          # textos de "Sobre mí", enlaces, foto y CV
```

## Archivos que faltan agregar

| Archivo | Para qué |
| --- | --- |
| `public/profile.jpg` | Foto de perfil (cuadrada, mínimo 640×640). Mientras no exista se muestran las iniciales. |
| `public/cv-benjamin-gonzalez.pdf` | CV exportado desde Canva. Lo usan el ícono de CV y el botón de Contacto. |
| `public/projects/<id>.webp` | Capturas opcionales de cada proyecto (16:10). Luego agrega `image: "/projects/<id>.webp"` en `src/data/projects.ts`. Sin captura se dibuja una vista generada con el stack. |

## Cómo funciona la sección de proyectos

- **d3-force** (solo ese módulo, no todo d3) calcula la física: colisiones, cada proyecto vuelve a su zona,
  las tecnologías orbitan su proyecto, el cursor deja una estela y las burbujas se pueden arrastrar y lanzar.
  React dibuja los nodos una vez; las posiciones se escriben directo en el DOM en cada cuadro, sin re-render.
- **Motion** (`motion/react`) anima la vista previa: un `clip-path: circle()` que crece desde la burbuja tocada,
  el cambio entre proyectos (círculo que nace desde la burbuja del navegador inferior) y el indicador de la navbar.
- La simulación se pausa fuera de pantalla y con la vista previa abierta.
- Con `prefers-reduced-motion` las burbujas quedan quietas y las transiciones se reducen a fundidos.
- Teclado: Tab recorre las burbujas, Enter abre, ← → cambian de proyecto, Esc cierra y devuelve el foco.
