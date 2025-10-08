'use client';

import { useMemo, useState } from 'react';

type ParentOption = { id: string; name: string };

type Props = {
  parentOptions: ParentOption[];
  action: (formData: FormData) => Promise<void>; // server action: createService
};

export default function ServiceCreateForm({ parentOptions, action }: Props) {
  const [kind, setKind] = useState<'category' | 'service'>('category');
  const [parentId, setParentId] = useState<string>('');
  const [durationMin, setDurationMin] = useState<number>(0);
  const [price, setPrice] = useState<string>('');
  const isCategory = kind === 'category';

  const pricePlaceholder = useMemo(() => (isCategory ? '—' : '45'), [isCategory]);
  const durPlaceholder = useMemo(() => (isCategory ? '0' : '60'), [isCategory]);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-6 items-end">
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Название</label>
        <input name="name" required className="w-full rounded-lg border bg-transparent px-3 py-2" placeholder="Стрижка / Мужская" />
      </div>
      <div>
        <label className="block text-sm mb-1">Slug</label>
        <input name="slug" className="w-full rounded-lg border bg-transparent px-3 py-2" placeholder="haircut-men" />
      </div>

      <div>
        <label className="block text-sm mb-1">Тип</label>
        <select
          name="kind"
          value={kind}
          onChange={(e) => {
            const v = e.target.value === 'service' ? 'service' : 'category';
            setKind(v);
            if (v === 'category') {
              setParentId('');
              setDurationMin(0);
              setPrice('');
            }
          }}
          className="w-full rounded-lg border bg-transparent px-3 py-2"
        >
          <option value="category">Это категория</option>
          <option value="service">Это услуга</option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Категория (для услуги)</label>
        <select
          name="parentId"
          disabled={isCategory}
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
        >
          <option value="">— без категории —</option>
          {parentOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Минуты</label>
        <input
          name="durationMin"
          type="number"
          min={0}
          step={5}
          placeholder={durPlaceholder}
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value || 0))}
          disabled={isCategory}
          className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Цена (€)</label>
        <input
          name="price"
          inputMode="decimal"
          placeholder={pricePlaceholder}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={isCategory}
          className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
        />
      </div>

      <div className="md:col-span-6">
        <label className="block text-sm mb-1">Описание</label>
        <textarea name="description" className="w-full rounded-lg border bg-transparent px-3 py-2" rows={3} placeholder="Короткое описание (опционально)" />
      </div>

      <div className="flex items-center gap-2">
        <input id="isActive" name="isActive" type="checkbox" defaultChecked className="rounded" />
        <label htmlFor="isActive">Активна</label>
      </div>

      <div className="md:col-span-6">
        <button className="rounded-full px-4 py-2 border hover:bg-white/10 transition">Сохранить</button>
      </div>
    </form>
  );
}
