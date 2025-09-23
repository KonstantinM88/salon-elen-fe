
import * as React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function Section({ title, subtitle, children, className, id }: Props) {
  return (
    <section id={id} className={`py-10 sm:py-14 ${className ?? ""}`}>
      <div className="container">
        {(title || subtitle) && (
          <header className="mb-6 sm:mb-8">
            {subtitle && (
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {title}
              </h2>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
