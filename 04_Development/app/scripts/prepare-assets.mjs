import { readdir } from "node:fs/promises";
import sharp from "sharp";

// Preserve source artwork; only generate smaller delivery copies.
const directory = "public/assets/editorial";
for (const name of await readdir(directory)) {
  if (!name.endsWith(".png")) continue;
  await sharp(`${directory}/${name}`).resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(`${directory}/${name.replace(/\.png$/, ".webp")}`);
}
for (const size of [192, 512, 180]) {
  const name = size === 180 ? "apple-touch-icon" : `icon-${size}`;
  await sharp("public/icons/fridge.svg").resize(size, size).png()
    .toFile(`public/icons/${name}.png`);
}
