import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  href?: string;              // можно опустить — тогда не ссылка
  src: string;
  alt: string;
  title: string;
  children?: ReactNode;       // любой контент
  className?: string;
};

export default function ImageCard({
  href,
  src,
  alt,
  title,
  children,
  className,
}: Props) {
  const inner = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium">{title}</h3>
        {children ? (
          // БЫЛО <p>…</p> — заменили на div, чтобы не было вложенных p
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {children}
          </div>
        ) : null}
      </div>
    </>
  );

  const cls =
    "group block rounded-2xl border hover:shadow-md transition overflow-hidden " +
    (className ?? "");

  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
