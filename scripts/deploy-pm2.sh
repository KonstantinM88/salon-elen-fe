#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="${APP_NAME:-salon-elen-fe}"
APP_PORT="${APP_PORT:-3000}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

COMMIT_SHA="$(git rev-parse --short HEAD)"
DEPLOYMENT_STAMP="$(date -u +%Y%m%d%H%M%S)"
DEPLOYMENT_VERSION="${DEPLOYMENT_VERSION:-${DEPLOYMENT_STAMP}-${COMMIT_SHA}}"
export DEPLOYMENT_VERSION

echo "[deploy] app=$APP_NAME port=$APP_PORT dir=$ROOT_DIR deployment=$DEPLOYMENT_VERSION"
PREVIOUS_BUILD=".next.previous-${DEPLOYMENT_STAMP}"
APP_EXISTS=0

restore_previous_build() {
  local exit_code=$?
  echo "[deploy] ERROR: deployment failed (exit=$exit_code)."

  if [ -d "$PREVIOUS_BUILD" ]; then
    echo "[deploy] Restoring previous .next build"
    rm -rf .next
    mv "$PREVIOUS_BUILD" .next
  fi

  if [ "$APP_EXISTS" = "1" ]; then
    echo "[deploy] Restarting previous PM2 process"
    pm2 restart "$APP_NAME" --update-env || pm2 start ecosystem.config.cjs --only "$APP_NAME" --update-env || true
    pm2 save || true
  fi

  exit "$exit_code"
}

trap restore_previous_build ERR

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[deploy] ERROR: pm2 is not installed or not in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[deploy] ERROR: npm is not installed or not in PATH."
  exit 1
fi

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  APP_EXISTS=1
  echo "[deploy] Stopping PM2 process before mutating node_modules/.next"
  pm2 stop "$APP_NAME"
fi

echo "[deploy] Installing dependencies"
npm ci

echo "[deploy] Backing up previous build artifacts"
rm -rf "$PREVIOUS_BUILD"
if [ -d .next ]; then
  mv .next "$PREVIOUS_BUILD"
fi

echo "[deploy] Building Next.js app"
npm run build

trap - ERR

echo "[deploy] Starting PM2 process from ecosystem config"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 delete "$APP_NAME"
fi
pm2 start ecosystem.config.cjs --only "$APP_NAME" --update-env

echo "[deploy] Removing previous build backup"
rm -rf "$PREVIOUS_BUILD"

echo "[deploy] Saving PM2 process list"
pm2 save

echo "[deploy] Status"
pm2 status "$APP_NAME"

echo "[deploy] Tail logs (last 40 lines)"
pm2 logs "$APP_NAME" --lines 40 --nostream

echo "[deploy] Done"
