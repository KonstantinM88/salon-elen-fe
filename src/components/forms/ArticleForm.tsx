// src/components/forms/ArticleForm.tsx
"use client";

import * as React from "react";
import type { ActionResult } from "@/app/admin/news/actions";
import type { SeoLocale } from "@/lib/seo-locale";

export type Initial = {
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  cover?: string | null;
  publishedAt?: string | null;
  expiresAt?: string | null;
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  // Закрепление
  isPinned?: boolean;
  sortOrder?: number;
  // Видео
  videoUrl?: string | null;
  videoType?: string | null;
};

type Props = {
  initial?: Initial;
  articleId?: string;
  redirectTo?: string;
  locale?: SeoLocale;
  onSubmit: (fd: FormData) => Promise<ActionResult>;
};

const LIMITS = {
  titleMax: 130,
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
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function generateSlug(title: string): string {
  const translitMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    ä: "ae", ö: "oe", ü: "ue", ß: "ss",
  };
  return title
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

/** Цветовой класс для счётчика символов */
function counterClass(len: number, min: number, max: number): string {
  if (len === 0) return "opacity-70";
  if (len >= min && len <= max) return "text-emerald-400";
  return "text-red-500";
}

type ArticleFormCopy = {
  fileNotSelected: string;
  pinTop: string;
  priority: string;
  priorityHint: string;
  titleLabel: string;
  titlePlaceholder: string;
  slugLabel: string;
  shortDescriptionLabel: string;
  shortDescriptionPlaceholder: string;
  bodyLabel: string;
  bodyPlaceholder: string;
  wordsLabel: string;
  aspectTooNarrow: string;
  aspectTooWide: string;
  coverLabel: string;
  chooseFile: string;
  publishFromLabel: string;
  coverHint: string;
  hideAfterLabel: string;
  coverPreviewTitle: string;
  coverPreviewAlt: string;
  videoSectionTitle: string;
  videoAdded: string;
  uploadVideoLabel: string;
  chooseVideo: string;
  videoFormatHint: string;
  videoOr: string;
  videoLinkLabel: string;
  videoLinkPlaceholder: string;
  videoPreviewTitle: string;
  currentVideoTitle: string;
  seoSectionTitle: string;
  seoFilled: string;
  seoHintTitle: string;
  seoHintText: string;
  seoPreviewTitle: string;
  seoTitleFallback: string;
  seoDescriptionFallback: string;
  seoTitleLabel: string;
  seoDescriptionLabel: string;
  seoTitlePlaceholder: string;
  seoDescriptionPlaceholder: string;
  seoCharsHint: string;
  ogTitleLabel: string;
  ogDescriptionLabel: string;
  ogTitlePlaceholder: string;
  ogDescriptionPlaceholder: string;
  saving: string;
  save: string;
};

const ARTICLE_FORM_COPY: Record<SeoLocale, ArticleFormCopy> = {
  de: {
    fileNotSelected: "Keine Datei gewaehlt",
    pinTop: "📌 Oben anheften",
    priority: "Prioritaet:",
    priorityHint: "hoeher = weiter oben",
    titleLabel: "Titel *",
    titlePlaceholder: "Zum Beispiel: Unser neuer Service...",
    slugLabel: "Slug:",
    shortDescriptionLabel: "Kurzbeschreibung",
    shortDescriptionPlaceholder: "Ein bis zwei Saetze als Teaser...",
    bodyLabel: "Text *",
    bodyPlaceholder: "Haupttext der Veroeffentlichung...",
    wordsLabel: "Woerter:",
    aspectTooNarrow:
      "zu schmal/vertikal. Empfohlen 1200x675 (16:9). Ein Teil des Bildes wird beim Anzeigen beschnitten.",
    aspectTooWide:
      "zu breit (Panorama). Empfohlen 1200x675 (16:9).",
    coverLabel: "Titelbild",
    chooseFile: "Datei auswaehlen",
    publishFromLabel: "Veroeffentlichen ab",
    coverHint:
      "📐 Empfohlenes Titelbild: 1200x675 (16:9) oder 1200x630 (1.91:1 fuer soziale Netzwerke). JPG/PNG/GIF/AVIF/BMP/TIFF wird automatisch in WebP konvertiert.",
    hideAfterLabel: "Ausblenden nach",
    coverPreviewTitle: "Titelbild-Vorschau",
    coverPreviewAlt: "Titelbild-Vorschau",
    videoSectionTitle: "🎬 Video",
    videoAdded: "hinzugefuegt",
    uploadVideoLabel: "Video hochladen",
    chooseVideo: "Video auswaehlen",
    videoFormatHint: "MP4, WebM, MOV - bis 100MB",
    videoOr: "- oder -",
    videoLinkLabel: "YouTube-/Vimeo-Link",
    videoLinkPlaceholder: "https://www.youtube.com/watch?v=...",
    videoPreviewTitle: "Video-Vorschau",
    currentVideoTitle: "Aktuelles Video",
    seoSectionTitle: "🔍 SEO",
    seoFilled: "ausgefuellt",
    seoHintTitle: "SEO-Tipps:",
    seoHintText:
      "Wenn leer, werden normaler Titel und Beschreibung verwendet.",
    seoPreviewTitle: "Google-Vorschau:",
    seoTitleFallback: "News-Titel",
    seoDescriptionFallback:
      "Die Beschreibung wird aus der Kurzbeschreibung uebernommen...",
    seoTitleLabel: "SEO Title",
    seoDescriptionLabel: "SEO Description",
    seoTitlePlaceholder: "SEO-Titel",
    seoDescriptionPlaceholder: "SEO-Beschreibung",
    seoCharsHint: "Zeichen (empfohlen",
    ogTitleLabel: "OG Title",
    ogDescriptionLabel: "OG Description",
    ogTitlePlaceholder: "Titel fuer soziale Netzwerke",
    ogDescriptionPlaceholder: "Beschreibung fuer soziale Netzwerke",
    saving: "Speichern...",
    save: "Speichern",
  },
  ru: {
    fileNotSelected: "Файл не выбран",
    pinTop: "📌 Закрепить наверху",
    priority: "Приоритет:",
    priorityHint: "выше = первее",
    titleLabel: "Заголовок *",
    titlePlaceholder: "Например: Наша новая услуга…",
    slugLabel: "Слаг:",
    shortDescriptionLabel: "Короткое описание",
    shortDescriptionPlaceholder: "Одно-два предложения анонса…",
    bodyLabel: "Текст *",
    bodyPlaceholder: "Основной текст публикации…",
    wordsLabel: "слов:",
    aspectTooNarrow:
      "слишком узкое/вертикальное. Рекомендуем 1200×675 (16:9). Часть картинки будет обрезана при отображении.",
    aspectTooWide:
      "слишком широкое (панорама). Рекомендуем 1200×675 (16:9).",
    coverLabel: "Обложка",
    chooseFile: "Выберите файл",
    publishFromLabel: "Публиковать с",
    coverHint:
      "📐 Рекомендуемый размер обложки: 1200×675 (16:9) или 1200×630 (1.91:1 для соцсетей). Любой формат (JPG, PNG, GIF, AVIF, BMP, TIFF) автоматически конвертируется в WebP.",
    hideAfterLabel: "Скрыть после",
    coverPreviewTitle: "Предпросмотр обложки",
    coverPreviewAlt: "Превью обложки",
    videoSectionTitle: "🎬 Видео",
    videoAdded: "добавлено",
    uploadVideoLabel: "Загрузить видео",
    chooseVideo: "Выберите видео",
    videoFormatHint: "MP4, WebM, MOV — до 100MB",
    videoOr: "— или —",
    videoLinkLabel: "Ссылка YouTube / Vimeo",
    videoLinkPlaceholder: "https://www.youtube.com/watch?v=...",
    videoPreviewTitle: "Предпросмотр видео",
    currentVideoTitle: "Текущее видео",
    seoSectionTitle: "🔍 SEO",
    seoFilled: "заполнено",
    seoHintTitle: "SEO-подсказки:",
    seoHintText:
      "Если оставить пустым — будет использован обычный заголовок и описание.",
    seoPreviewTitle: "Превью в Google:",
    seoTitleFallback: "Заголовок новости",
    seoDescriptionFallback:
      "Описание будет взято из краткого описания новости…",
    seoTitleLabel: "SEO Title",
    seoDescriptionLabel: "SEO Description",
    seoTitlePlaceholder: "SEO заголовок",
    seoDescriptionPlaceholder: "SEO описание",
    seoCharsHint: "символов (рекомендуется",
    ogTitleLabel: "OG Title",
    ogDescriptionLabel: "OG Description",
    ogTitlePlaceholder: "Заголовок для соцсетей",
    ogDescriptionPlaceholder: "Описание для соцсетей",
    saving: "Сохраняем…",
    save: "Сохранить",
  },
  en: {
    fileNotSelected: "No file selected",
    pinTop: "📌 Pin to top",
    priority: "Priority:",
    priorityHint: "higher = first",
    titleLabel: "Title *",
    titlePlaceholder: "For example: Our new service...",
    slugLabel: "Slug:",
    shortDescriptionLabel: "Short description",
    shortDescriptionPlaceholder: "One or two teaser sentences...",
    bodyLabel: "Text *",
    bodyPlaceholder: "Main publication text...",
    wordsLabel: "words:",
    aspectTooNarrow:
      "too narrow/vertical. Recommended 1200x675 (16:9). Part of the image will be cropped.",
    aspectTooWide:
      "too wide (panorama). Recommended 1200x675 (16:9).",
    coverLabel: "Cover",
    chooseFile: "Choose file",
    publishFromLabel: "Publish from",
    coverHint:
      "📐 Recommended cover size: 1200x675 (16:9) or 1200x630 (1.91:1 for social networks). JPG/PNG/GIF/AVIF/BMP/TIFF is automatically converted to WebP.",
    hideAfterLabel: "Hide after",
    coverPreviewTitle: "Cover preview",
    coverPreviewAlt: "Cover preview",
    videoSectionTitle: "🎬 Video",
    videoAdded: "added",
    uploadVideoLabel: "Upload video",
    chooseVideo: "Choose video",
    videoFormatHint: "MP4, WebM, MOV - up to 100MB",
    videoOr: "- or -",
    videoLinkLabel: "YouTube / Vimeo link",
    videoLinkPlaceholder: "https://www.youtube.com/watch?v=...",
    videoPreviewTitle: "Video preview",
    currentVideoTitle: "Current video",
    seoSectionTitle: "🔍 SEO",
    seoFilled: "filled",
    seoHintTitle: "SEO tips:",
    seoHintText: "If left empty, regular title and description will be used.",
    seoPreviewTitle: "Google preview:",
    seoTitleFallback: "News title",
    seoDescriptionFallback:
      "Description will be taken from the short description...",
    seoTitleLabel: "SEO Title",
    seoDescriptionLabel: "SEO Description",
    seoTitlePlaceholder: "SEO title",
    seoDescriptionPlaceholder: "SEO description",
    seoCharsHint: "chars (recommended",
    ogTitleLabel: "OG Title",
    ogDescriptionLabel: "OG Description",
    ogTitlePlaceholder: "Title for social networks",
    ogDescriptionPlaceholder: "Description for social networks",
    saving: "Saving...",
    save: "Save",
  },
};

/* ═══════════════════════════════════════════════════ */

export default function ArticleForm({
  initial,
  articleId,
  redirectTo,
  locale = "de",
  onSubmit,
}: Props) {
  const t = ARTICLE_FORM_COPY[locale];
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  // Основные поля
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [body, setBody] = React.useState(initial?.body ?? "");

  // SEO
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(initial?.seoDescription ?? "");
  const [ogTitle, setOgTitle] = React.useState(initial?.ogTitle ?? "");
  const [ogDescription, setOgDescription] = React.useState(initial?.ogDescription ?? "");
  const [seoOpen, setSeoOpen] = React.useState(
    !!(initial?.seoTitle || initial?.seoDescription || initial?.ogTitle || initial?.ogDescription),
  );

  // Закрепление
  const [isPinned, setIsPinned] = React.useState(initial?.isPinned ?? false);
  const [sortOrder, setSortOrder] = React.useState(initial?.sortOrder ?? 0);

  // Видео
  const [videoUrl, setVideoUrl] = React.useState(initial?.videoUrl ?? "");
  const [videoType, setVideoType] = React.useState(initial?.videoType ?? "");
  const [videoFileLabel, setVideoFileLabel] = React.useState(t.fileNotSelected);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const [videoOpen, setVideoOpen] = React.useState(!!(initial?.videoUrl));

  // Обложка
  const [newFilePreview, setNewFilePreview] = React.useState<string | null>(null);
  const [fileLabel, setFileLabel] = React.useState(t.fileNotSelected);
  const [aspectWarning, setAspectWarning] = React.useState<string | null>(null);
  const currentCover = initial?.cover ?? null;

  const isEditMode = !!articleId;

  React.useEffect(() => {
    return () => {
      if (newFilePreview) URL.revokeObjectURL(newFilePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [newFilePreview, videoPreview]);

  React.useEffect(() => {
    if (!isEditMode && title) setSlug(generateSlug(title));
  }, [title, isEditMode]);

  const wordCount = (s: string) => (s.trim().length ? s.trim().split(/\s+/).length : 0);

  /** Проверяем пропорции при выборе файла */
  function checkAspect(file: File) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio < 1.2) {
        setAspectWarning(
          `${img.width}×${img.height} — ${t.aspectTooNarrow}`,
        );
      } else if (ratio > 2.5) {
        setAspectWarning(
          `${img.width}×${img.height} — ${t.aspectTooWide}`,
        );
      } else {
        setAspectWarning(null);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

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
    } finally {
      setPending(false);
    }
  }

  /* ─────────── стили ─────────── */
  const inputCls =
    "mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/60";
  const labelCls = "text-sm font-medium";

  return (
    <form action={handleSubmit} className="space-y-8">
      {articleId && <input type="hidden" name="id" value={articleId} />}
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="isPinned" value={isPinned ? "on" : ""} />
      <input type="hidden" name="sortOrder" value={sortOrder} />
      <input type="hidden" name="videoUrl" value={videoUrl} />
      <input type="hidden" name="videoType" value={videoType} />

      {serverError && (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
        {/* ═══ Закрепление ═══ */}
        <div className="md:col-span-2 flex flex-wrap items-center gap-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-5 w-5 rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500/60"
            />
            <span className="text-sm font-medium">{t.pinTop}</span>
          </label>

          {isPinned && (
            <div className="flex items-center gap-2">
              <label className="text-sm opacity-70">{t.priority}</label>
              <input
                type="number"
                min={0}
                max={999}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-20 rounded-lg border bg-transparent px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-amber-500/60"
              />
              <span className="text-xs opacity-50">{t.priorityHint}</span>
            </div>
          )}
        </div>

        {/* ═══ Заголовок ═══ */}
        <div className="md:col-span-2">
          <label htmlFor="title" className={labelCls}>{t.titleLabel}</label>
          <input
            id="title" name="title" required maxLength={LIMITS.titleMax}
            value={title} onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder={t.titlePlaceholder}
          />
          {fieldErrors.title && <p className="mt-1 text-xs text-red-500">{fieldErrors.title[0]}</p>}
          <div className="mt-1 flex justify-between text-xs opacity-70">
            <span>{t.slugLabel} <code className="bg-white/10 px-1 rounded">{slug || "—"}</code></span>
            <span>{title.length}/{LIMITS.titleMax}</span>
          </div>
        </div>

        {/* ═══ Анонс ═══ */}
        <div className="md:col-span-2">
          <label htmlFor="excerpt" className={labelCls}>{t.shortDescriptionLabel}</label>
          <textarea
            id="excerpt" name="excerpt" rows={3} maxLength={LIMITS.excerptMax}
            value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            className={inputCls}
            placeholder={t.shortDescriptionPlaceholder}
          />
          {fieldErrors.excerpt && <p className="mt-1 text-xs text-red-500">{fieldErrors.excerpt[0]}</p>}
          <p className="mt-1 text-right text-xs opacity-70">{excerpt.length}/{LIMITS.excerptMax}</p>
        </div>

        {/* ═══ Текст ═══ */}
        <div className="md:col-span-2">
          <label htmlFor="body" className={labelCls}>{t.bodyLabel}</label>
          <textarea
            id="body" name="body" required rows={12}
            value={body} onChange={(e) => setBody(e.target.value)}
            className={inputCls}
            placeholder={t.bodyPlaceholder}
          />
          {fieldErrors.body && <p className="mt-1 text-xs text-red-500">{fieldErrors.body[0]}</p>}
          <p className="mt-1 text-right text-xs opacity-70">{t.wordsLabel} {wordCount(body)}</p>
        </div>

        {/* ═══ Обложка ═══ */}
        <div>
          <label htmlFor="cover" className={labelCls}>{t.coverLabel}</label>
          <div className="mt-1 flex items-center rounded-xl border px-2 h-10">
            <input
              id="cover" name="cover" type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0] ?? null;
                if (!f) {
                  setNewFilePreview(null);
                  setFileLabel(t.fileNotSelected);
                  setAspectWarning(null);
                  return;
                }
                setFileLabel(f.name);
                checkAspect(f);
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
              className="shrink-0 inline-flex items-center rounded-full px-4 py-1.5
                bg-emerald-600 text-white text-sm font-medium cursor-pointer
                hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {t.chooseFile}
            </label>
            <span className="ml-3 truncate text-sm opacity-80">{fileLabel}</span>
          </div>
          {aspectWarning && (
            <p className="mt-1 text-xs text-amber-400">⚠️ {aspectWarning}</p>
          )}
        </div>

        {/* ═══ Публиковать с ═══ */}
        <div>
          <label htmlFor="publishedAt" className={labelCls}>{t.publishFromLabel}</label>
          <input
            id="publishedAt" name="publishedAt" type="datetime-local"
            defaultValue={toLocalDateTimeValue(initial?.publishedAt ?? null)}
            className={inputCls}
          />
          {fieldErrors.publishedAt && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.publishedAt[0]}</p>
          )}
        </div>

        {/* Подсказка по обложке */}
        <div className="md:col-span-2">
          <p className="text-xs opacity-70">{t.coverHint}</p>
        </div>

        {/* Скрыть после */}
        <div>
          <label htmlFor="expiresAt" className={labelCls}>{t.hideAfterLabel}</label>
          <input
            id="expiresAt" name="expiresAt" type="datetime-local"
            defaultValue={toLocalDateTimeValue(initial?.expiresAt ?? null)}
            className={inputCls}
          />
          {fieldErrors.expiresAt && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.expiresAt[0]}</p>
          )}
        </div>

        <div>{/* spacer */}</div>

        {/* Предпросмотр обложки */}
        {(newFilePreview || currentCover) && (
          <div className="md:col-span-2">
            <div className="mt-1 rounded-xl border p-2">
              <div className="mb-2 text-xs opacity-70">{t.coverPreviewTitle}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={newFilePreview ?? currentCover ?? ""}
                alt={t.coverPreviewAlt}
                className="max-h-60 w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        )}

        {/* ═══ Видео (аккордеон) ═══ */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setVideoOpen(!videoOpen)}
            className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors"
          >
            <span className={`transition-transform ${videoOpen ? "rotate-90" : ""}`}>▶</span>
            {t.videoSectionTitle}
            {(videoUrl || initial?.videoUrl) && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                {t.videoAdded}
              </span>
            )}
          </button>

          {videoOpen && (
            <div className="mt-3 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
              {/* Загрузка видеофайла */}
              <div>
                <label htmlFor="videoFile" className={labelCls}>{t.uploadVideoLabel}</label>
                <div className="mt-1 flex items-center rounded-xl border px-2 h-10">
                  <input
                    id="videoFile" name="videoFile" type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0] ?? null;
                      if (!f) {
                        setVideoFileLabel(t.fileNotSelected);
                        setVideoPreview(null);
                        return;
                      }
                      setVideoFileLabel(f.name);
                      setVideoType("UPLOAD");
                      setVideoUrl(""); // очищаем внешнюю ссылку
                      const url = URL.createObjectURL(f);
                      setVideoPreview((prev) => {
                        if (prev) URL.revokeObjectURL(prev);
                        return url;
                      });
                    }}
                    className="sr-only"
                  />
                  <label
                    htmlFor="videoFile"
                    className="shrink-0 inline-flex items-center rounded-full px-4 py-1.5
                      bg-blue-600 text-white text-sm font-medium cursor-pointer
                      hover:bg-blue-700"
                  >
                    {t.chooseVideo}
                  </label>
                  <span className="ml-3 truncate text-sm opacity-80">{videoFileLabel}</span>
                </div>
                <p className="mt-1 text-xs opacity-50">{t.videoFormatHint}</p>
              </div>

              <div className="text-center text-xs opacity-50">{t.videoOr}</div>

              {/* YouTube / Vimeo ссылка */}
              <div>
                <label htmlFor="videoUrlInput" className={labelCls}>{t.videoLinkLabel}</label>
                <input
                  id="videoUrlInput"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    const v = e.target.value;
                    if (v.includes("youtube.com") || v.includes("youtu.be")) {
                      setVideoType("YOUTUBE");
                    } else if (v.includes("vimeo.com")) {
                      setVideoType("VIMEO");
                    } else {
                      setVideoType("");
                    }
                  }}
                  className={inputCls}
                  placeholder={t.videoLinkPlaceholder}
                />
              </div>

              {/* Предпросмотр видео */}
              {videoPreview && (
                <div className="rounded-xl border p-2">
                  <div className="mb-2 text-xs opacity-70">{t.videoPreviewTitle}</div>
                  <video src={videoPreview} controls className="max-h-48 rounded-lg" />
                </div>
              )}
              {initial?.videoUrl && !videoPreview && (
                <div className="rounded-xl border p-2">
                  <div className="mb-2 text-xs opacity-70">{t.currentVideoTitle}</div>
                  {initial.videoType === "UPLOAD" ? (
                    <video src={initial.videoUrl} controls className="max-h-48 rounded-lg" />
                  ) : (
                    <p className="text-sm opacity-70">🔗 {initial.videoUrl}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ SEO (аккордеон) ═══ */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setSeoOpen(!seoOpen)}
            className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors"
          >
            <span className={`transition-transform ${seoOpen ? "rotate-90" : ""}`}>▶</span>
            {t.seoSectionTitle}
            {(seoTitle || seoDescription) && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                {t.seoFilled}
              </span>
            )}
          </button>

          {seoOpen && (
            <div className="mt-3 space-y-6 rounded-xl border border-white/10 bg-white/5 p-4">
              {/* Справка */}
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-xs space-y-1">
                <p className="font-medium text-blue-300">{t.seoHintTitle}</p>
                <p className="opacity-70">{t.seoHintText}</p>
              </div>

              {/* Google Preview */}
              <div className="rounded-lg border border-white/10 p-3">
                <div className="text-xs opacity-50 mb-2">{t.seoPreviewTitle}</div>
                <div className="text-blue-400 text-sm font-medium truncate">
                  {seoTitle || title || t.seoTitleFallback} — Salon Elen
                </div>
                <div className="text-emerald-600 text-xs mt-0.5">
                  permanent-halle.de › news › {slug || "..."}
                </div>
                <div className="text-xs opacity-70 mt-1 line-clamp-2">
                  {seoDescription || excerpt || t.seoDescriptionFallback}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="seoTitle" className={labelCls}>{t.seoTitleLabel}</label>
                  <input
                    id="seoTitle" name="seoTitle"
                    value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                    className={inputCls}
                    placeholder={title ? `${title.slice(0, 50)}…` : t.seoTitlePlaceholder}
                  />
                  <p className={`mt-1 text-right text-xs ${counterClass(seoTitle.length, LIMITS.seoTitleMin, LIMITS.seoTitleMax)}`}>
                    {seoTitle.length} {t.seoCharsHint} {LIMITS.seoTitleMin}–{LIMITS.seoTitleMax})
                  </p>
                </div>

                <div>
                  <label htmlFor="seoDescription" className={labelCls}>{t.seoDescriptionLabel}</label>
                  <input
                    id="seoDescription" name="seoDescription"
                    value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)}
                    className={inputCls}
                    placeholder={excerpt ? `${excerpt.slice(0, 100)}…` : t.seoDescriptionPlaceholder}
                  />
                  <p className={`mt-1 text-right text-xs ${counterClass(seoDescription.length, LIMITS.seoDescMin, LIMITS.seoDescMax)}`}>
                    {seoDescription.length} {t.seoCharsHint} {LIMITS.seoDescMin}–{LIMITS.seoDescMax})
                  </p>
                </div>

                <div>
                  <label htmlFor="ogTitle" className={labelCls}>{t.ogTitleLabel}</label>
                  <input
                    id="ogTitle" name="ogTitle"
                    value={ogTitle} onChange={(e) => setOgTitle(e.target.value)}
                    className={inputCls}
                    placeholder={t.ogTitlePlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="ogDescription" className={labelCls}>{t.ogDescriptionLabel}</label>
                  <input
                    id="ogDescription" name="ogDescription"
                    value={ogDescription} onChange={(e) => setOgDescription(e.target.value)}
                    className={inputCls}
                    placeholder={t.ogDescriptionPlaceholder}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Кнопка-сабмит */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium
            bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? t.saving : t.save}
        </button>
      </div>
    </form>
  );
}



