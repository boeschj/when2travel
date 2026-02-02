import { useState, useRef } from 'react'
import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client, parseErrorResponse } from '@/lib/api'
import { planKeys } from '@/lib/queries'
import { ResponseForm } from '@/components/response-form/response-form'
import { toast } from 'sonner'
import type { ResponseFormData } from '@/lib/types'
import { z } from 'zod'
import { BackgroundEffects } from '@/components/layout/background-effects'
import { PageLayout, FormSection } from '@/components/layout/form-layout'
import { useResponseEditTokens } from '@/hooks/use-auth-tokens'
import { getStorageRecord, STORAGE_KEYS } from '@/lib/storage'
import { ErrorScreen } from '@/components/shared/error-screen'
import { format, parseISO } from 'date-fns'
import { pluralize } from '@/lib/utils'
import { NavigationBlocker } from '@/components/navigation-blocker'

import type { ErrorComponentProps } from '@tanstack/react-router'

const $createResponse = client.responses.$post

const searchSchema = z.object({
  returnUrl: z.string().optional(),
})

export const Route = createFileRoute('/plan/$planId/respond')({
  head: () => ({
    meta: [{ title: 'Add Your Availability | PlanTheTrip' }],
  }),
  beforeLoad: ({ params }) => {
    const responsePlanIds = getStorageRecord(STORAGE_KEYS.responsePlanIds)
    const hasExistingResponse = Object.values(responsePlanIds).includes(params.planId)

    if (hasExistingResponse) {
      throw redirect({ to: '/plan/$planId', params: { planId: params.planId }, replace: true })
    }
  },
  component: MarkAvailabilityPage,
  errorComponent: RespondErrorComponent,
  pendingComponent: () => null,
  validateSearch: searchSchema,
})

function MarkAvailabilityPage() {
  const { planId } = Route.useParams()
  const { returnUrl } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const { saveResponseEditToken } = useResponseEditTokens()
  const { data: plan } = useSuspenseQuery(planKeys.detail(planId))
  const [isDirty, setIsDirty] = useState(false)
  // HACK: Look for ways to replace this during refactor
  const resetFormRef = useRef<(() => void) | null>(null)
  const createResponseMutation = useMutation({
    mutationFn: async (formData: ResponseFormData) => {
      const response = await $createResponse({
        json: {
          planId,
          name: formData.name,
          availableDates: formData.availableDates,
        },
      })
      if (!response.ok) throw await parseErrorResponse(response, 'Failed to submit availability')
      return response.json()
    },
    onSuccess: (responseData) => {
      saveResponseEditToken({ responseId: responseData.id, token: responseData.editToken, planId })
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey })
      toast.success('Your availability has been submitted!')

      if (returnUrl) {
        navigate({ to: returnUrl })
      } else {
        navigate({ to: '/plan/$planId', params: { planId } })
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit availability. Please try again.')
    },
  })

  const hasUnsavedChanges = isDirty && !createResponseMutation.isPending && !createResponseMutation.isSuccess

  const formattedStartDate = format(parseISO(plan.startRange), 'MMM d')
  const formattedEndDate = format(parseISO(plan.endRange), 'MMM d, yyyy')
  const durationLabel = `${plan.numDays} ${pluralize(plan.numDays, 'day')}`
  const handleDirtyChange = (dirty: boolean) => {
    setIsDirty(dirty)
  }

  const handleResetRef = (reset: () => void) => {
    resetFormRef.current = reset
  }

  const existingRespondentNames = plan.responses?.map((r) => r.name) ?? []

  return (
    <PageLayout>
      <BackgroundEffects />
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
            <NavigationBlocker
              shouldBlock={hasUnsavedChanges}
              onDiscard={() => resetFormRef.current?.()}
            />
            <ResponseForm
              startRange={plan.startRange}
              endRange={plan.endRange}
              numDays={plan.numDays}
              existingNames={existingRespondentNames}
              onSubmit={(data) => createResponseMutation.mutate(data)}
              isSubmitting={createResponseMutation.isPending}
              onDirtyChange={handleDirtyChange}
              onResetRef={handleResetRef}
            />
          </FormSection>
        </div>
      </main>
    </PageLayout>
  )
}

function RespondErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="We couldn't load this page. Please try again."
      onRetry={reset}
    />
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
