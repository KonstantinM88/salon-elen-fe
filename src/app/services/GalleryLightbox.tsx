// src/app/services/GalleryLightbox.tsx
"use client";

import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";

type GalleryItem = { id: string; image: string; caption: string | null };

type Props = {
  images: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  serviceName: string;
};

const GalleryLightboxBackground = memo(() => (
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
    <div
      className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
      style={{
        background:
          "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)",
      }}
    />
    <div
      className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
      style={{
        background:
          "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
      }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background:
          "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)",
      }}
    />
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="absolute pointer-events-none"
        style={{ left: `${(i * 10) % 100}%`, top: `${(i * 11) % 100}%` }}
      >
        <Heart
          className={`${
            i % 3 === 0 ? "w-5 h-5" : i % 3 === 1 ? "w-4 h-4" : "w-3 h-3"
          } text-rose-400/30`}
          fill="currentColor"
        />
      </div>
    ))}
    {[...Array(15)].map((_, i) => (
      <div
        key={`star-${i}`}
        className="absolute w-1 h-1 rounded-full bg-white/20"
        style={{ left: `${(i * 6.5) % 100}%`, top: `${(i * 7) % 100}%` }}
      />
    ))}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
  </div>
));

GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

function preloadImage(src?: string) {
  if (!src || typeof window === "undefined") return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

export default function GalleryLightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  serviceName,
}: Props) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const minSwipeDistance = 50;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  // ✅ Ускорение свайпов: предзагрузка текущего + соседних кадров
  useEffect(() => {
    if (!images.length) return;

    const idxs = [
      currentIndex,
      currentIndex + 1,
      currentIndex - 1,
      currentIndex + 2,
      currentIndex - 2,
    ]
      .map((i) => (i + images.length) % images.length)
      .slice(0, Math.min(5, images.length));

    for (const i of idxs) {
      preloadImage(images[i]?.image);
    }
  }, [currentIndex, images]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setDragOffset(currentTouch - touchStart);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && images.length > 1) onNext();
    else if (distance < -minSwipeDistance && images.length > 1) onPrev();
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const currentImage = images[currentIndex];
  const swipeDirection = dragOffset > 0 ? 1 : -1;

  const lightbox = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      onClick={onClose}
    >
      <GalleryLightboxBackground />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
          <p className="text-white font-medium">
            {currentIndex + 1} <span className="text-white/60">/ {images.length}</span>
          </p>
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <ChevronLeft className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-xs font-medium">Swipe</span>
            <ChevronRight className="w-4 h-4 text-white/70" />
          </div>
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6"
                    : "bg-white/40 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: swipeDirection * 50 }}
        animate={{ opacity: 1, x: isDragging ? dragOffset * 0.3 : 0 }}
        exit={{ opacity: 0, x: -swipeDirection * 50 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
          <Image
            src={currentImage.image}
            alt={currentImage.caption || serviceName}
            width={900}
            height={1200}
            sizes="(max-width: 640px) 95vw, 80vw"
            className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
            draggable={false}
            // ✅ приоритет именно текущему кадру
            priority
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          {currentImage.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <p className="text-white text-center text-sm font-medium">
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>

        {isDragging && Math.abs(dragOffset) > 30 && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${
              dragOffset > 0 ? "left-2" : "right-2"
            }`}
          >
            <div className="p-3 rounded-full bg-black/50 backdrop-blur-md">
              {dragOffset > 0 ? (
                <ChevronLeft className="w-6 h-6 text-white" />
              ) : (
                <ChevronRight className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(lightbox, document.body);
}





//----------пробуем ускорить показ галерии----------
// // src/app/services/GalleryLightbox.tsx
// "use client";

// import { memo, useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";

// type GalleryItem = { id: string; image: string; caption: string | null };

// type Props = {
//   images: GalleryItem[];
//   currentIndex: number;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   serviceName: string;
// };

// const GalleryLightboxBackground = memo(() => (
//   <div className="absolute inset-0 -z-10">
//     <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
//     <div
//       className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
//       style={{
//         background:
//           "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)",
//       }}
//     />
//     <div
//       className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
//       style={{
//         background:
//           "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
//       }}
//     />
//     <div
//       className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
//       style={{
//         background:
//           "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)",
//       }}
//     />
//     {[...Array(10)].map((_, i) => (
//       <div
//         key={i}
//         className="absolute pointer-events-none"
//         style={{ left: `${(i * 10) % 100}%`, top: `${(i * 11) % 100}%` }}
//       >
//         <Heart
//           className={`${i % 3 === 0 ? "w-5 h-5" : i % 3 === 1 ? "w-4 h-4" : "w-3 h-3"} text-rose-400/30`}
//           fill="currentColor"
//         />
//       </div>
//     ))}
//     {[...Array(15)].map((_, i) => (
//       <div
//         key={`star-${i}`}
//         className="absolute w-1 h-1 rounded-full bg-white/20"
//         style={{ left: `${(i * 6.5) % 100}%`, top: `${(i * 7) % 100}%` }}
//       />
//     ))}
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
//   </div>
// ));

// GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

// export default function GalleryLightbox({
//   images,
//   currentIndex,
//   onClose,
//   onPrev,
//   onNext,
//   serviceName,
// }: Props) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }
//     const distance = touchStart - touchEnd;
//     if (distance > minSwipeDistance && images.length > 1) onNext();
//     else if (distance < -minSwipeDistance && images.length > 1) onPrev();
//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   const lightbox = (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
//       onClick={onClose}
//     >
//       <GalleryLightboxBackground />
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors"
//       >
//         <X className="w-6 h-6" />
//       </button>
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">
//             {currentIndex + 1}{" "}
//             <span className="text-white/60">/ {images.length}</span>
//           </p>
//         </div>
//       </div>
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             <ChevronLeft className="w-4 h-4 text-white/70" />
//             <span className="text-white/70 text-xs font-medium">Свайп</span>
//             <ChevronRight className="w-4 h-4 text-white/70" />
//           </div>
//         </div>
//       )}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onPrev();
//             }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onNext();
//             }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             {images.map((_, idx) => (
//               <div
//                 key={idx}
//                 className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6" : "bg-white/40 w-2"}`}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 50 }}
//         animate={{ opacity: 1, x: isDragging ? dragOffset * 0.3 : 0 }}
//         exit={{ opacity: 0, x: -swipeDirection * 50 }}
//         transition={{ type: "tween", duration: 0.2 }}
//         className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
//           <Image
//             src={currentImage.image}
//             alt={currentImage.caption || serviceName}
//             width={800}
//             height={600}
//             className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
//             draggable={false}
//             priority
//             decoding="async"
//           />
//           {currentImage.caption && (
//             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
//               <p className="text-white text-center text-sm font-medium">
//                 {currentImage.caption}
//               </p>
//             </div>
//           )}
//         </div>
//         {isDragging && Math.abs(dragOffset) > 30 && (
//           <div
//             className={`absolute top-1/2 -translate-y-1/2 ${dragOffset > 0 ? "left-2" : "right-2"}`}
//           >
//             <div className="p-3 rounded-full bg-black/50 backdrop-blur-md">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-6 h-6 text-white" />
//               ) : (
//                 <ChevronRight className="w-6 h-6 text-white" />
//               )}
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );

//   if (typeof document === "undefined") return null;
//   return createPortal(lightbox, document.body);
// }



// "use client";

// import { memo, useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";

// type GalleryItem = { id: string; image: string; caption: string | null };

// type Props = {
//   images: GalleryItem[];
//   currentIndex: number;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   serviceName: string;
// };

// const GalleryLightboxBackground = memo(() => (
//   <div className="absolute inset-0 -z-10">
//     <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
//     <div
//       className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
//       style={{
//         background:
//           "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)",
//       }}
//     />
//     <div
//       className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
//       style={{
//         background:
//           "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
//       }}
//     />
//     <div
//       className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
//       style={{
//         background:
//           "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)",
//       }}
//     />
//     {[...Array(10)].map((_, i) => (
//       <div
//         key={i}
//         className="absolute pointer-events-none"
//         style={{ left: `${(i * 10) % 100}%`, top: `${(i * 11) % 100}%` }}
//       >
//         <Heart
//           className={`${i % 3 === 0 ? "w-5 h-5" : i % 3 === 1 ? "w-4 h-4" : "w-3 h-3"} text-rose-400/30`}
//           fill="currentColor"
//         />
//       </div>
//     ))}
//     {[...Array(15)].map((_, i) => (
//       <div
//         key={`star-${i}`}
//         className="absolute w-1 h-1 rounded-full bg-white/20"
//         style={{ left: `${(i * 6.5) % 100}%`, top: `${(i * 7) % 100}%` }}
//       />
//     ))}
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
//   </div>
// ));

// GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

// export default function GalleryLightbox({
//   images,
//   currentIndex,
//   onClose,
//   onPrev,
//   onNext,
//   serviceName,
// }: Props) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }
//     const distance = touchStart - touchEnd;
//     if (distance > minSwipeDistance && images.length > 1) onNext();
//     else if (distance < -minSwipeDistance && images.length > 1) onPrev();
//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   const lightbox = (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
//       onClick={onClose}
//     >
//       <GalleryLightboxBackground />
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors"
//       >
//         <X className="w-6 h-6" />
//       </button>
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">
//             {currentIndex + 1}{" "}
//             <span className="text-white/60">/ {images.length}</span>
//           </p>
//         </div>
//       </div>
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             <ChevronLeft className="w-4 h-4 text-white/70" />
//             <span className="text-white/70 text-xs font-medium">Свайп</span>
//             <ChevronRight className="w-4 h-4 text-white/70" />
//           </div>
//         </div>
//       )}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onPrev();
//             }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onNext();
//             }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             {images.map((_, idx) => (
//               <div
//                 key={idx}
//                 className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6" : "bg-white/40 w-2"}`}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 50 }}
//         animate={{ opacity: 1, x: isDragging ? dragOffset * 0.3 : 0 }}
//         exit={{ opacity: 0, x: -swipeDirection * 50 }}
//         transition={{ type: "tween", duration: 0.2 }}
//         className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
//           <Image
//             src={currentImage.image}
//             alt={currentImage.caption || serviceName}
//             width={800}
//             height={600}
//             className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
//             draggable={false}
//             priority
//           />
//           {currentImage.caption && (
//             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
//               <p className="text-white text-center text-sm font-medium">
//                 {currentImage.caption}
//               </p>
//             </div>
//           )}
//         </div>
//         {isDragging && Math.abs(dragOffset) > 30 && (
//           <div
//             className={`absolute top-1/2 -translate-y-1/2 ${dragOffset > 0 ? "left-2" : "right-2"}`}
//           >
//             <div className="p-3 rounded-full bg-black/50 backdrop-blur-md">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-6 h-6 text-white" />
//               ) : (
//                 <ChevronRight className="w-6 h-6 text-white" />
//               )}
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );

//   if (typeof document === "undefined") return null;
//   return createPortal(lightbox, document.body);
// }
