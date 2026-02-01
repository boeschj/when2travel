import { useState } from 'react'
import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Users, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { client } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { planKeys } from '@/lib/queries'
import { ApiError } from '@/lib/errors'
import { NotFound } from '@/components/shared/not-found'
import { PlanHeader } from './-results/plan-header'
import { ErrorScreen } from '@/components/shared/error-screen'
import { ResultsCalendar } from './-results/results-calendar'
import { SmartRecommendationsCard } from './-results/smart-recommendations-card'
import { ResultsLegend } from './-results/availability-legend'
import { RespondentChips } from './-results/respondent-chips'
import { DateAvailabilityDialog } from './-results/date-availability-popover'
import { useCompatibleRanges } from './-results/use-compatible-ranges'
import { useSmartRecommendation } from './-results/use-smart-recommendation'
import { useCurrentUserResponse, useResponseEditTokens, usePlanAuthContext } from '@/hooks/use-auth-tokens'
import { getRespondentColor } from './-results/user-avatar'
import { AppHeader } from '@/components/shared/app-header'
import { ROUTES, ROUTE_IDS, buildAbsoluteUrl } from '@/lib/routes'
import { copyToClipboard } from '@/hooks/use-clipboard'

import type { PlanResponse } from '@/lib/types'
import type { CompatibleDateRange } from '@/lib/types'
import type { RecommendationResult } from './-results/recommendation-types'
import type { ErrorComponentProps } from '@tanstack/react-router'

export const Route = createFileRoute(ROUTE_IDS.PLAN)({
  loader: async ({ context: { queryClient }, params: { planId } }) => {
    try {
      await queryClient.ensureQueryData(planKeys.detail(planId))
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  component: PlanResultsPage,
  notFoundComponent: NotFound,
  errorComponent: PlanErrorComponent,
  pendingComponent: () => null,
})

const $deletePlan = client.plans[':id'].$delete

function PlanResultsPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()
  const { hasResponseToken } = useResponseEditTokens()
  const { isCreator, editToken } = usePlanAuthContext(planId)
  const [selectedRespondentId, setSelectedRespondentId] = useState<string | null>(null)
  const [popoverDate, setPopoverDate] = useState<Date | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const { data: plan } = useSuspenseQuery(planKeys.detail(planId))

  const deletePlanMutation = useMutation({
    mutationFn: async () => {
      if (!editToken) throw new Error('No edit token')
      const res = await $deletePlan({
        param: { id: planId },
        json: { editToken }
      })
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ error: 'Failed to delete plan' }))
        throw new Error('error' in errorBody ? errorBody.error : 'Failed to delete plan')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Plan deleted successfully')
      navigate({ to: ROUTES.TRIPS })
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || 'Failed to delete plan')
    }
  })

  const compatibleRanges = useCompatibleRanges(plan)
  const recommendation = useSmartRecommendation(plan)
  const currentUserResponse = useCurrentUserResponse(plan?.responses)

  const bestWindow = compatibleRanges[0] ?? null
  const selectedRespondentColor = getSelectedRespondentColor(selectedRespondentId)
  const respondents = mapResponsesToRespondents(plan?.responses ?? null, hasResponseToken)
  const popoverParticipants = getPopoverParticipants(popoverDate, plan?.responses ?? [], hasResponseToken)
  const popoverAvailableCount = popoverParticipants.filter(p => p.isAvailable).length
  const shareUrl = buildShareUrl(planId)

  function handleShareLink() {
    copyToClipboard(shareUrl)
    toast.success('Link copied to clipboard')
  }

  function handleEditAvailability() {
    const returnUrl = window.location.pathname
    if (currentUserResponse) {
      navigate({
        to: ROUTES.RESPONSE_EDIT,
        params: { responseId: currentUserResponse.id },
        search: { returnUrl }
      })
      return
    }
    navigate({
      to: ROUTES.PLAN_RESPOND,
      params: { planId },
      search: { returnUrl }
    })
  }

  function handleEditPlan() {
    navigate({ to: ROUTES.CREATE, search: { planId, returnUrl: window.location.pathname } })
  }

  function handleDateClick(date: Date) {
    setPopoverDate(date)
    setIsPopoverOpen(true)
  }

  const hasRespondents = respondents.length > 0

  const deleteConfig = buildDeleteConfig({
    isCreator,
    onConfirm: () => deletePlanMutation.mutate(),
    isPending: deletePlanMutation.isPending,
    responsesCount: respondents.length,
  })

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      <AppHeader planId={planId} />

      <main className="flex-1 flex flex-col items-center px-6 md:px-12 xl:px-20 pb-20 pt-4 md:pt-10">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8">
          <PlanHeader
            name={plan.name}
            numDays={plan.numDays}
            startRange={plan.startRange}
            endRange={plan.endRange}
            variant="results"
            showMenu={isCreator}
            onEdit={handleEditPlan}
            onShare={handleShareLink}
            deleteConfig={deleteConfig}
          />

          {!hasRespondents && (
            <NoRespondentsState
              onAddAvailability={handleEditAvailability}
              onShare={handleShareLink}
            />
          )}

          {hasRespondents && (
            <ResultsGrid
              plan={plan}
              recommendation={recommendation}
              isCreator={isCreator}
              currentUserResponse={currentUserResponse}
              respondents={respondents}
              bestWindow={bestWindow}
              selectedRespondentId={selectedRespondentId}
              selectedRespondentColor={selectedRespondentColor}
              onRespondentClick={setSelectedRespondentId}
              onDateClick={handleDateClick}
              onEditPlan={handleEditPlan}
              onEditAvailability={handleEditAvailability}
            />
          )}

          <DateAvailabilityDialog
            date={popoverDate ?? new Date()}
            availableCount={popoverAvailableCount}
            totalCount={respondents.length}
            participants={popoverParticipants}
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
            onSelectRespondent={setSelectedRespondentId}
          />
        </div>
      </main>
    </div>
  )
}

function PlanErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message={error.message || "We're having trouble loading this trip. Please try again in a moment."}
      onRetry={reset}
    />
  )
}

interface NoRespondentsStateProps {
  onAddAvailability: () => void
  onShare: () => void
}

function NoRespondentsState({ onAddAvailability, onShare }: NoRespondentsStateProps) {
  return (
    <div className="rounded-2xl bg-surface-dark border border-border p-6 md:p-8">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Waiting for responses
        </h2>
        <p className="text-lg text-text-secondary">
          Share this plan with your group to start collecting availability.
        </p>

        <div className="w-full max-w-lg pt-2 flex flex-col gap-3">
          <Button
            onClick={onAddAvailability}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
          >
            Add Dates
            <UserPlus className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={onShare}
            variant="outline"
            size="lg"
            className="w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
          >
            Share Plan
          </Button>
        </div>
      </div>
    </div>
  )
}

interface Respondent {
  id: string
  name: string
  availableDates: string[]
  isCurrentUser: boolean
}

interface ResultsGridProps {
  plan: { name: string; startRange: string; endRange: string; numDays: number; responses: PlanResponse[] | null }
  recommendation: RecommendationResult | null
  isCreator: boolean
  currentUserResponse: PlanResponse | null | undefined
  respondents: Respondent[]
  bestWindow: CompatibleDateRange | null
  selectedRespondentId: string | null
  selectedRespondentColor: string | null
  onRespondentClick: (id: string | null) => void
  onDateClick: (date: Date) => void
  onEditPlan: () => void
  onEditAvailability: () => void
}

function ResultsGrid({
  plan,
  recommendation,
  isCreator,
  currentUserResponse,
  respondents,
  bestWindow,
  selectedRespondentId,
  selectedRespondentColor,
  onRespondentClick,
  onDateClick,
  onEditPlan,
  onEditAvailability,
}: ResultsGridProps) {
  const hasResponded = !!currentUserResponse

  return (
    <div className="grid grid-cols-1 min-[1350px]:grid-cols-[minmax(300px,420px)_1fr] gap-6 min-[1350px]:gap-10 min-[1350px]:items-stretch">
      <div className="order-1 min-[1350px]:h-full">
        {recommendation && (
          <SmartRecommendationsCard
            recommendationResult={recommendation}
            planName={plan.name}
            isCreator={isCreator}
            hasResponded={hasResponded}
            currentUserResponseId={currentUserResponse?.id}
            onEditPlan={onEditPlan}
            onEditAvailability={onEditAvailability}
            onEditDuration={onEditPlan}
          />
        )}
      </div>

      <div className="order-2 min-w-0 min-[1350px]:h-full">
        <div className="bg-surface-dark border border-border rounded-2xl p-4 md:p-6 flex flex-col overflow-hidden min-[1350px]:h-full">
          <RespondentChips
            respondents={respondents}
            bestWindow={bestWindow}
            selectedRespondentId={selectedRespondentId}
            onRespondentClick={onRespondentClick}
            startRange={plan.startRange}
            endRange={plan.endRange}
            numDays={plan.numDays}
          />

          <Separator className="my-4" />

          <HeatmapHeader />

          <ResultsCalendar
            startRange={plan.startRange}
            endRange={plan.endRange}
            responses={plan.responses ?? []}
            selectedRespondentId={selectedRespondentId}
            selectedRespondentColor={selectedRespondentColor}
            onDateClick={onDateClick}
          />
        </div>
      </div>
    </div>
  )
}

function HeatmapHeader() {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
      <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
        Availability Heatmap
      </h3>
      <ResultsLegend />
    </div>
  )
}

function getSelectedRespondentColor(respondentId: string | null): string | null {
  if (!respondentId) return null
  return getRespondentColor(respondentId).hex
}

function mapResponsesToRespondents(
  responses: PlanResponse[] | null,
  hasResponseToken: (id: string) => boolean
): Respondent[] {
  if (!responses) return []
  return responses.map((response) => ({
    id: response.id,
    name: response.name,
    availableDates: response.availableDates,
    isCurrentUser: hasResponseToken(response.id)
  }))
}

interface DeleteConfigInput {
  isCreator: boolean
  onConfirm: () => void
  isPending: boolean
  responsesCount: number
}

function buildDeleteConfig({ isCreator, onConfirm, isPending, responsesCount }: DeleteConfigInput) {
  if (!isCreator) return undefined
  return { onConfirm, isPending, responsesCount }
}

function getPopoverParticipants(
  popoverDate: Date | null,
  responses: PlanResponse[],
  hasResponseToken: (id: string) => boolean
) {
  if (!popoverDate) return []
  return getParticipantsForDate(responses, popoverDate, hasResponseToken)
}

function getParticipantsForDate(
  responses: PlanResponse[],
  date: Date,
  hasResponseToken: (id: string) => boolean
) {
  const dateStr = format(date, 'yyyy-MM-dd')
  return responses.map((response) => ({
    id: response.id,
    name: response.name,
    isAvailable: response.availableDates.includes(dateStr),
    isCurrentUser: hasResponseToken(response.id)
  }))
}

function buildShareUrl(planId: string): string {
  return buildAbsoluteUrl(ROUTES.PLAN_RESPOND, { planId })
}
