import path from "path";
import { readdir, stat, unlink } from "fs/promises";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

type Mapping = { from: string; to: string; file: string };

const prisma = new PrismaClient();

const uploadsRoot =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");
const maxWidth = Number(process.env.IMAGE_MAX_WIDTH ?? 1600);
const quality = Number(process.env.IMAGE_WEBP_QUALITY ?? 82);
const dryRun = process.env.DRY_RUN === "1";
const keepOriginals = process.env.KEEP_ORIGINALS === "1";

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
      continue;
    }
    files.push(full);
  }
  return files;
}

function toPublicUrl(filePath: string, baseDir: string, newExt?: string): string {
  const rel = path.relative(baseDir, filePath).replace(/\\/g, "/");
  if (!newExt) return `/${path.join("uploads", rel).replace(/\\/g, "/")}`;
  const parsed = path.parse(rel);
  return `/${path
    .join("uploads", parsed.dir, `${parsed.name}${newExt}`)
    .replace(/\\/g, "/")}`;
}

async function convertToWebp(filePath: string): Promise<string> {
  const dir = path.dirname(filePath);
  const name = path.parse(filePath).name;
  const outPath = path.join(dir, `${name}.webp`);
  const image = sharp(filePath).rotate();
  const meta = await image.metadata();
  const resized =
    meta.width && meta.width > maxWidth
      ? image.resize({ width: maxWidth, withoutEnlargement: true })
      : image;
  await resized.webp({ quality }).toFile(outPath);
  return outPath;
}

async function main() {
  const allFiles = await walk(uploadsRoot);
  const targets = allFiles.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ext === ".png" || ext === ".jpg" || ext === ".jpeg";
  });

  const mappings: Mapping[] = [];

  for (const file of targets) {
    const outPath = path.join(path.dirname(file), `${path.parse(file).name}.webp`);
    const srcUrl = toPublicUrl(file, uploadsRoot);
    const outUrl = toPublicUrl(file, uploadsRoot, ".webp");

    if (!dryRun) {
      let shouldConvert = true;
      try {
        const srcStat = await stat(file);
        const outStat = await stat(outPath);
        if (outStat.mtimeMs >= srcStat.mtimeMs && outStat.size > 0) {
          shouldConvert = false;
        }
      } catch {
        // webp doesn't exist yet
      }

      if (shouldConvert) {
        await convertToWebp(file);
      }
    }

    mappings.push({ from: srcUrl, to: outUrl, file });
  }

  if (mappings.length === 0) {
    console.log("No PNG/JPG files found in uploads.");
    return;
  }

  if (dryRun) {
    console.log(`DRY_RUN=1. Files to convert: ${mappings.length}`);
    return;
  }

  let updated = 0;
  for (const map of mappings) {
    const serviceRes = await prisma.service.updateMany({
      where: { cover: map.from },
      data: { cover: map.to },
    });
    const galleryRes = await prisma.serviceGallery.updateMany({
      where: { image: map.from },
      data: { image: map.to },
    });
    const articleRes = await prisma.article.updateMany({
      where: { cover: map.from },
      data: { cover: map.to },
    });
    const masterRes = await prisma.master.updateMany({
      where: { avatarUrl: map.from },
      data: { avatarUrl: map.to },
    });

    updated +=
      serviceRes.count + galleryRes.count + articleRes.count + masterRes.count;

    const remainingService = await prisma.service.count({
      where: { cover: map.from },
    });
    const remainingGallery = await prisma.serviceGallery.count({
      where: { image: map.from },
    });
    const remainingArticle = await prisma.article.count({
      where: { cover: map.from },
    });
    const remainingMaster = await prisma.master.count({
      where: { avatarUrl: map.from },
    });

    const remaining =
      remainingService + remainingGallery + remainingArticle + remainingMaster;

    if (remaining === 0 && !keepOriginals) {
      try {
        await unlink(map.file);
      } catch (err) {
        console.warn(`Failed to delete ${map.file}:`, err);
      }
    }
  }

  console.log(`Converted images: ${mappings.length}`);
  console.log(`Updated DB rows: ${updated}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
