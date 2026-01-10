//src/app/admin/clients/[id]/DeleteClientForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

type Props = {
  clientId: string;
  clientName: string;
};

export default function DeleteClientForm({ clientId, clientName }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
  setIsDeleting(true);
  try {
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      // ✅ Принудительная перезагрузка на список клиентов
      window.location.href = "/admin/clients";
    } else {
      const error = await res.json();
      console.error("Delete failed:", error);
      alert(`Ошибка при удалении клиента: ${error.error || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Ошибка при удалении клиента");
  } finally {
    setIsDeleting(false);
  }
};

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
          <div className="text-2xl mb-4">🗑️</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Удалить клиента?
          </h2>
          <p className="text-gray-400 mb-4">
            Клиент <span className="text-white font-medium">«{clientName}»</span> будет перемещён в архив.
            Вы сможете восстановить его позже.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:from-red-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 hover:border-red-400/50 transition-all"
    >
      <Trash2 size={16} />
      Удалить
    </button>
  );
}






//-------------работало до 10.01.26---------
// "use client";

// import { useActionState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { deleteClient, type DeleteClientState } from "./actions";

// const initial: DeleteClientState = { ok: false };

// export default function DeleteClientForm(props: {
//   clientId: string;
//   clientName: string;
// }) {
//   const router = useRouter();
//   const [state, formAction, isPending] = useActionState(deleteClient, initial);

//   useEffect(() => {
//     if (state.ok) {
//       // уходим к списку клиентов
//       router.replace("/admin/clients");
//     }
//   }, [state.ok, router]);

//   return (
//     <form
//       action={formAction}
//       onSubmit={(e) => {
//         if (
//           !confirm(
//             `Удалить клиента «${props.clientName}»? Это действие необратимо.`
//           )
//         ) {
//           e.preventDefault();
//         }
//       }}
//       className="inline-flex"
//     >
//       <input type="hidden" name="id" value={props.clientId} />
//       <button
//         type="submit"
//         className="btn border-rose-500/60 text-rose-300 hover:bg-rose-500/10"
//         disabled={isPending}
//       >
//         {isPending ? "Удаляем…" : "Удалить"}
//       </button>
//       {state.formError && (
//         <span className="ml-2 text-xs text-rose-400">{state.formError}</span>
//       )}
//     </form>
//   );
// }
