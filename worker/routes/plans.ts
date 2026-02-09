import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";

import { planResponses, plans } from "../db/schema";
import type { Bindings } from "../lib/env";
import {
  createPlanSchema,
  deletePlanSchema,
  parseAvailableDates,
  updatePlanSchema,
} from "../lib/schemas";
import { verifyEditToken } from "../middleware/verify-edit-token";

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
      availableDates: parseAvailableDates(response.availableDates),
    }));

    const publicPlan = excludeEditToken(plan);

    return c.json({
      ...publicPlan,
      responses: parsedResponses,
    });
  })
  .put("/:id", verifyEditToken("plan"), zValidator("json", updatePlanSchema), async c => {
    const db = c.var.db;
    const planId = c.req.param("id");
    const body = c.req.valid("json");
    const existingPlan = c.var.verifiedPlan;

    const now = new Date().toISOString();
    const updateFields = excludeEditToken(body);

    const mergedStartRange = updateFields.startRange ?? existingPlan.startRange;
    const mergedEndRange = updateFields.endRange ?? existingPlan.endRange;

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

    if (!updatedPlan) {
      return c.json({ error: "Plan not found after update" }, 500);
    }

    return c.json(excludeEditToken(updatedPlan));
  })
  .delete("/:id", verifyEditToken("plan"), zValidator("json", deletePlanSchema), async c => {
    const db = c.var.db;
    const planId = c.req.param("id");

    await db.delete(plans).where(eq(plans.id, planId));

    return c.json({ message: "Plan deleted successfully" });
  });

function excludeEditToken<T extends { editToken: string }>(obj: T): Omit<T, "editToken"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Destructuring to omit editToken
  const { editToken, ...rest } = obj;
  return rest;
}
