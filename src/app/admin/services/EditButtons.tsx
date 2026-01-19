// src/app/admin/services/EditButtons.tsx
'use client';

import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import CategoryEditModal from './CategoryEditModal';
import ServiceEditModal from './ServiceEditModal';
import type { ActionResult } from './actions';

type CategoryForEdit = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  isActive: boolean;
};

type CategoryEditButtonProps = {
  category: CategoryForEdit;
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
  onUpdate: (formData: FormData) => Promise<ActionResult>;
  onDelete: (formData: FormData) => Promise<ActionResult>;
};

export function CategoryEditButton({ category, onUpdate, onDelete }: CategoryEditButtonProps) {
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
        <span className="hidden xl:inline">Редактировать</span>
        <span className="xl:hidden">Ред.</span>
      </button>

      {isOpen && (
        <CategoryEditModal
          category={category}
          onClose={() => setIsOpen(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

export function ServiceEditButton({ service, parentOptions, onUpdate, onDelete }: ServiceEditButtonProps) {
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
        <span className="hidden sm:inline">Редактировать</span>
        <span className="sm:hidden">Ред.</span>
      </button>

      {isOpen && (
        <ServiceEditModal
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


// // src/app/admin/services/EditButtons.tsx
// 'use client';

// import { useState } from 'react';
// import { Edit2 } from 'lucide-react';
// import CategoryEditModal from './CategoryEditModal';
// import ServiceEditModal from './ServiceEditModal';
// import type { ActionResult } from './actions';

// type CategoryForEdit = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   isActive: boolean;
// };

// type CategoryEditButtonProps = {
//   category: CategoryForEdit;
//   onUpdate: (formData: FormData) => Promise<ActionResult>;
//   onDelete: (formData: FormData) => Promise<ActionResult>;
// };

// type ParentOption = {
//   id: string;
//   name: string;
// };

// type ServiceForEdit = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   durationMin: number | null;
//   priceCents: number | null;
//   isActive: boolean;
//   parentId: string | null;
//   parentName: string;
// };

// type ServiceEditButtonProps = {
//   service: ServiceForEdit;
//   parentOptions: ParentOption[];
//   onUpdate: (formData: FormData) => Promise<ActionResult>;
//   onDelete: (formData: FormData) => Promise<ActionResult>;
// };

// export function CategoryEditButton({ category, onUpdate, onDelete }: CategoryEditButtonProps) {
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   return (
//     <>
//       <button
//         onClick={() => setIsOpen(true)}
//         type="button"
//         className={[
//           // сохраняем твой стиль, но делаем компактнее на узких карточках
//           'btn-primary cta-boost btn-primary-sheen idle-aura',
//           '!px-3 !py-1.5',
//           '!text-xs sm:!text-sm',
//           'whitespace-nowrap inline-flex items-center gap-2',
//         ].join(' ')}
//       >
//         <Edit2 className="h-4 w-4 shrink-0" />
//         <span className="hidden sm:inline">Редактировать</span>
//         <span className="sm:hidden">Ред.</span>
//       </button>

//       {isOpen && (
//         <CategoryEditModal
//           category={category}
//           onClose={() => setIsOpen(false)}
//           onUpdate={onUpdate}
//           onDelete={onDelete}
//         />
//       )}
//     </>
//   );
// }

// export function ServiceEditButton({ service, parentOptions, onUpdate, onDelete }: ServiceEditButtonProps) {
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   return (
//     <>
//       <button
//         onClick={() => setIsOpen(true)}
//         type="button"
//         className={[
//           'btn-secondary',
//           '!px-3 !py-1.5',
//           '!text-xs sm:!text-sm',
//           'whitespace-nowrap inline-flex items-center gap-2',
//         ].join(' ')}
//       >
//         <Edit2 className="h-4 w-4 shrink-0" />
//         <span className="hidden sm:inline">Редактировать</span>
//         <span className="sm:hidden">Ред.</span>
//       </button>

//       {isOpen && (
//         <ServiceEditModal
//           service={service}
//           parentOptions={parentOptions}
//           onClose={() => setIsOpen(false)}
//           onUpdate={onUpdate}
//           onDelete={onDelete}
//         />
//       )}
//     </>
//   );
// }







//------------добавляем кнопку редактирования категории и услуги-----------------
// 'use client';

// import { useState } from 'react';
// import { Edit2 } from 'lucide-react';
// import CategoryEditModal from './CategoryEditModal';
// import ServiceEditModal from './ServiceEditModal';
// import type { ActionResult } from './actions';

// // Category types
// type CategoryForEdit = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   isActive: boolean;
// };

// type CategoryEditButtonProps = {
//   category: CategoryForEdit;
//   onUpdate: (formData: FormData) => Promise<ActionResult>;
//   onDelete: (formData: FormData) => Promise<ActionResult>;
// };

// // Service types
// type ParentOption = {
//   id: string;
//   name: string;
// };

// type ServiceForEdit = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   durationMin: number | null;
//   priceCents: number | null;
//   isActive: boolean;
//   parentId: string | null;
//   parentName: string;
// };

// type ServiceEditButtonProps = {
//   service: ServiceForEdit;
//   parentOptions: ParentOption[];
//   onUpdate: (formData: FormData) => Promise<ActionResult>;
//   onDelete: (formData: FormData) => Promise<ActionResult>;
// };

// // Category Edit Button Component
// export function CategoryEditButton({ category, onUpdate, onDelete }: CategoryEditButtonProps) {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <>
//       <button
//         onClick={() => setIsOpen(true)}
//         className="btn-primary cta-boost btn-primary-sheen idle-aura"
//         type="button"
//       >
//         <Edit2 className="h-4 w-4 inline mr-2" />
//         Редактировать
//       </button>

//       {isOpen && (
//         <CategoryEditModal
//           category={category}
//           onClose={() => setIsOpen(false)}
//           onUpdate={onUpdate}
//           onDelete={onDelete}
//         />
//       )}
//     </>
//   );
// }

// // Service Edit Button Component
// export function ServiceEditButton({ service, parentOptions, onUpdate, onDelete }: ServiceEditButtonProps) {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <>
//       <button
//         onClick={() => setIsOpen(true)}
//         className="btn-secondary"
//         type="button"
//       >
//         <Edit2 className="h-4 w-4 inline mr-2" />
//         Редактировать
//       </button>

//       {isOpen && (
//         <ServiceEditModal
//           service={service}
//           parentOptions={parentOptions}
//           onClose={() => setIsOpen(false)}
//           onUpdate={onUpdate}
//           onDelete={onDelete}
//         />
//       )}
//     </>
//   );
// }
