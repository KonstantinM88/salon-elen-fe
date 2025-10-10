'use client';

import { useRef, useState, useEffect } from 'react';

type Props = {
  masterId: string;
  action: (formData: FormData) => Promise<void> | void; // server action uploadAvatar
  maxSizeMb?: number; // по умолчанию 5
};

export default function AvatarUploader({ masterId, action, maxSizeMb = 5 }: Props) {
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

  // Чистим objectURL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <form action={action} className="space-y-3">
      {/* НЕ добавляем encType/method — React проставит автоматически */}
      <input type="hidden" name="id" value={masterId} />

      <div className="space-y-2">
        <label className="block text-sm font-medium">Аватар</label>

        <div className="flex items-start gap-4">
          {/* Превью */}
          <div className="h-20 w-20 rounded-full ring-1 ring-black/10 overflow-hidden shrink-0 bg-neutral-100">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Предпросмотр" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-xs text-neutral-500">
                нет фото
              </div>
            )}
          </div>

          <div className="grow space-y-2">
            <input
              ref={inputRef}
              type="file"
              name="avatar"
              accept={accept}
              required
              onChange={handleChange}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-neutral-50"
              aria-describedby="avatar-hint avatar-error"
            />

            <p id="avatar-hint" className="text-xs text-neutral-500">
              Допустимые форматы: <b>JPG</b>, <b>PNG</b>, <b>WebP</b>. Максимум {maxSizeMb} МБ.
              {file ? (
                <> Выбран: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} МБ)</>
              ) : null}
            </p>

            {error ? (
              <p id="avatar-error" className="text-xs text-red-600">{error}</p>
            ) : null}

            <div className="flex gap-2">
              <button className="btn" type="submit" disabled={!file || !!error}>
                Загрузить
              </button>
              <button className="btn btn-ghost" type="button" onClick={reset} disabled={!file}>
                Очистить
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
