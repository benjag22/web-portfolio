import cn from "../utils/cn"

export default function NavBar() {
    return (
        <nav className={cn(
            "sticky top-0 z-10",
            "bg-gradient-to-b from-sky-950 to-[#70b0a8]",
            "h-16"
        )}>
            <ul className={cn("flex flex-row justify-between items-center h-full text-xl px-4")}>
                <li>
                    <p className={cn("py-3 px-6 cursor-pointer hover:opacity-80")}>
                        About me
                    </p>
                </li>
                <li>
                    <p className={cn("py-3 px-6 cursor-pointer hover:opacity-80")}>
                        Tech Stack
                    </p>
                </li>
                <li>
                    <p className={cn("py-3 px-6 cursor-pointer hover:opacity-80")}>
                        Work
                    </p>
                </li>
            </ul>
        </nav>
    )
}
