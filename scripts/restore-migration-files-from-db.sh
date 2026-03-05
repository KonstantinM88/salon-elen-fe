#!/usr/bin/env bash
set -euo pipefail

# Restore applied Prisma migration files from the database (_prisma_migrations.script).
# This fixes "migration was modified after it was applied" without resetting data.
#
# Usage:
#   DATABASE_URL="..." bash scripts/restore-migration-files-from-db.sh
#   DATABASE_URL="..." bash scripts/restore-migration-files-from-db.sh 20241216000000_add_customer_info_fields 20251125202804_add_google_quick_registration

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is required but not found in PATH." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

node scripts/restore-migration-files-from-db.mjs "$@"
