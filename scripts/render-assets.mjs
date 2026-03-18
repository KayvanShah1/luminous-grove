import { chromium } from "@playwright/test";
import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const ogSvgPath = path.join(root, "public", "og-image.svg");
const iconSvgPath = path.join(root, "public", "icon.svg");

const ogSvg = await fs.readFile(ogSvgPath, "utf8");
const iconSvg = await fs.readFile(iconSvgPath, "utf8");

const targets = [
  {
    name: "og-image.png",
    svg: ogSvg,
    width: 1200,
    height: 630,
  },
  {
    name: "apple-touch-icon.png",
    svg: iconSvg,
    width: 180,
    height: 180,
  },
  {
    name: "favicon-32x32.png",
    svg: iconSvg,
    width: 32,
    height: 32,
  },
  {
    name: "favicon-16x16.png",
    svg: iconSvg,
    width: 16,
    height: 16,
  },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const target of targets) {
  await page.setViewportSize({ width: target.width, height: target.height });
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
      svg { width: 100%; height: 100%; display: block; }
    </style>
    </head><body>${target.svg}</body></html>`,
    { waitUntil: "load" }
  );
  const outPath = path.join(root, "public", target.name);
  await page.screenshot({ path: outPath, type: "png" });
  console.log(`Wrote ${outPath}`);
}

await browser.close();
