import { defineConfig } from 'drizzle-kit'

const env = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  databaseId: process.env.CLOUDFLARE_DATABASE_ID,
  token: process.env.CLOUDFLARE_D1_TOKEN,
}

if (!env.accountId || !env.databaseId || !env.token) {
  throw new Error('Cloudflare D1 credentials are not set in the environment variables')
}

export default defineConfig({
  out: './drizzle',
  schema: './worker/db/schema.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: env.accountId,
    databaseId: env.databaseId,
    token: env.token,
  },
})