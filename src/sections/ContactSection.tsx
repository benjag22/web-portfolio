import {useState} from "react";
import {FaGithub, FaLinkedin} from "react-icons/fa";
import {TbCheck, TbCopy, TbFileCv, TbMail} from "react-icons/tb";
import cn from "@/utils/cn";
import {metadata} from "@/metadata";
import SectionTitle from "@/components/SectionTitle";

type ContactSectionProps = {
    id: string;
};

export default function ContactSection({id}: ContactSectionProps) {
    const [copied, setCopied] = useState(false);
    const {email, github, linkedin} = metadata.links;

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.location.href = `mailto:${email}`;
        }
    };

    const secondary = cn(
        "inline-flex items-center gap-2 rounded-full border border-cyan-400/30 px-5 py-2.5",
        "text-cyan-100 transition-colors hover:border-cyan-300 hover:text-white",
    );

    return (
        <section id={id} className="font-roboto-condensed scroll-mt-16 py-20 sm:py-28">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
                <SectionTitle>{"< Contacto />"}</SectionTitle>
                <div className="mt-10 flex flex-wrap gap-8 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-navy to-abyss p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
                    <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 font-semibold text-abyss transition-colors hover:bg-cyan-300"
                    >
                        <TbMail aria-hidden="true" className="text-xl"/> Escribir correo
                    </a>
                    <button type="button" onClick={copyEmail} className={secondary} aria-live="polite">
                        {copied ? <TbCheck aria-hidden="true" className="text-xl"/> :
                            <TbCopy aria-hidden="true" className="text-xl"/>}
                        {copied ? "Correo copiado" : "Copiar correo"}
                    </button>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className={secondary}>
                        <FaLinkedin aria-hidden="true" className="text-xl"/> LinkedIn
                    </a>
                    <a href={github} target="_blank" rel="noopener noreferrer" className={secondary}>
                        <FaGithub aria-hidden="true" className="text-xl"/> GitHub
                    </a>
                    <a href={metadata.cvUrl} download="CV.pdf" target="_blank" rel="noopener noreferrer" className={secondary}>
                        <TbFileCv aria-hidden="true" className="text-xl"/> CV
                    </a>
                </div>
            </div>

            <footer className="mx-auto mt-20 max-w-[1200px] px-4 text-sm text-cyan-100/50 sm:px-8">
                <p className="border-t border-cyan-400/15 pt-6">
                    © {new Date().getFullYear()} {metadata.name}. Hecho con Next.js, Tailwind CSS y Motion.
                </p>
            </footer>
        </section>
    );
}
