import cn from "../utils/cn"
import {FaGithub, FaLinkedin} from "react-icons/fa"
import { TbFileCv } from "react-icons/tb";
import {metadata} from "../metadata.ts"

import styles from "./AboutSection.module.css"

type AboutSectionProps = {
    id: string
}
export default function AboutSection(props: AboutSectionProps) {

    const goTo = (path: string) => {
        window.open(path, "_blank", "noopener,noreferrer")
    }

    return (
        <section id= {props.id} className={cn(
            "font-roboto-condensed",
            "h-screen",
        )}>
            <div className={cn(
                "h-full w-full bg-[#010621]",
                "grid [grid-template-rows:30%_50%_20%] gap-2"
            )}>
                <div className={cn("flex w-full items-start justify-start px-8 pt-8")}>
                    <h1 className={cn(
                        "font-roboto-condensed",
                        "italic text-5xl text-white p-6",
                        "border-b-2 border-cyan-600 shadow-md shadow-cyan-800"
                    )}>
                        {"< Acerca de Benjamín González />"}
                    </h1>
                </div>
                <div className={cn(
                    "grid grid-cols-2 gap-x-8 px-8 pb-8"
                )}>
                    <div className={cn(
                        styles.borderContainer,
                        "group cursor-pointer"
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
                            "p-8",
                            "h-full",
                            "flex flex-col justify-center gap-6",
                            "group-hover:shadow-lg group-hover:shadow-cyan-500/20",
                            "transition-all duration-300"
                        )}>
                            <p className={cn(
                                "font-roboto-condensed",
                                "text-white text-center leading-relaxed"
                            )}>
                                {metadata.aboutMeParagraph1}
                            </p>
                            <p className={cn(
                                "font-roboto-condensed",
                                "text-white text-center leading-relaxed"
                            )}>
                                {metadata.aboutMeParagraph2}
                            </p>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center justify-center",
                        "bg-gradient-to-br from-[#020A38] to-[#010621]",
                        "rounded-xl border border-cyan-800/30",
                        "shadow-lg shadow-cyan-900/20"
                    )}>
                        <div className={cn(
                            "font-roboto-condensed",
                            "text-cyan-400 text-2xl ",
                            "flex flex-col items-center gap-4"
                        )}>
                            <span className="text-center">futura foto de perfil</span>
                        </div>
                    </div>
                </div>
                <div className={cn(
                    "flex flex-row justify-center items-center gap-8"
                )}>
                    <div className={cn(
                        "group cursor-pointer p-3 rounded-full",
                        "hover:bg-cyan-900/20 transition-all duration-300"
                    )}>
                        <FaGithub
                            onClick={() => goTo("https://github.com/benjag22")}
                            className={cn(
                                "text-6xl text-white hover:text-cyan-400",
                                "cursor-pointer transition-colors duration-300",
                                "group-hover:scale-110 transform"
                            )}
                        />
                    </div>
                    <div className={cn(
                        "group cursor-pointer p-3 rounded-full",
                        "hover:bg-cyan-900/20 transition-all duration-300"
                    )}>
                        <FaLinkedin
                            onClick={() => goTo("https://www.linkedin.com/in/benjags/")}
                            className={cn(
                                "text-6xl text-white hover:text-cyan-400",
                                "cursor-pointer transition-colors duration-300",
                                "group-hover:scale-110 transform"
                            )}
                        />
                    </div>
                    <div className={cn(
                        "group cursor-pointer p-3 rounded-full",
                        "hover:bg-cyan-900/20 transition-all duration-300"
                    )}>
                        <TbFileCv
                            className={cn(
                                "text-6xl text-white hover:text-cyan-400",
                                "cursor-pointer transition-colors duration-300",
                                "group-hover:scale-110 transform"
                            )}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
