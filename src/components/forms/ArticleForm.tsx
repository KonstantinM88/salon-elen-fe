"use client";

import Image from "next/image";
import { useMemo, useRef, useState, FormEvent, ChangeEvent } from "react";
import { z } from "zod";
import { articleInput } from "@/lib/validators";
type ArticleInput = z.infer<typeof articleInput>;

type FieldErrors = Record<string, string[]>;
type ActionFail = { ok: false; error: string; details?: { fieldErrors?: FieldErrors } };
type ActionOk = { ok: true; id?: string };
type ActionResult = ActionOk | ActionFail;

type InitialArticle = Partial<
  Omit<ArticleInput, "publishedAt" | "expiresAt"> & {
    publishedAt?: string | Date | null;
    expiresAt?: string | Date | null;
  }
>;

type Props = {
  initial?: InitialArticle;
  articleId?: string;
  onSubmit: (fd: FormData) => Promise<ActionResult>;
  redirectTo?: string;
};

const TITLE_MIN = 3;
const TITLE_MAX = 80;
const SLUG_MIN = 3;
const SLUG_MAX = 60;
const EXCERPT_MAX = 200;
const BODY_MIN = 50;
const BODY_MAX = 5000;

function countWords(s: string): number {
  const m = s.match(/[\p{L}\p{N}]+/gu);
  return m ? m.length : 0;
}

