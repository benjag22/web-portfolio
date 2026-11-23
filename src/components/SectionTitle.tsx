import type { ReactNode } from "react";
import cn from "@/utils/cn";

type SectionTitleProps = {
    children: ReactNode;
    as?: "h1" | "h2";
    className?: string;
};

export default function SectionTitle({ children, as: Tag = "h2", className }: SectionTitleProps) {
    return (
        <Tag
            className={cn(
                "font-roboto-condensed inline-block self-start",
                "italic text-3xl text-white sm:text-4xl lg:text-5xl",
                "pb-4 pr-6",
                "border-b-2 border-cyan-600 shadow-md shadow-cyan-800",
                className,
            )}
        >
            {children}
        </Tag>
    );
}
