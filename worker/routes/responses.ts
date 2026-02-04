import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";

import { planResponses, plans } from "../db/schema";
import type { Bindings } from "../lib/env";
import { createResponseSchema, deleteResponseSchema, updateResponseSchema } from "../lib/schemas";

const availableDatesSchema = z.array(z.string());

function parseAvailableDates(serialized: string): string[] {
  const parsed: unknown = JSON.parse(serialized);
  return availableDatesSchema.parse(parsed);
}

function serializeAvailableDates(dates: string[]): string {
  return JSON.stringify(dates);
}

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
  .put("/:id", zValidator("json", updateResponseSchema), async c => {
    const db = c.var.db;
    const responseId = c.req.param("id");
    const body = c.req.valid("json");

    const existingResults = await db
      .select()
      .from(planResponses)
      .where(eq(planResponses.id, responseId))
      .limit(1);
    const existingResponse = existingResults[0];

    if (!existingResponse) {
      return c.json({ error: "Response not found" }, 404);
    }

    if (existingResponse.editToken !== body.editToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

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
      .select()
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
  .delete("/:id", zValidator("json", deleteResponseSchema), async c => {
    const db = c.var.db;
    const responseId = c.req.param("id");
    const body = c.req.valid("json");

    const existingResults = await db
      .select()
      .from(planResponses)
      .where(eq(planResponses.id, responseId))
      .limit(1);
    const existingResponse = existingResults[0];

    if (!existingResponse) {
      return c.json({ error: "Response not found" }, 404);
    }

    if (existingResponse.editToken !== body.editToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await db.delete(planResponses).where(eq(planResponses.id, responseId));

    return c.json({ message: "Response deleted successfully" });
  });
