// src/components/ContactsMapEmbed.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MapPin, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import s from "./contactsMapEmbed.module.css";

type Props = {
  title: string;
  caption: string;
  openMapsLabel: string;
  showMapLabel: string;
  privacyNote: string;

  previewImageSrc?: string;
  previewAlt?: string;

  mapsUrl: string;
  embedUrl: string;

  storageKey?: string;
  eagerDesktop?: boolean;
  desktopMinWidth?: number;
};

export default function ContactsMapEmbed({
  title,
  caption,
  openMapsLabel,
  showMapLabel,
  privacyNote,
  previewImageSrc,
  previewAlt,
  mapsUrl,
  embedUrl,
  storageKey = "contacts_map_consent",
  eagerDesktop = true,
  desktopMinWidth = 1024,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const safeEmbed = useMemo(() => {
    try {
      const u = new URL(embedUrl);
      const hostOk =
        u.hostname.endsWith("google.com") ||
        u.hostname.endsWith("google.de") ||
        u.hostname.endsWith("google.ru");
      if (!hostOk) return "";
      return u.toString();
    } catch {
      return "";
    }
  }, [embedUrl]);

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === "1") setLoaded(true);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!eagerDesktop) return;
    const decide = () => {
      const isDesktop = window.innerWidth >= desktopMinWidth;
      if (isDesktop) setLoaded(true);
    };
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, [eagerDesktop, desktopMinWidth]);

  const enable = () => {
    setLoaded(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60 ${s.wrap}`}>
      <div className={s.softBorder} />
      <div className={s.sparkles} />

      <div className="relative aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/9]">
        {!loaded ? (
          <>
            {previewImageSrc ? (
              <Image
                src={previewImageSrc}
                alt={previewAlt ?? title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_20%,rgba(255,193,7,0.45),transparent_55%),radial-gradient(800px_circle_at_90%_25%,rgba(236,72,153,0.28),transparent_55%),radial-gradient(700px_circle_at_40%_100%,rgba(56,189,248,0.24),transparent_55%)] dark:bg-[radial-gradient(900px_circle_at_15%_20%,rgba(255,193,7,0.18),transparent_60%),radial-gradient(800px_circle_at_90%_25%,rgba(168,85,247,0.16),transparent_60%),radial-gradient(700px_circle_at_40%_100%,rgba(56,189,248,0.12),transparent_60%)]" />
            )}

            {/* Light glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-white/20 to-white/0 dark:from-black/60 dark:via-black/25 dark:to-transparent" />

            <div className="absolute inset-0 p-4 sm:p-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/70 px-3 py-1 text-xs font-extrabold tracking-wide text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-black/25 dark:text-white">
                  <Sparkles className="h-4 w-4 text-gold-600" />
                  {title}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-gray-900/80 dark:text-white/80">
                  {caption}
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={enable}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-3 text-sm font-extrabold text-white shadow-soft dark:bg-white dark:text-gray-950 sm:w-auto ${s.shineBtn} ${s.glowHover}`}
                  >
                    <MapPin className="h-4 w-4" />
                    {showMapLabel}
                  </button>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-bold text-gray-950 shadow-soft backdrop-blur transition dark:border-white/20 dark:bg-white/10 dark:text-white sm:w-auto ${s.glowHover}`}
                  >
                    {openMapsLabel}
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </a>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-gray-900/70 dark:text-white/75">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="leading-relaxed">{privacyNote}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {safeEmbed ? (
              <iframe
                title={title}
                src={safeEmbed}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold">Map unavailable</p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center justify-center rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-2 text-sm font-bold text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white"
                  >
                    {openMapsLabel}
                  </a>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 p-3 sm:p-4">
              <div className="pointer-events-auto ml-auto flex w-fit gap-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center justify-center rounded-2xl border border-gray-900/10 bg-white/85 px-3 py-2 text-xs font-extrabold text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/70 dark:text-white ${s.glowHover}`}
                >
                  {openMapsLabel}
                </a>
                <button
                  type="button"
                  onClick={() => setLoaded(false)}
                  className={`inline-flex items-center justify-center rounded-2xl border border-gray-900/10 bg-white/85 px-3 py-2 text-xs font-extrabold text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/70 dark:text-white ${s.glowHover}`}
                  aria-label="Close map"
                >
                  ✕
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <noscript>
        <div className="p-5 sm:p-6">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-gray-950 px-4 py-2 text-sm font-extrabold text-white shadow-soft dark:bg-white dark:text-gray-950"
          >
            <MapPin className="h-4 w-4" />
            {openMapsLabel}
          </a>
        </div>
      </noscript>
    </div>
  );
}





