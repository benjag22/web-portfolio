export type BodyKind = "project" | "tech";

export type Body = {
    id: string;
    kind: BodyKind;
    tech: string | null;
    r: number;
    pad: number;
    mass: number;
    projectIndex: number;
    parent: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    ax: number;
    ay: number;
    phase: number;
    slot: number;
    orbitR: number;
    spin: number;
    fixed: boolean;
};

export type Pointer = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    inside: boolean;
};

export type World = {
    w: number;
    h: number;
    satR: number;
    bodies: Body[];
    projectCount: number;
    time: number;
    wander: boolean;
    hovered: number | null;
    pointer: Pointer;
};

export type WorldInput = {
    id: string;
    weight: number;
    stack: readonly string[];
};

export const STEP_MS = 1000 / 60;

const DAMPING = 0.78;
const MAX_SPEED = 24;

export function createWorld(items: WorldInput[], w: number, h: number): World {
    const compact = w < 640;
    const base = compact ? clamp(w * 0.2, 52, 80) : clamp(Math.min(w * 0.085, h * 0.13), 52, 98);
    const satR = clamp(base * 0.21, 12, 18);
    const count = items.length;
    const bodies: Body[] = [];

    items.forEach((item, i) => {
        const r = base * item.weight;
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

        bodies.push(makeBody({ id: item.id, kind: "project", r, pad: 10, mass: 4, projectIndex: i, x: ax, y: ay, ax, ay, phase: i * 1.9 }));
    });

    items.forEach((item, i) => {
        const parent = bodies[i];
        item.stack.forEach((tech, j) => {
            const slot = (j / item.stack.length) * Math.PI * 2 + i;
            const orbitR = parent.r + satR + 16;
            bodies.push(
                makeBody({
                    id: `${item.id}::${tech}`,
                    kind: "tech",
                    tech,
                    r: satR,
                    pad: 3,
                    mass: 1,
                    projectIndex: i,
                    parent: i,
                    x: parent.ax + Math.cos(slot) * orbitR,
                    y: parent.ay + Math.sin(slot) * orbitR,
                    ax: parent.ax,
                    ay: parent.ay,
                    phase: j,
                    slot,
                    orbitR,
                    spin: i % 2 === 0 ? 1 : -1,
                }),
            );
        });
    });

    return {
        w,
        h,
        satR,
        bodies,
        projectCount: count,
        time: 0,
        wander: true,
        hovered: null,
        pointer: { x: 0, y: 0, vx: 0, vy: 0, inside: false },
    };
}

export function step(world: World, ms: number = STEP_MS) {
    world.time += ms;
    const { bodies, pointer, w, h, wander } = world;
    const t = world.time;
    const wanderX = w * 0.025;
    const wanderY = h * 0.035;
    const pointerSpeed = Math.hypot(pointer.vx, pointer.vy);

    for (const b of bodies) {
        if (b.fixed) continue;

        if (b.kind === "project") {
            const tx = b.ax + (wander ? Math.sin(t * 0.00032 + b.phase) * wanderX : 0);
            const ty = b.ay + (wander ? Math.cos(t * 0.00027 + b.phase * 1.3) * wanderY : 0);
            b.vx += (tx - b.x) * 0.006;
            b.vy += (ty - b.y) * 0.006;
        } else {
            const p = bodies[b.parent];
            const angle = b.slot + (wander ? b.spin * t * 0.00008 : 0);
            b.vx += (p.x + Math.cos(angle) * b.orbitR - b.x) * 0.02;
            b.vy += (p.y + Math.sin(angle) * b.orbitR - b.y) * 0.02;
        }

        if (wander) {
            const amount = b.kind === "tech" ? 0.06 : 0.02;
            b.vx += (Math.random() - 0.5) * amount;
            b.vy += (Math.random() - 0.5) * amount;
        }

        if (b.kind === "project" && world.hovered === b.projectIndex) {
            b.vx *= 0.85;
            b.vy *= 0.85;
        } else if (pointer.inside && pointerSpeed >= 0.5) {
            const dx = b.x - pointer.x;
            const dy = b.y - pointer.y;
            const reach = b.r + 70;
            const d = Math.hypot(dx, dy);
            if (d < reach) {
                const falloff = 1 - d / reach;
                const weight = b.kind === "tech" ? 1 : 0.35;
                b.vx += pointer.vx * falloff * 0.06 * weight;
                b.vy += pointer.vy * falloff * 0.06 * weight;
            }
        }

        const pad = b.r + 4;
        if (b.x < pad) b.vx += Math.min((pad - b.x) * 0.08, 3);
        else if (b.x > w - pad) b.vx -= Math.min((b.x - (w - pad)) * 0.08, 3);
        if (b.y < pad) b.vy += Math.min((pad - b.y) * 0.08, 3);
        else if (b.y > h - pad) b.vy -= Math.min((b.y - (h - pad)) * 0.08, 3);

        b.vx = clamp(b.vx * DAMPING, -MAX_SPEED, MAX_SPEED);
        b.vy = clamp(b.vy * DAMPING, -MAX_SPEED, MAX_SPEED);
        b.x += b.vx;
        b.y += b.vy;
    }

    collide(bodies);
}

