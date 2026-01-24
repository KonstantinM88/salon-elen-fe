// // src/app/admin/services/[id]/gallery/GalleryManager.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { 
  Upload, 
  X, 
  GripVertical, 
  Trash2, 
  Save, 
  Image as ImageIcon,
  Plus,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";
import { 
  uploadGalleryImage, 
  deleteGalleryImage, 
  updateGalleryOrder,
  updateServiceCover,
  deleteServiceCover
} from "./actions";

type GalleryItem = {
  id: string;
  image: string;
  caption: string | null;
  sortOrder: number;
};

type Props = {
  serviceId: string;
  serviceName: string;
  initialGallery: GalleryItem[];
  cover: string | null;
};

export default function GalleryManager({ serviceId, serviceName, initialGallery, cover }: Props) {
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [currentCover, setCurrentCover] = useState<string | null>(cover);
  const [isPending, startTransition] = useTransition();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Загрузка фото в галерею
  const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serviceId", serviceId);
      formData.append("sortOrder", String(gallery.length));

      startTransition(async () => {
        const result = await uploadGalleryImage(formData);
        if (result.success && result.item) {
          setGallery((prev) => [...prev, result.item!]);
          showMessage("success", "Фото добавлено");
        } else {
          showMessage("error", result.error || "Ошибка загрузки");
        }
      });
    }

    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Загрузка обложки
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("serviceId", serviceId);

    startTransition(async () => {
      const result = await updateServiceCover(formData);
      if (result.success && result.cover) {
        setCurrentCover(result.cover);
        showMessage("success", "Обложка обновлена");
      } else {
        showMessage("error", result.error || "Ошибка загрузки");
      }
      setUploadingCover(false);
    });

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  // Удаление обложки
  const handleDeleteCover = async () => {
    if (!confirm("Удалить обложку?")) return;

    startTransition(async () => {
      const result = await deleteServiceCover(serviceId);
      if (result.success) {
        setCurrentCover(null);
        showMessage("success", "Обложка удалена");
      } else {
        showMessage("error", result.error || "Ошибка удаления");
      }
    });
  };

  // Удаление фото из галереи
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Удалить это фото?")) return;

    startTransition(async () => {
      const result = await deleteGalleryImage(imageId);
      if (result.success) {
        setGallery((prev) => prev.filter((item) => item.id !== imageId));
        showMessage("success", "Фото удалено");
      } else {
        showMessage("error", result.error || "Ошибка удаления");
      }
    });
  };

  // Drag & Drop для сортировки
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = gallery.findIndex((item) => item.id === draggedItem);
    const targetIndex = gallery.findIndex((item) => item.id === targetId);

    const newGallery = [...gallery];
    const [removed] = newGallery.splice(draggedIndex, 1);
    newGallery.splice(targetIndex, 0, removed);

    // Обновляем sortOrder
    const updatedGallery = newGallery.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    setGallery(updatedGallery);
    setDraggedItem(null);

    // Сохраняем порядок на сервере
    startTransition(async () => {
      const result = await updateGalleryOrder(
        updatedGallery.map((item) => ({ id: item.id, sortOrder: item.sortOrder }))
      );
      if (!result.success) {
        showMessage("error", "Ошибка сохранения порядка");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Message */}
      {message && (
        <div className={`
          flex items-center gap-2 p-4 rounded-xl
          ${message.type === "success" 
            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" 
            : "bg-red-500/20 border border-red-500/30 text-red-300"}
        `}>
          {message.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Cover Section */}
      <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-fuchsia-400" />
          Обложка услуги
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {currentCover ? (
            <div className="relative group w-full sm:w-64 aspect-video rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentCover}
                alt="Обложка"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="p-2 rounded-lg bg-white/20 hover:bg-white/30 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5" />
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCover}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleDeleteCover}
                  className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <label className="
              flex flex-col items-center justify-center
              w-full sm:w-64 aspect-video
              rounded-xl border-2 border-dashed border-white/20
              hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5
              transition-colors cursor-pointer
            ">
              {uploadingCover ? (
                <Loader2 className="w-8 h-8 text-fuchsia-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-sm text-slate-400">Загрузить обложку</span>
                </>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadCover}
                className="hidden"
              />
            </label>
          )}
          
          <div className="text-sm text-slate-400">
            <p>Рекомендуемый размер: 800×450 px</p>
            <p>Формат: JPG, PNG, WebP</p>
            <p className="mt-2 text-slate-500">
              Обложка отображается в карточке услуги на странице услуг
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-fuchsia-400" />
            Галерея работ ({gallery.length} фото)
          </h2>
          
          <label className="
            inline-flex items-center gap-2 px-4 py-2
            bg-gradient-to-r from-fuchsia-600 to-violet-600
            hover:from-fuchsia-500 hover:to-violet-500
            rounded-lg text-white font-medium text-sm
            cursor-pointer transition-colors
          ">
            {uploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Добавить фото
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUploadGallery}
              className="hidden"
            />
          </label>
        </div>

        {gallery.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500">Галерея пуста</p>
            <p className="text-sm text-slate-600 mt-1">
              Добавьте фото ваших работ для этой услуги
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                className={`
                  relative group aspect-square rounded-xl overflow-hidden
                  border-2 transition-all cursor-move
                  ${draggedItem === item.id 
                    ? "border-fuchsia-500 opacity-50" 
                    : "border-transparent hover:border-white/20"}
                `}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.caption || ""}
                  className="w-full h-full object-cover"
                />
                
                {/* Drag handle */}
                <div className="absolute top-2 left-2 p-1.5 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>
                
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteImage(item.id)}
                  disabled={isPending}
                  className="
                    absolute top-2 right-2 p-1.5 rounded
                    bg-red-500/80 hover:bg-red-500
                    opacity-0 group-hover:opacity-100
                    transition-all disabled:opacity-50
                  "
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>

                {/* Sort order */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/50 text-xs text-white">
                  #{item.sortOrder + 1}
                </div>

                {/* Caption */}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xs text-white truncate">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 mt-4">
          💡 Перетаскивайте фото для изменения порядка. Первое фото будет отображаться как превью.
        </p>
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400" />
            <span>Сохранение...</span>
          </div>
        </div>
      )}
    </div>
  );
}





