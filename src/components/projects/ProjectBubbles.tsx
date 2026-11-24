import {
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react";
import {
    forceCollide,
    forceLink,
    forceManyBody,
    forceSimulation,
    type Simulation,
    type SimulationLinkDatum,
    type SimulationNodeDatum,
} from "d3-force";
import type { Project } from "@/data/projects";
import Image from "next/image";
import { techIcons, type TechName } from "@/data/techIcons";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useIsTouchScreen from "@/hooks/useIsTouchScreen";
import cn from "@/utils/cn";
import BubbleField from "./BubbleField";
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

type BubbleNode = SimulationNodeDatum & {
    id: string;
    kind: "project" | "tech";
    r: number;
    projectIndex: number;
    ax: number;
    ay: number;
    phase: number;
    tech?: TechName;
    parentId?: string;
    slot?: number;
    orbitR?: number;
    spin?: number;
};

type BubbleLink = SimulationLinkDatum<BubbleNode> & {
    id: string;
    projectId: string;
    projectIndex: number;
    distance: number;
};

type Size = { w: number; h: number };

type Scene = Size & {
    nodes: BubbleNode[];
    links: BubbleLink[];
    byId: Map<string, BubbleNode>;
};

type Pointer = { x: number; y: number; vx: number; vy: number; inside: boolean };

type Drag = {
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
    vx: number;
    vy: number;
};

const MAX_SPEED = 24;

export default function ProjectBubbles({ projects, onOpen, apiRef, paused = false, className }: ProjectBubblesProps) {
    const reducedMotion = usePrefersReducedMotion();
    const touch = useIsTouchScreen();

    const stageRef = useRef<HTMLDivElement>(null);
    const nodeEls = useRef(new Map<string, HTMLDivElement>());
    const linkEls = useRef(new Map<string, SVGLineElement>());
    const simRef = useRef<Simulation<BubbleNode, BubbleLink> | null>(null);
    const pointerRef = useRef<Pointer>({ x: 0, y: 0, vx: 0, vy: 0, inside: false });
    const dragRef = useRef<Drag | null>(null);
    const suppressClickRef = useRef(false);
    const hoveredRef = useRef<number | null>(null);
    const timeRef = useRef(0);
    const savedPositions = useRef<Map<string, { x: number; y: number }> | null>(null);

    const [size, setSize] = useState<Size | null>(null);
    const [visible, setVisible] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const layout = useMemo(() => (size ? buildScene(projects, size) : null), [projects, size]);
    const sceneRef = useRef<Scene | null>(null);
    const running = visible && !paused && !reducedMotion;

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
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
            threshold: 0.15,
        });
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        if (!layout) return;
        const scene = cloneScene(layout);
        const saved = savedPositions.current;

        for (const node of scene.nodes) {
            const prev = saved?.get(node.id);
            if (prev) {
                node.x = prev.x * scene.w;
                node.y = prev.y * scene.h;
            } else if (!reducedMotion) {
                node.y = (node.y ?? 0) + scene.h * 0.75 + node.projectIndex * 140;
            }
        }

        const wander = !reducedMotion;
        const sim = forceSimulation<BubbleNode, BubbleLink>(scene.nodes)
            .alpha(0.3)
            .alphaDecay(0)
            .velocityDecay(0.22)
            .force(
                "link",
                forceLink<BubbleNode, BubbleLink>(scene.links)
                    .id((d) => d.id)
                    .distance((l) => l.distance)
                    .strength(0.3),
            )
            .force(
                "collide",
                forceCollide<BubbleNode>((d) => d.r + (d.kind === "project" ? 10 : 3))
                    .strength(0.9)
                    .iterations(2),
            )
            .force(
                "charge",
                forceManyBody<BubbleNode>()
                    .strength((d) => (d.kind === "tech" ? -8 : 0))
                    .distanceMax(140),
            )
            .force("anchor", anchorForce(() => timeRef.current, scene, wander))
            .force("orbit", orbitForce(() => timeRef.current, scene, wander))
            .force("wake", wakeForce(pointerRef.current, hoveredRef))
            .force("jitter", jitterForce(wander))
            .force("bounds", boundsForce(scene))
            .stop();

        if (reducedMotion) {
            for (const node of scene.nodes) {
                node.x = node.kind === "project" ? node.ax : node.x;
                node.y = node.kind === "project" ? node.ay : node.y;
            }
            sim.tick(260);
        }

        sceneRef.current = scene;
        simRef.current = sim;
        renderScene(scene, nodeEls.current, linkEls.current);

        return () => {
            sim.stop();
            simRef.current = null;
            sceneRef.current = null;
            savedPositions.current = new Map(
                scene.nodes.map((n) => [n.id, { x: (n.x ?? 0) / scene.w, y: (n.y ?? 0) / scene.h }]),
            );
        };
    }, [layout, reducedMotion]);

    useEffect(() => {
        if (!layout || !running) return;
        let frame = 0;

        const loop = (now: number) => {
            timeRef.current = now;
            const pointer = pointerRef.current;
            pointer.vx *= 0.82;
            pointer.vy *= 0.82;

            const sim = simRef.current;
            const scene = sceneRef.current;
            if (sim && scene) {
                sim.tick();
                for (const node of scene.nodes) {
                    node.vx = clamp(node.vx ?? 0, -MAX_SPEED, MAX_SPEED);
                    node.vy = clamp(node.vy ?? 0, -MAX_SPEED, MAX_SPEED);
                }
                renderScene(scene, nodeEls.current, linkEls.current);
            }
            frame = requestAnimationFrame(loop);
        };

        frame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frame);
    }, [layout, running]);

    useImperativeHandle(
        apiRef,
        () => ({
            getOrigin: (projectId) => originOf(nodeEls.current.get(projectId)),
            focus: (projectId) => {
                nodeEls.current.get(projectId)?.querySelector("button")?.focus({ preventScroll: true });
            },
        }),
        [],
    );

    const toLocal = (clientX: number, clientY: number) => {
        const rect = stageRef.current!.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleStageMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const { x, y } = toLocal(e.clientX, e.clientY);
        const pointer = pointerRef.current;
        if (pointer.inside) {
            pointer.vx = x - pointer.x;
            pointer.vy = y - pointer.y;
        }
        pointer.x = x;
        pointer.y = y;
        pointer.inside = true;
    };

    const handleStageLeave = () => {
        pointerRef.current.inside = false;
    };

    const setHover = (index: number | null) => {
        hoveredRef.current = index;
        setHovered(index);
    };

    const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, node: BubbleNode) => {
        if (e.pointerType === "touch" || e.button !== 0 || reducedMotion) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = {
            id: node.id,
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
            vx: 0,
            vy: 0,
        };
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const drag = dragRef.current;
        const scene = sceneRef.current;
        if (!drag || drag.pointerId !== e.pointerId || !scene) return;
        if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 6) return;

        const node = scene.byId.get(drag.id);
        if (!node) return;
        if (!drag.moved) {
            drag.moved = true;
            setDraggingId(drag.id);
        }
        const { x, y } = toLocal(e.clientX, e.clientY);
        const fx = clamp(x, node.r, scene.w - node.r);
        const fy = clamp(y, node.r, scene.h - node.r);
        drag.vx = fx - (node.fx ?? fx);
        drag.vy = fy - (node.fy ?? fy);
        node.fx = fx;
        node.fy = fy;
    };

    const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== e.pointerId) return;
        const node = sceneRef.current?.byId.get(drag.id);
        if (node) {
            node.fx = null;
            node.fy = null;
            if (drag.moved) {
                node.vx = drag.vx * 0.6;
                node.vy = drag.vy * 0.6;
            }
        }
        if (drag.moved) {
            suppressClickRef.current = true;
            setTimeout(() => (suppressClickRef.current = false), 0);
        }
        dragRef.current = null;
        setDraggingId(null);
    };

    const handleClick = (index: number, id: string) => {
        if (suppressClickRef.current) return;
        const origin = originOf(nodeEls.current.get(id));
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
            <BubbleField running={running && !touch} />

            {layout && (
                <>
                    <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        width={layout.w}
                        height={layout.h}
                        aria-hidden="true"
                    >
                        {layout.links.map((link) => (
                            <line
                                key={link.id}
                                ref={(el) => {
                                    if (el) linkEls.current.set(link.id, el);
                                    else linkEls.current.delete(link.id);
                                }}
                                className={cn(
                                    styles.link,
                                    hovered === link.projectIndex && styles.linkActive,
                                    hovered !== null && hovered !== link.projectIndex && styles.linkDim,
                                )}
                            />
                        ))}
                    </svg>

                    {layout.nodes.map((node) => {
                        const setRef = (el: HTMLDivElement | null) => {
                            if (el) nodeEls.current.set(node.id, el);
                            else nodeEls.current.delete(node.id);
                        };
                        const box = { width: node.r * 2, height: node.r * 2 };

                        if (node.kind === "tech" && node.tech) {
                            const { icon: Icon } = techIcons[node.tech];
                            return (
                                <div key={node.id} ref={setRef} className={styles.node} style={box} title={node.tech}>
                                    <div
                                        aria-hidden="true"
                                        className={cn(
                                            styles.sat,
                                            hovered === node.projectIndex && styles.satActive,
                                            hovered !== null && hovered !== node.projectIndex && styles.satDim,
                                        )}
                                    >
                                        <Icon style={{ width: node.r * 0.95, height: node.r * 0.95 }} />
                                    </div>
                                </div>
                            );
                        }

                        const project = projects[node.projectIndex];
                        return (
                            <div key={node.id} ref={setRef} className={cn(styles.node, "z-10")} style={box}>
                                <button
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-label={`${project.name}: ${project.title}. Abrir vista previa`}
                                    className={cn(styles.bubble, draggingId === node.id && styles.dragging)}
                                    onPointerDown={(e) => handlePointerDown(e, node)}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerUp}
                                    onPointerEnter={() => setHover(node.projectIndex)}
                                    onPointerLeave={() => setHover(null)}
                                    onFocus={() => setHover(node.projectIndex)}
                                    onBlur={() => setHover(null)}
                                    onClick={() => handleClick(node.projectIndex, node.id)}
                                >
                                    {project.image ? (
                                        <>
                                            <Image src={project.thumb ?? project.image} alt="" aria-hidden="true" draggable={false} fill sizes="240px"
                                                   className="rounded-[inherit] object-cover object-top opacity-95" />
                                            <span aria-hidden="true"
                                                  className="absolute inset-0 rounded-[inherit] bg-linear-to-t from-abyss/90 via-abyss/40 to-transparent" />
                                        </>
                                    ):(
                                        <span className={styles.name} style={{ fontSize: clamp(node.r * 0.24, 15, 28) }}>
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
                </>
            )}
        </div>
    );
}

function buildScene(projects: Project[], { w, h }: Size): Scene {
    const compact = w < 640;
    const base = compact ? clamp(w * 0.2, 52, 80) : clamp(Math.min(w * 0.085, h * 0.13), 52, 98);
    const satR = clamp(base * 0.21, 12, 18);
    const count = projects.length;

    const nodes: BubbleNode[] = [];
    const links: BubbleLink[] = [];

    projects.forEach((project, i) => {
        const r = base * project.weight;
        let ax: number;
        let ay: number;

        if (compact) {
            ax = w * (i % 2 === 0 ? 0.37 : 0.63);
            ay = h * ((i + 0.5) / count);
        } else if (w < 1000) {
            const rows = Math.ceil(count / 2);
            ax = w * (i % 2 === 0 ? 0.3 : 0.7);
            ay = h * ((Math.floor(i / 2) + 0.5) / rows) + (i % 2 === 0 ? -0.04 : 0.04) * h;
        } else {
            ax = w * (count > 1 ? 0.15 + (0.7 * i) / (count - 1) : 0.5);
            ay = h * (i % 2 === 0 ? 0.4 : 0.62);
        }

        nodes.push({ id: project.id, kind: "project", r, projectIndex: i, ax, ay, phase: i * 1.9, x: ax, y: ay });

        project.stack.forEach((tech, j) => {
            const angle = (j / project.stack.length) * Math.PI * 2 + i;
            const distance = r + satR + 16;
            const id = `${project.id}::${tech}`;
            nodes.push({
                id,
                kind: "tech",
                tech,
                r: satR,
                projectIndex: i,
                ax,
                ay,
                phase: j,
                parentId: project.id,
                slot: angle,
                orbitR: distance,
                spin: i % 2 === 0 ? 1 : -1,
                x: ax + Math.cos(angle) * distance,
                y: ay + Math.sin(angle) * distance,
            });
            links.push({ id, source: project.id, target: id, projectId: project.id, projectIndex: i, distance });
        });
    });

    return { w, h, nodes, links, byId: new Map(nodes.map((n) => [n.id, n])) };
}

function cloneScene(scene: Scene): Scene {
    const nodes = scene.nodes.map((n) => ({ ...n }));
    const links = scene.links.map((l) => ({ ...l }));
    return { w: scene.w, h: scene.h, nodes, links, byId: new Map(nodes.map((n) => [n.id, n])) };
}

function anchorForce(getTime: () => number, size: Size, wander: boolean) {
    let nodes: BubbleNode[] = [];
    const wanderX = size.w * 0.025;
    const wanderY = size.h * 0.035;

    const force = () => {
        const t = getTime();
        for (const n of nodes) {
            if (n.kind !== "project" || n.fx != null) continue;
            const tx = n.ax + (wander ? Math.sin(t * 0.00032 + n.phase) * wanderX : 0);
            const ty = n.ay + (wander ? Math.cos(t * 0.00027 + n.phase * 1.3) * wanderY : 0);
            n.vx = (n.vx ?? 0) + (tx - (n.x ?? 0)) * 0.006;
            n.vy = (n.vy ?? 0) + (ty - (n.y ?? 0)) * 0.006;
        }
    };
    force.initialize = (ns: BubbleNode[]) => {
        nodes = ns;
    };
    return force;
}

function orbitForce(getTime: () => number, scene: Scene, spin: boolean) {
    let nodes: BubbleNode[] = [];
    const force = () => {
        const t = getTime();
        for (const n of nodes) {
            if (n.kind !== "tech" || !n.parentId || n.slot === undefined || n.orbitR === undefined) continue;
            const parent = scene.byId.get(n.parentId);
            if (!parent) continue;
            const angle = n.slot + (spin ? (n.spin ?? 1) * t * 0.00008 : 0);
            const tx = (parent.x ?? 0) + Math.cos(angle) * n.orbitR;
            const ty = (parent.y ?? 0) + Math.sin(angle) * n.orbitR;
            n.vx = (n.vx ?? 0) + (tx - (n.x ?? 0)) * 0.02;
            n.vy = (n.vy ?? 0) + (ty - (n.y ?? 0)) * 0.02;
        }
    };
    force.initialize = (ns: BubbleNode[]) => {
        nodes = ns;
    };
    return force;
}

function wakeForce(pointer: Pointer, hovered: RefObject<number | null>) {
    let nodes: BubbleNode[] = [];

    const force = () => {
        for (const n of nodes) {
            if (n.kind === "project" && hovered.current === n.projectIndex) {
                n.vx = (n.vx ?? 0) * 0.85;
                n.vy = (n.vy ?? 0) * 0.85;
                continue;
            }
            if (!pointer.inside || n.fx != null) continue;
            const speed = Math.hypot(pointer.vx, pointer.vy);
            if (speed < 0.5) continue;

            const dx = (n.x ?? 0) - pointer.x;
            const dy = (n.y ?? 0) - pointer.y;
            const reach = n.r + 70;
            const d = Math.hypot(dx, dy);
            if (d > reach) continue;

            const falloff = 1 - d / reach;
            const mass = n.kind === "tech" ? 1 : 0.35;
            n.vx = (n.vx ?? 0) + pointer.vx * falloff * 0.06 * mass;
            n.vy = (n.vy ?? 0) + pointer.vy * falloff * 0.06 * mass;
        }
    };
    force.initialize = (ns: BubbleNode[]) => {
        nodes = ns;
    };
    return force;
}

function jitterForce(enabled: boolean) {
    let nodes: BubbleNode[] = [];
    const force = () => {
        if (!enabled) return;
        for (const n of nodes) {
            const amount = n.kind === "tech" ? 0.06 : 0.02;
            n.vx = (n.vx ?? 0) + (Math.random() - 0.5) * amount;
            n.vy = (n.vy ?? 0) + (Math.random() - 0.5) * amount;
        }
    };
    force.initialize = (ns: BubbleNode[]) => {
        nodes = ns;
    };
    return force;
}

function boundsForce(size: Size) {
    let nodes: BubbleNode[] = [];
    const force = () => {
        for (const n of nodes) {
            const pad = n.r + 4;
            const x = n.x ?? 0;
            const y = n.y ?? 0;
            if (x < pad) n.vx = (n.vx ?? 0) + Math.min((pad - x) * 0.08, 3);
            else if (x > size.w - pad) n.vx = (n.vx ?? 0) - Math.min((x - (size.w - pad)) * 0.08, 3);
            if (y < pad) n.vy = (n.vy ?? 0) + Math.min((pad - y) * 0.08, 3);
            else if (y > size.h - pad) n.vy = (n.vy ?? 0) - Math.min((y - (size.h - pad)) * 0.08, 3);
        }
    };
    force.initialize = (ns: BubbleNode[]) => {
        nodes = ns;
    };
    return force;
}

function renderScene(scene: Scene, nodeEls: Map<string, HTMLDivElement>, linkEls: Map<string, SVGLineElement>) {
    for (const n of scene.nodes) {
        const el = nodeEls.get(n.id);
        if (el) el.style.transform = `translate3d(${((n.x ?? 0) - n.r).toFixed(1)}px, ${((n.y ?? 0) - n.r).toFixed(1)}px, 0)`;
    }
    for (const link of scene.links) {
        const el = linkEls.get(link.id);
        const s = scene.byId.get(link.projectId);
        const t = scene.byId.get(link.id);
        if (!el || !s || !t) continue;

        const dx = (t.x ?? 0) - (s.x ?? 0);
        const dy = (t.y ?? 0) - (s.y ?? 0);
        const d = Math.hypot(dx, dy) || 1;
        const ux = dx / d;
        const uy = dy / d;
        el.setAttribute("x1", ((s.x ?? 0) + ux * s.r).toFixed(1));
        el.setAttribute("y1", ((s.y ?? 0) + uy * s.r).toFixed(1));
        el.setAttribute("x2", ((t.x ?? 0) - ux * t.r).toFixed(1));
        el.setAttribute("y2", ((t.y ?? 0) - uy * t.r).toFixed(1));
    }
}

function originOf(el: HTMLElement | undefined): BubbleOrigin | null {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, r: rect.width / 2 };
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}