//---------14.02.26 добавляем возможность загружать видео
// // src/components/forms/ArticleForm.tsx
// "use client";

// import * as React from "react";
// import type { ActionResult } from "@/app/admin/news/actions";

// export type Initial = {
//   title?: string;
//   slug?: string;
//   excerpt?: string;
//   body?: string;
//   cover?: string | null;
//   publishedAt?: string | null;
//   expiresAt?: string | null;
//   seoTitle?: string;
//   seoDesc?: string;
//   ogTitle?: string;
//   ogDesc?: string;
// };

// type Props = {
//   initial?: Initial;
//   articleId?: string;
//   redirectTo?: string;
//   onSubmit: (fd: FormData) => Promise<ActionResult>;
// };

// const LIMITS = {
//   titleMax: 120,
//   slugMax: 120,
//   excerptMax: 300,
//   seoTitleMin: 30,
//   seoTitleMax: 60,
//   seoDescMin: 70,
//   seoDescMax: 160,
// };

// function toLocalDateTimeValue(input?: string | null): string {
//   if (!input) return "";
//   const d = new Date(input);
//   if (Number.isNaN(d.getTime())) return input ?? "";
//   // Используем UTC чтобы избежать сдвига часов при редактировании
//   const yyyy = d.getUTCFullYear();
//   const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
//   const dd = String(d.getUTCDate()).padStart(2, "0");
//   const hh = String(d.getUTCHours()).padStart(2, "0");
//   const mi = String(d.getUTCMinutes()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
// }

