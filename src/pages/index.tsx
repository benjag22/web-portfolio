import Head from "next/head";
import NavBar from "@/components/NavBar";
import AboutSection from "@/sections/AboutSection";
import TechSection from "@/sections/TechSections";
import WorkSection from "@/sections/WorkSection";
import ContactSection from "@/sections/ContactSection";

const siteUrl = process.env.NEXT_PUBLIC_URL;

export default function Home() {
    const sectionsIds = {
        aboutSection: "about",
        techSection: "tech",
        workSection: "work",
        contactSection: "contact",
    }

    return (
        <>
            <Head>
                <title>Benjamín González | Desarrollador Full Stack</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta
                    name="description"
                    content="Portafolio de Benjamín González, estudiante de Ingeniería Civil Informática (UdeC) y desarrollador full stack: Next.js, React, Spring Boot, FastAPI, MySQL y PostgreSQL."
                />
                <meta property="og:title" content="Benjamín González | Desarrollador Full Stack" />
                <meta property="og:description" content="Proyectos reales en producción: CapChiCAL, COMPASS, PoCoPI y más." />
                <meta property="og:type" content="website" />
                {siteUrl && <meta property="og:url" content={siteUrl} />}
            </Head>
            <NavBar
                links={[
                    { href: "#" + sectionsIds.aboutSection, label: "Sobre mí" },
                    { href: "#" + sectionsIds.techSection, label: "Tecnologías" },
                    { href: "#" + sectionsIds.workSection, label: "Proyectos" },
                    { href: "#" + sectionsIds.contactSection, label: "Contacto" },
                ]}
            />
            <main>
                <AboutSection id={sectionsIds.aboutSection}/>
                <TechSection id={sectionsIds.techSection}/>
                <WorkSection id={sectionsIds.workSection}/>
                <ContactSection id={sectionsIds.contactSection}/>
            </main>
        </>
    )
}
