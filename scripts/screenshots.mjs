import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { projects } from "../src/data/projects.ts";

const THUMB_SIZE = 560;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const project of projects) {
    if (!project.url) continue;
    await page.goto(project.url, { waitUntil: "networkidle" });
    await page.screenshot({ path: `public/projects/${project.id}.jpg`, type: "jpeg", fullPage: true });
}

await mkdir("public/projects/thumbs", { recursive: true });
for (const project of projects) {
    if (!project.image || !project.thumb) continue;
    const source = await readFile(`public${project.image}`);
    const dataUrl = await page.evaluate(
        async ({ base64, size }) => {
            const blob = await (await fetch(`data:image/jpeg;base64,${base64}`)).blob();
            const img = await createImageBitmap(blob);
            const side = Math.min(img.width, img.height);
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, (img.width - side) / 2, 0, side, side, 0, 0, size, size);
            return canvas.toDataURL("image/webp", 0.8);
        },
        { base64: source.toString("base64"), size: THUMB_SIZE },
    );
    await writeFile(`public${project.thumb}`, Buffer.from(dataUrl.split(",")[1], "base64"));
}

await browser.close();