// /** Транслитерация и генерация слага из заголовка */
// function generateSlug(title: string): string {
//   const translitMap: Record<string, string> = {
//     а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
//     з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
//     п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
//     ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
//     ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss',
//   };
  
//   return title
//     .toLowerCase()
//     .split('')
//     .map(char => translitMap[char] ?? char)
//     .join('')
//     .replace(/[^a-z0-9\s-]/g, '')  // удаляем все кроме латиницы, цифр, пробелов и дефисов
//     .replace(/\s+/g, '-')           // пробелы в дефисы
//     .replace(/-+/g, '-')            // множественные дефисы в один
//     .replace(/^-|-$/g, '')          // убираем дефисы по краям
//     .slice(0, 100);                 // ограничиваем длину
// }

// export default function ArticleForm({
//   initial,
//   articleId,
//   redirectTo,
//   onSubmit,
// }: Props) {
//   const [pending, setPending] = React.useState(false);
//   const [serverError, setServerError] = React.useState<string | null>(null);
//   const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>(
//     {}
//   );

//   // управляемые поля — для счётчиков/подсказок
//   const [title, setTitle] = React.useState(initial?.title ?? "");
//   const [slug, setSlug] = React.useState(initial?.slug ?? "");
//   const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
//   const [body, setBody] = React.useState(initial?.body ?? "");
//   const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
//   const [seoDesc, setSeoDesc] = React.useState(initial?.seoDesc ?? "");
//   const [ogTitle, setOgTitle] = React.useState(initial?.ogTitle ?? "");
//   const [ogDesc, setOgDesc] = React.useState(initial?.ogDesc ?? "");

