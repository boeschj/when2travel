import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ROUTE_IDS } from '@/lib/routes'

export const Route = createFileRoute(ROUTE_IDS.RESPONSE_LAYOUT)({
  component: () => <Outlet />,
})
