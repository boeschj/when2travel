export const ROUTE_IDS = {
  HOME: '/',
  CREATE: '/create',
  TRIPS: '/trips',
  PLAN: '/plan/$planId/',
  PLAN_SHARE: '/plan/$planId/share',
  PLAN_RESPOND: '/plan/$planId/respond',
  RESPONSE_EDIT: '/response/$responseId/edit',
} as const

export const ROUTES = {
  HOME: '/',
  CREATE: '/create',
  TRIPS: '/trips',
  PLAN: '/plan/$planId',
  PLAN_SHARE: '/plan/$planId/share',
  PLAN_RESPOND: '/plan/$planId/respond',
  RESPONSE_EDIT: '/response/$responseId/edit',
} as const

export function buildAbsoluteUrl(route: string, params: Record<string, string>) {
  const path = Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`$${key}`, value),
    route
  )
  return `${window.location.origin}${path}`
}
