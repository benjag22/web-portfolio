import cn from "../utils/cn"
type TechSectionProps = {
    id: string
}
export default function TechSection(props: TechSectionProps) {
    return (
        <section id= {props.id} className={cn(
            "font-roboto-condensed",
            "h-screen",
            "flex flex-col my-6"
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

            </div>
        </section>
    )
}
