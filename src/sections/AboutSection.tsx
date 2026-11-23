import type { ReactNode } from "react";
import cn from "../utils/cn"
import {FaGithub, FaLinkedin} from "react-icons/fa"
import { TbFileCv } from "react-icons/tb";
import {metadata} from "../metadata.ts"
import SectionTitle from "../components/SectionTitle.tsx";
import ProfilePhoto from "../components/ProfilePhoto.tsx";

import styles from "./AboutSection.module.css"

type AboutSectionProps = {
    id: string
}

type SocialLinkProps = {
    href: string;
    label: string;
    children: ReactNode;
}

function SocialLink({ href, label, children }: SocialLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            download="CV.pdf"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={cn(
                "group p-3 rounded-full",
                "text-5xl sm:text-6xl text-white hover:text-cyan-400",
                "hover:bg-cyan-900/20 transition-all duration-300"
            )}
        >
            <span className="block transition-transform duration-300 group-hover:scale-110">{children}</span>
        </a>
    )
}

export default function AboutSection(props: AboutSectionProps) {
    return (
        <section id={props.id} className={cn(
            "font-roboto-condensed scroll-mt-16",
            "min-h-[calc(100svh-4rem)]",
            "flex flex-col"
        )}>
            <div className={cn(
                "mx-auto w-full max-w-[1200px] flex-1",
                "flex flex-col gap-10 px-4 py-12 sm:px-8 sm:py-16"
            )}>
                <SectionTitle as="h1">{"< Acerca de Benjamín González />"}</SectionTitle>

                <div className={cn(
                    "grid flex-1 grid-cols-1 gap-8 md:grid-cols-2"
                )}>
                    <div className={cn(
                        styles.borderContainer,
                        "group"
                    )}>
                        <div className={cn(
                            styles.animatedBorder,
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        )}>
                            <div className={styles.borderTrailSmooth}></div>
                        </div>

                        <div className={cn(
                            styles.contentWithBorder,
                            "text-lg",
                            "p-6 sm:p-8",
                            "h-full",
                            "flex flex-col justify-center gap-6",
                            "group-hover:shadow-lg group-hover:shadow-cyan-500/20",
                            "transition-all duration-300"
                        )}>
                            <p className="text-cyan-400 text-2xl italic">{metadata.role}</p>
                            <p className={cn(
                                "font-roboto-condensed",
                                "text-white leading-relaxed"
                            )}>
                                {metadata.aboutMeParagraph1}
                            </p>
                            <p className={cn(
                                "font-roboto-condensed",
                                "text-white leading-relaxed"
                            )}>
                                {metadata.aboutMeParagraph2}
                            </p>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center justify-center p-10",
                        "bg-gradient-to-br from-navy to-abyss",
                        "rounded-xl border border-cyan-800/30",
                        "shadow-lg shadow-cyan-900/20"
                    )}>
                        <ProfilePhoto
                            src={metadata.photo}
                            alt={`Foto de ${metadata.name}`}
                            initials={metadata.initials}
                        />
                    </div>
                </div>

                <div className={cn(
                    "flex flex-row justify-center items-center gap-6 sm:gap-8"
                )}>
                    <SocialLink href={metadata.links.github} label="GitHub">
                        <FaGithub />
                    </SocialLink>
                    <SocialLink href={metadata.links.linkedin} label="LinkedIn">
                        <FaLinkedin />
                    </SocialLink>
                    <SocialLink href={metadata.cvUrl} label="Descargar CV (PDF)">
                        <TbFileCv />
                    </SocialLink>
                </div>
            </div>
        </section>
    )
}
