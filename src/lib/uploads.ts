import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

/** Разрешённые MIME-типы */
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_MB = 10;

export type SaveImageOptions = {
  /** подпапка внутри public (без ведущего /) */
  dir?: string;        // default: "uploads"
  /** максимальная ширина при ресайзе (px) */
  maxWidth?: number;   // default: 1600
};

/** простая санитаризация пути папки */
function safeDir(d: string): string {
  return d.replace(/^\/*/, "").replace(/\.\.(\/|\\)/g, "").trim() || "uploads";
}

/**
 * Путь к папке uploads
 * Для VPS: можно переопределить через UPLOADS_DIR в .env
 * По умолчанию: ./public/uploads
 */
function getUploadsBasePath(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "public");
}

export async function saveImageFile(
  file: File,
  opts: SaveImageOptions = {}
): Promise<{ src: string; width?: number; height?: number }> {
  const dir = safeDir(opts.dir ?? "uploads");
  const maxWidth = opts.maxWidth ?? 1600;

  if (!ALLOWED.has(file.type)) {
    throw new Error("Недопустимый формат изображения");
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`Файл слишком большой (>${MAX_MB}MB)`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base = crypto.randomBytes(8).toString("hex");
  
  // Путь для сохранения файлов
  const uploadsBase = getUploadsBasePath();
  const publicDir = path.join(uploadsBase, dir);
  
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
  }

  // GIF - сохраняем как есть
  if (file.type === "image/gif") {
    const filename = `${base}.gif`;
    await writeFile(path.join(publicDir, filename), buf);
    return { src: `/${dir}/${filename}` };
  }

  // Остальные форматы - конвертируем в webp
  const sharp = (await import("sharp")).default;

  const image = sharp(buf).rotate();
  const meta = await image.metadata();
  const resized = meta.width && meta.width > maxWidth ? image.resize({ width: maxWidth }) : image;

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




// import { randomBytes } from "crypto";
// import { mkdir, writeFile } from "fs/promises";
// import path from "path";

// const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// function extFromMime(mime: string): string {
//   if (mime === "image/jpeg") return ".jpg";
//   if (mime === "image/png") return ".png";
//   if (mime === "image/webp") return ".webp";
//   const [, sub] = mime.split("/");
//   return sub ? `.${sub}` : "";
// }

// export async function saveImageFile(file: File): Promise<string> {
//   const buf = Buffer.from(await file.arrayBuffer());
//   await mkdir(UPLOAD_DIR, { recursive: true });

//   const ext = extFromMime(file.type) || path.extname(file.name) || ".bin";
//   const name = `${randomBytes(8).toString("hex")}${ext}`;
//   const abs = path.join(UPLOAD_DIR, name);

//   await writeFile(abs, buf);
//   return `/uploads/${name}`; // относительный URL (отдается из public)
// }
