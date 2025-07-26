import cn from "../utils/cn"
import StackCard from "../components/StackCard.tsx";
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
                "h-full w-full bg-[#010621] text-xl",
                "flex flex-col justify-center items-center"
            )}>
                <p className={cn(
                    "font-roboto-condensed",
                    "text-white text-center mb-4"
                )}>
                    Hello, {props.id}
                </p>
                <div className={cn("flex flex-col w-4/5 h-full")}>
                    <div className={cn("flex flex-row")}>
                        <StackCard title={"Frontend"}/>
                        <StackCard title={"Frontend"}/>
                    </div>
                    <div className={cn("flex flex-row")}>
                        <StackCard title={"Frontend"}/>
                        <StackCard title={"Frontend"}/>
                    </div>
                </div>


            </div>
        </section>
    )
}
