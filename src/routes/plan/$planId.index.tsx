import { useState, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { client } from '@/lib/api'
import { PlanHeader } from '@/components/plan/organisms/plan-header'
import { ResultsCalendar } from '@/components/plan/organisms/results-calendar'
import { BestWindowHero } from '@/components/plan/organisms/best-window-hero'
import { ResultsLegend } from '@/components/plan/molecules/availability-legend'
import { RespondentChips } from '@/components/plan/molecules/respondent-chips'
import { CompatibleDatesModal } from '@/components/plan/molecules/compatible-dates-modal'
import { DateAvailabilityDialog } from '@/components/plan/molecules/date-availability-popover'
import { Separator } from '@/components/ui/separator'
import { useCompatibleRanges } from '@/hooks/use-compatible-ranges'
import { useCurrentUserResponse, useResponseEditTokens } from '@/hooks/use-auth-tokens'
import type { PlanResponse } from '@/lib/types'
import { ROUTES, ROUTE_IDS } from '@/lib/routes'
import { AppHeader } from '@/components/shared/app-header'

export const Route = createFileRoute(ROUTE_IDS.PLAN)({
  component: PlanResultsPage,
})

function EmptyState({
  onEditPlan,
  onEditAvailability
}: {
  onEditPlan: () => void
  onEditAvailability: () => void
}) {
  return (
    <div className="rounded-2xl bg-surface-dark border border-border p-8 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-status-red/20 flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-8 h-8 text-status-red" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          No compatible windows found
        </h2>
        <p className="text-text-secondary mb-6">
          Try adjusting the trip dates or ask a participant to update their availability
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onEditPlan}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Edit Plan
          </button>
          <button
            onClick={onEditAvailability}
            className="px-6 py-3 rounded-lg border border-border text-white font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Edit My Availability
          </button>
        </div>
      </div>
    </div>
  )
}

function PlanResultsPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()
  const { hasResponseToken } = useResponseEditTokens()

  const [selectedRespondentId, setSelectedRespondentId] = useState<string | null>(null)
  const [isCompatibleDatesModalOpen, setIsCompatibleDatesModalOpen] = useState(false)
  const [popoverDate, setPopoverDate] = useState<Date | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

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
  const bestWindow = compatibleRanges[0] ?? null
  const currentUserResponse = useCurrentUserResponse(plan?.responses)

  const handleEditAvailability = useCallback(() => {
    if (currentUserResponse) {
      navigate({
        to: ROUTES.RESPONSE_EDIT,
        params: { responseId: currentUserResponse.id }
      })
    } else {
      navigate({
        to: ROUTES.PLAN_RESPOND,
        params: { planId }
      })
    }
  }, [currentUserResponse, navigate, planId])

  const handleEditPlan = useCallback(() => {
    navigate({ to: ROUTES.CREATE })
  }, [navigate])

  const handleDateClick = useCallback((date: Date) => {
    setPopoverDate(date)
    setIsPopoverOpen(true)
  }, [])


  const handleRespondentClick = useCallback((respondentId: string | null) => {
    setSelectedRespondentId(respondentId)
  }, [])

  const getParticipantsForDate = useCallback((date: Date) => {
    if (!plan?.responses) return []
    const dateStr = format(date, 'yyyy-MM-dd')
    return plan.responses.map((r: PlanResponse) => ({
      id: r.id,
      name: r.name,
      isAvailable: r.availableDates.includes(dateStr),
      isCurrentUser: hasResponseToken(r.id)
    }))
  }, [plan?.responses, hasResponseToken])

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
    isCurrentUser: hasResponseToken(r.id)
  })) ?? []

  const popoverParticipants = popoverDate ? getParticipantsForDate(popoverDate) : []
  const popoverAvailableCount = popoverParticipants.filter(p => p.isAvailable).length

  return (
    <div className="min-h-screen bg-background-dark text-white">
      <AppHeader planId={planId} responses={plan.responses} />

      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10 py-8">
        <div className="flex flex-col gap-8">
          <PlanHeader
            name={plan.name}
            numDays={plan.numDays}
            startRange={plan.startRange}
            endRange={plan.endRange}
            variant="results"
            action={{
              label: 'Edit My Availability',
              icon: <CalendarDays className="w-5 h-5" />,
              onClick: handleEditAvailability
            }}
          />

          {bestWindow ? (
            <BestWindowHero
              bestWindow={bestWindow}
              planName={plan.name}
              onSeeOtherDates={() => setIsCompatibleDatesModalOpen(true)}
            />
          ) : (
            <EmptyState
              onEditPlan={handleEditPlan}
              onEditAvailability={handleEditAvailability}
            />
          )}

          {respondents.length > 0 && (
            <RespondentChips
              respondents={respondents}
              bestWindow={bestWindow}
              selectedRespondentId={selectedRespondentId}
              onRespondentClick={handleRespondentClick}
            />
          )}

          <Separator className="my-2" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
                Availability Heatmap
              </h3>
              <ResultsLegend />
            </div>

            <div className="bg-surface-dark border border-border rounded-2xl p-4 md:p-6">
              <ResultsCalendar
                startRange={plan.startRange}
                endRange={plan.endRange}
                responses={plan.responses ?? []}
                selectedRespondentId={selectedRespondentId}
                onDateClick={handleDateClick}
              />
            </div>

            <DateAvailabilityDialog
              date={popoverDate ?? new Date()}
              availableCount={popoverAvailableCount}
              totalCount={respondents.length}
              participants={popoverParticipants}
              open={isPopoverOpen}
              onOpenChange={setIsPopoverOpen}
            />
          </div>
        </div>
      </div>

      <CompatibleDatesModal
        open={isCompatibleDatesModalOpen}
        onOpenChange={setIsCompatibleDatesModalOpen}
        compatibleRanges={compatibleRanges}
      />
    </div>
  )
}
