# PM2 + Next.js Runbook (Production)

Этот runbook закрывает две типичные проблемы из логов:

- `Failed to find Server Action "..."`
- `prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }`

## 1. Безопасный деплой без рассинхрона Server Actions

Используйте скрипт ниже: для текущего деплоя в один каталог он управляет
остановкой, сборкой и запуском через `ecosystem.config.cjs`:

```bash
cd ~/apps/salon-elen-fe
chmod +x scripts/deploy-pm2.sh
./scripts/deploy-pm2.sh
```

Что делает скрипт:

1. stop the current PM2 process before mutating `node_modules` or `.next`;
2. `npm ci`
3. move the current `.next` to a temporary backup;
4. `npm run build`
5. start the app from `ecosystem.config.cjs --update-env`
6. `pm2 save`

This repository is deployed in-place from one directory. Keeping `next start`
running while `.next` is removed or rebuilt can produce transient
`ChunkLoadError` / `MODULE_NOT_FOUND` errors for server chunks. The script now
prefers a short maintenance window during build over serving a half-replaced
build artifact. If the build fails, it restores the previous `.next` backup and
restarts the old PM2 process. This is a build-artifact fallback, not a complete
dependency rollback: after changing package versions, restore the matching
commit/lockfile and rerun the deploy script if a full rollback is needed.

Уникальный `DEPLOYMENT_VERSION` передаётся в сборку и PM2. Это не делает старые
Server Actions доступными: давно открытая вкладка всё ещё может требовать обновления.

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

1. деплой через `scripts/deploy-pm2.sh` и одну рабочую версию;
2. при наличии reverse proxy/CDN не кэшировать HTML App Router агрессивно;
3. после релиза при необходимости инвалидировать кэш на прокси.

### Неверный формат Server Action ID

`The Server Reference ID did not match the expected format. Received "y"`
отличается от отсутствующего действия с корректным ID. Значения вроде `y`
или короткого hex-ID могут приходить от автоматического сканирования либо от
несовместимой версии клиента. По одному PM2 stack trace нельзя установить
источник запроса или утверждать, что сайт взломан.

Сопоставьте время с nginx access log: путь, метод, user-agent и HTTP-статус.
Проверьте реальную форму в новой вкладке после деплоя. Если ошибка повторяется
на обычной форме, зафиксируйте URL, время и текущий deployment ID, исключите
старый HTML/RSC-кэш и параллельные сборки. Не отключайте авторизацию, проверки
Server Actions или их ошибки ради чистого лога. Постоянный encryption key нужен
для согласования нескольких серверов/сборок и не исправляет случайный ID `y`.

Документация: https://nextjs.org/docs/messages/failed-to-find-server-action

### Предупреждения об оптимизации CSS

Tailwind читает файлы как текст. При автоматическом сканировании от корня
`.next.previous-*`, созданная скриптом перед сборкой, могла попадать в источники
и порождать мусорные arbitrary classes. `src/app/globals.css` теперь ограничивает
источники каталогом `src`, исключая generated-код и `.bak`/`.backup`.
Резервные сборки также исключены в `.gitignore`. Корректные safe-area классы
в компонентах сохраняются; `npm run test:styles` проверяет область сканирования
и генерацию мобильного отступа. `Found warnings while optimizing generated CSS`
само по себе не означает провал сборки — проверяйте итоговый exit code.

## 5. Рекомендуемый релизный цикл

```bash
git pull --ff-only
./scripts/deploy-pm2.sh
pm2 logs salon-elen-fe --lines 80 --nostream
```

Если нужно откатить:

1. вернуться на предыдущий commit;
2. снова `./scripts/deploy-pm2.sh`.

## 6. Neon не переходит в Scale to Zero

Проверьте, не остался ли старый 15-минутный AI Health cron:

```bash
crontab -l | grep 'ai-health'
```

В production нужен только ежедневный отчёт:

```cron
0 8 * * * curl -sS -X POST 'https://permanent-halle.de/api/admin/ai-health?action=daily' -H "Authorization: Bearer $CRON_SECRET"
```

Удалите через `crontab -e` строку с
`ai-health?action=alert`. Код также пропускает эту проверку без запроса к
БД, если не установлено `AI_HEALTH_REALTIME_ALERTS_ENABLED=true`.
Включать эту опцию нужно только осознанно: каждая проверка будит Neon и
сбрасывает таймер автопаузы.

После деплоя подождите 20-30 минут без трафика и проверьте Neon
`Monitoring -> System operations`: старты ровно в `:00`, `:15`, `:30`, `:45`
должны исчезнуть. AI-виджет в админке запрашивает метрики один раз
при открытии; дальше они обновляются только кнопкой.
