// src/app/news/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";

/* ---------- utils ---------- */

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function inlineHtml(s: string) {
  let out = escapeHtml(s);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/_(.+?)_/g, "<em>$1</em>");
  return out;
}

/** Делим текст на читабельные блоки с «защитой от простыни». */
function splitToBlocks(raw: string): string[] {
  const text = raw.trim().replace(/\r\n/g, "\n");
  if (!text) return [];

  // 1) Абзацы разделены пустой строкой
  if (/\n{2,}/.test(text)) {
    return text.split(/\n{2,}/);
  }

  // 2) Одинарные переносы — группируем строки
  const lines = text.split("\n");
  if (lines.length > 1) {
    const blocks: string[] = [];
    let buf: string[] = [];
    let mode: "list" | "quote" | null = null;

    const flush = () => {
      if (buf.length) blocks.push(buf.join("\n"));
      buf = [];
      mode = null;
    };

    for (const line of lines) {
      const t = line.trim();
      if (!t) {
        flush();
        continue;
      }
      if (t.startsWith("## ")) {
        flush();
        blocks.push(line);
        continue;
      }
      if (t.startsWith("- ")) {
        if (mode !== "list") flush();
        mode = "list";
        buf.push(line);
        continue;
      }
      if (t.startsWith("> ")) {
        if (mode !== "quote") flush();
        mode = "quote";
        buf.push(line);
        continue;
      }
      // обычная строка → самостоятельный абзац
      flush();
      blocks.push(line);
    }
    flush();
    return blocks;
  }

  // 3) Переносов нет — делим по предложениям
  const parts: string[] = [];
  const re = /([^.!?…]+[.!?…]+)(\s+|$)/gu;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    parts.push(m[1].trim());
    i = re.lastIndex;
  }
  if (i < text.length) parts.push(text.slice(i).trim());
  if (parts.length <= 1) return [text];

  // Сгруппируем предложения в абзацы ~350–450 символов
  const blocks: string[] = [];
  let acc = "";

  for (const sent of parts) {
    const next = acc ? `${acc} ${sent}` : sent;
    if (next.length > 420) {
      if (acc) blocks.push(acc);
      acc = sent;
    } else {
      acc = next;
    }
  }
  if (acc) blocks.push(acc);
  return blocks;
}

/* ---------- renderer ---------- */