// // src/app/admin/services/[id]/gallery/GalleryManager.tsx
// "use client";

// import { useState, useTransition, useRef } from "react";
// import { 
//   Upload, 
//   X, 
//   GripVertical, 
//   Trash2, 
//   Save, 
//   Image as ImageIcon,
//   Plus,
//   Loader2,
//   Check,
//   AlertCircle
// } from "lucide-react";
// import { 
//   uploadGalleryImage, 
//   deleteGalleryImage, 
//   updateGalleryOrder,
//   updateServiceCover,
//   deleteServiceCover
// } from "./actions";

// type GalleryItem = {
//   id: string;
//   image: string;
//   caption: string | null;
//   sortOrder: number;
// };

// type Props = {
//   serviceId: string;
//   serviceName: string;
//   initialGallery: GalleryItem[];
//   cover: string | null;
// };

// export default function GalleryManager({ serviceId, serviceName, initialGallery, cover }: Props) {
//   const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
//   const [currentCover, setCurrentCover] = useState<string | null>(cover);
//   const [isPending, startTransition] = useTransition();
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [uploadingCover, setUploadingCover] = useState(false);
//   const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
//   const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const coverInputRef = useRef<HTMLInputElement>(null);

//   const showMessage = (type: "success" | "error", text: string) => {
//     setMessage({ type, text });
//     setTimeout(() => setMessage(null), 3000);
//   };

//   // Загрузка фото в галерею
//   const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     setUploadingImage(true);
    
//     for (const file of Array.from(files)) {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("serviceId", serviceId);
//       formData.append("sortOrder", String(gallery.length));

//       startTransition(async () => {
//         const result = await uploadGalleryImage(formData);
//         if (result.success && result.item) {
//           setGallery((prev) => [...prev, result.item!]);
//           showMessage("success", "Фото добавлено");
//         } else {
//           showMessage("error", result.error || "Ошибка загрузки");
//         }
//       });
//     }

