import { createMiddleware } from 'hono/factory'
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'
import type { Bindings } from '../lib/env'

declare module 'hono' {
  interface ContextVariableMap {
    db: DrizzleD1Database
  }
}

export const dbMiddleware = createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
  const db = drizzle(c.env.when2travel_d1)
  c.set('db', db)
  await next()
})

