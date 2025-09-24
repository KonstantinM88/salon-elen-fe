"use client";

import { useMemo, useState, FormEvent, ChangeEvent } from "react";
import type { ArticleInput } from "@/lib/validators";

/** ----- Строгие типы результата server action ----- */
type FieldErrors = Record<string, string[]>;
type ActionFail = { ok: false; error: string; details?: { fieldErrors?: FieldErrors } };
type ActionOk   = { ok: true; id?: string };
type ActionResult = ActionOk | ActionFail;

/** Значения из Prisma (Date|null) и строки из формы */
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

/** ISO/Date -> для <input type="datetime-local"> */
function toDatetimeLocal(value?: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

/** простое slugify */
function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** утилита классов */
function cx(...v: Array<string | false | undefined>) {
  return v.filter(Boolean).join(" ");
}

export default function ArticleForm({
  initial,
  onSubmit,
  redirectTo = "/admin/news",
}: {
  initial?: InitialArticle;
  onSubmit: (fd: FormData) => Promise<ActionResult>;
  redirectTo?: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [type, setType] = useState<ArticleInput["type"]>(initial?.type ?? "ARTICLE");
  const [coverUrl, setCoverUrl] = useState(initial?.cover ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [publishedAt, setPublishedAt] = useState<string>(toDatetimeLocal(initial?.publishedAt));
  const [expiresAt, setExpiresAt] = useState<string>(toDatetimeLocal(initial?.expiresAt));
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seoDesc ?? "");

  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const liveSlug = useMemo(() => (slug ? slug : slugify(title)), [slug, title]);

  const coverPreview = useMemo(() => {
    if (coverFile) return URL.createObjectURL(coverFile);
    return coverUrl || "";
  }, [coverFile, coverUrl]);

  const err = (name: string) => fieldErrors?.[name]?.[0];

  // подготовим ARIA-пропсы как объекты со строковыми значениями
  const aria = {
    title: (msg?: string) =>
      msg ? ({ "aria-invalid": "true" as const, "aria-describedby": "err-title" } as const) : {},
    slug: (msg?: string) =>
      msg ? ({ "aria-invalid": "true" as const, "aria-describedby": "err-slug" } as const) : {},
    body: (msg?: string) =>
      msg ? ({ "aria-invalid": "true" as const, "aria-describedby": "err-body" } as const) : {},
    cover: (msg?: string) =>
      msg ? ({ "aria-invalid": "true" as const, "aria-describedby": "err-cover" } as const) : {},
    publishedAt: (msg?: string) =>
      msg ? ({ "aria-invalid": "true" as const, "aria-describedby": "err-pub" } as const) : {},
    expiresAt: (msg?: string) =>
      msg ? ({ "aria-invalid": "true" as const, "aria-describedby": "err-exp" } as const) : {},
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrorMsg(null);
    setFieldErrors({});

    const fd = new FormData();
    const payload = {
      title,
      slug: liveSlug,
      type,
      cover: coverUrl, // файл (если есть) перезапишет на сервере
      excerpt,
      body,
      publishedAt,
      expiresAt,
      seoTitle,
      seoDesc,
    };

    (Object.entries(payload) as [keyof typeof payload, string | ArticleInput["type"]][]).forEach(
      ([k, v]) => fd.append(String(k), String(v ?? ""))
    );
    if (coverFile) fd.append("coverFile", coverFile);

    try {
      const res = await onSubmit(fd);
      if (res.ok) {
        window.location.href = redirectTo;
      } else {
        setErrorMsg(res.error);
        if (res.details?.fieldErrors) setFieldErrors(res.details.fieldErrors);
        setPending(false);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Неизвестная ошибка");
      setPending(false);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0] ?? null;
    setCoverFile(file);
  }

  const titleErr = err("title");
  const slugErr = err("slug");
  const bodyErr = err("body");
  const coverErr = err("cover");
  const pubErr = err("publishedAt");
  const expErr = err("expiresAt");

  return (
    <form className="space-y-4 max-w-3xl" onSubmit={handleSubmit} noValidate>
      {/* Заголовок + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm">Заголовок</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cx("mt-1 w-full border rounded-2xl p-3", !!titleErr && "border-red-500")}
            required
            placeholder="Например: Новая акция сентября"
            {...aria.title(titleErr)}
          />
          <p className="mt-1 text-xs opacity-60">Минимум 2 символа.</p>
          {titleErr && (
            <p id="err-title" className="text-xs text-red-500 mt-1">
              {titleErr}
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-sm">Slug</span>
          <input
            value={liveSlug}
            onChange={(e) => setSlug(e.target.value)}
            className={cx("mt-1 w-full border rounded-2xl p-3", !!slugErr && "border-red-500")}
            required
            placeholder="novaya-akciya"
            {...aria.slug(slugErr)}
          />
          <p className="mt-1 text-xs opacity-60">
            Только латиница, цифры и дефисы (<code>^[a-z0-9-]+$</code>).
          </p>
          {slugErr && (
            <p id="err-slug" className="text-xs text-red-500 mt-1">
              {slugErr}
            </p>
          )}
        </label>
      </div>

      {/* Тип */}
      <label className="block">
        <span className="text-sm">Тип</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ArticleInput["type"])}
          className="mt-1 w-full border rounded-2xl p-3"
        >
          <option value="ARTICLE">Новость</option>
          <option value="PROMO">Акция</option>
        </select>
      </label>

      {/* Обложка: URL + файл */}
      <label className="block">
        <span className="text-sm">Обложка</span>
        <div className="mt-1 grid gap-3 md:grid-cols-[1fr,260px]">
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className={cx("w-full border rounded-2xl p-3", !!coverErr && "border-red-500")}
            placeholder="URL (необязательно — можно загрузить файл)"
            {...aria.cover(coverErr)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="w-full border rounded-2xl p-2"
          />
        </div>
        <p className="mt-1 text-xs opacity-60">
          Можно указать URL или выбрать файл. Файл будет загружен и использован вместо URL.
        </p>
        {coverErr && (
          <p id="err-cover" className="text-xs text-red-500 mt-1">
            {coverErr}
          </p>
        )}
        {coverPreview && (
          <div className="mt-3 relative aspect-[16/9] overflow-hidden rounded-xl border">
            <img src={coverPreview} alt="Превью" className="h-full w-full object-cover" />
          </div>
        )}
      </label>

      {/* Краткое описание */}
      <label className="block">
        <span className="text-sm">Краткое описание</span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="mt-1 w-full border rounded-2xl p-3"
          rows={3}
        />
      </label>

      {/* Текст */}
      <label className="block">
        <span className="text-sm">Текст</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={cx("mt-1 w-full border rounded-2xl p-3 font-mono", !!bodyErr && "border-red-500")}
          rows={10}
          required
          placeholder="Основной текст публикации"
          {...aria.body(bodyErr)}
        />
        <p className="mt-1 text-xs opacity-60">Минимум 10 символов.</p>
        {bodyErr && (
          <p id="err-body" className="text-xs text-red-500 mt-1">
            {bodyErr}
          </p>
        )}
      </label>

      {/* Даты */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm">Публикация</span>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={cx("mt-1 w-full border rounded-2xl p-3", !!pubErr && "border-red-500")}
            {...aria.publishedAt(pubErr)}
          />
          <p className="mt-1 text-xs opacity-60">
            Формат <code>YYYY-MM-DDTHH:mm</code> или оставьте пустым.
          </p>
          {pubErr && (
            <p id="err-pub" className="text-xs text-red-500 mt-1">
              {pubErr}
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-sm">Срок действия (до)</span>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={cx("mt-1 w-full border rounded-2xl p-3", !!expErr && "border-red-500")}
            {...aria.expiresAt(expErr)}
          />
          <p className="mt-1 text-xs opacity-60">
            Формат <code>YYYY-MM-DDTHH:mm</code> или оставьте пустым.
          </p>
          {expErr && (
            <p id="err-exp" className="text-xs text-red-500 mt-1">
              {expErr}
            </p>
          )}
        </label>
      </div>

      {/* SEO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm">SEO Title</span>
          <input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="mt-1 w-full border rounded-2xl p-3"
          />
        </label>
        <label className="block">
          <span className="text-sm">SEO Description</span>
          <input
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            className="mt-1 w-full border rounded-2xl p-3"
          />
        </label>
      </div>

      {/* Общая ошибка (например, дубликат slug) */}
      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <div className="flex items-center gap-3">
        <button className="rounded-2xl border px-4 py-2 disabled:opacity-60" disabled={pending}>
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
        <span className="text-xs opacity-60">После сохранения произойдёт переход к списку</span>
      </div>
    </form>
  );
}
