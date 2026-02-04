import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";

import { planResponses, plans } from "../db/schema";
import type { Bindings } from "../lib/env";
import { createPlanSchema, deletePlanSchema, updatePlanSchema } from "../lib/schemas";

const availableDatesSchema = z.array(z.string());

export const plansRoutes = new Hono<{ Bindings: Bindings }>()
  .post("/", zValidator("json", createPlanSchema), async c => {
    const db = c.var.db;
    const body = c.req.valid("json");

    const id = nanoid();
    const editToken = nanoid();
    const now = new Date().toISOString();

    const newPlan = {
      id,
      editToken,
      name: body.name,
      numDays: body.numDays,
      startRange: body.startRange,
      endRange: body.endRange,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(plans).values(newPlan);

    return c.json(newPlan, 201);
  })
  .get("/:id", async c => {
    const db = c.var.db;
    const planId = c.req.param("id");

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
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
      .where(eq(planResponses.planId, planId));

    const parsedResponses = responses.map(response => ({
      ...response,
      availableDates: availableDatesSchema.parse(JSON.parse(response.availableDates)),
    }));

    const publicPlan = excludeEditToken(plan);

    return c.json({
      ...publicPlan,
      responses: parsedResponses,
    });
  })
  .put("/:id", zValidator("json", updatePlanSchema), async c => {
    const db = c.var.db;
    const planId = c.req.param("id");
    const body = c.req.valid("json");

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
    }

    if (plan.editToken !== body.editToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const now = new Date().toISOString();
    const updateFields = excludeEditToken(body);

    const mergedStartRange = updateFields.startRange ?? plan.startRange;
    const mergedEndRange = updateFields.endRange ?? plan.endRange;

    const startDateExceedsEndDate = new Date(mergedStartRange) > new Date(mergedEndRange);
    if (startDateExceedsEndDate) {
      return c.json({ error: "Start date must be before or equal to end date" }, 400);
    }

    await db
      .update(plans)
      .set({
        ...(updateFields.name && { name: updateFields.name }),
        ...(updateFields.numDays && { numDays: updateFields.numDays }),
        ...(updateFields.startRange && { startRange: updateFields.startRange }),
        ...(updateFields.endRange && { endRange: updateFields.endRange }),
        updatedAt: now,
      })
      .where(eq(plans.id, planId));

    const [updatedPlan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

    return c.json(updatedPlan);
  })
  .delete("/:id", zValidator("json", deletePlanSchema), async c => {
    const db = c.var.db;
    const planId = c.req.param("id");
    const body = c.req.valid("json");

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
    }

    if (plan.editToken !== body.editToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await db.delete(plans).where(eq(plans.id, planId));

    return c.json({ message: "Plan deleted successfully" });
  });

function excludeEditToken<T extends { editToken: string }>(obj: T): Omit<T, "editToken"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Destructuring to omit editToken
  const { editToken, ...rest } = obj;
  return rest;
}
