// src/app/admin/masters/[id]/AvatarUploader.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon } from 'lucide-react';

type Props = {
  masterId: string;
  action: (formData: FormData) => Promise<void> | void;
  maxSizeMb?: number;
};

export default function AvatarUploader({
  masterId,
  action,
  maxSizeMb = 5,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accept = 'image/jpeg,image/png,image/webp';

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const validate = (f: File) => {
    if (!accept.split(',').includes(f.type)) {
      return 'Допустимы только JPG, PNG или WebP.';
    }
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (f.size > maxBytes) {
      return `Размер файла не должен превышать ${maxSizeMb} МБ.`;
    }
    return null;
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      reset();
      return;
    }
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
      setPreview(null);
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={masterId} />

      {/* Custom File Input Button */}
      <label className="relative block cursor-pointer group">
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept={accept}
          required
          onChange={handleChange}
          className="hidden"
        />
        <div className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-amber-500/50">
          <ImageIcon className="w-5 h-5 text-white" />
          <span className="font-medium text-white">
            {file ? 'Выбрать другой файл' : 'Выберите файл'}
          </span>
        </div>
      </label>

      {/* File Info */}
      <div className="text-sm text-slate-400 space-y-1">
        <p>
          Допустимые форматы: <span className="text-amber-500">JPG, PNG, WEBP</span>
        </p>
        <p>
          Максимум <span className="text-amber-500">{maxSizeMb} МБ</span>
        </p>
        {file && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white"
          >
            Выбран: <span className="font-medium">{file.name}</span> (
            {(file.size / 1024 / 1024).toFixed(2)} МБ)
          </motion.p>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="text-sm text-slate-300 mb-2">Предпросмотр:</div>
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-amber-500/20">
              <img
                src={preview}
                alt="Предпросмотр"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {file && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/50 text-white font-medium"
            type="submit"
          >
            <Upload className="w-4 h-4" />
            Загрузить
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-600 text-white"
            type="button"
            onClick={reset}
          >
            <X className="w-4 h-4" />
            Отмена
          </motion.button>
        </motion.div>
      )}
    </form>
  );
}





// // src/app/admin/masters/[id]/AvatarUploader.tsx
// 'use client';

// import { useRef, useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Upload, X } from 'lucide-react';

// type Props = {
//   masterId: string;
//   action: (formData: FormData) => Promise<void> | void;
//   maxSizeMb?: number;
// };

// export default function AvatarUploader({
//   masterId,
//   action,
//   maxSizeMb = 5,
// }: Props) {
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const accept = 'image/jpeg,image/png,image/webp';

//   const reset = () => {
//     setFile(null);
//     setPreview(null);
//     setError(null);
//     if (inputRef.current) inputRef.current.value = '';
//   };

//   const validate = (f: File) => {
//     if (!accept.split(',').includes(f.type)) {
//       return 'Допустимы только JPG, PNG или WebP.';
//     }
//     const maxBytes = maxSizeMb * 1024 * 1024;
//     if (f.size > maxBytes) {
//       return `Размер файла не должен превышать ${maxSizeMb} МБ.`;
//     }
//     return null;
//   };

//   const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) {
//       reset();
//       return;
//     }
//     const err = validate(f);
//     if (err) {
//       setError(err);
//       setFile(null);
//       setPreview(null);
//       return;
//     }
//     setError(null);
//     setFile(f);
//     setPreview(URL.createObjectURL(f));
//   };

//   useEffect(() => {
//     return () => {
//       if (preview) URL.revokeObjectURL(preview);
//     };
//   }, [preview]);

//   return (
//     <form action={action} className="space-y-3">
//       <input type="hidden" name="id" value={masterId} />

//       <div className="space-y-2">
//         <div className="flex items-start gap-4">
//           {/* Превью */}
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="h-20 w-20 rounded-full ring-1 ring-white/10 overflow-hidden shrink-0 bg-white/5 relative"
//           >
//             <AnimatePresence mode="wait">
//               {preview ? (
//                 <motion.img
//                   key="preview"
//                   src={preview}
//                   alt="Предпросмотр"
//                   className="h-full w-full object-cover"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                 />
//               ) : (
//                 <motion.div
//                   key="placeholder"
//                   className="h-full w-full grid place-items-center text-xs text-slate-500"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                 >
//                   нет фото
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>

//           <div className="grow space-y-2">
//             <input
//               ref={inputRef}
//               type="file"
//               name="avatar"
//               accept={accept}
//               required
//               onChange={handleChange}
//               className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-white/10 file:transition-colors"
//               aria-describedby="avatar-hint avatar-error"
//             />

//             <p id="avatar-hint" className="text-xs text-slate-400">
//               Допустимые форматы: <b>JPG</b>, <b>PNG</b>, <b>WebP</b>.
//               Максимум {maxSizeMb} МБ.
//               {file && (
//                 <motion.span
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                 >
//                   {' '}
//                   Выбран: <span className="font-medium">{file.name}</span> (
//                   {(file.size / 1024 / 1024).toFixed(2)} МБ)
//                 </motion.span>
//               )}
//             </p>

//             <AnimatePresence>
//               {error && (
//                 <motion.p
//                   id="avatar-error"
//                   className="text-xs text-rose-300"
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                 >
//                   {error}
//                 </motion.p>
//               )}
//             </AnimatePresence>

//             <div className="flex gap-2">
//               <motion.button
//                 className="btn-glass inline-flex items-center gap-2 text-sm px-4 py-2 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
//                 type="submit"
//                 disabled={!file || !!error}
//                 whileHover={!file && !error ? { scale: 1.05 } : {}}
//                 whileTap={!file && !error ? { scale: 0.95 } : {}}
//               >
//                 <Upload className="h-4 w-4" />
//                 Загрузить
//               </motion.button>
//               <motion.button
//                 className="btn-glass inline-flex items-center gap-2 text-sm px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 type="button"
//                 onClick={reset}
//                 disabled={!file}
//                 whileHover={file ? { scale: 1.05 } : {}}
//                 whileTap={file ? { scale: 0.95 } : {}}
//               >
//                 <X className="h-4 w-4" />
//                 Очистить
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </form>
//   );
// }
