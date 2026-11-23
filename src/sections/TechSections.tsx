import cn from "../utils/cn"
import StackCard from "../components/StackCard.tsx";
import SectionTitle from "../components/SectionTitle.tsx";
import { stackGroups } from "../data/stack.ts";

type TechSectionProps = {
    id: string
}

export default function TechSection(props: TechSectionProps) {
    return (
        <section id={props.id} className={cn(
            "font-roboto-condensed scroll-mt-16",
            "py-20 sm:py-28",
        )}>
            <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
                <SectionTitle>{"< Tecnologías />"}</SectionTitle>
                <p className="mt-6 max-w-prose text-lg leading-relaxed text-cyan-100/80">
                    Las herramientas que uso en mis proyectos, desde el modelo de datos hasta el despliegue.
                </p>

                <div className={cn("mt-10 grid grid-cols-1 gap-6 md:grid-cols-2")}>
                    {stackGroups.map((group) => (
                        <StackCard key={group.title} title={group.title} items={group.items} />
                    ))}
                </div>
            </div>
        </section>
    )
}