/** dd.MM.yyyy HH:mm */
function formatRu(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** DD.MM.YYYY HH:mm | YYYY-MM-DD[ T]HH:mm | ISO */
function parseDateFlexible(value: string): Date | null {
  const v = value.trim();
  if (!v) return null;

  const ru = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/;
  const mRu = v.match(ru);
  if (mRu) {
    const [, dd, mm, yyyy, HH = "00", MM = "00"] = mRu;
    const d = new Date(`${yyyy}-${mm}-${dd}T${HH}:${MM}:00Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const ymd = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?$/;
  const mYmd = v.match(ymd);
  if (mYmd) {
    const [, yyyy, mm, dd, HH = "00", MM = "00"] = mYmd;
    const d = new Date(`${yyyy}-${mm}-${dd}T${HH}:${MM}:00Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toRuInput(value?: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "" : formatRu(d);
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}

function isSlugValid(s: string): boolean {
  if (s.length < SLUG_MIN || s.length > SLUG_MAX) return false;
  return /^[\p{L}\p{N}-]+$/u.test(s);
}

export default function ArticleForm({
  initial,
  articleId,
  onSubmit,
  redirectTo = "/admin/news",
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [type, setType] = useState<ArticleInput["type"]>(initial?.type ?? "ARTICLE");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");

  // ВАЖНО: если initial нет (создание) — ставим publishedAt = сейчас
  const defaultPublished = initial?.publishedAt ?? new Date();
  const [publishedAt, setPublishedAt] = useState<string>(toRuInput(defaultPublished));
  const [expiresAt, setExpiresAt] = useState<string>(toRuInput(initial?.expiresAt));

  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seoDesc ?? "");
  const [ogTitle, setOgTitle] = useState(initial?.ogTitle ?? "");
  const [ogDesc, setOgDesc] = useState(initial?.ogDesc ?? "");

  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [rawDetails, setRawDetails] = useState<unknown>(null);

  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : ""), [coverFile]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const titleErr = fieldErrors.title?.[0];
  const slugErr = fieldErrors.slug?.[0];
  const bodyErr = fieldErrors.body?.[0];
  const coverErr = fieldErrors.cover?.[0];

  const titleLen = title.length;
  const titleBad = titleLen > 0 && (titleLen < TITLE_MIN || titleLen > TITLE_MAX);
  const titleWords = countWords(title);

  const slugLen = slug.length;
  const slugBad = slugLen > 0 && !isSlugValid(slug);

  const excerptLen = excerpt.length;
  const excerptBad = excerptLen > EXCERPT_MAX;
  const excerptWords = countWords(excerpt);

  const bodyLen = body.length;
  const bodyBad = bodyLen > 0 && (bodyLen < BODY_MIN || bodyLen > BODY_MAX);
  const bodyWords = countWords(body);

  function onChangeCoverFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setCoverFile(f ?? null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrorMsg(null);
    setFieldErrors({});
    setRawDetails(null);

    try {
      const fd = new FormData(e.currentTarget);
      if (articleId) fd.set("id", articleId);
      if (!fd.has("cover")) fd.set("cover", "");

      // строки → ISO (или удалить поле)
      const pubDate = parseDateFlexible(publishedAt.trim());
      if (pubDate) fd.set("publishedAt", pubDate.toISOString());
      else fd.delete("publishedAt");

      const expDate = parseDateFlexible(expiresAt.trim());
      if (expDate) fd.set("expiresAt", expDate.toISOString());
      else fd.delete("expiresAt");

      const res = await onSubmit(fd);

      if (res.ok) {
        window.location.href = redirectTo;
        return;
      }

      setErrorMsg(res.error ?? "Не удалось сохранить");
      const fe = res.details?.fieldErrors ?? {};
      setFieldErrors(fe);
      setRawDetails(res.details ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Неизвестная ошибка при отправке формы";
      setErrorMsg(msg);
      setRawDetails(err);
    } finally {
      setPending(false);
    }
  }

  type AllowedType = ArticleInput["type"];
  const TYPE_OPTIONS: { value: AllowedType; label: string }[] = [
    { value: "ARTICLE", label: "Статья" },
    { value: "NEWS", label: "Новость" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
      {articleId ? <input type="hidden" name="id" value={articleId} /> : null}
      <input type="hidden" name="cover" value="" />

      {errorMsg && (
        <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 text-red-800 px-4 py-3 space-y-2">
          <div className="font-medium">Ошибка: {errorMsg}</div>
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="list-disc pl-5 text-sm">
              {Object.entries(fieldErrors).map(([field, arr]) => {
                const texts = Array.isArray(arr) ? arr : [String(arr ?? "")];
                return (
                  <li key={field}>
                    <span className="font-semibold">{field}:</span> {texts.join("; ")}
                  </li>
                );
              })}
            </ul>
          )}
          {!!rawDetails && (
            <details className="text-xs opacity-80">
              <summary className="cursor-pointer">Показать подробности для разработчика</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">{JSON.stringify(rawDetails, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      {/* Заголовок */}
      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm">Заголовок</span>
          <span className="text-xs opacity-70">
            {titleLen}/{TITLE_MAX} символов • {titleWords} слов (мин. {TITLE_MIN})
          </span>
        </div>
        <input
          name="title"
          value={title}
          onChange={(e) => {
            const v = e.target.value;
            setTitle(v);
            if (!initial?.slug) setSlug(slugify(v));
          }}
          className={`mt-1 w-full border rounded-2xl p-3 ${titleBad ? "border-red-400" : ""}`}
          placeholder="Коротко и ясно (3–80 символов)"
          {...(titleErr || titleBad ? { "aria-invalid": true as const, "aria-describedby": "err-title" } : {})}
        />
        {(titleErr || titleBad) && (
          <p id="err-title" className="text-xs text-red-500 mt-1">
            {titleErr ?? `Длина заголовка должна быть от ${TITLE_MIN} до ${TITLE_MAX} символов.`}
          </p>
        )}
      </label>

      {/* Слаг */}
      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm">Слаг (URL)</span>
          <span className="text-xs opacity-70">
            {slugLen}/{SLUG_MAX} символов
          </span>
        </div>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onBlur={() => setSlug((s) => slugify(s))}
          className={`mt-1 w-full border rounded-2xl p-3 ${slugBad ? "border-red-400" : ""}`}
          placeholder="tolko-latinica-цифры-и-дефисы"
          {...(slugErr || slugBad ? { "aria-invalid": true as const, "aria-describedby": "err-slug" } : {})}
        />
        {(slugErr || slugBad) && (
          <p id="err-slug" className="text-xs text-red-500 mt-1">
            {slugErr ?? `Используйте буквы/цифры/дефис. Длина ${SLUG_MIN}–${SLUG_MAX}.`}
          </p>
        )}
      </label>

      {/* Тип */}
      <label className="block">
        <span className="text-sm">Тип</span>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as AllowedType)}
          className="mt-1 w-full border rounded-2xl p-3"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      {/* Обложка (файл) */}
      <label className="block">
        <span className="text-sm">Обложка (только файл)</span>

        <input
          ref={fileInputRef}
          type="file"
          name="coverFile"
          accept="image/*"
          onChange={onChangeCoverFile}
          className="hidden"
        />

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="rounded-2xl border px-3 py-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Выбрать файл
          </button>
          {coverFile && (
            <button
              type="button"
              className="rounded-2xl border px-3 py-2"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                setCoverFile(null);
              }}
            >
              Очистить
            </button>
          )}
          <span className="text-xs opacity-70">
            {coverFile ? `${coverFile.name} · ${(coverFile.size / 1024).toFixed(1)} KB` : "Файл не выбран"}
          </span>
        </div>

        {coverErr && (
          <p id="err-cover" className="text-xs text-red-500 mt-1">
            {coverErr}
          </p>
        )}

        {coverPreview ? (
          <div className="mt-3 relative aspect-[16/9] overflow-hidden rounded-xl border">
            <div className="relative h-full w-full">
              <Image src={coverPreview} alt="Превью" fill sizes="100vw" style={{ objectFit: "cover" }} />
            </div>
          </div>
        ) : (
          <p className="text-xs opacity-70 mt-1">Поддерживаются JPEG, PNG, WebP. Рекомендуем 16:9.</p>
        )}
      </label>

      {/* Краткое описание */}
      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm">Краткое описание</span>
          <span className="text-xs opacity-70">
            {excerptLen}/{EXCERPT_MAX} символов • {excerptWords} слов
          </span>
        </div>
        <textarea
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={`mt-1 w-full border rounded-2xl p-3 ${excerptBad ? "border-red-400" : ""}`}
          rows={3}
          placeholder="Короткое резюме (до 200 символов)"
        />
        {excerptBad && <p className="text-xs text-red-500 mt-1">Максимум {EXCERPT_MAX} символов.</p>}
      </label>

      {/* Текст */}
      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm">Текст</span>
          <span className="text-xs opacity-70">
            {bodyLen}/{BODY_MAX} символов • {bodyWords} слов (минимум {BODY_MIN})
          </span>
        </div>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`mt-1 w-full border rounded-2xl p-3 ${bodyBad ? "border-red-400" : ""}`}
          rows={10}
          placeholder="Основной текст (минимум 50 символов)"
          {...(bodyErr || bodyBad ? { "aria-invalid": true as const, "aria-describedby": "err-body" } : {})}
        />
        {(bodyErr || bodyBad) && (
          <p id="err-body" className="text-xs text-red-500 mt-1">
            {bodyErr ?? `Длина текста должна быть от ${BODY_MIN} до ${BODY_MAX} символов.`}
          </p>
        )}
      </label>

      {/* Даты */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-sm">Публикация</span>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs underline opacity-80"
                onClick={() => setPublishedAt(formatRu(new Date()))}
                title="Поставить текущую дату/время"
              >
                Сейчас
              </button>
              <button
                type="button"
                className="text-xs underline opacity-60"
                onClick={() => setPublishedAt("")}
                title="Очистить поле"
              >
                Очистить
              </button>
            </div>
          </div>

          <input
            type="text"
            name="publishedAt"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="mt-1 w-full border rounded-2xl p-3"
            placeholder="ДД.ММ.ГГГГ ЧЧ:ММ — или YYYY-MM-DD HH:mm"
          />
        </label>

        <label className="block">
          <span className="text-sm">Срок действия (до)</span>
          <input
            type="text"
            name="expiresAt"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-1 w-full border rounded-2xl p-3"
            placeholder="ДД.ММ.ГГГГ ЧЧ:ММ — или YYYY-MM-DD HH:mm (можно пусто)"
          />
        </label>
      </div>

      {/* SEO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">SEO Title</span>
          <input
            name="seoTitle"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="mt-1 w-full border rounded-2xl p-3"
            placeholder="Если пусто — возьмём заголовок"
          />
        </label>

        <label className="block">
          <span className="text-sm">SEO Description</span>
          <input
            name="seoDesc"
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            className="mt-1 w-full border rounded-2xl p-3"
            placeholder="Если пусто — возьмём краткое описание"
          />
        </label>

        <label className="block">
          <span className="text-sm">OG Title</span>
          <input
            name="ogTitle"
            value={ogTitle}
            onChange={(e) => setOgTitle(e.target.value)}
            className="mt-1 w-full border rounded-2xl p-3"
          />
        </label>

        <label className="block">
          <span className="text-sm">OG Description</span>
          <input
            name="ogDesc"
            value={ogDesc}
            onChange={(e) => setOgDesc(e.target.value)}
            className="mt-1 w-full border rounded-2xl p-3"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-2xl border px-4 py-2 disabled:opacity-60" disabled={pending}>
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
        <span className="text-xs opacity-60">После сохранения произойдёт переход к списку</span>
      </div>
    </form>
  );
}
