import cn from "../utils/cn"
type NavBarProps = {
    aboutHref: string;
    techHref: string;
    workHref: string;
}

export default function NavBar(props: NavBarProps) {
    return (
        <nav className={cn(
            "sticky top-0 z-10",
            "bg-[#06263b] border-b-2 border-cyan-600 opacity-98",
            "h-16"
        )}>
            <ul className={cn("flex flex-row justify-between items-center h-full text-xl text-cyan-100 px-4")}>
                <li>
                    <a href={props.aboutHref} className={cn("py-3 px-6 cursor-pointer hover:opacity-80")}>
                        About me
                    </a>
                </li>
                <li>
                    <a href={props.techHref} className={cn("py-3 px-6 cursor-pointer hover:opacity-80")}>
                        Tech Stack
                    </a>
                </li>
                <li>
                    <a href={props.workHref} className={cn("py-3 px-6 cursor-pointer hover:opacity-80")}>
                        Work
                    </a>
                </li>
            </ul>
        </nav>
    )
}
