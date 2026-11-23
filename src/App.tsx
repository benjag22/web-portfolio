import AboutSection from "./sections/AboutSection.tsx";
import TechSection from "./sections/TechSections.tsx"
import WorkSection from "./sections/WorkSection.tsx";
import ContactSection from "./sections/ContactSection.tsx";
import NavBar from "./components/NavBar.tsx";

function App() {
    const sectionsIds = {
        aboutSection: "about",
        techSection: "tech",
        workSection: "work",
        contactSection: "contact",
    }

    return (
        <>
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

export default App