//   // Режим редактирования - slug не меняется автоматически
//   const isEditMode = !!articleId;

//   // файл + предпросмотр
//   const [newFilePreview, setNewFilePreview] = React.useState<string | null>(
//     null
//   );
//   const [fileLabel, setFileLabel] = React.useState("Файл не выбран");
//   const currentCover = initial?.cover ?? null;

//   React.useEffect(() => {
//     return () => {
//       if (newFilePreview) URL.revokeObjectURL(newFilePreview);
//     };
//   }, [newFilePreview]);

//   // Автогенерация слага при изменении заголовка (только для новых записей)
//   React.useEffect(() => {
//     if (!isEditMode && title) {
//       setSlug(generateSlug(title));
//     }
//   }, [title, isEditMode]);

//   const wordCount = (s: string) =>
//     s.trim().length ? s.trim().split(/\s+/).length : 0;

//   async function handleSubmit(formData: FormData) {
//     setPending(true);
//     setServerError(null);
//     setFieldErrors({});
//     try {
//       const res = await onSubmit(formData);
//       if (!res.ok) {
//         setServerError(res.error);
//         if (res.details?.fieldErrors) setFieldErrors(res.details.fieldErrors);
//       }
//       // успешный редирект выполняется на странице
//     } finally {
//       setPending(false);
//     }
//   }

