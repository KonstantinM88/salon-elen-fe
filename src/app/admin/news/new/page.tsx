// src/app/admin/news/new/page.tsx
import ArticleForm from "@/components/forms/ArticleForm";
import { createArticle, type ActionResult } from "../actions";
import { redirect } from "next/navigation";
import {
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";

const NEW_PAGE_TITLE: Record<SeoLocale, string> = {
  de: "Neuer Eintrag",
  ru: "Новая запись",
  en: "New post",
};

type PageProps = {
  searchParams?: SearchParamsPromise;
};

export default async function Page({ searchParams }: PageProps) {
  const locale = await resolveContentLocale(searchParams);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">{NEW_PAGE_TITLE[locale]}</h1>

      <ArticleForm
        locale={locale}
        onSubmit={async (fd) => {
          "use server";
          const res = await createArticle(fd);
          if (res.ok) {
            // можно добавить revalidatePath("/admin/news") при необходимости
            redirect("/admin/news");
          }
          return res as ActionResult;
        }}
      />
    </main>
  );
}