//     setUploadingImage(false);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Загрузка обложки
//   const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploadingCover(true);

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("serviceId", serviceId);

//     startTransition(async () => {
//       const result = await updateServiceCover(formData);
//       if (result.success && result.cover) {
//         setCurrentCover(result.cover);
//         showMessage("success", "Обложка обновлена");
//       } else {
//         showMessage("error", result.error || "Ошибка загрузки");
//       }
//       setUploadingCover(false);
//     });

//     if (coverInputRef.current) {
//       coverInputRef.current.value = "";
//     }
//   };

//   // Удаление обложки
//   const handleDeleteCover = async () => {
//     if (!confirm("Удалить обложку?")) return;

//     startTransition(async () => {
//       const result = await deleteServiceCover(serviceId);
//       if (result.success) {
//         setCurrentCover(null);
//         showMessage("success", "Обложка удалена");
//       } else {
//         showMessage("error", result.error || "Ошибка удаления");
//       }
//     });
//   };

//   // Удаление фото из галереи
//   const handleDeleteImage = async (imageId: string) => {
//     if (!confirm("Удалить это фото?")) return;

//     startTransition(async () => {
//       const result = await deleteGalleryImage(imageId);
//       if (result.success) {
//         setGallery((prev) => prev.filter((item) => item.id !== imageId));
//         showMessage("success", "Фото удалено");
//       } else {
//         showMessage("error", result.error || "Ошибка удаления");
//       }
//     });
//   };

//   // Drag & Drop для сортировки
//   const handleDragStart = (e: React.DragEvent, itemId: string) => {
//     setDraggedItem(itemId);
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = "move";
//   };

//   const handleDrop = (e: React.DragEvent, targetId: string) => {
//     e.preventDefault();
//     if (!draggedItem || draggedItem === targetId) return;

//     const draggedIndex = gallery.findIndex((item) => item.id === draggedItem);
//     const targetIndex = gallery.findIndex((item) => item.id === targetId);

//     const newGallery = [...gallery];
//     const [removed] = newGallery.splice(draggedIndex, 1);
//     newGallery.splice(targetIndex, 0, removed);

//     // Обновляем sortOrder
//     const updatedGallery = newGallery.map((item, index) => ({
//       ...item,
//       sortOrder: index,
//     }));

//     setGallery(updatedGallery);
//     setDraggedItem(null);

//     // Сохраняем порядок на сервере
//     startTransition(async () => {
//       const result = await updateGalleryOrder(
//         updatedGallery.map((item) => ({ id: item.id, sortOrder: item.sortOrder }))
//       );
//       if (!result.success) {
//         showMessage("error", "Ошибка сохранения порядка");
//       }
//     });
//   };

//   return (
//     <div className="space-y-8">
//       {/* Message */}
//       {message && (
//         <div className={`
//           flex items-center gap-2 p-4 rounded-xl
//           ${message.type === "success" 
//             ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" 
//             : "bg-red-500/20 border border-red-500/30 text-red-300"}
//         `}>
//           {message.type === "success" ? (
//             <Check className="w-5 h-5" />
//           ) : (
//             <AlertCircle className="w-5 h-5" />
//           )}
//           {message.text}
//         </div>
//       )}

//       {/* Cover Section */}
//       <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-6">
//         <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//           <ImageIcon className="w-5 h-5 text-fuchsia-400" />
//           Обложка услуги
//         </h2>
        
