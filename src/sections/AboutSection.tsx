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
                <div className={cn("flex w-full items-start justify-start p-8")}>
                    <h1 className={cn(
                        "font-roboto-condensed",
                        "italic text-5xl text-white p-6",
                        "border-b-2 border-cyan-600 shadow-md shadow-cyan-800"
                    )}>
                        {"< Acerca de Benjamín González />"}
                    </h1>
                </div>
                <div className={cn(
                    "grid grid-cols-2 gap-2 px-8 pb-8"
                )}>
                    <div className={styles.borderContainer}>
                        <div className={styles.animatedBorder}>
                            <div className={styles.borderTrail}></div>
                        </div>

                        <div className={cn(
                            styles.contentWithBorder,
                            "text-xl"
                        )}>
                            <p className={cn(
                                "font-roboto-condensed",
                                "text-white text-center py-8"
                            )}>
                                {metadata.aboutMeParagraph1}
                            </p>
                            <p className={cn(
                                "font-roboto-condensed",
                                "text-white text-center py-8"
                            )}>
                                {metadata.aboutMeParagraph2}
                            </p>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center justify-center"
                    )}>
                        Aca va la foto.
                    </div>
                </div>
                <div className={cn(
                    "flex flex-row justify-center"
                )}>
                    <FaGithub onClick={() => goTo("https://github.com/benjag22")} className={cn(
                        "text-6xl text-white hover:text-gray-300 cursor-pointer transition-colors"
                    )}/>
                    <FaLinkedin onClick={() => goTo("https://www.linkedin.com/in/benjags/")} className={cn(
                        "text-6xl text-white hover:text-gray-300 cursor-pointer transition-colors"
                    )}/>
                    <TbFileCv width={200} className={cn(
                        "text-6xl text-white hover:text-gray-300 cursor-pointer transition-colors"
                    )}/>
                </div>

            </div>
        </section>
    )
}
