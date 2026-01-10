// src/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Получение текущей сессии пользователя
 * 
 * @example
 * // В Server Components:
 * const session = await auth();
 * 
 * // В API Routes:
 * const session = await auth();
 * if (!session?.user) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * }
 */
export const auth = () => getServerSession(authOptions);

// Реэкспортируем authOptions для использования в [...nextauth]/route.ts
export { authOptions };