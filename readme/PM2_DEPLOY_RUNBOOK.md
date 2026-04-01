# PM2 + Next.js Runbook (Production)

Этот runbook закрывает две типичные проблемы из логов:

- `Failed to find Server Action "..."`
- `prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }`

## 1. Безопасный деплой без рассинхрона Server Actions

Используйте только reload по `ecosystem.config.cjs`, а не случайные stop/start:

```bash
cd ~/apps/salon-elen-fe
chmod +x scripts/deploy-pm2.sh
./scripts/deploy-pm2.sh
```

Что делает скрипт:

1. `npm ci`
2. `rm -rf .next`
3. `npm run build`
4. `pm2 reload ecosystem.config.cjs --update-env`
5. `pm2 save`

Это уменьшает вероятность того, что клиент останется со старым action-id после новой сборки.

## 2. Проверка процессов PM2

```bash
pm2 status salon-elen-fe
pm2 logs salon-elen-fe --lines 150
pm2 show salon-elen-fe
```

Если в логах есть строка:

`Invalid project directory provided, no such directory: .../3000`

это значит, что процесс был запущен со старыми/лишними аргументами (например `next start -p 3000 3000`).
Быстрое исправление:

```bash
pm2 delete salon-elen-fe
pm2 start ecosystem.config.cjs --only salon-elen-fe --update-env
pm2 save
```

Если процесс иногда завершается через SIGKILL:

- проверьте, что используется `kill_timeout` (в `ecosystem.config.cjs` уже задан);
- избегайте ручных `pm2 stop && pm2 start` в момент трафика.

## 3. Быстрая диагностика Prisma `kind: Closed`

Проверьте переменные и сетевой доступ:

```bash
echo "$DATABASE_URL" | sed 's/:[^:@/]*@/:***@/'
```

Проверьте, не перезапускается ли БД/пулер:

```bash
# ваш провайдер БД: dashboard/logs/events
```

Проверьте лимит соединений:

- если используется pooler (PgBouncer/Neon pooler/Supabase pooler), используйте pooled URL для production;
- убедитесь, что `max_connections` не упирается в потолок.

## 4. Почему `Failed to find Server Action` после деплоя

Это обычно **не баг кода**, а mismatch версии:

- открытая старая вкладка пользователя;
- старая HTML/RSC-страница из прокси-кэша;
- параллельные версии приложения во время обновления.

Что делать:

1. деплой только через `reload` и одну рабочую версию;
2. при наличии reverse proxy/CDN не кэшировать HTML App Router агрессивно;
3. после релиза при необходимости инвалидировать кэш на прокси.

## 5. Рекомендуемый релизный цикл

```bash
git pull --ff-only
./scripts/deploy-pm2.sh
pm2 logs salon-elen-fe --lines 80 --nostream
```

Если нужно откатить:

1. вернуться на предыдущий commit;
2. снова `./scripts/deploy-pm2.sh`.
