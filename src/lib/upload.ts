import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

/** Разрешённые mime */
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_MB = 10;

export type SaveImageOptions = {
  /** папка назначения внутри public (без ведущего /) */
  dir?: string; // default: uploads
  /** максимальная ширина ресайза (px). Оригинал сохранится как есть, если меньше */
  maxWidth?: number; // default: 1600
};

export async function saveImageFile(
  file: File,
  opts: SaveImageOptions = {}
): Promise<{ src: string; width?: number; height?: number }> {
  const dir = opts.dir ?? "uploads";
  const maxWidth = opts.maxWidth ?? 1600;

  if (!ALLOWED.has(file.type)) {
    throw new Error("Недопустимый формат изображения");
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`Файл слишком большой (>${MAX_MB}MB)`);
  }

  const buf = Buffer.from(await file.arrayBuffer());

  const publicDir = path.join(process.cwd(), "public", dir);
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
  }

  // генерим имя
  const base = crypto.randomBytes(8).toString("hex");
  // исходник приведём к webp (легче весит); если gif — оставим gif
  const isGif = file.type === "image/gif";

  if (isGif) {
    const filename = `${base}.gif`;
    const abs = path.join(publicDir, filename);
    await writeFile(abs, buf);
    return { src: `/${dir}/${filename}` };
  }

  // обрабатываем sharp: ресайз до maxWidth, сохраняем webp
  const image = sharp(buf).rotate();
  const meta = await image.metadata();
  const resized =
    meta.width && meta.width > maxWidth ? image.resize({ width: maxWidth }) : image;

  const webpName = `${base}.webp`;
  const abs = path.join(publicDir, webpName);
  const out = await resized.webp({ quality: 82 }).toBuffer();
  await writeFile(abs, out);

  const dim = await sharp(abs).metadata();
  return {
    src: `/${dir}/${webpName}`,
    width: dim.width,
    height: dim.height,
  };
}
