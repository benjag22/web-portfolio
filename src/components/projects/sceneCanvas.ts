import type { World } from "./physics";

export type Particle = {
    x: number;
    y: number;
    r: number;
    speed: number;
    sway: number;
    phase: number;
    alpha: number;
};

export type SceneSprites = {
    tech: Map<string, HTMLCanvasElement>;
    glow: HTMLCanvasElement;
    particle: HTMLCanvasElement;
    half: number;
    glowHalf: number;
};

export type SceneEmphasis = {
    projects: number[];
    any: number;
};

const TAU = Math.PI * 2;
const SPRITE_PAD = 4;
const SPRITE_OVERSAMPLE = 1.2;
const PARTICLE_R = 8;

export function svgToImage(svg: SVGSVGElement, color: string, size: number): Promise<HTMLImageElement> {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute("data-tech");
    clone.removeAttribute("class");
    clone.removeAttribute("style");
    clone.setAttribute("width", String(size));
    clone.setAttribute("height", String(size));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const markup = new XMLSerializer().serializeToString(clone).replaceAll("currentColor", color);
    const img = new Image();
    img.decoding = "async";
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    return img.decode().then(() => img);
}

export function renderSprites(r: number, dpr: number, icons: Map<string, HTMLImageElement>, techs: string[]): SceneSprites {
    const scale = dpr * SPRITE_OVERSAMPLE;
    const half = r + SPRITE_PAD;
    const tech = new Map<string, HTMLCanvasElement>();

    for (const name of techs) {
        const { canvas, ctx } = makeCanvas(half * 2, scale);
        paintGlass(ctx, half, r);
        const icon = icons.get(name);
        if (icon) {
            const size = r * 0.95;
            ctx.drawImage(icon, half - size / 2, half - size / 2, size, size);
        }
        tech.set(name, canvas);
    }

    const glowHalf = r * 2;
    const glowSprite = makeCanvas(glowHalf * 2, scale);
    const glow = glowSprite.ctx.createRadialGradient(glowHalf, glowHalf, r * 0.6, glowHalf, glowHalf, glowHalf);
    glow.addColorStop(0, "rgba(34, 211, 238, 0.45)");
    glow.addColorStop(1, "rgba(34, 211, 238, 0)");
    glowSprite.ctx.fillStyle = glow;
    glowSprite.ctx.fillRect(0, 0, glowHalf * 2, glowHalf * 2);

    const particleSprite = makeCanvas((PARTICLE_R + 1) * 2, scale);
    paintParticle(particleSprite.ctx, PARTICLE_R + 1, PARTICLE_R);

    return { tech, glow: glowSprite.canvas, particle: particleSprite.canvas, half, glowHalf };
}

export function createParticles(count: number, w: number, h: number): Particle[] {
    return Array.from({ length: count }, () => spawnParticle(w, h, true));
}

export function updateParticles(particles: Particle[], w: number, h: number, frames: number) {
    for (const p of particles) {
        p.y -= p.speed * frames;
        p.phase += 0.012 * frames;
        if (p.y < -p.r * 2) Object.assign(p, spawnParticle(w, h, false));
    }
}

