# Neon-Safe Migration Flow

Use this flow for Neon to avoid `migrate dev` drift/reset prompts.

1. Create migration folder:
```bash
mkdir -p prisma/migrations/<timestamp>_<name>
```

2. Apply SQL to Neon:
```bash
npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/<timestamp>_<name>/migration.sql
```

3. Mark migration as applied:
```bash
npx prisma migrate resolve --schema prisma/schema.prisma --applied <timestamp>_<name>
```

4. Regenerate Prisma Client:
```bash
npx prisma generate
```
