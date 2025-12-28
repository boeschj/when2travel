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
