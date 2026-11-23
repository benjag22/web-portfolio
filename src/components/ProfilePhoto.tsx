import { useState } from "react";
import cn from "../utils/cn";
import bubbleStyles from "./projects/ProjectBubbles.module.css";

type ProfilePhotoProps = {
    src: string;
    alt: string;
    initials: string;
    className?: string;
};

export default function ProfilePhoto({ src, alt, initials, className }: ProfilePhotoProps) {
    const [failed, setFailed] = useState(false);

    return (
        <div className={cn("relative aspect-square w-full max-w-[320px]", className)}>
            <div aria-hidden="true" className="absolute -inset-6 rounded-full bg-cyan-500/10 blur-2xl" />

            <div className={cn(bubbleStyles.glass, "relative h-full w-full overflow-hidden")}>
                {failed ? (
                    <div
                        role="img"
                        aria-label={alt}
                        className="grid h-full w-full place-items-center text-7xl font-semibold italic text-cyan-100 [text-shadow:0_0_24px_rgba(34,211,238,0.5)]"
                    >
                        {initials}
                    </div>
                ) : (
                    <img
                        src={src}
                        alt={alt}
                        onError={() => setFailed(true)}
                        className="h-full w-full rounded-full object-cover p-1.5"
                    />
                )}
            </div>
        </div>
    );
}