function RichBody({ body }: { body: string }) {
  const blocks = splitToBlocks(body);
  let key = 0;
  return (
    <div className="prose prose-elen dark:prose-invert">
      {blocks.map((block) => {
        key += 1;
        const trimmed = block.trim();
        const lines = block.split("\n");

        // список
        if (lines.every((l) => l.trim().startsWith("- "))) {
          const items = lines.map((l) => l.replace(/^-+\s*/, "").trim()).filter(Boolean);
          return (
            <ul key={key}>
              {items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: inlineHtml(it) }} />
              ))}
            </ul>
          );
        }

        // цитата
        if (lines.every((l) => l.trim().startsWith("> "))) {
          const text = lines.map((l) => l.replace(/^>\s*/, "")).join(" ");
          return <blockquote key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />;
        }

        // подзаголовок
        if (trimmed.startsWith("## ")) {
          const text = trimmed.replace(/^##\s+/, "");
          return <h2 key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />;
        }

        // обычный абзац
        return <p key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(block) }} />;
      })}
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // Next.js 15: params — Promise

  const item = await prisma.article.findFirst({
    where: {
      slug,
      AND: [
        { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      ],
    },
    // Можно явно перечислить поля, но и без select тип уже знает content
    // select: { id: true, slug: true, title: true, excerpt: true, cover: true, content: true, publishedAt: true, expiresAt: true, type: true },
  });
  if (!item) return notFound();

  return (
    <main className="px-4">
      <article className="mx-auto max-w-3xl py-8">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {item.title}
          </h1>

          {item.publishedAt && (
            <time
              dateTime={item.publishedAt.toISOString()}
              className="mt-2 block text-sm opacity-60"
            >
              {new Date(item.publishedAt).toLocaleDateString("ru", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
          )}

          {item.excerpt && (
            <p className="mt-4 text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium">
              {item.excerpt}
            </p>
          )}
        </header>

        {item.cover && (
          <figure className="group overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-sm mb-6">
            <div className="relative aspect-[16/9]">
              <Image
                src={item.cover}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                priority
                unoptimized={item.cover.startsWith("/uploads/")}
              />
            </div>
          </figure>
        )}

        {/* ВАЖНО: используем content вместо body */}
        {item.content && <RichBody body={item.content} />}
      </article>
    </main>
  );
}




//-------исправляем кеширование страницы новости по slug -------//
// import { notFound } from "next/navigation";
// import Image from "next/image";
// import { prisma } from "@/lib/db";

// /* ---------- utils ---------- */

// function escapeHtml(s: string) {
//   return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
// }
// function inlineHtml(s: string) {
//   let out = escapeHtml(s);
//   out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
//   out = out.replace(/_(.+?)_/g, "<em>$1</em>");
//   return out;
// }

// /** Делим текст на читабельные блоки с «защитой от простыни». */
// function splitToBlocks(raw: string): string[] {
//   const text = raw.trim().replace(/\r\n/g, "\n");
//   if (!text) return [];

//   // 1) Абзацы разделены пустой строкой
//   if (/\n{2,}/.test(text)) {
//     return text.split(/\n{2,}/);
//   }

//   // 2) Одинарные переносы — группируем строки
//   const lines = text.split("\n");
//   if (lines.length > 1) {
//     const blocks: string[] = [];
//     let buf: string[] = [];
//     let mode: "list" | "quote" | null = null;

//     const flush = () => {
//       if (buf.length) blocks.push(buf.join("\n"));
//       buf = [];
//       mode = null;
//     };

//     for (const line of lines) {
//       const t = line.trim();
//       if (!t) {
//         flush();
//         continue;
//       }
//       if (t.startsWith("## ")) {
//         flush();
//         blocks.push(line);
//         continue;
//       }
//       if (t.startsWith("- ")) {
//         if (mode !== "list") flush();
//         mode = "list";
//         buf.push(line);
//         continue;
//       }
//       if (t.startsWith("> ")) {
//         if (mode !== "quote") flush();
//         mode = "quote";
//         buf.push(line);
//         continue;
//       }
//       // обычная строка → самостоятельный абзац
//       flush();
//       blocks.push(line);
//     }
//     flush();
//     return blocks;
//   }

//   // 3) Переносов нет — делим по предложениям
//   const parts: string[] = [];
//   const re = /([^.!?…]+[.!?…]+)(\s+|$)/gu;
//   let m: RegExpExecArray | null;
//   let i = 0;
//   while ((m = re.exec(text))) {
//     parts.push(m[1].trim());
//     i = re.lastIndex;
//   }
//   if (i < text.length) parts.push(text.slice(i).trim());
//   if (parts.length <= 1) return [text];

//   // Сгруппируем предложения в абзацы ~350–450 символов
//   const blocks: string[] = [];
//   let acc = "";

//   for (const sent of parts) {
//     const next = acc ? `${acc} ${sent}` : sent;
//     if (next.length > 420) {
//       if (acc) blocks.push(acc);
//       acc = sent;
//     } else {
//       acc = next;
//     }
//   }
//   if (acc) blocks.push(acc);
//   return blocks;
// }

// /* ---------- renderer ---------- */

// function RichBody({ body }: { body: string }) {
//   const blocks = splitToBlocks(body);
//   let key = 0;
//   return (
//     <div className="prose prose-elen dark:prose-invert">
//       {blocks.map((block) => {
//         key += 1;
//         const trimmed = block.trim();
//         const lines = block.split("\n");

//         // список
//         if (lines.every((l) => l.trim().startsWith("- "))) {
//           const items = lines.map((l) => l.replace(/^-+\s*/, "").trim()).filter(Boolean);
//           return (
//             <ul key={key}>
//               {items.map((it, i) => (
//                 <li key={i} dangerouslySetInnerHTML={{ __html: inlineHtml(it) }} />
//               ))}
//             </ul>
//           );
//         }

//         // цитата
//         if (lines.every((l) => l.trim().startsWith("> "))) {
//           const text = lines.map((l) => l.replace(/^>\s*/, "")).join(" ");
//           return <blockquote key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />;
//         }

//         // подзаголовок
//         if (trimmed.startsWith("## ")) {
//           const text = trimmed.replace(/^##\s+/, "");
//           return <h2 key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />;
//         }

//         // обычный абзац
//         return <p key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(block) }} />;
//       })}
//     </div>
//   );
// }

// export default async function Page({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params; // Next.js 15: params — Promise

//   const item = await prisma.article.findFirst({
//     where: {
//       slug,
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
//       ],
//     },
//     // Можно явно перечислить поля, но и без select тип уже знает content
//     // select: { id: true, slug: true, title: true, excerpt: true, cover: true, content: true, publishedAt: true, expiresAt: true, type: true },
//   });
//   if (!item) return notFound();

//   return (
//     <main className="px-4">
//       <article className="mx-auto max-w-3xl py-8">
//         <header className="mb-6">
//           <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
//             {item.title}
//           </h1>

//           {item.publishedAt && (
//             <time
//               dateTime={item.publishedAt.toISOString()}
//               className="mt-2 block text-sm opacity-60"
//             >
//               {new Date(item.publishedAt).toLocaleDateString("ru", {
//                 day: "2-digit",
//                 month: "long",
//                 year: "numeric",
//               })}
//             </time>
//           )}

//           {item.excerpt && (
//             <p className="mt-4 text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium">
//               {item.excerpt}
//             </p>
//           )}
//         </header>

//         {item.cover && (
//           <figure className="group overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-sm mb-6">
//             <div className="relative aspect-[16/9]">
//               <Image
//                 src={item.cover}
//                 alt={item.title}
//                 fill
//                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
//                 className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                 priority
//               />
//             </div>
//           </figure>
//         )}

//         {/* ВАЖНО: используем content вместо body */}
//         {item.content && <RichBody body={item.content} />}
//       </article>
//     </main>
//   );
// }
