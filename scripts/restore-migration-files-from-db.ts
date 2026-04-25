#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { prisma } from "../src/lib/prisma";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const DEFAULT_MIGRATIONS = [
  "20241216000000_add_customer_info_fields",
  "20251125202804_add_google_quick_registration",
];

const targetMigrations =
  process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_MIGRATIONS;

function prismaChecksum(sql: string): string {
  const normalized = sql.replace(/\r\n/g, "\n");
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

try {
  const columns = await prisma.$queryRaw<
    Array<{ column_name: string | null }>
  >`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = '_prisma_migrations'
  `;

  const hasScriptColumn = columns.some(
    (column) => String(column.column_name ?? "").toLowerCase() === "script",
  );

  if (!hasScriptColumn) {
    console.warn(
      "WARN: _prisma_migrations.script is not available in this Prisma version. Switching to checksum sync mode.",
    );

    for (const migrationName of targetMigrations) {
      const targetFile = path.join(
        ROOT_DIR,
        "prisma",
        "migrations",
        migrationName,
        "migration.sql",
      );

      const sql = await fs.readFile(targetFile, "utf8");
      const checksum = prismaChecksum(sql);

      const updated = await prisma.$executeRaw`
        UPDATE "_prisma_migrations"
        SET "checksum" = ${checksum}
        WHERE "migration_name" = ${migrationName}
      `;

      if (!updated) {
        throw new Error(
          `Migration '${migrationName}' not found in _prisma_migrations.`,
        );
      }

      console.log(`Synced checksum for ${migrationName}`);
    }

    console.log("\nDone.");
    console.log("Now validate:");
    console.log("  npx prisma migrate status");
    console.log("  npx prisma migrate dev --name smoke_check --create-only");
    process.exit(0);
  }

  for (const migrationName of targetMigrations) {
    const rows = await prisma.$queryRaw<
      Array<{ migration_name: string; script: string | null }>
    >`
      SELECT migration_name, script
      FROM "_prisma_migrations"
      WHERE migration_name = ${migrationName}
      ORDER BY finished_at DESC NULLS LAST, started_at DESC NULLS LAST
      LIMIT 1
    `;

    if (rows.length === 0) {
      throw new Error(
        `Migration '${migrationName}' not found in _prisma_migrations.`,
      );
    }

    const row = rows[0];
    const script =
      typeof row.script === "string" ? row.script : String(row.script ?? "");

    if (!script.trim()) {
      throw new Error(
        `Migration '${migrationName}' has empty script in _prisma_migrations.`,
      );
    }

    const targetDir = path.join(ROOT_DIR, "prisma", "migrations", migrationName);
    const targetFile = path.join(targetDir, "migration.sql");
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(targetFile, script, "utf8");
    console.log(
      `Restored ${migrationName} -> prisma/migrations/${migrationName}/migration.sql`,
    );
  }

  console.log("\nDone.");
  console.log("Review changes:");
  console.log("  git diff prisma/migrations");
  console.log("\nThen validate:");
  console.log("  npx prisma migrate status");
  console.log("  npx prisma migrate dev --name smoke_check --create-only");
} catch (error) {
  console.error(
    `ERROR: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
