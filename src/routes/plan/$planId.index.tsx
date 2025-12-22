import { useState, useCallback, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Users, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { client } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { planKeys } from '@/lib/queries'
import { PlanHeader } from '@/components/plan/organisms/plan-header'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { ErrorScreen } from '@/components/shared/error-screen'
import { ResultsCalendar } from '@/components/plan/organisms/results-calendar'
import { SmartRecommendationsCard } from '@/components/plan/organisms/smart-recommendations-card'
import { ResultsLegend } from '@/components/plan/molecules/availability-legend'
import { RespondentChips } from '@/components/plan/molecules/respondent-chips'
import { DateAvailabilityDialog } from '@/components/plan/molecules/date-availability-popover'
import { Separator } from '@/components/ui/separator'
import { useCompatibleRanges } from '@/hooks/use-compatible-ranges'
import { useSmartRecommendation } from '@/hooks/use-smart-recommendation'
import { useCurrentUserResponse, useResponseEditTokens, usePlanAuthContext } from '@/hooks/use-auth-tokens'
import type { PlanResponse } from '@/lib/types'
import { ROUTES, ROUTE_IDS } from '@/lib/routes'
import { AppHeader } from '@/components/shared/app-header'
import { getRespondentColor } from '@/components/plan/atoms/user-avatar'

export const Route = createFileRoute(ROUTE_IDS.PLAN)({
  component: PlanResultsPage,
})

function NoRespondentsState({
  onAddAvailability
}: {
  onAddAvailability: () => void
}) {
  return (
    <>
      <div className="rounded-2xl bg-surface-dark border border-border p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Waiting for responses
          </h2>
          <p className="text-text-secondary">
            Share this plan with your group to start collecting availability.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-dark border border-border p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
            Add Your Availability
          </h3>
          <p className="text-text-secondary text-sm">
            Be the first to add your availability to get the ball rolling!
          </p>
          <Button
            onClick={onAddAvailability}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
          >
            Add Dates
            <UserPlus className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </>
  )
}

const $deletePlan = client.plans[':id'].$delete

function PlanResultsPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()
  const { hasResponseToken } = useResponseEditTokens()
  const { isCreator, editToken } = usePlanAuthContext(planId)

  const [selectedRespondentId, setSelectedRespondentId] = useState<string | null>(null)
  const [popoverDate, setPopoverDate] = useState<Date | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { data: plan, isLoading, error } = useQuery(planKeys.detail(planId))

  const deletePlanMutation = useMutation({
    mutationFn: async () => {
      if (!editToken) throw new Error('No edit token')
      const res = await $deletePlan({
        param: { id: planId },
        json: { editToken }
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to delete plan' }))
        throw new Error('error' in error ? error.error : 'Failed to delete plan')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Plan deleted successfully')
      navigate({ to: ROUTES.TRIPS })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete plan')
    }
  })

  const compatibleRanges = useCompatibleRanges(plan)
  const bestWindow = compatibleRanges[0] ?? null
  const recommendation = useSmartRecommendation(plan)
  const currentUserResponse = useCurrentUserResponse(plan?.responses)

  const handleEditAvailability = useCallback(() => {
    const returnUrl = window.location.pathname
    if (currentUserResponse) {
      navigate({
        to: ROUTES.RESPONSE_EDIT,
        params: { responseId: currentUserResponse.id },
        search: { returnUrl }
      })
    } else {
      navigate({
        to: ROUTES.PLAN_RESPOND,
        params: { planId },
        search: { returnUrl }
      })
    }
  }, [currentUserResponse, navigate, planId])

  const handleEditPlan = useCallback(() => {
    navigate({ to: ROUTES.CREATE, search: { planId, returnUrl: window.location.pathname } })
  }, [navigate, planId])

  const handleEditDuration = useCallback(() => {
    // Navigate to edit plan - the form will allow changing duration
    navigate({ to: ROUTES.CREATE, search: { planId, returnUrl: window.location.pathname } })
  }, [navigate, planId])

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

  // Get the selected respondent's color for calendar highlighting
  // Must be before early returns to maintain hooks order
  const selectedRespondentColor = useMemo(() => {
    if (!selectedRespondentId) return null
    return getRespondentColor(selectedRespondentId).hex
  }, [selectedRespondentId])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    // Check if it's a 404 (not found) vs other errors
    const status = 'status' in error ? (error as { status: number }).status : null
    const is404 = status === 404

    if (is404) {
      return (
        <ErrorScreen
          variant="not-found"
          title="Off the Map?"
          message="We couldn't find the page you're looking for. It seems this trip doesn't exist, or you may have taken a wrong turn on your journey."
        />
      )
    }

    // Server error or other errors
    return (
      <ErrorScreen
        title="Something went wrong"
        message="We're having trouble loading this trip. Please try again in a moment."
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!plan) {
    return (
      <ErrorScreen
        variant="not-found"
        title="Off the Map?"
        message="We couldn't find the page you're looking for. It seems this trip doesn't exist, or you may have taken a wrong turn on your journey."
      />
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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      <AppHeader planId={planId} />

      <main className="flex-1 flex flex-col items-center px-6 md:px-12 lg:px-20 pb-20 pt-10">
        <div className="w-fit max-w-full mx-auto flex flex-col gap-8">
          <PlanHeader
            name={plan.name}
            numDays={plan.numDays}
            startRange={plan.startRange}
            endRange={plan.endRange}
            variant="results"
            showMenu={isCreator}
            onEdit={handleEditPlan}
            deleteConfig={isCreator ? {
              onConfirm: () => deletePlanMutation.mutate(),
              isPending: deletePlanMutation.isPending,
              responsesCount: respondents.length
            } : undefined}
          />

          {respondents.length === 0 ? (
            <NoRespondentsState onAddAvailability={handleEditAvailability} />
          ) : recommendation ? (
            <SmartRecommendationsCard
              recommendationResult={recommendation}
              planName={plan.name}
              isCreator={isCreator}
              hasResponded={!!currentUserResponse}
              currentUserResponseId={currentUserResponse?.id}
              onEditPlan={handleEditPlan}
              onEditAvailability={handleEditAvailability}
              onEditDuration={handleEditDuration}
            />
          ) : null}

          {respondents.length > 0 && (
            <RespondentChips
              respondents={respondents}
              bestWindow={bestWindow}
              selectedRespondentId={selectedRespondentId}
              onRespondentClick={handleRespondentClick}
              startRange={plan.startRange}
              endRange={plan.endRange}
              numDays={plan.numDays}
            />
          )}

          <Separator className="my-2" />

          <div className="flex flex-col gap-4 w-fit mx-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
                Availability Heatmap
              </h3>
              <ResultsLegend />
            </div>

            <div className="bg-surface-dark border border-border rounded-2xl p-4 md:px-12 md:py-6">
              <ResultsCalendar
                startRange={plan.startRange}
                endRange={plan.endRange}
                responses={plan.responses ?? []}
                selectedRespondentId={selectedRespondentId}
                selectedRespondentColor={selectedRespondentColor}
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
      </main>
    </div>
  )
}
