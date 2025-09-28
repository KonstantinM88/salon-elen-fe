import ArticleForm from "@/components/forms/ArticleForm";
import { createArticle, type ActionResult } from "../actions";
import { redirect } from "next/navigation";

export default function Page() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Новая запись</h1>

      <ArticleForm
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
