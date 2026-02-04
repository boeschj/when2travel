import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { planResponses, plans } from "./schema";

export type Plan = InferSelectModel<typeof plans>;
export type PlanResponse = InferSelectModel<typeof planResponses>;

export type NewPlan = InferInsertModel<typeof plans>;
export type NewPlanResponse = InferInsertModel<typeof planResponses>;

export type PlanWithResponses = Plan & {
  responses: PlanResponse[];
};
