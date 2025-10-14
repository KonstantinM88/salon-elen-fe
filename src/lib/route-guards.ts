// src/lib/route-guards.ts
import type { NextResponse } from "next/server";
import {
  assertAdminApi,
  assertAdminOrMasterApi,
  assertAdminAction,
  assertAdminOrMasterAction,
} from "./rbac";

/** HOF: защита API-метода только для ADMIN */
export function withAdminRoute<
  T extends (req: Request) => Promise<Response | NextResponse>,
>(handler: T): (req: Request) => Promise<Response | NextResponse> {
  return async (req: Request) => {
    const guard = await assertAdminApi();
    if (guard) return guard;
    return handler(req);
  };
}

/** HOF: защита API-метода для ADMIN|MASTER */
export function withAdminOrMasterRoute<
  T extends (req: Request) => Promise<Response | NextResponse>,
>(handler: T): (req: Request) => Promise<Response | NextResponse> {
  return async (req: Request) => {
    const guard = await assertAdminOrMasterApi();
    if (guard) return guard;
    return handler(req);
  };
}

/** HOF: для server actions (только ADMIN). Пример использования в actions ниже */
export function withAdminAction<
  T extends (...args: never[]) => Promise<unknown>,
>(action: T): T {
  return (async (...args: never[]) => {
    await assertAdminAction();
    return action(...args);
  }) as T;
}

/** HOF: server actions для ADMIN|MASTER */
export function withAdminOrMasterAction<
  T extends (...args: never[]) => Promise<unknown>,
>(action: T): T {
  return (async (...args: never[]) => {
    await assertAdminOrMasterAction();
    return action(...args);
  }) as T;
}
