import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { dbMiddleware } from './middleware/db'
import { plansRoutes } from './routes/plans'
import { responsesRoutes } from './routes/responses'
import type { Bindings } from './lib/env'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:8787', 'http://localhost:8788', 'https://planthetrip.huskers15.workers.dev', 'https://justplanthetrip.com', 'https://www.justplanthetrip.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('/api/*', dbMiddleware)

const api = new Hono<{ Bindings: Bindings }>()
  .route('/plans', plansRoutes)
  .route('/responses', responsesRoutes)
  .get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  })

app.route('/api', api)

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err.stack)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export type AppType = typeof api

export default app
