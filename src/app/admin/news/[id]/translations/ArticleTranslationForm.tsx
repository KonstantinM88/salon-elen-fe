// src/app/admin/news/[id]/translations/ArticleTranslationForm.tsx
"use client";

import { useState, useTransition } from "react";
import { saveArticleTranslation, deleteArticleTranslation } from "./actions";

const LIMITS = {
  seoTitleMin: 30,
  seoTitleMax: 60,
  seoDescMin: 70,
  seoDescMax: 160,
};

function counterClass(len: number, min: number, max: number): string {
  if (len === 0) return "opacity-70";
  if (len >= min && len <= max) return "text-emerald-400";
  return "text-red-500";
}

type Props = {
  articleId: string;
  locale: string;
  original: {
    title: string;
    excerpt: string;
    content: string;
  };
  translation: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    seoTitle: string;
    seoDescription: string;
    ogTitle: string;
    ogDescription: string;
  } | null;
};

export default function ArticleTranslationForm({
  articleId,
  locale,
  original,
  translation,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(!!translation);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [title, setTitle] = useState(translation?.title ?? "");
  const [excerpt, setExcerpt] = useState(translation?.excerpt ?? "");
  const [content, setContent] = useState(translation?.content ?? "");

  // SEO
  const [seoTitle, setSeoTitle] = useState(translation?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(translation?.seoDescription ?? "");
  const [ogTitle, setOgTitle] = useState(translation?.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(translation?.ogDescription ?? "");
  const [seoOpen, setSeoOpen] = useState(
    !!(translation?.seoTitle || translation?.seoDescription),
  );

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveArticleTranslation({
        articleId,
        locale,
        title,
        excerpt,
        content,
        seoTitle,
        seoDescription,
        ogTitle,
        ogDescription,
      });
      if (result.ok) {
        setMessage({ type: "success", text: "Перевод сохранён!" });
      } else {
        setMessage({ type: "error", text: result.error || "Ошибка сохранения" });
      }
    });
  };

  const handleDelete = () => {
    if (!translation?.id) return;
    if (!confirm("Удалить этот перевод?")) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteArticleTranslation(translation.id);
      if (result.ok) {
        setTitle("");
        setExcerpt("");
        setContent("");
        setSeoTitle("");
        setSeoDescription("");
        setOgTitle("");
        setOgDescription("");
        setIsExpanded(false);
        setMessage({ type: "success", text: "Перевод удалён" });
      } else {
        setMessage({ type: "error", text: result.error || "Ошибка удаления" });
      }
    });
  };

  const copyFromOriginal = () => {
    setTitle(original.title);
    setExcerpt(original.excerpt);
    setContent(original.content);
  };

  const inputCls =
    "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full py-3 border border-dashed border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-colors"
      >
        + Добавить перевод
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Оригинал для справки */}
      <details className="text-sm">
        <summary className="cursor-pointer text-white/60 hover:text-white/80">
          Показать оригинал
        </summary>
        <div className="mt-2 p-3 bg-black/20 rounded-lg space-y-2 text-white/70">
          <p><strong>Заголовок:</strong> {original.title}</p>
          {original.excerpt && <p><strong>Краткое описание:</strong> {original.excerpt}</p>}
          {original.content && (
            <p><strong>Содержание:</strong> {original.content.slice(0, 200)}...</p>
          )}
        </div>
      </details>

      {/* Основные поля */}
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
          placeholder="Переведённый заголовок"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Краткое описание</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
          placeholder="Переведённое краткое описание"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Содержание</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className={`${inputCls} resize-y`}
          placeholder="Переведённое содержание новости"
        />
      </div>

      {/* SEO (аккордеон) */}
      <div>
        <button
          type="button"
          onClick={() => setSeoOpen(!seoOpen)}
          className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors"
        >
          <span className={`transition-transform ${seoOpen ? "rotate-90" : ""}`}>▶</span>
          🔍 SEO для этого языка
          {(seoTitle || seoDescription) && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              заполнено
            </span>
          )}
        </button>

        {seoOpen && (
          <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">SEO Title</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputCls}
                placeholder="SEO заголовок на этом языке"
              />
              <p className={`mt-1 text-right text-xs ${counterClass(seoTitle.length, LIMITS.seoTitleMin, LIMITS.seoTitleMax)}`}>
                {seoTitle.length} символов ({LIMITS.seoTitleMin}–{LIMITS.seoTitleMax})
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">SEO Description</label>
              <input
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className={inputCls}
                placeholder="SEO описание на этом языке"
              />
              <p className={`mt-1 text-right text-xs ${counterClass(seoDescription.length, LIMITS.seoDescMin, LIMITS.seoDescMax)}`}>
                {seoDescription.length} символов ({LIMITS.seoDescMin}–{LIMITS.seoDescMax})
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">OG Title</label>
              <input
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                className={inputCls}
                placeholder="Заголовок для соцсетей"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">OG Description</label>
              <input
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                className={inputCls}
                placeholder="Описание для соцсетей"
              />
            </div>
          </div>
        )}
      </div>

      {/* Сообщение */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Кнопки */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          disabled={isPending || !title.trim()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {isPending ? "Сохранение..." : "Сохранить"}
        </button>

        <button
          onClick={copyFromOriginal}
          type="button"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Копировать из оригинала
        </button>

        {translation?.id && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors ml-auto"
          >
            Удалить
          </button>
        )}

        <button
          onClick={() => setIsExpanded(false)}
          className="px-4 py-2 text-white/60 hover:text-white transition-colors"
        >
          Свернуть
        </button>
      </div>
    </div>
  );
}



