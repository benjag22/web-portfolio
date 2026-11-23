import cn from "@/utils/cn";
import { techIcons, type TechName } from "@/data/techIcons";

type StackCardProps = {
    title: string;
    items: TechName[];
    className?: string;
};

export default function StackCard({ title, items, className }: StackCardProps) {

    function renderTech(name: TechName) {
        const { icon: Icon, color } = techIcons[name];
        return (
            <div className="flex h-full flex-col items-center justify-center p-4 rounded-lg bg-panel shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300">
                <Icon aria-hidden="true" className="text-5xl" style={{ color }} />
                <span className="mt-2 text-center text-sm text-cyan-100">{name}</span>
            </div>
        );
    }

    return (
        <div className={cn("bg-navy w-full p-6 rounded-xl shadow-lg flex flex-col items-center", className)}>
            <h3 className="text-cyan-400 text-3xl font-semibold italic mb-8 text-center relative inline-block before:absolute before:inset-0 before:blur-md before:bg-cyan-400 before:opacity-30">
                {title}
            </h3>

            <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
                {items.map((name) => (
                    <li key={name}>{renderTech(name)}</li>
                ))}
            </ul>
        </div>
    );
}
