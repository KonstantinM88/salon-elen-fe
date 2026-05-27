"use client";

import * as React from "react";
import { Check, Clock3, Eye, Share2 } from "lucide-react";
import type { SeoLocale } from "@/lib/seo-locale";

type NewsArticleMetaProps = {
  articleId: string;
  title: string;
  locale: SeoLocale;
  readMinutes: number;
  initialViews: number;
};

type MetaCopy = {
  readTime: (minutes: number) => string;
  share: string;
  copied: string;
  views: (views: number) => string;
};

function pluralRu(count: number, forms: [string, string, string]): string {
  const mod10 = Math.abs(count) % 10;
  const mod100 = Math.abs(count) % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return forms[1];
  }
  return forms[2];
}

const META_COPY: Record<SeoLocale, MetaCopy> = {
  de: {
    readTime: (minutes) => `${minutes} Min. Lesezeit`,
    share: "Teilen",
    copied: "Link kopiert",
    views: (views) =>
      `${views.toLocaleString("de-DE")} ${views === 1 ? "Aufruf" : "Aufrufe"}`,
  },
  ru: {
    readTime: (minutes) => `${minutes} мин. чтения`,
    share: "Поделиться",
    copied: "Ссылка скопирована",
    views: (views) =>
      `${views.toLocaleString("ru-RU")} ${pluralRu(views, [
        "просмотр",
        "просмотра",
        "просмотров",
      ])}`,
  },
  en: {
    readTime: (minutes) => `${minutes} min read`,
    share: "Share",
    copied: "Link copied",
    views: (views) =>
      `${views.toLocaleString("en-US")} ${views === 1 ? "view" : "views"}`,
  },
};

type ViewResponse = {
  views?: number;
};

export default function NewsArticleMeta({
  articleId,
  title,
  locale,
  readMinutes,
  initialViews,
}: NewsArticleMetaProps): React.JSX.Element {
  const copy = META_COPY[locale] ?? META_COPY.de;
  const [views, setViews] = React.useState(initialViews);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const storageKey = `salon-elen-article-viewed-v2:${articleId}`;
    let canUseStorage = true;

    try {
      if (window.sessionStorage.getItem(storageKey)) {
        return;
      }
      window.sessionStorage.setItem(storageKey, "pending");
    } catch {
      canUseStorage = false;
    }

    let cancelled = false;

    fetch(`/api/articles/${articleId}/view`, {
      method: "POST",
      cache: "no-store",
      keepalive: true,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("View update failed");
        return (await response.json()) as ViewResponse;
      })
      .then((data) => {
        if (typeof data?.views !== "number") return;
        if (!cancelled) {
          setViews(data.views);
        }
        if (canUseStorage) {
          window.sessionStorage.setItem(storageKey, "done");
        }
      })
      .catch(() => {
        if (canUseStorage) {
          window.sessionStorage.removeItem(storageKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-4 w-4" aria-hidden="true" />
        {copy.readTime(readMinutes)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Eye className="h-4 w-4" aria-hidden="true" />
        {copy.views(views)}
      </span>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-full text-gray-600 transition hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:text-gray-400 dark:hover:text-rose-300"
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? copy.copied : copy.share}
      </button>
    </div>
  );
}
