import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    cloudflareTest(async () => {
      const migrations = await readD1Migrations(path.join(repoRoot, "drizzle"));

      return {
        miniflare: {
          compatibilityDate: "2025-12-10",
          d1Databases: ["planthetrip_d1"],
          bindings: {
            ENVIRONMENT: "test",
            TEST_MIGRATIONS: migrations,
          },
        },
      };
    }),
  ],
  test: {
    name: "worker",
    include: ["worker/**/*.test.ts"],
    setupFiles: ["./worker/test/apply-migrations.ts"],
  },
});
