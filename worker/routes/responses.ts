import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { plans, planResponses } from '../db/schema'
import { createResponseSchema, updateResponseSchema, deleteResponseSchema } from '../lib/schemas'
import type { Bindings } from '../lib/env'

export const responsesRoutes = new Hono<{ Bindings: Bindings }>()
  .post('/', zValidator('json', createResponseSchema), async (c) => {
    const db = c.var.db
    const body = c.req.valid('json')

    const [plan] = await db.select().from(plans).where(eq(plans.id, body.planId)).limit(1)

    if (!plan) {
      return c.json({ error: 'Plan not found' }, 404)
    }

    const id = nanoid()
    const editToken = nanoid()
    const now = new Date().toISOString()

    const newResponse = {
      id,
      planId: body.planId,
      name: body.name,
      availableDates: JSON.stringify(body.availableDates),
      editToken,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(planResponses).values(newResponse)

    return c.json({
      id,
      planId: body.planId,
      name: body.name,
      availableDates: body.availableDates,
      editToken,
      createdAt: now,
      updatedAt: now,
    }, 201)
  })
  .put('/:id', zValidator('json', updateResponseSchema), async (c) => {
    const db = c.var.db
    const responseId = c.req.param('id')
    const body = c.req.valid('json')

    const [response] = await db
      .select()
      .from(planResponses)
      .where(eq(planResponses.id, responseId))
      .limit(1)

    if (!response) {
      return c.json({ error: 'Response not found' }, 404)
    }

    if (response.editToken !== body.editToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const now = new Date().toISOString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Justification: editToken explicitly excluded from obj
    const { editToken, ...updateData } = body

    await db
      .update(planResponses)
      .set({
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.availableDates && { availableDates: JSON.stringify(updateData.availableDates) }),
        updatedAt: now,
      })
      .where(eq(planResponses.id, responseId))

    const [updatedResponse] = await db
      .select()
      .from(planResponses)
      .where(eq(planResponses.id, responseId))
      .limit(1)

    return c.json({
      ...updatedResponse,
      availableDates: JSON.parse(updatedResponse.availableDates) as string[],
    })
  })
  .delete('/:id', zValidator('json', deleteResponseSchema), async (c) => {
    const db = c.var.db
    const responseId = c.req.param('id')
    const body = c.req.valid('json')

    const [response] = await db
      .select()
      .from(planResponses)
      .where(eq(planResponses.id, responseId))
      .limit(1)

    if (!response) {
      return c.json({ error: 'Response not found' }, 404)
    }

    if (response.editToken !== body.editToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await db.delete(planResponses).where(eq(planResponses.id, responseId))

    return c.json({ message: 'Response deleted successfully' })
  })
