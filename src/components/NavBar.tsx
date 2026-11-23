import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TbMenu2, TbX } from "react-icons/tb";
import cn from "../utils/cn"
import useActiveSection from "../hooks/useActiveSection";

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

    return (
        <nav className={cn(
            "font-roboto-condensed sticky top-0 z-40",
            "bg-nav/95 border-b-2 border-cyan-600 backdrop-blur",
            "h-16"
        )}>
            <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-8">
                <a href={links[0]?.href ?? "#"} className="text-xl italic text-cyan-100 hover:text-white">
                    {"<benjag />"}
                </a>

                <ul className={cn("hidden h-full items-center gap-2 text-xl text-cyan-100 md:flex")}>
                    {links.map((link) => {
                        const isActive = active === link.href.replace("#", "");
                        return (
                            <li key={link.href} className="relative h-full">
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
                                {isActive && (
                                    <motion.span
                                        layoutId="nav-active-bubble"
                                        aria-hidden="true"
                                        className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rounded-full border border-cyan-200 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                    />
                                )}
                            </li>
                        );
                    })}
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

            <AnimatePresence>
                {menuOpen && (
                    <motion.ul
                        id="mobile-menu"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-x-0 top-full border-b-2 border-cyan-600 bg-nav/95 px-4 py-2 text-lg text-cyan-100 backdrop-blur md:hidden"
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
                    </motion.ul>
                )}
            </AnimatePresence>
        </nav>
    )
}
