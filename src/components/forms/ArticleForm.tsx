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

/** Транслитерация и генерация слага из заголовка */
function generateSlug(title: string): string {
  const translitMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss',
  };
  
  return title
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')  // удаляем все кроме латиницы, цифр, пробелов и дефисов
    .replace(/\s+/g, '-')           // пробелы в дефисы
    .replace(/-+/g, '-')            // множественные дефисы в один
    .replace(/^-|-$/g, '')          // убираем дефисы по краям
    .slice(0, 100);                 // ограничиваем длину
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

  // Режим редактирования - slug не меняется автоматически
  const isEditMode = !!articleId;

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

  // Автогенерация слага при изменении заголовка (только для новых записей)
  React.useEffect(() => {
    if (!isEditMode && title) {
      setSlug(generateSlug(title));
    }
  }, [title, isEditMode]);

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
      {/* Скрытое поле slug - автогенерируется */}
      <input type="hidden" name="slug" value={slug} />

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
        <div className="md:col-span-2">
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
          <div className="mt-1 flex justify-between text-xs opacity-70">
            <span>Слаг: <code className="bg-white/10 px-1 rounded">{slug || '—'}</code></span>
            <span>{title.length}/{LIMITS.titleMax}</span>
          </div>
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



{/* --- Обложка: одинаковая высота с input-ами, кнопка-пилюля --- */}
<div>
  <label htmlFor="cover" className="text-sm font-medium">Обложка</label>

  {/* обёртка — как текстовый инпут: border + та же высота */}
  <div className="mt-1 flex items-center rounded-xl border px-2 h-10">
    {/* реальный input — скрыт */}
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

    {/* видимая кнопка — «пилюля»; по высоте подгоняем под h-10 контейнера */}
    <label
      htmlFor="cover"
      className="shrink-0 inline-flex items-center rounded-full px-4 py-1.5
                 bg-emerald-600 text-white text-sm font-medium
                 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      Выберите файл
    </label>

    {/* имя файла — чтобы не рвало сетку, ограничиваем и троетим */}
    <span className="ml-3 truncate text-sm opacity-80">
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




//-----------работало до 20.01.26 обновляем редактирование новостей-------
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
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   const hh = String(d.getHours()).padStart(2, "0");
//   const mi = String(d.getMinutes()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
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
//         <div>
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
//           <p className="mt-1 text-right text-xs opacity-70">
//             {title.length}/{LIMITS.titleMax}
//           </p>
//         </div>

//         {/* Slug */}
//         <div>
//           <label htmlFor="slug" className="text-sm font-medium">
//             Слаг *
//           </label>
//           <input
//             id="slug"
//             name="slug"
//             required
//             maxLength={LIMITS.slugMax}
//             value={slug}
//             onChange={(e) => setSlug(e.target.value)}
//             className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
//             placeholder="naprimer-novaya-usluga"
//             pattern="^[a-z0-9-]+$"
//             title="Только строчные латинские буквы, цифры и дефисы"
//           />
//           {fieldErrors.slug && (
//             <p className="mt-1 text-xs text-red-500">{fieldErrors.slug[0]}</p>
//           )}
//           <p className="mt-1 text-right text-xs opacity-70">
//             {slug.length}/{LIMITS.slugMax}
//           </p>
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