//         <div className="flex flex-col sm:flex-row gap-4">
//           {currentCover ? (
//             <div className="relative group w-full sm:w-64 aspect-video rounded-xl overflow-hidden">
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={currentCover}
//                 alt="Обложка"
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
//                 <label className="p-2 rounded-lg bg-white/20 hover:bg-white/30 cursor-pointer transition-colors">
//                   <Upload className="w-5 h-5" />
//                   <input
//                     ref={coverInputRef}
//                     type="file"
//                     accept="image/*"
//                     onChange={handleUploadCover}
//                     className="hidden"
//                   />
//                 </label>
//                 <button
//                   onClick={handleDeleteCover}
//                   className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
//                 >
//                   <Trash2 className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <label className="
//               flex flex-col items-center justify-center
//               w-full sm:w-64 aspect-video
//               rounded-xl border-2 border-dashed border-white/20
//               hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5
//               transition-colors cursor-pointer
//             ">
//               {uploadingCover ? (
//                 <Loader2 className="w-8 h-8 text-fuchsia-400 animate-spin" />
//               ) : (
//                 <>
//                   <Upload className="w-8 h-8 text-slate-500 mb-2" />
//                   <span className="text-sm text-slate-400">Загрузить обложку</span>
//                 </>
//               )}
//               <input
//                 ref={coverInputRef}
//                 type="file"
//                 accept="image/*"
//                 onChange={handleUploadCover}
//                 className="hidden"
//               />
//             </label>
//           )}
          
//           <div className="text-sm text-slate-400">
//             <p>Рекомендуемый размер: 800×450 px</p>
//             <p>Формат: JPG, PNG, WebP</p>
//             <p className="mt-2 text-slate-500">
//               Обложка отображается в карточке услуги на странице услуг
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Gallery Section */}
//       <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold flex items-center gap-2">
//             <ImageIcon className="w-5 h-5 text-fuchsia-400" />
//             Галерея работ ({gallery.length} фото)
//           </h2>
          
//           <label className="
//             inline-flex items-center gap-2 px-4 py-2
//             bg-gradient-to-r from-fuchsia-600 to-violet-600
//             hover:from-fuchsia-500 hover:to-violet-500
//             rounded-lg text-white font-medium text-sm
//             cursor-pointer transition-colors
//           ">
//             {uploadingImage ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Plus className="w-4 h-4" />
//             )}
//             Добавить фото
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={handleUploadGallery}
//               className="hidden"
//             />
//           </label>
//         </div>

//         {gallery.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
//               <ImageIcon className="w-8 h-8 text-slate-600" />
//             </div>
//             <p className="text-slate-500">Галерея пуста</p>
//             <p className="text-sm text-slate-600 mt-1">
//               Добавьте фото ваших работ для этой услуги
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//             {gallery.map((item) => (
//               <div
//                 key={item.id}
//                 draggable
//                 onDragStart={(e) => handleDragStart(e, item.id)}
//                 onDragOver={handleDragOver}
//                 onDrop={(e) => handleDrop(e, item.id)}
//                 className={`
//                   relative group aspect-square rounded-xl overflow-hidden
//                   border-2 transition-all cursor-move
//                   ${draggedItem === item.id 
//                     ? "border-fuchsia-500 opacity-50" 
//                     : "border-transparent hover:border-white/20"}
//                 `}
//               >
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img
//                   src={item.image}
//                   alt={item.caption || ""}
//                   className="w-full h-full object-cover"
//                 />
                
//                 {/* Drag handle */}
//                 <div className="absolute top-2 left-2 p-1.5 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <GripVertical className="w-4 h-4 text-white" />
//                 </div>
                
//                 {/* Delete button */}
//                 <button
//                   onClick={() => handleDeleteImage(item.id)}
//                   disabled={isPending}
//                   className="
//                     absolute top-2 right-2 p-1.5 rounded
//                     bg-red-500/80 hover:bg-red-500
//                     opacity-0 group-hover:opacity-100
//                     transition-all disabled:opacity-50
//                   "
//                 >
//                   <Trash2 className="w-4 h-4 text-white" />
//                 </button>

//                 {/* Sort order */}
//                 <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/50 text-xs text-white">
//                   #{item.sortOrder + 1}
//                 </div>

//                 {/* Caption */}
//                 {item.caption && (
//                   <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
//                     <p className="text-xs text-white truncate">{item.caption}</p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}

//         <p className="text-xs text-slate-500 mt-4">
//           💡 Перетаскивайте фото для изменения порядка. Первое фото будет отображаться как превью.
//         </p>
//       </div>

//       {/* Loading overlay */}
//       {isPending && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-slate-900 rounded-xl p-6 flex items-center gap-3">
//             <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400" />
//             <span>Сохранение...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }