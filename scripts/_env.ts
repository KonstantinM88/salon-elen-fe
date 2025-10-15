// scripts/_env.ts
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

function loadIfExists(p: string) {
  const abs = path.resolve(process.cwd(), p);
  if (fs.existsSync(abs)) {
    dotenv.config({ path: abs });
    return true;
  }
  return false;
}

// Порядок: .env.local -> .env
// (точно так же, как делает Next при дев-запуске)
const loadedLocal = loadIfExists('.env.local');
const loadedEnv = loadIfExists('.env');

if (!loadedLocal && !loadedEnv) {
  // fallback – все равно загрузится из process.env, если установлено снаружи
}

function maskDbUrl(url: string | undefined): string {
  if (!url) return '(undefined)';
  try {
    const u = new URL(url);
    if (u.password) u.password = '***';
    // замаскируем логин для наглядности
    if (u.username) u.username = '***';
    return u.toString();
  } catch {
    return '(invalid DATABASE_URL)';
  }
}

export function assertEnv(): void {
  const db = process.env.DATABASE_URL;
  if (!db) {
    // Явная ошибка, чтобы не работать «в никуда»
    // Подсказывает, какие файлы мы пытались загрузить.
    throw new Error(
      `DATABASE_URL is not set. Checked .env.local (${loadedLocal}), .env (${loadedEnv}).`
    );
  }
  // Небольшой безопасный лог: поможет убедиться, что и сервер, и скрипты смотрят в одно и то же
  // (лог не содержит паролей)
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({ usingDatabase: maskDbUrl(db) })
  );
}
