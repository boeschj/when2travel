---
paths:
  - "worker/**"
  - "drizzle/**"
---

# Worker + D1 rules

- Dev and tests run against LOCAL D1 (miniflare state under `.wrangler/`). Never add `remote: true` to a binding and never run `wrangler d1 execute --remote`. Prod data is read through `pnpm db:studio` only.
- Never edit a generated migration in `drizzle/`. Schema changes need Jordan's sign-off, then `pnpm db:generate` and `pnpm db:migrate:local`.
- Schema doctrine: conservative integer sizes for bounded domains, CHECK constraints on every bounded or non-empty column, as-const enums with CHECK over free text, no redundant state columns, column names consistent across tables, `onDelete` behavior explicit on every reference.
- Routes stay chained on the Hono app (RPC type inference and `testClient` both require it). Validate every request body with the Zod schemas in `worker/lib/schemas.ts`; edit tokens are checked by `verifyEditToken`, never inline.
- API responses never include `editToken` except at creation time (`excludeEditToken`).
