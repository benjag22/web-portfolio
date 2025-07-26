import { SiTypescript, SiNextdotjs } from "react-icons/si";
import { FaReact, FaHtml5, FaCss3Alt } from "react-icons/fa";
import { RiTailwindCssFill } from "react-icons/ri";
import { type ReactNode } from "react";
import cn from "../utils/cn";

type StackCardProps = {
    title: string;
};

type TechIcon = {
    icon: ReactNode;
    name: string;
};

export default function StackCard({ title }: StackCardProps) {
    const techStack: TechIcon[] = [
        { icon: <SiTypescript className="text-[#007acc]" />, name: "TypeScript" },
        { icon: <FaReact className="text-[#6CE6E1]" />, name: "React" },
        { icon: <FaHtml5 className="text-[#F57900]" />, name: "HTML" },
        { icon: <FaCss3Alt className="text-[#0035F5]" />, name: "CSS" },
        { icon: <SiNextdotjs className="text-white" />, name: "Next.js" },
        { icon: <RiTailwindCssFill className="text-[#53C7E0]" />, name: "Tailwind CSS" },
    ];

    function renderTech({ icon, name }: TechIcon) {
        return (
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#0B1741] shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300">
                <div className="text-5xl">{icon}</div>
                <span className="mt-2 text-sm text-cyan-100">{name}</span>
            </div>
        );
    }

    return (
        <div className="bg-[#020A38] w-full max-w-md m-5 p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h1 className="text-cyan-400 text-4xl font-semibold italic mb-8 text-center relative inline-block before:absolute before:inset-0 before:blur-md before:bg-cyan-400 before:opacity-30">
                {title}
            </h1>


            <div className="grid grid-cols-2 gap-4">
                {techStack.map((tech, idx) => (
                    <div key={idx}>{renderTech(tech)}</div>
                ))}
            </div>
        </div>
    );
}
