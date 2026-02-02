import { createFileRoute, Outlet, notFound } from '@tanstack/react-router'
import { AppHeader } from '@/components/shared/app-header'
import { planKeys } from '@/lib/queries'
import { ApiError } from '@/lib/errors'
import { NotFound } from '@/components/shared/not-found'

export const Route = createFileRoute('/plan/$planId')({
  loader: async ({ context: { queryClient }, params: { planId } }) => {
    try {
      return await queryClient.ensureQueryData(planKeys.detail(planId))
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} | PlanTheTrip` : 'PlanTheTrip' }],
  }),
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
