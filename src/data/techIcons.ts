import type { IconType } from "react-icons";
import {
    SiTypescript,
    SiJavascript,
    SiPython,
    SiNextdotjs,
    SiReact,
    SiTailwindcss,
    SiHtml5,
    SiCss3,
    SiSpringboot,
    SiFastapi,
    SiFlask,
    SiNestjs,
    SiExpress,
    SiMysql,
    SiPostgresql,
    SiRedis,
    SiDocker,
    SiNginx,
    SiGit,
    SiDigitalocean,
    SiOpenapiinitiative,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbApi, TbArrowsExchange, TbDatabase, TbPlugConnected } from "react-icons/tb";

export type TechInfo = {
    icon: IconType;
    color: string;
};
export const techIcons = {
    "TypeScript": { icon: SiTypescript, color: "#3B8FDB" },
    "JavaScript": { icon: SiJavascript, color: "#F7DF1E" },
    "Python": { icon: SiPython, color: "#FFD43B" },
    "Java": { icon: FaJava, color: "#F89820" },
    "HTML": { icon: SiHtml5, color: "#F57900" },
    "CSS": { icon: SiCss3, color: "#3B82F6" },
    "SQL": { icon: TbDatabase, color: "#67E8F9" },
    "React": { icon: SiReact, color: "#6CE6E1" },
    "Next.js": { icon: SiNextdotjs, color: "#FFFFFF" },
    "Tailwind CSS": { icon: SiTailwindcss, color: "#53C7E0" },
    "Spring Boot": { icon: SiSpringboot, color: "#6DB33F" },
    "FastAPI": { icon: SiFastapi, color: "#14B8A6" },
    "Flask": { icon: SiFlask, color: "#E2E8F0" },
    "NestJS": { icon: SiNestjs, color: "#E0234E" },
    "Express.js": { icon: SiExpress, color: "#E2E8F0" },
    "MySQL": { icon: SiMysql, color: "#5B9BD5" },
    "PostgreSQL": { icon: SiPostgresql, color: "#6E8EF0" },
    "Redis": { icon: SiRedis, color: "#FF5A4E" },
    "Docker": { icon: SiDocker, color: "#2496ED" },
    "Nginx": { icon: SiNginx, color: "#22B35A" },
    "Git": { icon: SiGit, color: "#F05032" },
    "DigitalOcean": { icon: SiDigitalocean, color: "#3B9BFF" },
    "OpenAPI": { icon: SiOpenapiinitiative, color: "#8BC34A" },
    "REST": { icon: TbApi, color: "#67E8F9" },
    "WebSocket": { icon: TbPlugConnected, color: "#67E8F9" },
    "gRPC": { icon: TbArrowsExchange, color: "#67E8F9" },
} satisfies Record<string, TechInfo>;

export type TechName = keyof typeof techIcons;
