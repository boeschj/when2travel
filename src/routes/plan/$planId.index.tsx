import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { client } from '@/lib/api'
import { PlanHeader } from '@/components/plan/organisms/plan-header'
import { AvailabilityCalendar } from '@/components/plan/organisms/availability-calendar'
import { ResultsSidebar } from '@/components/plan/organisms/results-sidebar'
import { AvailabilityLegend } from '@/components/plan/molecules/availability-legend'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useCompatibleRanges } from '@/hooks/use-compatible-ranges'
import type { PlanResponse } from '@/lib/types'
import { ROUTES, ROUTE_IDS } from '@/lib/routes'

export const Route = createFileRoute(ROUTE_IDS.PLAN)({
  component: PlanResultsPage,
})


function PlanResultsPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()

  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => {
      const res = await client.plans[':id'].$get({
        param: { id: planId },
      })
      if (!res.ok) {
        throw new Error('Failed to fetch plan')
      }
      return res.json()
    },
  })

  const compatibleRanges = useCompatibleRanges(plan)

  const handleEditAvailability = () => {
    const currentUserResponseId = plan?.responses?.find((r: PlanResponse) => {
      const hasEditToken = localStorage.getItem(`responseEditToken:${r.id}`) !== null
      return hasEditToken
    })?.id

    if (currentUserResponseId) {
      navigate({
        to: ROUTES.RESPONSE_EDIT,
        params: { responseId: currentUserResponseId }
      })
    } else {
      navigate({
        to: ROUTES.PLAN_RESPOND,
        params: { planId }
      })
    }
  }

  const handleShareResults = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Results link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleCreateNewEvent = () => {
    navigate({ to: ROUTES.CREATE })
  }

  const handleEditResponse = (responseId: string) => {
    const token = localStorage.getItem(`responseEditToken:${responseId}`)
    if (token) {
      navigate({
        to: ROUTES.RESPONSE_EDIT,
        params: { responseId }
      })
    } else {
      toast.error('You can only edit your own responses')
    }
  }

  if (isLoading || !plan) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const respondents = plan.responses?.map((r: PlanResponse) => ({
    id: r.id,
    name: r.name,
    availableDates: r.availableDates,
    isCurrentUser: localStorage.getItem(`responseEditToken:${r.id}`) !== null
  })) || []

  return (
    <div className="min-h-screen bg-background-dark text-white">
      <div className="w-full border-b border-solid border-b-border bg-surface-dark px-4 py-3 md:px-10">
        <header className="flex items-center justify-between whitespace-nowrap mx-auto max-w-[1440px]">
          <div className="flex items-center gap-4 text-white">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
            </div>
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">when2travel</h2>
          </div>
          <div className="flex items-center justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <a className="text-primary text-sm font-medium leading-normal" href="#">Results</a>
            </div>
          </div>
        </header>
      </div>

      <div className="layout-container flex h-full grow flex-col mx-auto w-full max-w-[1440px]">
        <div className="px-4 md:px-10 py-8 flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col w-full flex-1 gap-8">
            <PlanHeader
              name={plan.name}
              numDays={plan.numDays}
              startRange={plan.startRange}
              endRange={plan.endRange}
              action={{
                label: 'Edit My Availability',
                icon: 'edit_calendar',
                onClick: handleEditAvailability
              }}
              className="border-b border-border"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1"
              >
                <ResultsSidebar
                  compatibleRanges={compatibleRanges}
                  respondents={respondents}
                  onShareResults={handleShareResults}
                  onCreateNewEvent={handleCreateNewEvent}
                  onEditResponse={handleEditResponse}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-9 flex flex-col gap-6 order-1 lg:order-2"
              >
                <div className="bg-surface-dark border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <h2 className="text-white text-2xl font-bold">Availability Overview</h2>
                    </div>
                    <AvailabilityLegend className="text-text-secondary" />
                  </div>

                  <div className="max-w-[800px] mx-auto">
                    <AvailabilityCalendar
                      startRange={plan.startRange}
                      endRange={plan.endRange}
                      responses={plan.responses || []}
                      mode="view"
                      showNavigation={true}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
