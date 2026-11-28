import { useRef, useState } from "react";
import cn from "@/utils/cn";
import { projects } from "@/data/projects";
import SectionTitle from "@/components/SectionTitle";
import ProjectBubbles, { type BubbleOrigin, type ProjectBubblesApi } from "@/components/projects/ProjectBubbles";
import ProjectPreview from "@/components/projects/ProjectPreview";

type WorkSectionProps = {
    id: string
}

type PreviewState = {
    index: number;
    origin: BubbleOrigin;
};

export default function WorkSection(props: WorkSectionProps) {
    const bubblesApi = useRef<ProjectBubblesApi>(null);
    const [preview, setPreview] = useState<PreviewState | null>(null);

    const open = (index: number, origin: BubbleOrigin) => {
        setPreview({ index, origin });
    };

    const returnOrigin = () => {
        if (!preview) return null;
        return bubblesApi.current?.getOrigin(projects[preview.index].id) ?? null;
    };

    const closed = () => {
        if (!preview) return;
        const id = projects[preview.index].id;
        setPreview(null);
        bubblesApi.current?.focus(id);
    };

    return (
        <section id={props.id} className={cn(
            "font-roboto-condensed scroll-mt-16",
            "py-20 sm:py-28",
        )}>
            <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
                <SectionTitle>{"< Proyectos />"}</SectionTitle>
                <p className="mt-6 text-lg leading-relaxed text-cyan-100/80">
                    Proyectos con clientes reales en los que he trabajado que actualmente se encuentren en producción.
                </p>

                <ProjectBubbles
                    className="mt-10"
                    projects={projects}
                    apiRef={bubblesApi}
                    paused={preview !== null}
                    onOpen={open}
                />
            </div>

            {preview && (
                <ProjectPreview
                    projects={projects}
                    index={preview.index}
                    origin={preview.origin}
                    getReturnOrigin={returnOrigin}
                    onNavigate={(index) => setPreview((current) => (current ? { ...current, index } : current))}
                    onClosed={closed}
                />
            )}
        </section>
    )
}
