#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="${APP_NAME:-salon-elen-fe}"
APP_PORT="${APP_PORT:-3000}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "[deploy] app=$APP_NAME port=$APP_PORT dir=$ROOT_DIR"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[deploy] ERROR: pm2 is not installed or not in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[deploy] ERROR: npm is not installed or not in PATH."
  exit 1
fi

echo "[deploy] Installing dependencies"
npm ci

echo "[deploy] Cleaning previous build artifacts"
rm -rf .next

echo "[deploy] Building Next.js app"
npm run build

echo "[deploy] Reloading PM2 process"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --only "$APP_NAME" --update-env
else
  pm2 start ecosystem.config.cjs --only "$APP_NAME" --update-env
fi

echo "[deploy] Saving PM2 process list"
pm2 save

echo "[deploy] Status"
pm2 status "$APP_NAME"

echo "[deploy] Tail logs (last 40 lines)"
pm2 logs "$APP_NAME" --lines 40 --nostream

echo "[deploy] Done"
