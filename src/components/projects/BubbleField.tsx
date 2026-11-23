import { useEffect, useRef } from "react";
import cn from "@/utils/cn";

type BubbleFieldProps = {
    running: boolean;
    className?: string;
};

type Particle = {
    x: number;
    y: number;
    r: number;
    speed: number;
    sway: number;
    phase: number;
    alpha: number;
};

export default function BubbleField({ running, className }: BubbleFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const sizeRef = useRef({ w: 0, h: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
            sizeRef.current = { w: width, h: height };

            const count = Math.min(70, Math.round((width * height) / 14000));
            particlesRef.current = Array.from({ length: count }, () => spawn(width, height, true));
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let frame = 0;
        let last = performance.now();

        const draw = (now: number) => {
            const dt = Math.min((now - last) / 16.67, 3);
            last = now;
            const { w, h } = sizeRef.current;
            ctx.clearRect(0, 0, w, h);

            for (const p of particlesRef.current) {
                p.y -= p.speed * dt;
                p.phase += 0.012 * dt;
                const x = p.x + Math.sin(p.phase) * p.sway;

                if (p.y < -p.r * 2) Object.assign(p, spawn(w, h, false));

                const fade = Math.min(1, p.y / (h * 0.35));
                const alpha = p.alpha * Math.max(0, fade);

                ctx.beginPath();
                ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = `rgba(34, 211, 238, ${alpha * 0.12})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.22, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
                ctx.fill();
            }

            frame = requestAnimationFrame(draw);
        };

        if (running) {
            frame = requestAnimationFrame(draw);
        } else {
            draw(performance.now());
            cancelAnimationFrame(frame);
        }

        return () => cancelAnimationFrame(frame);
    }, [running]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
        />
    );
}

function spawn(w: number, h: number, anywhere: boolean): Particle {
    const r = 1.5 + Math.random() * 4.5;
    return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + r * 2 + Math.random() * 40,
        r,
        speed: 0.18 + r * 0.07 + Math.random() * 0.15,
        sway: 4 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.35,
    };
}
