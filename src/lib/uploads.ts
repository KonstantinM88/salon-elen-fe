import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  const [, sub] = mime.split("/");
  return sub ? `.${sub}` : "";
}

export async function saveImageFile(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = extFromMime(file.type) || path.extname(file.name) || ".bin";
  const name = `${randomBytes(8).toString("hex")}${ext}`;
  const abs = path.join(UPLOAD_DIR, name);

  await writeFile(abs, buf);
  return `/uploads/${name}`; // относительный URL (отдается из public)
}
