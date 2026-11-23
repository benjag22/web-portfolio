import type { TechName } from "./techIcons";

export type Project = {
    id: string;
    name: string;
    title: string;
    organization: string;
    role: string;
    period: string;
    status: string;
    url?: string;
    repoUrl?: string;
    image?: string;
    summary: string;
    highlights: string[];
    stack: TechName[];
    weight: number;
};

export const projects: Project[] = [
    {
        id: "capchical",
        name: "CapChiCAL",
        title: "Base de datos de composición de alimentos",
        organization: "Capítulo Chileno de Composición de Alimentos (CapChiCAL), ONG nacional",
        role: "Desarrollador Full Stack",
        period: "Sep 2024 – presente",
        status: "En producción",
        url: "https://db.capchical.com",
        image: "/projects/capchical.jpg",
        summary:
            "Sistema público, de alcance nacional, para consultar la composición de los alimentos, " +
            "con un panel para que los administradores gestionen el catálogo.",
        highlights: [
            "Diseñé parte del modelo de datos en MySQL 8 a partir de la planilla Excel que usaba la organización.",
            "Colaboré en la API REST (NestJS / Express.js), con Nginx para la gestión de imágenes.",
            "Diseñé e implementé la aplicación web: búsqueda pública y panel con inicio de sesión para el CRUD del catálogo.",
            "Migré el frontend de React a Next.js 16 y los estilos de React Bootstrap a Tailwind CSS v4.",
            "Lleva más de un año en producción; hoy hago su mantenimiento remunerado y migro el modelo de datos a un nuevo formato.",
        ],
        stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "NestJS", "MySQL", "Nginx"],
        weight: 1.2,
    },
    {
        id: "compass",
        name: "COMPASS",
        title: "Juego de rol para analizar capacidades de gestión",
        organization: "Universidad de Concepción",
        role: "Desarrollador Full Stack, rediseño de arquitectura",
        period: "2026 – presente",
        status: "En desarrollo",
        url: "https://compass.giia.udec.cl",
        image: "/projects/compass.jpg",
        summary:
            "Rediseño de un juego de rol que usan investigadores para analizar capacidades de gestión " +
            "a partir de las acciones de los participantes.",
        highlights: [
            "Diagnostiqué el prototipo, hecho íntegramente con IA generativa: código duplicado, alto acoplamiento y baja trazabilidad.",
            "Diseñé una arquitectura modular y un nuevo modelo de datos para habilitar la configuración de escenarios y el análisis de telemetría.",
            "Implemento el backend en FastAPI, el frontend en Next.js y Nginx para imágenes y texturas, con migración incremental (Strangler Fig).",
        ],
        stack: ["FastAPI", "Python", "Next.js", "TypeScript", "Nginx"],
        weight: 1.1,
    },
    {
        id: "taller-usm",
        name: "Taller USM",
        title: "Registro de vehículos para un taller mecánico",
        organization: "Ingeniería Mecánica, Universidad Técnica Federico Santa María",
        role: "Desarrollador Full Stack",
        period: "2025",
        status: "Desplegado",
        url: "https://mechanical-workshop.benjag.dev",
        summary:
            "Sistema que centraliza y estandariza el registro de ingreso, permanencia y salida de vehículos, " +
            "con roles de mecánico practicante, revisor y administrador.",
        image: "/projects/taller-usm.jpg",
        highlights: [
            "Diseñé la base de datos en MySQL e implementé los principales endpoints de la API REST en Spring Boot.",
            "Desarrollé la aplicación web completa en Next.js.",
            "Configuré Nginx para guardar las imágenes de cada vehículo por registro y desplegué todo en DigitalOcean.",
        ],
        stack: ["Spring Boot", "Java", "Next.js", "MySQL", "Nginx", "DigitalOcean"],
        weight: 1,
    },
    {
        id: "pocopi",
        name: "PoCoPI",
        title: "Plataforma de tests psicológicos para investigación",
        organization: "Proof of Concept of Psycho-Informatics, Universidad de Concepción",
        role: "Desarrollador Full Stack",
        period: "2025",
        status: "En uso en investigación",
        url: "https://pocopi.giia.udec.cl",
        summary:
            "Plataforma web de tests psicológicos (equipo de 3 personas) que pasó de un único test de " +
            "Matrices de Raven a un sistema que admite cualquier tipo de formulario.",
        image: "/projects/pocopi.jpg",
        highlights: [
            "Implementé la nueva API REST en Spring Boot e integré su contrato OpenAPI en el frontend web.",
            "Desarrollé el panel de configuración de formularios y la gestión de cuentas por tipo de usuario.",
            "Se usa en estudios de investigación de la Universidad de Concepción.",
        ],
        stack: ["Spring Boot", "Java", "OpenAPI", "REST"],
        weight: 0.95,
    },
];
