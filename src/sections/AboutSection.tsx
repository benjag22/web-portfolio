import cn from "../utils/cn"
import {FaGithub, FaLinkedin} from "react-icons/fa"

export default function AboutSection() {

    const goTo = (path: string) => {
        window.open(path, "_blank", "noopener,noreferrer")
    }

    return (
        <section className={cn(
            "font-roboto-condensed",
            "h-[calc(100vh-4rem)]",
            "flex flex-col p-6"
        )}>
            <div className={cn(
                "h-full w-full bg-sky-950 text-xl rounded-md p-6",
                "flex flex-col justify-center items-center"
            )}>
                <p className={cn(
                    "font-roboto-condensed",
                    "text-white text-center mb-4"
                )}>
                    Hello,
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
