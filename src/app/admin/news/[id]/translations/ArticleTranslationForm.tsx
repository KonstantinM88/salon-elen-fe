// src/app/admin/news/[id]/translations/ArticleTranslationForm.tsx
"use client";

import { useState, useTransition } from "react";
import { saveArticleTranslation, deleteArticleTranslation } from "./actions";

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

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveArticleTranslation({
        articleId,
        locale,
        title,
        excerpt,
        content,
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

      {/* Форма */}
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Переведённый заголовок"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Краткое описание</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          placeholder="Переведённое краткое описание"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Содержание</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
          placeholder="Переведённое содержание новости"
        />
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