// // src/components/ContactsMapEmbed.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { MapPin, ShieldCheck, Sparkles } from "lucide-react";

// type Props = {
//   title: string;
//   caption: string;
//   openMapsLabel: string;
//   showMapLabel: string;
//   privacyNote: string;

//   // preview image optional
//   previewImageSrc?: string;
//   previewAlt?: string;

//   mapsUrl: string;
//   embedUrl: string;

//   // optional: key for localStorage
//   storageKey?: string;
// };

// export default function ContactsMapEmbed({
//   title,
//   caption,
//   openMapsLabel,
//   showMapLabel,
//   privacyNote,
//   previewImageSrc,
//   previewAlt,
//   mapsUrl,
//   embedUrl,
//   storageKey = "contacts_map_consent",
// }: Props) {
//   const [loaded, setLoaded] = useState(false);

//   // auto-load if user already consented before
//   useEffect(() => {
//     try {
//       const v = localStorage.getItem(storageKey);
//       if (v === "1") setLoaded(true);
//     } catch {}
//   }, [storageKey]);

//   const safeEmbed = useMemo(() => {
//     try {
//       const u = new URL(embedUrl);
//       const hostOk =
//         u.hostname.endsWith("google.com") ||
//         u.hostname.endsWith("google.de") ||
//         u.hostname.endsWith("google.ru");
//       if (!hostOk) return "";
//       return u.toString();
//     } catch {
//       return "";
//     }
//   }, [embedUrl]);

//   const enable = () => {
//     setLoaded(true);
//     try {
//       localStorage.setItem(storageKey, "1");
//     } catch {}
//   };

//   return (
//     <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 shadow-soft backdrop-blur dark:border-gray-800 dark:bg-gray-900/50">
//       {/* Media */}
//       <div className="relative aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/9]">
//         {!loaded ? (
//           <>
//             {/* Preview background */}
//             {previewImageSrc ? (
//               <>
//                 <Image
//                   src={previewImageSrc}
//                   alt={previewAlt ?? title}
//                   fill
//                   className="object-cover"
//                   sizes="(max-width: 1024px) 100vw, 50vw"
//                   priority={false}
//                 />
//                 {/* Light theme: colorful overlay. Dark theme: deeper overlay */}
//                 <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_20%,rgba(255,193,7,0.35),transparent_55%),radial-gradient(800px_circle_at_90%_25%,rgba(236,72,153,0.25),transparent_55%),radial-gradient(700px_circle_at_40%_100%,rgba(56,189,248,0.20),transparent_55%)] dark:bg-[radial-gradient(900px_circle_at_15%_20%,rgba(255,193,7,0.16),transparent_60%),radial-gradient(800px_circle_at_90%_25%,rgba(168,85,247,0.14),transparent_60%),radial-gradient(700px_circle_at_40%_100%,rgba(56,189,248,0.10),transparent_60%)]" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-white/65 via-white/15 to-white/0 dark:from-black/60 dark:via-black/25 dark:to-transparent" />
//               </>
//             ) : (
//               <>
//                 <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_20%,rgba(255,193,7,0.55),transparent_55%),radial-gradient(800px_circle_at_90%_25%,rgba(236,72,153,0.35),transparent_55%),radial-gradient(700px_circle_at_40%_100%,rgba(56,189,248,0.30),transparent_55%)] dark:bg-[radial-gradient(900px_circle_at_15%_20%,rgba(255,193,7,0.20),transparent_60%),radial-gradient(800px_circle_at_90%_25%,rgba(168,85,247,0.16),transparent_60%),radial-gradient(700px_circle_at_40%_100%,rgba(56,189,248,0.12),transparent_60%)]" />
//                 <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),transparent_55%)] dark:bg-[linear-gradient(135deg,rgba(0,0,0,0.35),transparent_55%)]" />
//               </>
//             )}

