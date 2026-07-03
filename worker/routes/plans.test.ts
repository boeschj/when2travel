import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import app from "../index";

const createdPlanSchema = z.object({
  id: z.string(),
  editToken: z.string(),
  name: z.string(),
  numDays: z.number(),
  startRange: z.string(),
  endRange: z.string(),
});

const publicPlanSchema = createdPlanSchema.omit({ editToken: true }).extend({
  responses: z.array(
    z.object({
      id: z.string(),
      planId: z.string(),
      name: z.string(),
      availableDates: z.array(z.string()),
    }),
  ),
});

const errorSchema = z.object({ error: z.string() });

const VALID_PLAN_BODY = {
  name: "Lisbon Trip",
  numDays: 5,
  startRange: "2026-08-01",
  endRange: "2026-08-10",
};

async function postJson(path: string, body: unknown): Promise<Response> {
  const response = await app.request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    env,
  );
  return response;
}

async function sendJson(path: string, method: "PUT" | "DELETE", body: unknown): Promise<Response> {
  const response = await app.request(
    path,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    env,
  );
  return response;
}

async function createPlan(): Promise<z.infer<typeof createdPlanSchema>> {
  const response = await postJson("/api/plans", VALID_PLAN_BODY);
  const createdPlan = createdPlanSchema.parse(await response.json());
  return createdPlan;
}

describe("POST /api/plans", () => {
  it("creates a plan and returns it with an edit token", async () => {
    const response = await postJson("/api/plans", VALID_PLAN_BODY);

    expect(response.status).toBe(201);
    const createdPlan = createdPlanSchema.parse(await response.json());
    expect(createdPlan.name).toBe(VALID_PLAN_BODY.name);
    expect(createdPlan.numDays).toBe(VALID_PLAN_BODY.numDays);
    expect(createdPlan.editToken.length).toBeGreaterThan(0);
  });

  it("rejects a missing name", async () => {
    const response = await postJson("/api/plans", { ...VALID_PLAN_BODY, name: "" });
    expect(response.status).toBe(400);
  });

  it("rejects numDays outside 1-60", async () => {
    const tooFew = await postJson("/api/plans", { ...VALID_PLAN_BODY, numDays: 0 });
    const tooMany = await postJson("/api/plans", { ...VALID_PLAN_BODY, numDays: 61 });

    expect(tooFew.status).toBe(400);
    expect(tooMany.status).toBe(400);
  });

  it("rejects a start date after the end date", async () => {
    const response = await postJson("/api/plans", {
      ...VALID_PLAN_BODY,
      startRange: "2026-08-10",
      endRange: "2026-08-01",
    });
    expect(response.status).toBe(400);
  });

  it("rejects a non-ISO date", async () => {
    const response = await postJson("/api/plans", { ...VALID_PLAN_BODY, startRange: "08/01/2026" });
    expect(response.status).toBe(400);
  });
});

describe("GET /api/plans/:id", () => {
  it("returns the plan without the edit token", async () => {
    const createdPlan = await createPlan();

    const response = await app.request(`/api/plans/${createdPlan.id}`, {}, env);

    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    const publicPlan = publicPlanSchema.parse(body);
    expect(publicPlan.id).toBe(createdPlan.id);
    expect(publicPlan.responses).toEqual([]);
    expect(body).not.toHaveProperty("editToken");
  });

  it("returns 404 for an unknown plan", async () => {
    const response = await app.request("/api/plans/does-not-exist", {}, env);

    expect(response.status).toBe(404);
    const errorBody = errorSchema.parse(await response.json());
    expect(errorBody.error).toBe("Plan not found");
  });

  it("includes responses with parsed available dates", async () => {
    const createdPlan = await createPlan();
    await postJson("/api/responses", {
      planId: createdPlan.id,
      name: "Ana",
      availableDates: ["2026-08-01", "2026-08-02"],
    });

    const response = await app.request(`/api/plans/${createdPlan.id}`, {}, env);
    const publicPlan = publicPlanSchema.parse(await response.json());

    expect(publicPlan.responses).toHaveLength(1);
    expect(publicPlan.responses[0]?.availableDates).toEqual(["2026-08-01", "2026-08-02"]);
  });
});

describe("PUT /api/plans/:id", () => {
  it("updates the plan with a valid edit token", async () => {
    const createdPlan = await createPlan();

    const response = await sendJson(`/api/plans/${createdPlan.id}`, "PUT", {
      editToken: createdPlan.editToken,
      name: "Porto Trip",
    });

    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    const updatedPlan = createdPlanSchema.omit({ editToken: true }).parse(body);
    expect(updatedPlan.name).toBe("Porto Trip");
    expect(body).not.toHaveProperty("editToken");
  });

  it("rejects a wrong edit token", async () => {
    const createdPlan = await createPlan();

    const response = await sendJson(`/api/plans/${createdPlan.id}`, "PUT", {
      editToken: "wrong-token",
      name: "Porto Trip",
    });

    expect(response.status).toBe(401);
  });

  it("returns 404 for an unknown plan", async () => {
    const response = await sendJson("/api/plans/does-not-exist", "PUT", {
      editToken: "anything",
      name: "Porto Trip",
    });

    expect(response.status).toBe(404);
  });

  it("rejects an update that inverts the date range", async () => {
    const createdPlan = await createPlan();

    const response = await sendJson(`/api/plans/${createdPlan.id}`, "PUT", {
      editToken: createdPlan.editToken,
      startRange: "2026-08-20",
    });

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/plans/:id", () => {
  it("deletes the plan with a valid edit token", async () => {
    const createdPlan = await createPlan();

    const deleteResponse = await sendJson(`/api/plans/${createdPlan.id}`, "DELETE", {
      editToken: createdPlan.editToken,
    });
    const getResponse = await app.request(`/api/plans/${createdPlan.id}`, {}, env);

    expect(deleteResponse.status).toBe(200);
    expect(getResponse.status).toBe(404);
  });

  it("rejects a wrong edit token", async () => {
    const createdPlan = await createPlan();

    const response = await sendJson(`/api/plans/${createdPlan.id}`, "DELETE", {
      editToken: "wrong-token",
    });

    expect(response.status).toBe(401);
  });

  it("cascades the delete to the plan's responses", async () => {
    const createdPlan = await createPlan();
    const responseCreation = await postJson("/api/responses", {
      planId: createdPlan.id,
      name: "Ana",
      availableDates: ["2026-08-01"],
    });
    const createdResponse = z
      .object({ id: z.string(), editToken: z.string() })
      .parse(await responseCreation.json());

    await sendJson(`/api/plans/${createdPlan.id}`, "DELETE", {
      editToken: createdPlan.editToken,
    });

    const orphanUpdate = await sendJson(`/api/responses/${createdResponse.id}`, "PUT", {
      editToken: createdResponse.editToken,
      name: "Ana Updated",
    });
    expect(orphanUpdate.status).toBe(404);
  });
});