//-------14.02.26 добавляем возможность редактирования SEO и видео -----------
// // src/app/admin/news/[id]/translations/ArticleTranslationForm.tsx
// "use client";

// import { useState, useTransition } from "react";
// import { saveArticleTranslation, deleteArticleTranslation } from "./actions";

// type Props = {
//   articleId: string;
//   locale: string;
//   original: {
//     title: string;
//     excerpt: string;
//     content: string;
//   };
//   translation: {
//     id: string;
//     title: string;
//     excerpt: string;
//     content: string;
//   } | null;
// };

// export default function ArticleTranslationForm({
//   articleId,
//   locale,
//   original,
//   translation,
// }: Props) {
//   const [isExpanded, setIsExpanded] = useState(!!translation);
//   const [isPending, startTransition] = useTransition();
//   const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

//   const [title, setTitle] = useState(translation?.title ?? "");
//   const [excerpt, setExcerpt] = useState(translation?.excerpt ?? "");
//   const [content, setContent] = useState(translation?.content ?? "");

//   const handleSave = () => {
//     setMessage(null);
//     startTransition(async () => {
//       const result = await saveArticleTranslation({
//         articleId,
//         locale,
//         title,
//         excerpt,
//         content,
//       });
//       if (result.ok) {
//         setMessage({ type: "success", text: "Перевод сохранён!" });
//       } else {
//         setMessage({ type: "error", text: result.error || "Ошибка сохранения" });
//       }
//     });
//   };

//   const handleDelete = () => {
//     if (!translation?.id) return;
//     if (!confirm("Удалить этот перевод?")) return;

//     setMessage(null);
//     startTransition(async () => {
//       const result = await deleteArticleTranslation(translation.id);
//       if (result.ok) {
//         setTitle("");
//         setExcerpt("");
//         setContent("");
//         setIsExpanded(false);
//         setMessage({ type: "success", text: "Перевод удалён" });
//       } else {
//         setMessage({ type: "error", text: result.error || "Ошибка удаления" });
//       }
//     });
//   };

//   const copyFromOriginal = () => {
//     setTitle(original.title);
//     setExcerpt(original.excerpt);
//     setContent(original.content);
//   };

//   if (!isExpanded) {
//     return (
//       <button
//         onClick={() => setIsExpanded(true)}
//         className="w-full py-3 border border-dashed border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-colors"
//       >
//         + Добавить перевод
//       </button>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Оригинал для справки */}
//       <details className="text-sm">
//         <summary className="cursor-pointer text-white/60 hover:text-white/80">
//           Показать оригинал
//         </summary>
//         <div className="mt-2 p-3 bg-black/20 rounded-lg space-y-2 text-white/70">
//           <p><strong>Заголовок:</strong> {original.title}</p>
//           {original.excerpt && <p><strong>Краткое описание:</strong> {original.excerpt}</p>}
//           {original.content && (
//             <p><strong>Содержание:</strong> {original.content.slice(0, 200)}...</p>
//           )}
//         </div>
//       </details>

//       {/* Форма */}
//       <div>
//         <label className="block text-sm font-medium mb-1">Заголовок *</label>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
//           placeholder="Переведённый заголовок"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-1">Краткое описание</label>
//         <textarea
//           value={excerpt}
//           onChange={(e) => setExcerpt(e.target.value)}
//           rows={2}
//           className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//           placeholder="Переведённое краткое описание"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-1">Содержание</label>
//         <textarea
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           rows={8}
//           className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
//           placeholder="Переведённое содержание новости"
//         />
//       </div>

//       {/* Сообщение */}
//       {message && (
//         <div
//           className={`p-3 rounded-lg text-sm ${
//             message.type === "success"
//               ? "bg-emerald-500/20 text-emerald-400"
//               : "bg-red-500/20 text-red-400"
//           }`}
//         >
//           {message.text}
//         </div>
//       )}

//       {/* Кнопки */}
//       <div className="flex flex-wrap gap-2">
//         <button
//           onClick={handleSave}
//           disabled={isPending || !title.trim()}
//           className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
//         >
//           {isPending ? "Сохранение..." : "Сохранить"}
//         </button>

//         <button
//           onClick={copyFromOriginal}
//           type="button"
//           className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
//         >
//           Копировать из оригинала
//         </button>

//         {translation?.id && (
//           <button
//             onClick={handleDelete}
//             disabled={isPending}
//             className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors ml-auto"
//           >
//             Удалить
//           </button>
//         )}

//         <button
//           onClick={() => setIsExpanded(false)}
//           className="px-4 py-2 text-white/60 hover:text-white transition-colors"
//         >
//           Свернуть
//         </button>
//       </div>
//     </div>
//   );
// }