//             {/* Content overlay */}
//             <div className="absolute inset-0 p-4 sm:p-6">
//               <div className="max-w-xl">
//                 <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/55 px-3 py-1 text-xs font-semibold text-gray-900 shadow-soft backdrop-blur dark:border-white/15 dark:bg-black/25 dark:text-white">
//                   <Sparkles className="h-4 w-4" />
//                   {title}
//                 </div>

//                 <p className="mt-3 text-sm leading-relaxed text-gray-900/80 dark:text-white/80">
//                   {caption}
//                 </p>

//                 <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
//                   <button
//                     type="button"
//                     onClick={enable}
//                     className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-gray-900 sm:w-auto"
//                   >
//                     <MapPin className="h-4 w-4" />
//                     {showMapLabel}
//                   </button>

//                   <a
//                     href={mapsUrl}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-900/10 bg-white/60 px-4 py-3 text-sm font-semibold text-gray-900 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/20 dark:bg-white/10 dark:text-white sm:w-auto"
//                   >
//                     {openMapsLabel}
//                   </a>
//                 </div>

//                 <div className="mt-3 flex items-start gap-2 text-xs text-gray-900/70 dark:text-white/75">
//                   <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
//                   <p className="leading-relaxed">{privacyNote}</p>
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <>
//             {/* Real map */}
//             {safeEmbed ? (
//               <iframe
//                 title={title}
//                 src={safeEmbed}
//                 className="absolute inset-0 h-full w-full"
//                 loading="lazy"
//                 referrerPolicy="no-referrer-when-downgrade"
//                 allowFullScreen
//               />
//             ) : (
//               <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-gray-700 dark:text-gray-300">
//                 <div>
//                   <p className="font-semibold">Map unavailable</p>
//                   <a
//                     href={mapsUrl}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="mt-2 inline-flex items-center justify-center rounded-xl border border-gray-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-900 shadow-soft backdrop-blur dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100"
//                   >
//                     {openMapsLabel}
//                   </a>
//                 </div>
//               </div>
//             )}

//             {/* Controls */}
//             <div className="pointer-events-none absolute inset-x-0 top-0 p-3 sm:p-4">
//               <div className="pointer-events-auto ml-auto flex w-fit gap-2">
//                 <a
//                   href={mapsUrl}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="inline-flex items-center justify-center rounded-xl border border-gray-200/70 bg-white/80 px-3 py-2 text-xs font-semibold text-gray-900 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-100"
//                 >
//                   {openMapsLabel}
//                 </a>
//                 <button
//                   type="button"
//                   onClick={() => setLoaded(false)}
//                   className="inline-flex items-center justify-center rounded-xl border border-gray-200/70 bg-white/80 px-3 py-2 text-xs font-semibold text-gray-900 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-100"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       <noscript>
//         <div className="p-5 sm:p-6">
//           <a
//             href={mapsUrl}
//             target="_blank"
//             rel="noreferrer"
//             className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-soft dark:bg-white dark:text-gray-900"
//           >
//             <MapPin className="h-4 w-4" />
//             {openMapsLabel}
//           </a>
//         </div>
//       </noscript>
//     </div>
//   );
// }

