import {
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { techIcons, type TechName } from "@/data/techIcons";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useIsTouchScreen from "@/hooks/useIsTouchScreen";
import cn from "@/utils/cn";
import { clamp, createWorld, hitTech, settle, step, STEP_MS, type World } from "./physics";
import {
    createParticles,
    drawScene,
    renderSprites,
    svgToImage,
    updateParticles,
    type Particle,
    type SceneEmphasis,
    type SceneSprites,
} from "./sceneCanvas";
import styles from "./ProjectBubbles.module.css";

export type BubbleOrigin = { x: number; y: number; r: number };

export type ProjectBubblesApi = {
    getOrigin: (projectId: string) => BubbleOrigin | null;
    focus: (projectId: string) => void;
};

type ProjectBubblesProps = {
    projects: Project[];
    onOpen: (index: number, origin: BubbleOrigin) => void;
    apiRef?: RefObject<ProjectBubblesApi | null>;
    paused?: boolean;
    className?: string;
};

type Size = { w: number; h: number };

type Quality = {
    level: "high" | "low";
    dpr: number;
    frameMs: number;
    particleArea: number;
    maxParticles: number;
};

type Drag = {
    index: number;
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
    vx: number;
    vy: number;
};

const ICON_COLOR = "#cffafe";
const ICON_RASTER = 64;

const HIGH: Quality = { level: "high", dpr: 1.5, frameMs: 0, particleArea: 16000, maxParticles: 60 };
const LOW: Quality = { level: "low", dpr: 1, frameMs: 1000 / 30, particleArea: 42000, maxParticles: 18 };

export default function ProjectBubbles({ projects, onOpen, apiRef, paused = false, className }: ProjectBubblesProps) {
    const reducedMotion = usePrefersReducedMotion();
    const touch = useIsTouchScreen();

    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const iconSourceRef = useRef<HTMLDivElement>(null);
    const nodeEls = useRef<(HTMLDivElement | null)[]>([]);

    const worldRef = useRef<World | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const spritesRef = useRef<SceneSprites | null>(null);
    const iconsRef = useRef(new Map<string, HTMLImageElement>());
    const particlesRef = useRef<Particle[]>([]);
    const emphasisRef = useRef<SceneEmphasis>({ projects: [], any: 0 });
    const qualityRef = useRef<Quality>(HIGH);
    const dragRef = useRef<Drag | null>(null);
    const suppressClickRef = useRef(false);
    const runningRef = useRef(false);
    const savedPositions = useRef<Map<string, { x: number; y: number }> | null>(null);

    const [size, setSize] = useState<Size | null>(null);
    const [visible, setVisible] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const techs = useMemo(() => Array.from(new Set(projects.flatMap((p) => p.stack))), [projects]);
    const layout = useMemo(() => {
        if (!size) return null;
        const world = createWorld(
            projects.map((p) => ({ id: p.id, weight: p.weight, stack: p.stack })),
            size.w,
            size.h,
        );
        return {
            w: size.w,
            h: size.h,
            satR: world.satR,
            bubbles: world.bodies.slice(0, world.projectCount).map((b) => ({ id: b.id, r: b.r, index: b.projectIndex })),
        };
    }, [projects, size]);

    const running = visible && !paused && !reducedMotion;

    const paint = useCallback((elapsed: number) => {
        const world = worldRef.current;
        const ctx = ctxRef.current;
        if (!world || !ctx) return;

        const emphasis = emphasisRef.current;
        const k = elapsed > 0 ? Math.min(1, elapsed / 120) : 1;
        for (let i = 0; i < world.projectCount; i++) {
            const target = world.hovered === i ? 1 : 0;
            const current = emphasis.projects[i] ?? 0;
            emphasis.projects[i] = current + (target - current) * k;
        }
        emphasis.any += ((world.hovered === null ? 0 : 1) - emphasis.any) * k;

        if (elapsed > 0) updateParticles(particlesRef.current, world.w, world.h, elapsed / STEP_MS);

        for (let i = 0; i < world.projectCount; i++) {
            const b = world.bodies[i];
            const el = nodeEls.current[i];
            if (el) el.style.transform = `translate3d(${(b.x - b.r).toFixed(1)}px, ${(b.y - b.r).toFixed(1)}px, 0)`;
        }

        drawScene(ctx, world, spritesRef.current, particlesRef.current, emphasis, reducedMotion ? 0 : -world.time * 0.009);
    }, [reducedMotion]);

    const requestStaticPaint = useCallback(() => {
        if (!runningRef.current) paint(0);
    }, [paint]);

    const fitCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const world = worldRef.current;
        if (!canvas || !world) return;
        const dpr = Math.min(window.devicePixelRatio || 1, qualityRef.current.dpr);
        canvas.width = Math.round(world.w * dpr);
        canvas.height = Math.round(world.h * dpr);
        const ctx = canvas.getContext("2d");
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctxRef.current = ctx;
    }, []);

    const rebuildSprites = useCallback(() => {
        const world = worldRef.current;
        if (!world) return;
        const dpr = Math.min(window.devicePixelRatio || 1, qualityRef.current.dpr);
        spritesRef.current = renderSprites(world.satR, dpr, iconsRef.current, techs);
    }, [techs]);

    const resetParticles = useCallback(() => {
        const world = worldRef.current;
        if (!world) return;
        const q = qualityRef.current;
        const count = reducedMotion ? 0 : Math.min(q.maxParticles, Math.round((world.w * world.h) / q.particleArea));
        particlesRef.current = createParticles(count, world.w, world.h);
    }, [reducedMotion]);

    useEffect(() => {
        const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
        const weak =
            touch ||
            (nav.hardwareConcurrency ?? 8) <= 4 ||
            (nav.deviceMemory ?? 8) <= 4 ||
            nav.connection?.saveData === true ||
            isSoftwareRendering();
        const next = weak ? LOW : HIGH;
        if (qualityRef.current.level === next.level) return;
        qualityRef.current = next;
        fitCanvas();
        rebuildSprites();
        resetParticles();
        requestStaticPaint();
    }, [touch, fitCanvas, rebuildSprites, resetParticles, requestStaticPaint]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        let frame = 0;
        const observer = new ResizeObserver(([entry]) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const w = Math.round(entry.contentRect.width);
                const h = Math.round(entry.contentRect.height);
                setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
            });
        });
        observer.observe(stage);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const root = iconSourceRef.current;
        if (!root) return;
        let cancelled = false;
        const svgs = Array.from(root.querySelectorAll<SVGSVGElement>("svg[data-tech]"));
        Promise.all(
            svgs.map((svg) =>
                svgToImage(svg, ICON_COLOR, ICON_RASTER)
                    .then((img) => [svg.dataset.tech ?? "", img] as const)
                    .catch(() => null),
            ),
        ).then((entries) => {
            if (cancelled) return;
            for (const entry of entries) if (entry) iconsRef.current.set(entry[0], entry[1]);
            rebuildSprites();
            requestStaticPaint();
        });
        return () => {
            cancelled = true;
        };
    }, [rebuildSprites, requestStaticPaint]);

    useLayoutEffect(() => {
        if (!layout) return;
        const world = createWorld(
            projects.map((p) => ({ id: p.id, weight: p.weight, stack: p.stack })),
            layout.w,
            layout.h,
        );
        world.wander = !reducedMotion;
        const saved = savedPositions.current;

        if (reducedMotion) {
            settle(world);
        } else {
            for (const b of world.bodies) {
                const prev = saved?.get(b.id);
                if (prev) {
                    b.x = prev.x * world.w;
                    b.y = prev.y * world.h;
                } else {
                    b.y += world.h * 0.75 + b.projectIndex * 140;
                }
            }
        }

        worldRef.current = world;
        emphasisRef.current = { projects: new Array(world.projectCount).fill(0), any: 0 };
        fitCanvas();
        rebuildSprites();
        resetParticles();
        paint(0);

        return () => {
            savedPositions.current = new Map(world.bodies.map((b) => [b.id, { x: b.x / world.w, y: b.y / world.h }]));
            worldRef.current = null;
        };
    }, [layout, projects, reducedMotion, fitCanvas, rebuildSprites, resetParticles, paint]);

    useEffect(() => {
        runningRef.current = running;
        if (!layout || !running) return;

        let frame = 0;
        let last = performance.now();
        let lastPaint = 0;
        let accumulator = 0;
        let average = STEP_MS;
        let slowSince = 0;
        const start = last;

        const loop = (now: number) => {
            frame = requestAnimationFrame(loop);
            const quality = qualityRef.current;
            if (now - lastPaint < quality.frameMs - 2) return;

            const elapsed = Math.min(now - last, 100);
            last = now;
            lastPaint = now;

            if (quality.level === "high" && now - start > 1500) {
                average = average * 0.9 + elapsed * 0.1;
                if (average > 24) {
                    if (!slowSince) slowSince = now;
                    else if (now - slowSince > 1200) {
                        qualityRef.current = LOW;
                        fitCanvas();
                        rebuildSprites();
                        resetParticles();
                    }
                } else {
                    slowSince = 0;
                }
            }

            const world = worldRef.current;
            if (!world) return;
            const decay = Math.pow(0.82, elapsed / STEP_MS);
            world.pointer.vx *= decay;
            world.pointer.vy *= decay;

            accumulator += elapsed;
            let steps = 0;
            while (accumulator >= STEP_MS && steps < 6) {
                step(world);
                accumulator -= STEP_MS;
                steps++;
            }
            if (steps === 6) accumulator = 0;

            paint(elapsed);
        };

        frame = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(frame);
            runningRef.current = false;
        };
    }, [layout, running, paint, fitCanvas, rebuildSprites, resetParticles]);

    useImperativeHandle(
        apiRef,
        () => ({
            getOrigin: (projectId) => originOf(nodeEls.current[projects.findIndex((p) => p.id === projectId)]),
            focus: (projectId) => {
                nodeEls.current[projects.findIndex((p) => p.id === projectId)]
                    ?.querySelector("button")
                    ?.focus({ preventScroll: true });
            },
        }),
        [projects],
    );

    const toLocal = (clientX: number, clientY: number) => {
        const rect = stageRef.current!.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleStageMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const world = worldRef.current;
        if (!world) return;
        const { x, y } = toLocal(e.clientX, e.clientY);
        const pointer = world.pointer;
        if (pointer.inside) {
            pointer.vx = x - pointer.x;
            pointer.vy = y - pointer.y;
        }
        pointer.x = x;
        pointer.y = y;
        pointer.inside = true;

        if (e.pointerType === "mouse" && stageRef.current) {
            const tech = hitTech(world, x, y)?.tech ?? "";
            if (stageRef.current.title !== tech) stageRef.current.title = tech;
        }
    };

    const handleStageLeave = () => {
        const world = worldRef.current;
        if (world) world.pointer.inside = false;
        if (stageRef.current) stageRef.current.title = "";
    };

    const setHover = (index: number | null) => {
        const world = worldRef.current;
        if (!world) return;
        world.hovered = index;
        requestStaticPaint();
    };

    const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, index: number) => {
        if (e.pointerType === "touch" || e.button !== 0 || reducedMotion) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { index, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false, vx: 0, vy: 0 };
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const drag = dragRef.current;
        const world = worldRef.current;
        if (!drag || !world || drag.pointerId !== e.pointerId) return;
        if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 6) return;

        const body = world.bodies[drag.index];
        if (!drag.moved) {
            drag.moved = true;
            body.fixed = true;
            setDraggingIndex(drag.index);
        }
        const { x, y } = toLocal(e.clientX, e.clientY);
        const nx = clamp(x, body.r, world.w - body.r);
        const ny = clamp(y, body.r, world.h - body.r);
        drag.vx = nx - body.x;
        drag.vy = ny - body.y;
        body.x = nx;
        body.y = ny;
        body.vx = 0;
        body.vy = 0;
    };

    const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== e.pointerId) return;
        const world = worldRef.current;
        if (world && drag.moved) {
            const body = world.bodies[drag.index];
            body.fixed = false;
            body.vx = drag.vx * 0.6;
            body.vy = drag.vy * 0.6;
            suppressClickRef.current = true;
            setTimeout(() => (suppressClickRef.current = false), 0);
        }
        dragRef.current = null;
        setDraggingIndex(null);
    };

    const handleClick = (index: number) => {
        if (suppressClickRef.current) return;
        const origin = originOf(nodeEls.current[index]);
        if (origin) onOpen(index, origin);
    };

    return (
        <div
            ref={stageRef}
            onPointerMove={handleStageMove}
            onPointerLeave={handleStageLeave}
            className={cn(
                styles.stage,
                "h-[820px] w-full rounded-3xl border border-cyan-400/20 sm:h-[clamp(560px,72vh,760px)]",
                "shadow-[0_0_60px_rgba(6,182,212,0.08)]",
                className,
            )}
        >
            <div className={styles.grid} aria-hidden="true" />
            <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

            <div ref={iconSourceRef} hidden aria-hidden="true">
                {techs.map((tech) => {
                    const { icon: Icon } = techIcons[tech as TechName];
                    return <Icon key={tech} data-tech={tech} />;
                })}
            </div>

            {layout?.bubbles.map(({ id, r, index }) => {
                const project = projects[index];
                return (
                    <div
                        key={id}
                        ref={(el) => {
                            nodeEls.current[index] = el;
                        }}
                        className={cn(styles.node, "z-10")}
                        style={{ width: r * 2, height: r * 2 }}
                    >
                        <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-label={`${project.name}: ${project.title}. Abrir vista previa`}
                            className={cn(styles.bubble, draggingIndex === index && styles.dragging)}
                            onPointerDown={(e) => handlePointerDown(e, index)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            onPointerEnter={() => setHover(index)}
                            onPointerLeave={() => setHover(null)}
                            onFocus={() => setHover(index)}
                            onBlur={() => setHover(null)}
                            onClick={() => handleClick(index)}
                        >
                            {project.image ? (
                                <>
                                    <Image
                                        src={project.thumb ?? project.image}
                                        alt=""
                                        aria-hidden="true"
                                        draggable={false}
                                        fill
                                        sizes="240px"
                                        className="rounded-[inherit] object-cover object-top opacity-95"
                                    />
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 rounded-[inherit] bg-linear-to-t from-abyss/90 via-abyss/40 to-transparent"
                                    />
                                </>
                            ) : (
                                <span className={styles.name} style={{ fontSize: clamp(r * 0.24, 15, 28) }}>
                                    {project.name}
                                </span>
                            )}

                            <span className={styles.meta}>{project.period}</span>
                            <span className={styles.hint} aria-hidden="true">
                                Ver proyecto
                            </span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function isSoftwareRendering(): boolean {
    try {
        const gl = document.createElement("canvas").getContext("webgl");
        if (!gl) return true;
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
    } catch {
        return false;
    }
}

function originOf(el: HTMLElement | null | undefined): BubbleOrigin | null {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, r: rect.width / 2 };
}
