import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { TbArrowUpRight, TbBrandGithub, TbChevronLeft, TbChevronRight, TbX } from "react-icons/tb";
import type { Project } from "@/data/projects";
import { techIcons } from "@/data/techIcons";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import cn from "@/utils/cn";
import type { BubbleOrigin } from "./ProjectBubbles";
import ProjectVisual from "./ProjectVisual";

type ProjectPreviewProps = {
    projects: Project[];
    index: number;
    origin: BubbleOrigin;
    onNavigate: (index: number) => void;
    onClose: () => void;
};

type Wipe = { x: number; y: number; max: number };

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_EXPAND = [0.4, 0, 0.2, 1] as const;

const overlayVariants: Variants = {
    closed: (o: BubbleOrigin | null) => {
        const c = o ?? screenCenter();
        return {
            clipPath: `circle(${c.r}px at ${c.x}px ${c.y}px)`,
            transition: { duration: 0.5, ease: EASE },
        };
    },
    open: (o: BubbleOrigin | null) => {
        const c = o ?? screenCenter();
        return {
            clipPath: `circle(${coverRadius(c)}px at ${c.x}px ${c.y}px)`,
            transition: { duration: 0.75, ease: EASE_EXPAND },
        };
    },
};

const fadeVariants: Variants = {
    closed: { opacity: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, transition: { duration: 0.2 } },
};

const contentVariants: Variants = {
    enter: (w: Wipe | null) => (w ? { clipPath: `circle(0px at ${w.x}px ${w.y}px)`, zIndex: 2 } : { opacity: 0, zIndex: 2 }),
    center: (w: Wipe | null) =>
        w
            ? { clipPath: `circle(${w.max}px at ${w.x}px ${w.y}px)`, opacity: 1, zIndex: 2, transition: { duration: 0.6, ease: EASE } }
            : { opacity: 1, zIndex: 2, transition: { duration: 0.2 } },
    exit: { opacity: 0, zIndex: 1, transition: { duration: 0.25, delay: 0.2 } },
};

