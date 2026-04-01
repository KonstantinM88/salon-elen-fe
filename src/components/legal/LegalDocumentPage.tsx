import type { LegalDocument } from "@/lib/legal-content";

type LegalDocumentPageProps = {
  doc: LegalDocument;
};

export default function LegalDocumentPage({
  doc,
}: LegalDocumentPageProps): React.JSX.Element {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <article className="rounded-3xl border border-gray-200/70 bg-white/90 p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-gray-900/70">
        <header className="mb-8 border-b border-gray-200/70 pb-6 dark:border-white/10">
          <h1 className="font-playfair text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            {doc.title}
          </h1>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {doc.intro.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        </header>

        <div className="space-y-8">
          {doc.sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h2>

              {section.paragraphs?.map((paragraph, index) => (
                <p
                  key={`${index}-${paragraph.slice(0, 24)}`}
                  className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  {paragraph}
                </p>
              ))}

              {section.items && section.items.length > 0 && (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {section.items.map((item, index) => (
                    <li key={`${index}-${item.slice(0, 24)}`}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-gray-200/70 pt-6 text-xs leading-relaxed text-gray-500 dark:border-white/10 dark:text-gray-400">
          <p>{doc.updated}</p>
          {doc.languageNote && <p className="mt-2">{doc.languageNote}</p>}
        </footer>
      </article>
    </main>
  );
}
