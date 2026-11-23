import { useState } from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { techIcons } from "@/data/techIcons";
import cn from "@/utils/cn";
import styles from "./ProjectBubbles.module.css";

type ProjectVisualProps = {
    project: Project;
};

export default function ProjectVisual({ project }: ProjectVisualProps) {
    const [failed, setFailed] = useState(false);
    const domain = project.url ? new URL(project.url).host : project.name.toLowerCase();

    return (
        <div className="overflow-hidden rounded-xl border border-cyan-400/20 bg-deep shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <div className="flex h-9 items-center gap-1.5 border-b border-cyan-400/15 bg-nav/70 px-4" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-cyan-400/40" />
                <span className="size-2.5 rounded-full bg-cyan-400/25" />
                <span className="size-2.5 rounded-full bg-cyan-400/15" />
                <span className="ml-3 flex h-6 flex-1 items-center truncate rounded-full bg-abyss/80 px-3 text-xs text-cyan-100/70">
                    {domain}
                </span>
            </div>

            <div className="relative aspect-[16/10]">
                {project.image && !failed ? (
                    <Image
                        src={project.image}
                        alt={`Captura de ${project.name}`}
                        fill
                        sizes="(min-width: 768px) 600px, 100vw"
                        onError={() => setFailed(true)}
                        className="object-cover object-top"
                    />
                ) : (
                    <GeneratedVisual project={project} />
                )}
            </div>
        </div>
    );
}

function GeneratedVisual({ project }: ProjectVisualProps) {
    const count = project.stack.length;

    return (
        <div className={cn(styles.scene, "absolute inset-0 overflow-hidden")} role="img" aria-label={`Stack de ${project.name}: ${project.stack.join(", ")}`}>
            <div className={styles.grid} />
            <div className="absolute inset-0 grid place-items-center">
                <div className="relative grid aspect-square h-[56%] place-items-center">
                    <div className={cn(styles.glass, "grid h-full w-full place-items-center")}>
                        <span className="px-3 text-center text-[clamp(1rem,3.2vw,1.9rem)] font-semibold italic text-white [text-shadow:0_0_18px_rgba(34,211,238,0.45)]">
                            {project.name}
                        </span>
                    </div>

                    {project.stack.map((tech, i) => {
                        const { icon: Icon } = techIcons[tech];
                        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                        return (
                            <div
                                key={tech}
                                className="absolute left-1/2 top-1/2 size-[24%]"
                                style={{
                                    transform: `translate(-50%, -50%) translate(${Math.cos(angle) * 283}%, ${Math.sin(angle) * 283}%)`,
                                }}
                            >
                                <div
                                    className={cn(styles.glass, styles.floating, "grid h-full w-full place-items-center text-cyan-100")}
                                    style={{ animationDelay: `${i * -0.9}s` }}
                                >
                                    <Icon className="size-1/2" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
