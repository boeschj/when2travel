import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { dbMiddleware } from './middleware/db'
import { plansRoutes } from './routes/plans'
import { responsesRoutes } from './routes/responses'
import { plans } from './db/schema'
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

// Dynamic OG meta tags for share pages
app.get('/plan/:planId/share', async (c) => {
  const planId = c.req.param('planId')

  try {
    const db = drizzle(c.env.planthetrip_d1)
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1)

    // Get the base HTML from assets
    const assetResponse = await c.env.ASSETS.fetch(new Request(new URL('/', c.req.url)))
    let html = await assetResponse.text()

    if (plan) {
      const title = `Join ${plan.name} on PlanTheTrip`
      const startDate = new Date(plan.startRange)
      const endDate = new Date(plan.endRange)
      const formatStart = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const formatEnd = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const description = `Add your availability for the ${plan.numDays}-day trip between ${formatStart} and ${formatEnd}!`
      const url = `https://justplanthetrip.com/plan/${planId}/share`

      // Replace OG meta tags
      html = html
        .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
        .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
        .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
        .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
        .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`)
        .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    }

    return c.html(html)
  } catch {
    // On error, fall back to serving the default HTML
    const assetResponse = await c.env.ASSETS.fetch(new Request(new URL('/', c.req.url)))
    return new Response(assetResponse.body, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
})

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err.stack)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export type AppType = typeof api

export default app
