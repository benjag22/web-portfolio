import cn from "../utils/cn"
import {FaGithub, FaLinkedin} from "react-icons/fa"
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
            "flex flex-col"
        )}>
            <div className={cn(
                "h-full w-full bg-sky-950 text-xl",
                "flex flex-col justify-center items-center"
            )}>
                <p className={cn(
                    "font-roboto-condensed",
                    "text-white text-center mb-4"
                )}>
                    Hello, {props.id}
                </p>
                <div className={cn(
                    "flex flex-row"
                )}>
                    <FaGithub onClick={() => goTo("https://github.com/benjag22")} className={cn(
                        "text-6xl text-white hover:text-gray-300 cursor-pointer transition-colors"
                    )}/>
                    <FaLinkedin onClick={() => goTo("https://www.linkedin.com/in/benjags/")} className={cn(
                        "text-6xl text-white hover:text-gray-300 cursor-pointer transition-colors"
                    )}/>
                </div>

            </div>
        </section>
    )
}