//   // ⛳ ВАЖНО: НЕ указываем encType/method — их задаёт React/Next для server action
//   return (
//     <form action={handleSubmit} className="space-y-8">
//       {articleId && <input type="hidden" name="id" value={articleId} />}
//       {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
//       {/* Скрытое поле slug - автогенерируется */}
//       <input type="hidden" name="slug" value={slug} />

//       {serverError && (
//         <div
//           role="alert"
//           className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm"
//         >
//           {serverError}
//         </div>
//       )}

//       {/* Сетка 2 колонки, элементы по верху — идеально ровные ряды */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
//         {/* Заголовок */}
//         <div className="md:col-span-2">
//           <label htmlFor="title" className="text-sm font-medium">
//             Заголовок *
//           </label>
//           <input
//             id="title"
//             name="title"
//             required
//             maxLength={LIMITS.titleMax}
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//             placeholder="Например: Наша новая услуга…"
//             title="Обязательное поле. До 120 символов."
//           />
//           {fieldErrors.title && (
//             <p className="mt-1 text-xs text-red-500">{fieldErrors.title[0]}</p>
//           )}
//           <div className="mt-1 flex justify-between text-xs opacity-70">
//             <span>Слаг: <code className="bg-white/10 px-1 rounded">{slug || '—'}</code></span>
//             <span>{title.length}/{LIMITS.titleMax}</span>
//           </div>
//         </div>

