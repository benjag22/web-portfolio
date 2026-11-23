import type { TechName } from "./techIcons";

export type StackGroup = {
    title: string;
    items: TechName[];
};

export const stackGroups: StackGroup[] = [
    {
        title: "Frontend",
        items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "HTML", "CSS"],
    },
    {
        title: "Backend",
        items: ["Java", "Spring Boot", "Python", "FastAPI", "NestJS", "Flask"],
    },
    {
        title: "Datos e infraestructura",
        items: ["MySQL", "PostgreSQL", "Redis", "Docker", "Nginx", "DigitalOcean"],
    },
    {
        title: "APIs y herramientas",
        items: ["REST", "OpenAPI", "WebSocket", "gRPC", "Express.js", "Git"],
    },
];
