import { createFileRoute, Outlet, notFound } from '@tanstack/react-router'
import { AppHeader } from '@/components/shared/app-header'
import { planKeys } from '@/lib/queries'
import { ApiError } from '@/lib/errors'
import { NotFound } from '@/components/shared/not-found'
import { ROUTE_IDS } from '@/lib/routes'

export const Route = createFileRoute(ROUTE_IDS.PLAN_LAYOUT)({
  loader: async ({ context: { queryClient }, params: { planId } }) => {
    try {
      await queryClient.ensureQueryData(planKeys.detail(planId))
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  component: PlanLayout,
  notFoundComponent: NotFound,
})

function PlanLayout() {
  const { planId } = Route.useParams()

  return (
    <>
      <AppHeader planId={planId} />
      <Outlet />
    </>
  )
}