//         {/* Анонс */}
//         <div className="md:col-span-2">
//           <label htmlFor="excerpt" className="text-sm font-medium">
//             Короткое описание
//           </label>
//           <textarea
//             id="excerpt"
//             name="excerpt"
//             rows={3}
//             maxLength={LIMITS.excerptMax}
//             value={excerpt}
//             onChange={(e) => setExcerpt(e.target.value)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//             placeholder="Одно-два предложения анонса…"
//             title="Необязательно. До 300 символов."
//           />
//           {fieldErrors.excerpt && (
//             <p className="mt-1 text-xs text-red-500">{fieldErrors.excerpt[0]}</p>
//           )}
//           <p className="mt-1 text-right text-xs opacity-70">
//             {excerpt.length}/{LIMITS.excerptMax}
//           </p>
//         </div>

//         {/* Текст */}
//         <div className="md:col-span-2">
//           <label htmlFor="body" className="text-sm font-medium">
//             Текст *
//           </label>
//           <textarea
//             id="body"
//             name="body"
//             required
//             rows={12}
//             value={body}
//             onChange={(e) => setBody(e.target.value)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//             placeholder="Основной текст публикации…"
//             title="Обязательное поле"
//           />
//           {fieldErrors.body && (
//             <p className="mt-1 text-xs text-red-500">{fieldErrors.body[0]}</p>
//           )}
//           <p className="mt-1 text-right text-xs opacity-70">слов: {wordCount(body)}</p>
//         </div>



