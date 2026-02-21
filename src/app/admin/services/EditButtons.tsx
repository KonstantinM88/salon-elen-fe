// src/app/admin/services/EditButtons.tsx
'use client';

import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import CategoryEditModal from './CategoryEditModal';
import ServiceEditModal from './ServiceEditModal';
import type { ActionResult } from './actions';
import type { SeoLocale } from '@/lib/seo-locale';

type CategoryForEdit = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  isActive: boolean;
};

type CategoryEditButtonProps = {
  category: CategoryForEdit;
  locale?: SeoLocale;
  onUpdate: (formData: FormData) => Promise<ActionResult>;
  onDelete: (formData: FormData) => Promise<ActionResult>;
};

type ParentOption = {
  id: string;
  name: string;
};

type ServiceForEdit = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  durationMin: number | null;
  priceCents: number | null;
  isActive: boolean;
  parentId: string | null;
  parentName: string;
};

type ServiceEditButtonProps = {
  service: ServiceForEdit;
  parentOptions: ParentOption[];
  locale?: SeoLocale;
  onUpdate: (formData: FormData) => Promise<ActionResult>;
  onDelete: (formData: FormData) => Promise<ActionResult>;
};

const EDIT_COPY: Record<SeoLocale, { edit: string; short: string }> = {
  de: { edit: 'Bearbeiten', short: 'Bearb.' },
  ru: { edit: 'Редактировать', short: 'Ред.' },
  en: { edit: 'Edit', short: 'Edit' },
};

export function CategoryEditButton({
  category,
  locale = 'de',
  onUpdate,
  onDelete,
}: CategoryEditButtonProps) {
  const t = EDIT_COPY[locale];
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={[
          'btn-primary cta-boost btn-primary-sheen idle-aura',
          '!px-2.5 !py-1',
          '!text-xs',
          'whitespace-nowrap inline-flex items-center gap-1.5',
        ].join(' ')}
      >
        <Edit2 className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden xl:inline">{t.edit}</span>
        <span className="xl:hidden">{t.short}</span>
      </button>

      {isOpen && (
        <CategoryEditModal
          locale={locale}
          category={category}
          onClose={() => setIsOpen(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

export function ServiceEditButton({
  service,
  parentOptions,
  locale = 'de',
  onUpdate,
  onDelete,
}: ServiceEditButtonProps) {
  const t = EDIT_COPY[locale];
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={[
          'btn-secondary',
          '!px-3 !py-1.5',
          '!text-xs sm:!text-sm',
          'whitespace-nowrap inline-flex items-center gap-2',
        ].join(' ')}
      >
        <Edit2 className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{t.edit}</span>
        <span className="sm:hidden">{t.short}</span>
      </button>

      {isOpen && (
        <ServiceEditModal
          locale={locale}
          service={service}
          parentOptions={parentOptions}
          onClose={() => setIsOpen(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