export default function ProjectPreview({ projects, index, origin, onNavigate, onClose }: ProjectPreviewProps) {
    const reducedMotion = usePrefersReducedMotion();
    const project = projects[index];
    const count = projects.length;

    const dialogRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const [wipe, setWipe] = useState<Wipe | null>(null);

    const goTo = (target: number, from?: HTMLElement | null) => {
        const next = (target + count) % count;
        if (next === index) return;

        const content = contentRef.current;
        if (content && !reducedMotion) {
            const box = content.getBoundingClientRect();
            const src = from?.getBoundingClientRect();
            const x = src ? src.left + src.width / 2 - box.left : next > index ? box.width : 0;
            const y = src ? src.top + src.height / 2 - box.top : box.height / 2;
            const max = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y)) + 40;
            setWipe({ x, y, max });
        } else {
            setWipe(null);
        }
        onNavigate(next);
    };

    const handleKey = useEffectEvent((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            onClose();
        } else if (e.key === "ArrowRight") {
            goTo(index + 1);
        } else if (e.key === "ArrowLeft") {
            goTo(index - 1);
        } else if (e.key === "Tab") {
            trapFocus(e, dialogRef.current);
        }
    });

    useEffect(() => {
        const listener = (e: KeyboardEvent) => handleKey(e);
        document.addEventListener("keydown", listener);
        return () => document.removeEventListener("keydown", listener);
    }, []);

    useLayoutEffect(() => {
        const root = document.documentElement;
        const scrollbar = window.innerWidth - root.clientWidth;
        const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
        root.style.overflow = "hidden";
        if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
        closeRef.current?.focus({ preventScroll: true });
        return () => {
            root.style.overflow = previous.overflow;
            root.style.paddingRight = previous.paddingRight;
        };
    }, []);

    const titleId = `project-preview-title-${project.id}`;

    return createPortal(
        <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            custom={origin}
            variants={reducedMotion ? fadeVariants : overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 font-roboto-condensed sm:p-6"
        >
            <div
                className="absolute inset-0 bg-abyss/92"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className={cn(
                    "relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl",
                    "border border-cyan-400/25 bg-gradient-to-br from-navy via-deep to-abyss",
                    "shadow-[0_0_80px_rgba(6,182,212,0.2)]",
                )}
            >
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar vista previa"
                    className={cn(
                        "absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full",
                        "border border-cyan-400/30 bg-abyss/70 text-2xl text-cyan-100",
                        "transition-colors hover:border-cyan-300 hover:text-white",
                    )}
                >
                    <TbX />
                </button>

                <div ref={contentRef} className="grid min-h-0 flex-1 overflow-y-auto [&>*]:col-start-1 [&>*]:row-start-1">
                    <AnimatePresence initial={false} custom={wipe}>
                        <motion.div
                            key={project.id}
                            custom={wipe}
                            variants={contentVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="relative bg-gradient-to-br from-navy via-deep to-abyss"
                        >
                            <ProjectDetail project={project} titleId={titleId} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <ProjectTrack projects={projects} index={index} onGo={goTo} />
            </div>
        </motion.div>,
        document.body,
    );
}


function ProjectDetail({ project, titleId }: { project: Project; titleId: string }) {
    return (
        <article
            className={cn(
                "grid items-start gap-x-10 gap-y-6 p-5 pt-16 sm:p-10 sm:pt-12",
                "[grid-template-areas:'visual'_'info'_'extras']",
                "md:grid-cols-[1.1fr_1fr] md:grid-rows-[auto_1fr] md:[grid-template-areas:'visual_info'_'extras_info']",
            )}
        >
            <div className="[grid-area:visual]">
                <ProjectVisual project={project} />
            </div>

            <div className="flex flex-col gap-5 text-cyan-50 [grid-area:info]">
                <header>
                    <h2 id={titleId} className="text-4xl font-semibold italic text-white sm:text-5xl">
                        {project.name}
                    </h2>
                    <p className="mt-1 text-xl text-cyan-100">{project.title}</p>
                </header>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
                    <dt className="text-slate-400">Organización</dt>
                    <dd>{project.organization}</dd>
                    <dt className="text-slate-400">Rol</dt>
                    <dd>{project.role}</dd>
                    <dt className="text-slate-400">Período</dt>
                    <dd>{project.period}</dd>
                    <dt className="text-slate-400">Estado</dt>
                    <dd className="flex items-center gap-2">
                        <span className="relative flex size-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2.5 rounded-full bg-cyan-400" />
                        </span>
                        {project.status}
                    </dd>
                </dl>

                <p className="max-w-prose text-lg leading-relaxed text-cyan-50/90">{project.summary}</p>

                <ul className="flex max-w-prose flex-col gap-2.5">
                    {project.highlights.map((item) => (
                        <li key={item} className="flex gap-3 leading-snug text-cyan-50/85">
                            <span
                                aria-hidden="true"
                                className="mt-1.5 size-2.5 shrink-0 rounded-full border border-cyan-300/70 bg-cyan-400/15 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                            />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-5 [grid-area:extras]">
                <ul className="flex flex-wrap gap-2" aria-label="Tecnologías">
                    {project.stack.map((tech) => {
                        const { icon: Icon } = techIcons[tech];
                        return (
                            <li
                                key={tech}
                                className="flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-panel px-3 py-1 text-sm text-cyan-100"
                            >
                                <Icon aria-hidden="true" className="text-base" />
                                {tech}
                            </li>
                        );
                    })}
                </ul>

                {(project.url || project.repoUrl) && (
                    <div className="flex flex-wrap gap-3">
                        {project.url && (
                            <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 font-semibold text-abyss transition-colors hover:bg-cyan-300"
                            >
                                Visitar sitio <TbArrowUpRight aria-hidden="true" className="text-lg" />
                            </a>
                        )}
                        {project.repoUrl && (
                            <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 px-5 py-2.5 text-cyan-100 transition-colors hover:border-cyan-300 hover:text-white"
                            >
                                <TbBrandGithub aria-hidden="true" className="text-lg" /> Ver código
                            </a>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}

type ProjectTrackProps = {
    projects: Project[];
    index: number;
    onGo: (index: number, from?: HTMLElement | null) => void;
};

function ProjectTrack({ projects, index, onGo }: ProjectTrackProps) {
    const arrow = cn(
        "grid size-11 shrink-0 place-items-center rounded-full text-2xl",
        "border border-cyan-400/30 text-cyan-100 transition-colors hover:border-cyan-300 hover:text-white",
    );

    return (
        <nav
            aria-label="Cambiar de proyecto"
            className="flex items-center justify-between gap-2 border-t border-cyan-400/15 bg-abyss/60 px-3 py-3 sm:gap-4 sm:px-10"
        >
            <button type="button" aria-label="Proyecto anterior" className={arrow} onClick={(e) => onGo(index - 1, e.currentTarget)}>
                <TbChevronLeft />
            </button>

            <ol className="flex items-start">
                {projects.map((p, i) => {
                    const active = i === index;
                    return (
                        <li key={p.id} className="flex items-start">
                            {i > 0 && <span aria-hidden="true" className="mt-[17px] h-px w-3 bg-cyan-400/30 sm:mt-[21px] sm:w-12" />}
                            <button
                                type="button"
                                aria-current={active ? "true" : undefined}
                                aria-label={`Ver ${p.name}`}
                                onClick={(e) => onGo(i, e.currentTarget)}
                                className="group flex w-9 flex-col items-center gap-1.5 sm:w-16"
                            >
                                <span className="relative grid size-9 place-items-center sm:size-11">
                                    {active && (
                                        <motion.span
                                            layoutId="project-track-glow"
                                            className="absolute inset-0 rounded-full border border-cyan-300 bg-cyan-400/20 shadow-[0_0_18px_rgba(34,211,238,0.6)]"
                                            transition={{ type: "spring", stiffness: 260, damping: 30 }}
                                        />
                                    )}
                                    <span
                                        className={cn(
                                            "relative size-4 rounded-full border transition-all",
                                            active
                                                ? "border-white bg-cyan-200"
                                                : "border-cyan-400/50 bg-cyan-400/10 group-hover:border-cyan-300 group-hover:bg-cyan-400/30",
                                        )}
                                    />
                                </span>
                                <span
                                    className={cn(
                                        "hidden whitespace-nowrap text-xs sm:block",
                                        active ? "text-white" : "text-cyan-100/60 group-hover:text-cyan-100",
                                    )}
                                >
                                    {p.name}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            <button type="button" aria-label="Proyecto siguiente" className={arrow} onClick={(e) => onGo(index + 1, e.currentTarget)}>
                <TbChevronRight />
            </button>
        </nav>
    );
}

function screenCenter(): BubbleOrigin {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2, r: 0 };
}

function coverRadius(o: BubbleOrigin) {
    const w = typeof window === "undefined" ? 1920 : window.innerWidth;
    const h = typeof window === "undefined" ? 1080 : window.innerHeight;
    return Math.hypot(Math.max(o.x, w - o.x), Math.max(o.y, h - o.y)) + 20;
}

function trapFocus(e: KeyboardEvent, container: HTMLElement | null) {
    if (!container) return;
    const focusables = Array.from(
        container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}
