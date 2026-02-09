import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import { planResponses, plans } from "../db/schema";
import type { Plan, PlanResponse } from "../db/types";
import type { Bindings } from "../lib/env";

declare module "hono" {
  interface ContextVariableMap {
    verifiedPlan: Plan;
    verifiedResponse: PlanResponse;
  }
}

function verifyPlan() {
  return createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
    const db = c.var.db;
    const resourceId = c.req.param("id") ?? "";

    const [resource] = await db.select().from(plans).where(eq(plans.id, resourceId)).limit(1);

    if (!resource) {
      return c.json({ error: "Not found" }, 404);
    }

    const clonedBody: { editToken?: string } = await c.req.raw.clone().json();

    if (resource.editToken !== clonedBody.editToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("verifiedPlan", resource);
    return next();
  });
}

function verifyResponse() {
  return createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
    const db = c.var.db;
    const resourceId = c.req.param("id") ?? "";

    const [resource] = await db
      .select()
      .from(planResponses)
      .where(eq(planResponses.id, resourceId))
      .limit(1);

    if (!resource) {
      return c.json({ error: "Not found" }, 404);
    }

    const clonedBody: { editToken?: string } = await c.req.raw.clone().json();

    if (resource.editToken !== clonedBody.editToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("verifiedResponse", resource);
    return next();
  });
}

const VERIFY_MIDDLEWARE = {
  plan: verifyPlan,
  response: verifyResponse,
} as const;

type ProtectedResource = keyof typeof VERIFY_MIDDLEWARE;

export function verifyEditToken(resourceType: ProtectedResource) {
  return VERIFY_MIDDLEWARE[resourceType]();
}
