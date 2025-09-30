import * as React from "react";
import Link from "next/link";

type Props = {
  title?: string;
  subtitle?: string;
  /** Если указан, заголовок станет ссылкой */
  titleHref?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function Section({
  title,
  subtitle,
  titleHref,
  children,
  className,
  id,
}: Props) {
  return (
    <section id={id} className={`py-10 sm:py-14 ${className ?? ""}`}>
      <div className="container">
        {(title || subtitle) && (
          <header className="mb-6 sm:mb-8">
            {subtitle && (
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                {subtitle}
              </p>
            )}
            {title && (
              titleHref ? (
                <Link
                  href={titleHref}
                  className="inline-block text-2xl sm:text-3xl font-semibold tracking-tight hover:opacity-90 transition"
                >
                  {title}
                </Link>
              ) : (
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
              )
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