export function drawScene(
    ctx: CanvasRenderingContext2D,
    world: World,
    sprites: SceneSprites | null,
    particles: Particle[],
    emphasis: SceneEmphasis,
    dashOffset: number,
) {
    const { w, h, bodies, projectCount } = world;
    ctx.clearRect(0, 0, w, h);

    if (sprites) {
        for (const p of particles) {
            const fade = Math.min(1, p.y / (h * 0.35));
            if (fade <= 0) continue;
            const size = (p.r / PARTICLE_R) * (PARTICLE_R + 1) * 2;
            ctx.globalAlpha = p.alpha * fade;
            ctx.drawImage(sprites.particle, p.x + Math.sin(p.phase) * p.sway - size / 2, p.y - size / 2, size, size);
        }
        ctx.globalAlpha = 1;
    }

    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.lineDashOffset = dashOffset;
    for (let i = projectCount; i < bodies.length; i++) {
        const t = bodies[i];
        const s = bodies[t.parent];
        const e = emphasis.projects[t.projectIndex] ?? 0;
        const alpha = 0.22 + 0.53 * e - 0.14 * emphasis.any * (1 - e);
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const d = Math.hypot(dx, dy) || 1;
        const ux = dx / d;
        const uy = dy / d;
        ctx.strokeStyle = `rgba(103, 232, 249, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(s.x + ux * s.r, s.y + uy * s.r);
        ctx.lineTo(t.x - ux * t.r, t.y - uy * t.r);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    if (!sprites) return;

    for (let i = projectCount; i < bodies.length; i++) {
        const t = bodies[i];
        const e = emphasis.projects[t.projectIndex] ?? 0;
        if (e > 0.01) {
            ctx.globalAlpha = e;
            const g = sprites.glowHalf;
            ctx.drawImage(sprites.glow, t.x - g, t.y - g, g * 2, g * 2);
        }
    }

    for (let i = projectCount; i < bodies.length; i++) {
        const t = bodies[i];
        const sprite = t.tech ? sprites.tech.get(t.tech) : undefined;
        if (!sprite) continue;
        const e = emphasis.projects[t.projectIndex] ?? 0;
        ctx.globalAlpha = Math.max(0.15, 0.55 + 0.45 * e - 0.33 * emphasis.any * (1 - e));
        const half = sprites.half * (1 + 0.15 * e);
        ctx.drawImage(sprite, t.x - half, t.y - half, half * 2, half * 2);
    }
    ctx.globalAlpha = 1;
}

function makeCanvas(size: number, scale: number) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(size * scale);
    canvas.height = Math.ceil(size * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(canvas.width / size, canvas.height / size);
    return { canvas, ctx };
}

function paintGlass(ctx: CanvasRenderingContext2D, c: number, r: number) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, TAU);

    let g = ctx.createRadialGradient(c, c, 0, c, c, r);
    g.addColorStop(0, "rgba(2, 10, 56, 0.55)");
    g.addColorStop(0.68, "rgba(2, 10, 56, 0.85)");
    g.addColorStop(1, "rgba(34, 211, 238, 0.3)");
    ctx.fillStyle = g;
    ctx.fill();

    g = ctx.createRadialGradient(c + r * 0.44, c + r * 0.64, 0, c + r * 0.44, c + r * 0.64, r * 0.92);
    g.addColorStop(0, "rgba(129, 140, 248, 0.22)");
    g.addColorStop(1, "rgba(129, 140, 248, 0)");
    ctx.fillStyle = g;
    ctx.fill();

    g = ctx.createRadialGradient(c - r * 0.36, c - r * 0.48, 0, c - r * 0.36, c - r * 0.48, r * 0.64);
    g.addColorStop(0, "rgba(255, 255, 255, 0.26)");
    g.addColorStop(0.44, "rgba(255, 255, 255, 0.05)");
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(c, c, r - 0.5, 0, TAU);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = rimGradient(ctx, c);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(c - r * 0.36, c - r * 0.56);
    ctx.rotate((-32 * Math.PI) / 180);
    ctx.scale(1, 0.55);
    const s = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.3);
    s.addColorStop(0, "rgba(255, 255, 255, 0.55)");
    s.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, TAU);
    ctx.fill();
    ctx.restore();
}

function paintParticle(ctx: CanvasRenderingContext2D, c: number, r: number) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, TAU);
    ctx.fillStyle = "rgba(34, 211, 238, 0.12)";
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(125, 211, 252, 1)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c - r * 0.35, c - r * 0.35, r * 0.22, 0, TAU);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();
}

function rimGradient(ctx: CanvasRenderingContext2D, c: number): CanvasGradient | string {
    if (typeof ctx.createConicGradient !== "function") return "rgba(103, 232, 249, 0.8)";
    const g = ctx.createConicGradient(0, c, c);
    g.addColorStop(0, "#22d3ee");
    g.addColorStop(0.18, "#7dd3fc");
    g.addColorStop(0.34, "#818cf8");
    g.addColorStop(0.52, "rgba(34, 211, 238, 0.25)");
    g.addColorStop(0.7, "#67e8f9");
    g.addColorStop(0.86, "#a5b4fc");
    g.addColorStop(1, "#22d3ee");
    return g;
}

function spawnParticle(w: number, h: number, anywhere: boolean): Particle {
    const r = 1.5 + Math.random() * 4.5;
    return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + r * 2 + Math.random() * 40,
        r,
        speed: 0.18 + r * 0.07 + Math.random() * 0.15,
        sway: 4 + Math.random() * 10,
        phase: Math.random() * TAU,
        alpha: 0.25 + Math.random() * 0.35,
    };
}
