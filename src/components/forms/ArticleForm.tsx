"use client";
import { useState } from "react";
import type { ArticleInput } from "@/lib/validators";

// Разрешим как строки, так и Date/null — то, что приходит из Prisma
type InitialArticle = Partial<
  Omit<ArticleInput, "publishedAt" | "expiresAt"> & {
    publishedAt?: string | Date | null;
    expiresAt?: string | Date | null;
    excerpt?: string | null;
    cover?: string | null;
    seoTitle?: string | null;
    seoDesc?: string | null;
    ogTitle?: string | null;
    ogDesc?: string | null;
  }
>;

// ISO/Date -> значение для <input type="datetime-local">
function toDatetimeLocal(value?: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  // YYYY-MM-DDTHH:mm локально
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function ArticleForm({
  initial,
  onSubmit,
}: {
  initial?: InitialArticle;
  onSubmit: (fd: FormData) => Promise<unknown>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [type, setType] = useState<ArticleInput["type"]>(initial?.type ?? "ARTICLE");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [publishedAt, setPublishedAt] = useState<string>(toDatetimeLocal(initial?.publishedAt));
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seoDesc ?? "");

  return (
    <form
      className="space-y-3 max-w-3xl"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData();
        const payload = { title, slug, type, excerpt, cover, body, publishedAt, seoTitle, seoDesc };
        Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v ?? "")));
        await onSubmit(fd);
      }}
    >
      {/* остальной JSX без изменений */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm">Заголовок</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-2xl p-3" />
        </label>
        <label className="block">
          <span className="text-sm">Slug</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border rounded-2xl p-3" placeholder="novaya-akciya" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Тип</span>
        <select value={type} onChange={(e) => setType(e.target.value as ArticleInput["type"])} className="w-full border rounded-2xl p-3">
          <option value="ARTICLE">Новость</option>
          <option value="PROMO">Акция</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Картинка (URL)</span>
        <input value={cover} onChange={(e) => setCover(e.target.value)} className="w-full border rounded-2xl p-3" placeholder="https://..." />
      </label>

      <label className="block">
        <span className="text-sm">Краткое описание</span>
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border rounded-2xl p-3" rows={3} />
      </label>

      <label className="block">
        <span className="text-sm">Текст</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full border rounded-2xl p-3 font-mono" rows={10} />
      </label>

      <label className="block">
        <span className="text-sm">Публикация</span>
        <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="w-full border rounded-2xl p-3" />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm">SEO Title</span>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full border rounded-2xl p-3" />
        </label>
        <label className="block">
          <span className="text-sm">SEO Description</span>
          <input value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className="w-full border rounded-2xl p-3" />
        </label>
      </div>

      <button className="rounded-2xl border px-4 py-2">Сохранить</button>
    </form>
  );
}
