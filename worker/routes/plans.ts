import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { plans, planResponses } from '../db/schema'
import { createPlanSchema, updatePlanSchema, deletePlanSchema } from '../lib/schemas'
import type { Bindings } from '../lib/env'

export const plansRoutes = new Hono<{ Bindings: Bindings }>()
  .post('/', zValidator('json', createPlanSchema), async (c) => {
    const db = c.var.db
    const body = c.req.valid('json')

    const id = nanoid()
    const editToken = nanoid()
    const now = new Date().toISOString()

    const newPlan = {
      id,
      editToken,
      name: body.name,
      numDays: body.numDays,
      startRange: body.startRange,
      endRange: body.endRange,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(plans).values(newPlan)

    return c.json(newPlan, 201)
  })
  .get('/:id', async (c) => {
    const db = c.var.db
    const planId = c.req.param('id')

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1)

    if (!plan) {
      return c.json({ error: 'Plan not found' }, 404)
    }

    const responses = await db
      .select({
        id: planResponses.id,
        planId: planResponses.planId,
        name: planResponses.name,
        availableDates: planResponses.availableDates,
        createdAt: planResponses.createdAt,
        updatedAt: planResponses.updatedAt,
      })
      .from(planResponses)
      .where(eq(planResponses.planId, planId))

    const parsedResponses = responses.map((r) => ({
      ...r,
      availableDates: JSON.parse(r.availableDates) as string[],
    }))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Justification: editToken explicitly excluded from obj
    const { editToken, ...publicPlan } = plan

    return c.json({
      ...publicPlan,
      responses: parsedResponses,
    })
  })
  .put('/:id', zValidator('json', updatePlanSchema), async (c) => {
    const db = c.var.db
    const planId = c.req.param('id')
    const body = c.req.valid('json')

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1)

    if (!plan) {
      return c.json({ error: 'Plan not found' }, 404)
    }

    if (plan.editToken !== body.editToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const now = new Date().toISOString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Justification: editToken explicitly excluded from obj
    const { editToken, ...updateData } = body

    const mergedStartRange = updateData.startRange ?? plan.startRange
    const mergedEndRange = updateData.endRange ?? plan.endRange

    if (new Date(mergedStartRange) > new Date(mergedEndRange)) {
      return c.json({ error: 'Start date must be before or equal to end date' }, 400)
    }

    await db
      .update(plans)
      .set({
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.numDays && { numDays: updateData.numDays }),
        ...(updateData.startRange && { startRange: updateData.startRange }),
        ...(updateData.endRange && { endRange: updateData.endRange }),
        updatedAt: now,
      })
      .where(eq(plans.id, planId))

    const [updatedPlan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1)

    return c.json(updatedPlan)
  })
  .delete('/:id', zValidator('json', deletePlanSchema), async (c) => {
    const db = c.var.db
    const planId = c.req.param('id')
    const body = c.req.valid('json')

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1)

    if (!plan) {
      return c.json({ error: 'Plan not found' }, 404)
    }

    if (plan.editToken !== body.editToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await db.delete(plans).where(eq(plans.id, planId))

    return c.json({ message: 'Plan deleted successfully' })
  })
