import cn from "../utils/cn.ts"

export default function AboutSection() {
    return (
        <header className={cn(
            "flex flex-col p-6"
        )}>
            <div className={
                "h-full w-3/4 bg-sky-950 text-xl rounded-md"
            }>
                <p className={cn(
                    "font-roboto-condensed",
                    "text-white",

                )}>
                    hello
                </p>
            </div>
        </header>
    )
}