// {/* --- Обложка: одинаковая высота с input-ами, кнопка-пилюля --- */}
// <div>
//   <label htmlFor="cover" className="text-sm font-medium">Обложка</label>

//   {/* обёртка — как текстовый инпут: border + та же высота */}
//   <div className="mt-1 flex items-center rounded-xl border px-2 h-10">
//     {/* реальный input — скрыт */}
//     <input
//       id="cover"
//       name="cover"
//       type="file"
//       accept="image/*"
//       onChange={(e) => {
//         const f = e.currentTarget.files?.[0] ?? null;
//         if (!f) {
//           setNewFilePreview(null);
//           setFileLabel("Файл не выбран");
//           return;
//         }
//         setFileLabel(f.name);
//         const url = URL.createObjectURL(f);
//         setNewFilePreview((prev) => {
//           if (prev) URL.revokeObjectURL(prev);
//           return url;
//         });
//       }}
//       className="sr-only"
//     />

//     {/* видимая кнопка — «пилюля»; по высоте подгоняем под h-10 контейнера */}
//     <label
//       htmlFor="cover"
//       className="shrink-0 inline-flex items-center rounded-full px-4 py-1.5
//                  bg-emerald-600 text-white text-sm font-medium
//                  hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
//     >
//       Выберите файл
//     </label>

