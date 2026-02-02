import { hc } from 'hono/client'
import type { AppType } from '../../worker'
import { ApiError } from './errors'

export const client = hc<AppType>('/api')

export async function parseErrorResponse(response: { status: number; json: () => Promise<unknown> }, fallback: string): Promise<ApiError> {
  const body = await response.json().catch(() => null)
  const hasErrorMessage =
    typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
  const message = hasErrorMessage ? (body as { error: string }).error : fallback
  return new ApiError(response.status, message)
}

