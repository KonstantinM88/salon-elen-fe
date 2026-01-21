// src/app/booking/(steps)/confirm/page.tsx
import { redirect } from 'next/navigation';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Временная заглушка: страница подтверждения не используется.
 * Если пользователь попал сюда, сразу переносим его на /booking/success
 * с сохранением всех query-параметров.
 */
export default function Page(props: { searchParams: SearchParams }): never {
  const sp = props.searchParams;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v != null) qs.append(key, String(v));
      }
    } else if (value != null) {
      qs.set(key, String(value));
    }
  }

  redirect(`/booking/success?${qs.toString()}`);
}