export function settle(world: World, steps = 260) {
    const wander = world.wander;
    world.wander = false;
    for (const b of world.bodies) {
        if (b.kind === "project") {
            b.x = b.ax;
            b.y = b.ay;
        }
    }
    for (let i = 0; i < steps; i++) step(world);
    world.wander = wander;
}

export function hitTech(world: World, x: number, y: number): Body | null {
    for (let i = world.bodies.length - 1; i >= world.projectCount; i--) {
        const b = world.bodies[i];
        if ((b.x - x) ** 2 + (b.y - y) ** 2 <= b.r * b.r) return b;
    }
    return null;
}

function collide(bodies: Body[]) {
    for (let iteration = 0; iteration < 2; iteration++) {
        for (let i = 0; i < bodies.length; i++) {
            const a = bodies[i];
            for (let j = i + 1; j < bodies.length; j++) {
                const b = bodies[j];
                const min = a.r + a.pad + b.r + b.pad;
                let dx = b.x - a.x;
                let dy = b.y - a.y;
                const d2 = dx * dx + dy * dy;
                if (d2 >= min * min) continue;

                let d = Math.sqrt(d2);
                if (d < 0.001) {
                    dx = Math.random() - 0.5;
                    dy = Math.random() - 0.5;
                    d = Math.hypot(dx, dy);
                }

                const ia = a.fixed ? 0 : 1 / a.mass;
                const ib = b.fixed ? 0 : 1 / b.mass;
                const total = ia + ib;
                if (total === 0) continue;

                const ux = dx / d;
                const uy = dy / d;
                const overlap = (min - d) * 0.5;
                a.x -= ux * overlap * (ia / total);
                a.y -= uy * overlap * (ia / total);
                b.x += ux * overlap * (ib / total);
                b.y += uy * overlap * (ib / total);

                const approach = (b.vx - a.vx) * ux + (b.vy - a.vy) * uy;
                if (approach < 0) {
                    const impulse = approach * 0.5;
                    a.vx += ux * impulse * (ia / total);
                    a.vy += uy * impulse * (ia / total);
                    b.vx -= ux * impulse * (ib / total);
                    b.vy -= uy * impulse * (ib / total);
                }
            }
        }
    }
}

function makeBody(values: Partial<Body> & Pick<Body, "id" | "kind" | "r" | "pad" | "mass" | "projectIndex" | "x" | "y" | "ax" | "ay" | "phase">): Body {
    return {
        tech: null,
        parent: -1,
        vx: 0,
        vy: 0,
        slot: 0,
        orbitR: 0,
        spin: 1,
        fixed: false,
        ...values,
    };
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}
