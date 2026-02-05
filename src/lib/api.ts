import { hc } from "hono/client";

import type { AppType } from "../../worker";
import { ApiError } from "./errors";

export const client = hc<AppType>("/api");

function isErrorBody(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

export async function parseErrorResponse(
  response: { status: number; json: () => Promise<unknown> },
  fallback: string,
): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  const message = isErrorBody(body) ? body.error : fallback;
  return new ApiError(response.status, message);
}
