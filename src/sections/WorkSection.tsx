import cn from "../utils/cn"
type WorkSectionProps = {
    id: string
}
export default function WorkSection(props: WorkSectionProps) {

    return (
        <section id= {props.id} className={cn(
            "font-roboto-condensed",
            "h-screen",
            "flex flex-col"
        )}>
            <div className={cn(
                "h-full w-full bg-[#010621] text-xl",
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
