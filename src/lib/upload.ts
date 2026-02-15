// src/lib/upload.ts
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

/* ─────────────────── IMAGES ─────────────────── */

const ALLOWED_IMAGES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
  "image/bmp",
]);
const MAX_IMAGE_MB = 10;

export type SaveImageOptions = {
  /** подпапка внутри public (без ведущего /) */
  dir?: string; // default: "uploads"
  /** максимальная ширина при ресайзе (px) */
  maxWidth?: number; // default: 1600
  /** Генерировать OG-версию 1200×630 рядом с основной? */
  generateOg?: boolean;
};

function safeDir(d: string): string {
  return d.replace(/^\/*/, "").replace(/\.\.(\/|\\)/g, "").trim() || "uploads";
}

export async function saveImageFile(
  file: File,
  opts: SaveImageOptions = {},
): Promise<{ src: string; ogSrc?: string; width?: number; height?: number }> {
  const dir = safeDir(opts.dir ?? "uploads");
  const maxWidth = opts.maxWidth ?? 1600;

  if (!ALLOWED_IMAGES.has(file.type)) {
    throw new Error(
      `Недопустимый формат изображения (${file.type}). Разрешены: JPG, PNG, WebP, GIF, AVIF, TIFF, BMP`,
    );
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`Файл слишком большой (>${MAX_IMAGE_MB}MB)`);
  }

  const buf = Buffer.from(await file.arrayBuffer());

  const publicDir = path.join(process.cwd(), "public", dir);
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
  }

  const base = crypto.randomBytes(8).toString("hex");

  // GIF — сохраняем как есть (анимация)
  if (file.type === "image/gif") {
    const filename = `${base}.gif`;
    await writeFile(path.join(publicDir, filename), buf);
    const src = `/${dir}/${filename}`;
    let ogSrc: string | undefined;
    if (opts.generateOg) {
      ogSrc = await generateOgImage(buf, publicDir, base);
    }
    return { src, ogSrc };
  }

  const sharp = (await import("sharp")).default;

  const image = sharp(buf).rotate();
  const meta = await image.metadata();
  const resized =
    meta.width && meta.width > maxWidth ? image.resize({ width: maxWidth }) : image;

  // Конвертируем в WebP
  const webpName = `${base}.webp`;
  const abs = path.join(publicDir, webpName);
  const out = await resized.webp({ quality: 82 }).toBuffer();
  await writeFile(abs, out);

  const dim = await sharp(abs).metadata();
  const src = `/${dir}/${webpName}`;

  // OG-версия (1200×630, cover-кроп)
  let ogSrc: string | undefined;
  if (opts.generateOg) {
    ogSrc = await generateOgImage(buf, publicDir, base);
  }

  return {
    src,
    ogSrc,
    width: dim.width,
    height: dim.height,
  };
}

/**
 * Генерирует OG-картинку 1200×630 из оригинала.
 * Использует cover-кроп чтобы ничего не обрезалось критично.
 */
async function generateOgImage(
  buf: Buffer,
  publicDir: string,
  base: string,
): Promise<string> {
  const sharp = (await import("sharp")).default;
  const ogName = `${base}-og.webp`;
  const ogAbs = path.join(publicDir, ogName);

  await sharp(buf)
    .rotate()
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toFile(ogAbs);

  const dir = path.basename(publicDir);
  return `/uploads/${ogName}`;
}

/**
 * Валидирует пропорции изображения и возвращает предупреждение если нужно.
 * Рекомендуемый формат для обложки: 16:9 (1200×675) или 1.91:1 (1200×630 для OG).
 */
export function checkImageAspectRatio(
  width: number,
  height: number,
): { ok: boolean; warning?: string } {
  const ratio = width / height;

  // Идеал: 1.7–2.0 (между 16:9=1.78 и 1.91:1)
  if (ratio >= 1.6 && ratio <= 2.1) {
    return { ok: true };
  }

  // Квадрат или вертикаль — предупреждаем
  if (ratio < 1.2) {
    return {
      ok: false,
      warning: `Изображение ${width}×${height} слишком узкое/вертикальное. Рекомендуем 1200×630 или 1200×675 (формат 16:9). При отображении часть картинки будет обрезана.`,
    };
  }

  // Слишком широкое
  if (ratio > 2.5) {
    return {
      ok: false,
      warning: `Изображение ${width}×${height} слишком широкое (панорама). Рекомендуем 1200×630 или 1200×675. При отображении часть картинки будет обрезана.`,
    };
  }

  return { ok: true };
}

/* ─────────────────── VIDEO ─────────────────── */

const ALLOWED_VIDEO = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
]);
const MAX_VIDEO_MB = 100;

