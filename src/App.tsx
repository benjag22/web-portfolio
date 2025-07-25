import AboutSection from "./sections/AboutSection.tsx";
import TechSection from "./sections/TechSections.tsx"
import WorkSection from "./sections/WorkSection.tsx";
import NavBar from "./components/NavBar.tsx";

function App() {
    const sectionsIds = {
        aboutSection: "about",
        techSection: "tech",
        workSection: "work"
    }
    return (
        <>
            <NavBar
                aboutHref={"#"+sectionsIds.aboutSection}
                techHref={"#"+sectionsIds.techSection}
                workHref={"#"+sectionsIds.workSection}
            />
            <AboutSection id={sectionsIds.aboutSection}/>
            <TechSection id={sectionsIds.techSection}/>
            <WorkSection id={sectionsIds.workSection}/>
        </>
    )
}

export default App
