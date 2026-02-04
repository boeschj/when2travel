import type { InferResponseType } from "hono/client";

import type { client } from "./api";

type Client = typeof client;

// Extract the success response type from the discriminated union
export type PlanWithResponses = Extract<
  Awaited<InferResponseType<Client["plans"][":id"]["$get"]>>,
  { id: string }
>;

export type PlanResponse = NonNullable<PlanWithResponses["responses"]>[number];

export interface CompatibleDateRange {
  start: string;
  end: string;
  availableCount: number;
  totalCount: number;
}

export interface ResponseFormData {
  name: string;
  availableDates: string[];
}

export interface DateRange {
  id: string;
  start: string;
  end: string;
  days: number;
  status: "available" | "unavailable";
}