export type SaveVideoResult = {
  src: string; // путь к .webm / .mp4
  originalType: string;
};

/**
 * Сохраняет видеофайл. MP4 и WebM сохраняются как есть.
 * Остальные форматы тоже сохраняем как есть — конвертация
 * в WebM требует ffmpeg и занимает много времени,
 * лучше делать через фоновый job или рекомендовать MP4/WebM.
 */
export async function saveVideoFile(
  file: File,
  opts: { dir?: string } = {},
): Promise<SaveVideoResult> {
  const dir = safeDir(opts.dir ?? "uploads");

  if (!ALLOWED_VIDEO.has(file.type)) {
    throw new Error(
      `Недопустимый формат видео (${file.type}). Разрешены: MP4, WebM, MOV, AVI, MKV`,
    );
  }
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    throw new Error(`Видео слишком большое (>${MAX_VIDEO_MB}MB)`);
  }

  const buf = Buffer.from(await file.arrayBuffer());

  const publicDir = path.join(process.cwd(), "public", dir);
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
  }

  const base = crypto.randomBytes(8).toString("hex");

  // Определяем расширение
  let ext = "mp4";
  if (file.type === "video/webm") ext = "webm";
  else if (file.type === "video/quicktime") ext = "mov";
  else if (file.type === "video/x-msvideo") ext = "avi";
  else if (file.type === "video/x-matroska") ext = "mkv";

  const filename = `${base}.${ext}`;
  await writeFile(path.join(publicDir, filename), buf);

  return {
    src: `/${dir}/${filename}`,
    originalType: file.type,
  };
}



//---------делаем возможность сохранять видео и изображения в папке public/uploads, чтобы потом показывать их на сайте. Важно: эта функция не должна быть доступна в продакшене, так как может быть использована злоумышленниками для загрузки вредоносных файлов. Поэтому её нужно использовать только в режиме разработки или с дополнительной аутентификацией.
// import { mkdir, writeFile } from "fs/promises";
// import { existsSync } from "fs";
// import path from "path";
// import crypto from "crypto";

// /** Разрешённые MIME-типы */
// const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
// const MAX_MB = 10;

// export type SaveImageOptions = {
//   /** подпапка внутри public (без ведущего /) */
//   dir?: string;        // default: "uploads"
//   /** максимальная ширина при ресайзе (px) */
//   maxWidth?: number;   // default: 1600
// };

// /** простая санитаризация пути папки */
// function safeDir(d: string): string {
//   return d.replace(/^\/*/, "").replace(/\.\.(\/|\\)/g, "").trim() || "uploads";
// }

// export async function saveImageFile(
//   file: File,
//   opts: SaveImageOptions = {}
// ): Promise<{ src: string; width?: number; height?: number }> {
//   const dir = safeDir(opts.dir ?? "uploads");
//   const maxWidth = opts.maxWidth ?? 1600;

//   if (!ALLOWED.has(file.type)) {
//     throw new Error("Недопустимый формат изображения");
//   }
//   if (file.size > MAX_MB * 1024 * 1024) {
//     throw new Error(`Файл слишком большой (>${MAX_MB}MB)`);
//   }

//   const buf = Buffer.from(await file.arrayBuffer());

//   const publicDir = path.join(process.cwd(), "public", dir);
//   if (!existsSync(publicDir)) {
//     await mkdir(publicDir, { recursive: true });
//   }

//   const base = crypto.randomBytes(8).toString("hex");

//   if (file.type === "image/gif") {
//     const filename = `${base}.gif`;
//     await writeFile(path.join(publicDir, filename), buf);
//     return { src: `/${dir}/${filename}` };
//   }

//   // динамический импорт, чтобы модуль не тянулся там, где не нужен
//   const sharp = (await import("sharp")).default;

//   const image = sharp(buf).rotate();
//   const meta = await image.metadata();
//   const resized = meta.width && meta.width > maxWidth ? image.resize({ width: maxWidth }) : image;

//   const webpName = `${base}.webp`;
//   const abs = path.join(publicDir, webpName);
//   const out = await resized.webp({ quality: 82 }).toBuffer();
//   await writeFile(abs, out);

//   const dim = await sharp(abs).metadata();
//   return {
//     src: `/${dir}/${webpName}`,
//     width: dim.width,
//     height: dim.height,
//   };
// }