//     {/* имя файла — чтобы не рвало сетку, ограничиваем и троетим */}
//     <span className="ml-3 truncate text-sm opacity-80">
//       {fileLabel}
//     </span>
//   </div>
// </div>




//         <div>
//           <label htmlFor="publishedAt" className="text-sm font-medium">
//             Публиковать с
//           </label>
//           <input
//             id="publishedAt"
//             name="publishedAt"
//             type="datetime-local"
//             defaultValue={toLocalDateTimeValue(initial?.publishedAt ?? null)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//             title="Если оставить пустым — публикация сразу после сохранения"
//           />
//           {fieldErrors.publishedAt && (
//             <p className="mt-1 text-xs text-red-500">
//               {fieldErrors.publishedAt[0]}
//             </p>
//           )}
//         </div>




//         {/* Подсказка к обложке — отдельной строкой на всю ширину → первая строка ровная */}
//         <div className="md:col-span-2">
//           <p className="text-xs opacity-70">
//             Рекомендация по обложке: 1200×630+, до 10 МБ (JPG/PNG/WEBP/GIF)
//           </p>
//         </div>

//         {/* Скрыть после */}
//         <div>
//           <label htmlFor="expiresAt" className="text-sm font-medium">
//             Скрыть после
//           </label>
//           <input
//             id="expiresAt"
//             name="expiresAt"
//             type="datetime-local"
//             defaultValue={toLocalDateTimeValue(initial?.expiresAt ?? null)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//           />
//           {fieldErrors.expiresAt && (
//             <p className="mt-1 text-xs text-red-500">
//               {fieldErrors.expiresAt[0]}
//             </p>
//           )}
//         </div>

//         {/* Предпросмотр — своей строкой на всю ширину */}
//         {(newFilePreview || currentCover) && (
//           <div className="md:col-span-2">
//             <div className="mt-1 rounded-xl border p-2">
//               <div className="mb-2 text-xs opacity-70">Предпросмотр</div>
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={newFilePreview ?? currentCover ?? ""}
//                 alt="Превью обложки"
//                 className="max-h-60 w-auto rounded-lg object-contain"
//               />
//             </div>
//           </div>
//         )}

//         {/* SEO */}
//         <div>
//           <label htmlFor="seoTitle" className="text-sm font-medium">
//             SEO Title
//           </label>
//           <input
//             id="seoTitle"
//             name="seoTitle"
//             value={seoTitle}
//             onChange={(e) => setSeoTitle(e.target.value)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//           />
//           <p
//             className={`mt-1 text-right text-xs ${
//               seoTitle.length === 0 ||
//               (seoTitle.length >= LIMITS.seoTitleMin &&
//                 seoTitle.length <= LIMITS.seoTitleMax)
//                 ? "opacity-70"
//                 : "text-red-500"
//             }`}
//           >
//             {seoTitle.length} символов (рекомендуется {LIMITS.seoTitleMin}–{LIMITS.seoTitleMax})
//           </p>
//         </div>

//         <div>
//           <label htmlFor="seoDesc" className="text-sm font-medium">
//             SEO Description
//           </label>
//           <input
//             id="seoDesc"
//             name="seoDesc"
//             value={seoDesc}
//             onChange={(e) => setSeoDesc(e.target.value)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//           />
//           <p
//             className={`mt-1 text-right text-xs ${
//               seoDesc.length === 0 ||
//               (seoDesc.length >= LIMITS.seoDescMin &&
//                 seoDesc.length <= LIMITS.seoDescMax)
//                 ? "opacity-70"
//                 : "text-red-500"
//             }`}
//           >
//             {seoDesc.length} символов (рекомендуется {LIMITS.seoDescMin}–{LIMITS.seoDescMax})
//           </p>
//         </div>

//         <div>
//           <label htmlFor="ogTitle" className="text-sm font-medium">
//             OG Title
//           </label>
//           <input
//             id="ogTitle"
//             name="ogTitle"
//             value={ogTitle}
//             onChange={(e) => setOgTitle(e.target.value)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//           />
//         </div>
//         <div>
//           <label htmlFor="ogDesc" className="text-sm font-medium">
//             OG Description
//           </label>
//           <input
//             id="ogDesc"
//             name="ogDesc"
//             value={ogDesc}
//             onChange={(e) => setOgDesc(e.target.value)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//           />
//         </div>
//       </div>

//       {/* Кнопка-сабмит — «пилюля» */}
//       <div className="flex justify-end">
//         <button
//           type="submit"
//           disabled={pending}
//           className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium
//                      bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm
//                      disabled:opacity-60 disabled:cursor-not-allowed"
//         >
//           {pending ? "Сохраняем…" : "Сохранить"}
//         </button>
//       </div>
//     </form>
//   );
// }
