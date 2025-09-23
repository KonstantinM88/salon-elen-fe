import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string;
  src: string;
  alt: string;
  title: string;
  children?: React.ReactNode;
  ratio?: "square" | "video" | "photo"; // 1:1 | 16:9 | 3:2
};

const ratioClass = {
  square: "aspect-square",
  video: "aspect-video",
  photo: "aspect-[3/2]",
};

export default function ImageCard({ href, src, alt, title, children, ratio = "photo" }: Props) {
  const body = (
    <article className="rounded-2xl border border-gray-200/70 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 hover:shadow-md transition">
      <div className={`relative ${ratioClass[ratio]}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-medium text-lg">{title}</h3>
        {children && <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">{children}</div>}
      </div>
    </article>
  );

  return href ? <Link href={href} className="block">{body}</Link> : body;
}
