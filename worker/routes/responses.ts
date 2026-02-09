import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";

import { planResponses, plans } from "../db/schema";
import type { Bindings } from "../lib/env";
import {
  createResponseSchema,
  deleteResponseSchema,
  parseAvailableDates,
  serializeAvailableDates,
  updateResponseSchema,
} from "../lib/schemas";
import { verifyEditToken } from "../middleware/verify-edit-token";

export const responsesRoutes = new Hono<{ Bindings: Bindings }>()
  .post("/", zValidator("json", createResponseSchema), async c => {
    const db = c.var.db;
    const body = c.req.valid("json");

    const planResults = await db.select().from(plans).where(eq(plans.id, body.planId)).limit(1);
    const plan = planResults[0];

    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
    }

    const id = nanoid();
    const editToken = nanoid();
    const now = new Date().toISOString();

    const newResponse = {
      id,
      planId: body.planId,
      name: body.name,
      availableDates: serializeAvailableDates(body.availableDates),
      editToken,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(planResponses).values(newResponse);

    return c.json(
      {
        id,
        planId: body.planId,
        name: body.name,
        availableDates: body.availableDates,
        editToken,
        createdAt: now,
        updatedAt: now,
      },
      201,
    );
  })
  .put("/:id", verifyEditToken("response"), zValidator("json", updateResponseSchema), async c => {
    const db = c.var.db;
    const responseId = c.req.param("id");
    const body = c.req.valid("json");

    const now = new Date().toISOString();

    await db
      .update(planResponses)
      .set({
        ...(body.name && { name: body.name }),
        ...(body.availableDates && {
          availableDates: serializeAvailableDates(body.availableDates),
        }),
        updatedAt: now,
      })
      .where(eq(planResponses.id, responseId));

    const updatedResults = await db
      .select({
        id: planResponses.id,
        planId: planResponses.planId,
        name: planResponses.name,
        availableDates: planResponses.availableDates,
        createdAt: planResponses.createdAt,
        updatedAt: planResponses.updatedAt,
      })
      .from(planResponses)
      .where(eq(planResponses.id, responseId))
      .limit(1);
    const updatedResponse = updatedResults[0];

    if (!updatedResponse) {
      return c.json({ error: "Response not found after update" }, 500);
    }

    return c.json({
      ...updatedResponse,
      availableDates: parseAvailableDates(updatedResponse.availableDates),
    });
  })
  .delete(
    "/:id",
    verifyEditToken("response"),
    zValidator("json", deleteResponseSchema),
    async c => {
      const db = c.var.db;
      const responseId = c.req.param("id");

      await db.delete(planResponses).where(eq(planResponses.id, responseId));

      return c.json({ message: "Response deleted successfully" });
    },
  );
