// Route IDs for createFileRoute (index routes have trailing slash)
export const ROUTE_IDS = {
  HOME: '/',
  CREATE: '/create',
  PLAYGROUND: '/playground',
  TRIPS: '/trips',
  PLAN: '/plan/$planId/',
  PLAN_SHARE: '/plan/$planId/share',
  PLAN_RESPOND: '/plan/$planId/respond',
  RESPONSE_EDIT: '/response/$responseId/edit',
} as const

// Route paths for navigation (no trailing slashes)
export const ROUTES = {
  HOME: '/',
  CREATE: '/create',
  PLAYGROUND: '/playground',
  TRIPS: '/trips',
  PLAN: '/plan/$planId',
  PLAN_SHARE: '/plan/$planId/share',
  PLAN_RESPOND: '/plan/$planId/respond',
  RESPONSE_EDIT: '/response/$responseId/edit',
} as const
