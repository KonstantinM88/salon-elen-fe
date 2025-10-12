// src/app/users/page.tsx
import { redirect } from "next/navigation";

/** Легаси-редирект: /users -> /admin/users */
export default function UsersLegacyRedirect() {
  redirect("/admin/users");
}
