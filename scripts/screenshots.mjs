import { chromium } from "playwright";
import { projects } from "../src/data/projects.ts";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const project of projects) {
    if (!project.url) continue;
    await page.goto(project.url, { waitUntil: "networkidle" });
    await page.screenshot({ path: `public/projects/${project.id}.jpg`, type: "jpeg", fullPage: true });
}
await browser.close();
