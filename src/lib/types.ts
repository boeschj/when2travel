import type { InferResponseType } from "hono/client";

import type { client } from "./api";
import type { ISODateString } from "./date/types";

type Client = typeof client;

// Extract the success response type from the discriminated union
export type PlanWithResponses = Extract<
  Awaited<InferResponseType<Client["plans"][":id"]["$get"]>>,
  { id: string }
>;

export type PlanResponse = NonNullable<PlanWithResponses["responses"]>[number];

export interface CompatibleDateRange {
  start: ISODateString;
  end: ISODateString;
  availableCount: number;
  totalCount: number;
}

export interface ResponseFormData {
  name: string;
  availableDates: ISODateString[];
}

export interface DateRange {
  id: string;
  start: ISODateString;
  end: ISODateString;
  days: number;
  status: "available" | "unavailable";
}
