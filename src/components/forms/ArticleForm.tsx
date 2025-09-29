// src/components/forms/ArticleForm.tsx
"use client";

import * as React from "react";
import type { ActionResult } from "@/app/admin/news/actions";

export type Initial = {
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  cover?: string | null;
  publishedAt?: string | null;
  expiresAt?: string | null;
  seoTitle?: string;
  seoDesc?: string;
  ogTitle?: string;
  ogDesc?: string;
};

type Props = {
  initial?: Initial;
  articleId?: string;
  redirectTo?: string;
  onSubmit: (fd: FormData) => Promise<ActionResult>;
};

const LIMITS = {
  titleMax: 120,
  slugMax: 120,
  excerptMax: 300,
  seoTitleMin: 30,
  seoTitleMax: 60,
  seoDescMin: 70,
  seoDescMax: 160,
};

function toLocalDateTimeValue(input?: string | null): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input ?? "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function ArticleForm({
  initial,
  articleId,
  redirectTo,
  onSubmit,
}: Props) {
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>(
    {}
  );

  // управляемые поля — для счётчиков/подсказок
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [body, setBody] = React.useState(initial?.body ?? "");
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = React.useState(initial?.seoDesc ?? "");
  const [ogTitle, setOgTitle] = React.useState(initial?.ogTitle ?? "");
  const [ogDesc, setOgDesc] = React.useState(initial?.ogDesc ?? "");

  // файл + предпросмотр
  const [newFilePreview, setNewFilePreview] = React.useState<string | null>(
    null
  );
  const [fileLabel, setFileLabel] = React.useState("Файл не выбран");
  const currentCover = initial?.cover ?? null;

  React.useEffect(() => {
    return () => {
      if (newFilePreview) URL.revokeObjectURL(newFilePreview);
    };
  }, [newFilePreview]);

  const wordCount = (s: string) =>
    s.trim().length ? s.trim().split(/\s+/).length : 0;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setServerError(null);
    setFieldErrors({});
    try {
      const res = await onSubmit(formData);
      if (!res.ok) {
        setServerError(res.error);
        if (res.details?.fieldErrors) setFieldErrors(res.details.fieldErrors);
      }
      // успешный редирект выполняется на странице
    } finally {
      setPending(false);
    }
  }

  // ⛳ ВАЖНО: НЕ указываем encType/method — их задаёт React/Next для server action
  return (
    <form action={handleSubmit} className="space-y-8">
      {articleId && <input type="hidden" name="id" value={articleId} />}
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm"
        >
          {serverError}
        </div>
      )}

      {/* Сетка 2 колонки, элементы по верху — идеально ровные ряды */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
        {/* Заголовок */}
        <div>
          <label htmlFor="title" className="text-sm font-medium">
            Заголовок *
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={LIMITS.titleMax}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Например: Наша новая услуга…"
            title="Обязательное поле. До 120 символов."
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.title[0]}</p>
          )}
          <p className="mt-1 text-right text-xs opacity-70">
            {title.length}/{LIMITS.titleMax}
          </p>
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="text-sm font-medium">
            Слаг *
          </label>
          <input
            id="slug"
            name="slug"
            required
            maxLength={LIMITS.slugMax}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="naprimer-novaya-usluga"
            pattern="^[a-z0-9-]+$"
            title="Только строчные латинские буквы, цифры и дефисы"
          />
          {fieldErrors.slug && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.slug[0]}</p>
          )}
          <p className="mt-1 text-right text-xs opacity-70">
            {slug.length}/{LIMITS.slugMax}
          </p>
        </div>

        {/* Анонс */}
        <div className="md:col-span-2">
          <label htmlFor="excerpt" className="text-sm font-medium">
            Короткое описание
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            maxLength={LIMITS.excerptMax}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Одно-два предложения анонса…"
            title="Необязательно. До 300 символов."
          />
          {fieldErrors.excerpt && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.excerpt[0]}</p>
          )}
          <p className="mt-1 text-right text-xs opacity-70">
            {excerpt.length}/{LIMITS.excerptMax}
          </p>
        </div>

        {/* Текст */}
        <div className="md:col-span-2">
          <label htmlFor="body" className="text-sm font-medium">
            Текст *
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Основной текст публикации…"
            title="Обязательное поле"
          />
          {fieldErrors.body && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.body[0]}</p>
          )}
          <p className="mt-1 text-right text-xs opacity-70">слов: {wordCount(body)}</p>
        </div>

        {/* --- Ряд: Обложка (слева) + Публиковать с (справа) --- */}
        <div>
          <label className="text-sm font-medium">Обложка</label>
          <div className="mt-1 flex items-center gap-3 rounded-2xl border bg-transparent px-3 py-2">
            <input
              id="cover"
              name="cover"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0] ?? null;
                if (!f) {
                  setNewFilePreview(null);
                  setFileLabel("Файл не выбран");
                  return;
                }
                setFileLabel(f.name);
                const url = URL.createObjectURL(f);
                setNewFilePreview((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return url;
                });
              }}
              className="sr-only"
            />
            <label
              htmlFor="cover"
              className="btn btn-primary rounded-full px-5 py-2"
            >
              Выберите файл
            </label>
            <span className="max-w-[18rem] truncate text-xs opacity-80">
              {fileLabel}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="publishedAt" className="text-sm font-medium">
            Публиковать с
          </label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={toLocalDateTimeValue(initial?.publishedAt ?? null)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            title="Если оставить пустым — публикация сразу после сохранения"
          />
          {fieldErrors.publishedAt && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.publishedAt[0]}
            </p>
          )}
        </div>

        {/* Подсказка к обложке — отдельной строкой на всю ширину → первая строка ровная */}
        <div className="md:col-span-2">
          <p className="text-xs opacity-70">
            Рекомендация по обложке: 1200×630+, до 10 МБ (JPG/PNG/WEBP/GIF)
          </p>
        </div>

        {/* Скрыть после */}
        <div>
          <label htmlFor="expiresAt" className="text-sm font-medium">
            Скрыть после
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            defaultValue={toLocalDateTimeValue(initial?.expiresAt ?? null)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          />
          {fieldErrors.expiresAt && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.expiresAt[0]}
            </p>
          )}
        </div>

        {/* Предпросмотр — своей строкой на всю ширину */}
        {(newFilePreview || currentCover) && (
          <div className="md:col-span-2">
            <div className="mt-1 rounded-xl border p-2">
              <div className="mb-2 text-xs opacity-70">Предпросмотр</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={newFilePreview ?? currentCover ?? ""}
                alt="Превью обложки"
                className="max-h-60 w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        )}

        {/* SEO */}
        <div>
          <label htmlFor="seoTitle" className="text-sm font-medium">
            SEO Title
          </label>
          <input
            id="seoTitle"
            name="seoTitle"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p
            className={`mt-1 text-right text-xs ${
              seoTitle.length === 0 ||
              (seoTitle.length >= LIMITS.seoTitleMin &&
                seoTitle.length <= LIMITS.seoTitleMax)
                ? "opacity-70"
                : "text-red-500"
            }`}
          >
            {seoTitle.length} символов (рекомендуется {LIMITS.seoTitleMin}–{LIMITS.seoTitleMax})
          </p>
        </div>

        <div>
          <label htmlFor="seoDesc" className="text-sm font-medium">
            SEO Description
          </label>
          <input
            id="seoDesc"
            name="seoDesc"
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p
            className={`mt-1 text-right text-xs ${
              seoDesc.length === 0 ||
              (seoDesc.length >= LIMITS.seoDescMin &&
                seoDesc.length <= LIMITS.seoDescMax)
                ? "opacity-70"
                : "text-red-500"
            }`}
          >
            {seoDesc.length} символов (рекомендуется {LIMITS.seoDescMin}–{LIMITS.seoDescMax})
          </p>
        </div>

        <div>
          <label htmlFor="ogTitle" className="text-sm font-medium">
            OG Title
          </label>
          <input
            id="ogTitle"
            name="ogTitle"
            value={ogTitle}
            onChange={(e) => setOgTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="ogDesc" className="text-sm font-medium">
            OG Description
          </label>
          <input
            id="ogDesc"
            name="ogDesc"
            value={ogDesc}
            onChange={(e) => setOgDesc(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Кнопка-сабмит — «пилюля» */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium
                     bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
