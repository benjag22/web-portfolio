import { useLayoutEffect, useRef, useState } from "react";
import { TbMenu2, TbX } from "react-icons/tb";
import cn from "@/utils/cn"
import useActiveSection from "@/hooks/useActiveSection";

type NavLink = {
    href: string;
    label: string;
}

type NavBarProps = {
    links: NavLink[];
}

export default function NavBar({ links }: NavBarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const active = useActiveSection(links.map((link) => link.href.replace("#", "")));
    const listRef = useRef<HTMLUListElement>(null);
    const markerRef = useRef<HTMLSpanElement>(null);
    const placedRef = useRef(false);

    useLayoutEffect(() => {
        const list = listRef.current;
        const marker = markerRef.current;
        if (!list || !marker) return;

        const place = () => {
            const link = list.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
            if (!link || link.offsetWidth === 0) return;
            const x = link.offsetLeft + link.offsetWidth / 2 - marker.offsetWidth / 2;
            marker.style.transform = `translateX(${x}px)`;
            marker.style.opacity = "1";
            if (!placedRef.current) {
                placedRef.current = true;
                requestAnimationFrame(() => marker.classList.add("transition-transform"));
            }
        };

        place();
        window.addEventListener("resize", place);
        return () => window.removeEventListener("resize", place);
    }, [active]);

    return (
        <nav className={cn(
            "font-roboto-condensed sticky top-0 z-40",
            "bg-nav border-b-2 border-cyan-600",
            "h-16"
        )}>
            <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-8">
                <a href={links[0]?.href ?? "#"} className="text-xl italic text-cyan-100 hover:text-white">
                    {"<benjag />"}
                </a>

                <ul ref={listRef} className={cn("relative hidden h-full items-center gap-2 text-xl text-cyan-100 md:flex")}>
                    {links.map((link) => {
                        const isActive = active === link.href.replace("#", "");
                        return (
                            <li key={link.href} className="h-full">
                                <a
                                    href={link.href}
                                    aria-current={isActive ? "location" : undefined}
                                    className={cn(
                                        "flex h-full items-center px-5 transition-opacity hover:opacity-80",
                                        isActive && "text-white",
                                    )}
                                >
                                    {link.label}
                                </a>
                            </li>
                        );
                    })}
                    <span
                        ref={markerRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-[7px] left-0 size-3 rounded-full border border-cyan-200 bg-cyan-400 opacity-0 shadow-[0_0_12px_rgba(34,211,238,0.9)] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                </ul>

                <button
                    type="button"
                    className="grid size-11 place-items-center rounded-full text-2xl text-cyan-100 md:hidden"
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? <TbX /> : <TbMenu2 />}
                </button>
            </div>

            <ul
                id="mobile-menu"
                className={cn(
                    "absolute inset-x-0 top-full border-b-2 border-cyan-600 bg-nav px-4 py-2 text-lg text-cyan-100 md:hidden",
                    "transition-[opacity,translate,visibility] duration-200",
                    menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
                )}
            >
                {links.map((link) => (
                    <li key={link.href}>
                        <a
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 py-3",
                                active === link.href.replace("#", "") && "text-white",
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "size-2.5 rounded-full border border-cyan-400/60",
                                    active === link.href.replace("#", "") && "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]",
                                )}
                            />
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
