import ArticleForm from "@/components/forms/ArticleForm";
import { createArticle } from "../actions";

export default function Page() {
  
  return <main className="space-y-4">
    <h1 className="text-xl font-semibold">Новая запись</h1>
    <ArticleForm onSubmit={async (fd) => { "use server"; await createArticle(fd); }} />
  </main>;
}
