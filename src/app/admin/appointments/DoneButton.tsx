// src/app/admin/appointments/DoneButton.tsx
"use client";

import { useTransition, useState } from "react";
import { markDone } from "./actions";

export function DoneButton({ id, initialStatus }: { id: string; initialStatus: "PENDING" | "CONFIRMED" | "CANCELED" | "DONE" }) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, start] = useTransition();

  if (status === "DONE") {
    return <span className="text-emerald-600 font-medium">DONE</span>;
  }

  return (
    <button
      className="rounded-full px-3 py-1 text-sm bg-black text-white disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        start(async () => {
          const r = await markDone(id);
          if (r.ok) setStatus("DONE");
          // опционально: добавить toast
        });
      }}
    >
      {pending ? "..." : "DONE"}
    </button>
  );
}
