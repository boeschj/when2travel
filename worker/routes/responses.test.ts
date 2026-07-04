import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import app from "../index";

const createdPlanSchema = z.object({
  id: z.string(),
  editToken: z.string(),
});

const createdResponseSchema = z.object({
  id: z.string(),
  planId: z.string(),
  name: z.string(),
  availableDates: z.array(z.string()),
  editToken: z.string(),
});

const updatedResponseSchema = createdResponseSchema.omit({ editToken: true });

const VALID_PLAN_BODY = {
  name: "Lisbon Trip",
  numDays: 5,
  startRange: "2026-08-01",
  endRange: "2026-08-10",
};

async function requestJson(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body: unknown,
): Promise<Response> {
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
  const response = await requestJson("/api/plans", "POST", VALID_PLAN_BODY);
  const createdPlan = createdPlanSchema.parse(await response.json());
  return createdPlan;
}

async function createResponse(planId: string): Promise<z.infer<typeof createdResponseSchema>> {
  const response = await requestJson("/api/responses", "POST", {
    planId,
    name: "Ana",
    availableDates: ["2026-08-01", "2026-08-02"],
  });
  const createdResponse = createdResponseSchema.parse(await response.json());
  return createdResponse;
}

describe("POST /api/responses", () => {
  it("creates a response and returns it with an edit token", async () => {
    const plan = await createPlan();

    const response = await requestJson("/api/responses", "POST", {
      planId: plan.id,
      name: "Ana",
      availableDates: ["2026-08-01", "2026-08-03"],
    });

    expect(response.status).toBe(201);
    const createdResponse = createdResponseSchema.parse(await response.json());
    expect(createdResponse.planId).toBe(plan.id);
    expect(createdResponse.availableDates).toEqual(["2026-08-01", "2026-08-03"]);
    expect(createdResponse.editToken.length).toBeGreaterThan(0);
  });

  it("returns 404 for an unknown plan", async () => {
    const response = await requestJson("/api/responses", "POST", {
      planId: "does-not-exist",
      name: "Ana",
      availableDates: ["2026-08-01"],
    });

    expect(response.status).toBe(404);
  });

  it("rejects an empty name", async () => {
    const plan = await createPlan();

    const response = await requestJson("/api/responses", "POST", {
      planId: plan.id,
      name: "",
      availableDates: ["2026-08-01"],
    });

    expect(response.status).toBe(400);
  });

  it("rejects non-ISO available dates", async () => {
    const plan = await createPlan();

    const response = await requestJson("/api/responses", "POST", {
      planId: plan.id,
      name: "Ana",
      availableDates: ["not-a-date"],
    });

    expect(response.status).toBe(400);
  });
});

describe("PUT /api/responses/:id", () => {
  it("updates name and dates with a valid edit token", async () => {
    const plan = await createPlan();
    const createdResponse = await createResponse(plan.id);

    const response = await requestJson(`/api/responses/${createdResponse.id}`, "PUT", {
      editToken: createdResponse.editToken,
      name: "Ana Updated",
      availableDates: ["2026-08-05"],
    });

    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    const updatedResponse = updatedResponseSchema.parse(body);
    expect(updatedResponse.name).toBe("Ana Updated");
    expect(updatedResponse.availableDates).toEqual(["2026-08-05"]);
    expect(body).not.toHaveProperty("editToken");
  });

  it("rejects a wrong edit token", async () => {
    const plan = await createPlan();
    const createdResponse = await createResponse(plan.id);

    const response = await requestJson(`/api/responses/${createdResponse.id}`, "PUT", {
      editToken: "wrong-token",
      name: "Mallory",
    });

    expect(response.status).toBe(401);
  });

  it("returns 404 for an unknown response", async () => {
    const response = await requestJson("/api/responses/does-not-exist", "PUT", {
      editToken: "anything",
      name: "Ana",
    });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/responses/:id", () => {
  it("deletes the response with a valid edit token", async () => {
    const plan = await createPlan();
    const createdResponse = await createResponse(plan.id);

    const deleteResponse = await requestJson(`/api/responses/${createdResponse.id}`, "DELETE", {
      editToken: createdResponse.editToken,
    });
    const repeatDelete = await requestJson(`/api/responses/${createdResponse.id}`, "DELETE", {
      editToken: createdResponse.editToken,
    });

    expect(deleteResponse.status).toBe(200);
    expect(repeatDelete.status).toBe(404);
  });

  it("rejects a wrong edit token", async () => {
    const plan = await createPlan();
    const createdResponse = await createResponse(plan.id);

    const response = await requestJson(`/api/responses/${createdResponse.id}`, "DELETE", {
      editToken: "wrong-token",
    });

    expect(response.status).toBe(401);
  });
});
