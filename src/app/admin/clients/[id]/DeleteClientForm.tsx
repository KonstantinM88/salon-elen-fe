"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteClient, type DeleteClientState } from "./actions";

const initial: DeleteClientState = { ok: false };

export default function DeleteClientForm(props: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(deleteClient, initial);

  useEffect(() => {
    if (state.ok) {
      // уходим к списку клиентов
      router.replace("/admin/clients");
    }
  }, [state.ok, router]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Удалить клиента «${props.clientName}»? Это действие необратимо.`
          )
        ) {
          e.preventDefault();
        }
      }}
      className="inline-flex"
    >
      <input type="hidden" name="id" value={props.clientId} />
      <button
        type="submit"
        className="btn border-rose-500/60 text-rose-300 hover:bg-rose-500/10"
        disabled={isPending}
      >
        {isPending ? "Удаляем…" : "Удалить"}
      </button>
      {state.formError && (
        <span className="ml-2 text-xs text-rose-400">{state.formError}</span>
      )}
    </form>
  );
}
