import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/api'
import { planKeys } from '@/lib/queries'
import { ResponseForm } from '@/components/plan/organisms/response-form'
import { toast } from 'sonner'
import type { ResponseFormData } from '@/lib/types'
import { ROUTES } from '@/lib/routes'
import { z } from 'zod'
import { BackgroundEffects } from '@/components/create-plan'
import { AppHeader } from '@/components/shared/app-header'
import { PageLayout, FormSection } from '@/components/create-plan/form-layout'
import { useResponseEditTokens, useCurrentUserResponse } from '@/hooks/use-auth-tokens'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { ErrorScreen } from '@/components/shared/error-screen'
import { format, parseISO } from 'date-fns'
import { pluralize } from '@/lib/utils'

const $createResponse = client.responses.$post

const searchSchema = z.object({
  returnUrl: z.string().optional(),
})

export const Route = createFileRoute(ROUTES.PLAN_RESPOND)({
  component: MarkAvailabilityPage,
  validateSearch: searchSchema,
})

function MarkAvailabilityPage() {
  const { planId } = Route.useParams()
  const { returnUrl } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { saveResponseEditToken } = useResponseEditTokens()
  const { data: plan, isLoading: isPlanLoading, error: planError } = useQuery(planKeys.detail(planId))
  const existingResponse = useCurrentUserResponse(plan?.responses)

  const createResponseMutation = useMutation({
    mutationFn: async (formData: ResponseFormData) => {
      const response = await $createResponse({
        json: {
          planId,
          name: formData.name,
          availableDates: formData.availableDates,
        },
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Failed to submit availability' }))
        throw new Error('error' in errorBody ? errorBody.error : 'Failed to submit availability')
      }

      return response.json()
    },
    onSuccess: async (responseData) => {
      saveResponseEditToken({ responseId: responseData.id, token: responseData.editToken, planId })
      await queryClient.refetchQueries({ queryKey: planKeys.detail(planId).queryKey })
      toast.success('Your availability has been submitted!')

      const destination = returnUrl ?? ROUTES.PLAN
      const navigationOptions = returnUrl ? { to: destination } : { to: destination, params: { planId } }
      navigate(navigationOptions)
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message || 'Failed to submit availability. Please try again.')
    },
  })

  if (existingResponse) {
    navigate({ to: ROUTES.PLAN, params: { planId }, replace: true })
    return <LoadingScreen />
  }

  if (isPlanLoading) {
    return <LoadingScreen />
  }

  if (planError || !plan) {
    return (
      <ErrorScreen
        variant="not-found"
        title="Off the Map?"
        message="We couldn't find the page you're looking for. It seems this trip doesn't exist, or you may have taken a wrong turn on your journey."
      />
    )
  }

  const formattedStartDate = format(parseISO(plan.startRange), 'MMM d')
  const formattedEndDate = format(parseISO(plan.endRange), 'MMM d, yyyy')
  const durationLabel = `${plan.numDays} ${pluralize(plan.numDays, 'day')}`
  const existingRespondentNames = plan.responses?.map((r) => r.name) ?? []

  return (
    <PageLayout>
      <BackgroundEffects />
      <AppHeader planId={planId} />

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pb-20 pt-10 relative z-10">
        <div className="w-full md:w-fit mx-auto flex flex-col gap-12">
          <FormSection className="space-y-2">
            <PageHeading />
            <PlanDescription
              planName={plan.name}
              durationLabel={durationLabel}
              startDate={formattedStartDate}
              endDate={formattedEndDate}
            />
          </FormSection>

          <FormSection delay={0.1}>
            <ResponseForm
              startRange={plan.startRange}
              endRange={plan.endRange}
              numDays={plan.numDays}
              existingNames={existingRespondentNames}
              onSubmit={(data) => createResponseMutation.mutate(data)}
              isSubmitting={createResponseMutation.isPending}
            />
          </FormSection>
        </div>
      </main>
    </PageLayout>
  )
}

function PageHeading() {
  return (
    <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em] text-foreground">
      When can you go?
    </h1>
  )
}

interface PlanDescriptionProps {
  planName: string
  durationLabel: string
  startDate: string
  endDate: string
}

function PlanDescription({ planName, durationLabel, startDate, endDate }: PlanDescriptionProps) {
  return (
    <p className="text-lg font-normal leading-normal text-muted-foreground">
      Sharing availability for: <span className="text-foreground font-medium">{planName}</span> for{' '}
      <span className="text-foreground font-medium">{durationLabel}</span>{' '}
      between {startDate} - {endDate}
    </p>
  )
}
