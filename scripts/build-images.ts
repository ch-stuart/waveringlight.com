#!/usr/bin/env bun

import sharp from "sharp";
import { readdir, mkdir, rm } from "fs/promises";
import { join, basename, extname } from "path";

const SIZES = [660, 990];
const SRC = "src/images";
const DOCS = "docs/images";

async function main() {
  await rm("docs", { recursive: true, force: true });

  await Promise.all(SIZES.map((s) => mkdir(join(DOCS, String(s)), { recursive: true })));

  const images = (await readdir(SRC)).filter((f) => !f.startsWith("."));
  const uuid = crypto.randomUUID().split('-')[0];

  for (const image of images) {
    const srcPath = join(SRC, image);

    await Promise.all(
      SIZES.flatMap((size) => {
        const stem = basename(image, extname(image));
        const dir = join(DOCS, String(size));
        const resized = sharp(srcPath).rotate().resize(size);
        const filename = `${stem}-${uuid}`;

        return [
          resized.clone().jpeg({ quality: 75 }).toFile(join(dir, `${filename}.jpg`)),
          resized.clone().webp({ quality: 75 }).toFile(join(dir, `${filename}.webp`)),
          resized.clone().avif({ quality: 50 }).toFile(join(dir, `${filename}.avif`)),
        ];
      }),
    );
    console.log(`→ Processed ${image}`);
  }

  console.log(`\nDone. ${images.length} image(s) → ${SIZES.length} sizes each.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
