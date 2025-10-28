// src/lib/fetchJson.ts
export type JsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; text: string };

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<JsonResult<T>> {
  const res = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Accept": "application/json",
    },
  });

  const ctype = res.headers.get("content-type") || "";
  // Если это не JSON — читаем как текст и возвращаем как ошибку,
  // чтобы не падать на res.json()
  if (!ctype.includes("application/json")) {
    const text = await res.text();
    return { ok: false, status: res.status, text };
  }

  try {
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (e) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, text };
  }
}
