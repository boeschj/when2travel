import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/api'
import { planKeys } from '@/lib/queries'
import { ResponseForm } from '@/components/plan/organisms/response-form'
import { toast } from 'sonner'
import type { ResponseFormData } from '@/lib/types'
import { ROUTES } from '@/lib/routes'
import { BackgroundEffects } from '@/components/create-plan'
import { AppHeader } from '@/components/shared/app-header'
import { PageLayout, FormSection } from '@/components/create-plan/form-layout'
import { useResponseEditTokens } from '@/hooks/use-auth-tokens'
import { format, parseISO } from 'date-fns'

const $createResponse = client.responses.$post

export const Route = createFileRoute(ROUTES.PLAN_RESPOND)({
  component: MarkAvailabilityPage,
})

function MarkAvailabilityPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { saveResponseEditToken } = useResponseEditTokens()

  const { data: plan, isLoading: isPlanLoading } = useQuery(planKeys.detail(planId))

  const createResponseMutation = useMutation({
    mutationFn: async (data: ResponseFormData) => {
      const res = await $createResponse({
        json: {
          planId,
          name: data.name,
          availableDates: data.availableDates,
        },
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to submit availability' }))
        throw new Error('error' in error ? error.error : 'Failed to submit availability')
      }

      return res.json()
    },
    onSuccess: async (data) => {
      saveResponseEditToken(data.id, data.editToken, planId)
      await queryClient.refetchQueries({ queryKey: planKeys.detail(planId).queryKey })
      toast.success('Your availability has been submitted!')

      navigate({
        to: ROUTES.PLAN,
        params: { planId },
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit availability. Please try again.')
    },
  })

  const handleSubmit = (data: ResponseFormData) => {
    createResponseMutation.mutate(data)
  }

  if (isPlanLoading || !plan) {
    return (
      <PageLayout>
        <BackgroundEffects />
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pb-20 pt-10 relative z-10">
          <div className="w-full max-w-6xl flex flex-col gap-12">
            <div className="flex items-center justify-center py-20">
              <div className="text-foreground">Loading...</div>
            </div>
          </div>
        </main>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <BackgroundEffects />
      <AppHeader planId={planId} responses={plan.responses} />

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pb-20 pt-10 relative z-10">
        <div className="w-fit mx-auto flex flex-col gap-12">
          <FormSection className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em] text-foreground">
              When can you go?
            </h1>
            <p className="text-lg font-normal leading-normal text-muted-foreground">
              Sharing availability for: <span className="text-foreground font-medium">{plan.name}</span> for{' '}
              <span className="text-foreground font-medium">{plan.numDays} {plan.numDays === 1 ? 'day' : 'days'}</span>{' '}
              between {format(parseISO(plan.startRange), 'MMM d')} - {format(parseISO(plan.endRange), 'MMM d, yyyy')}
            </p>
          </FormSection>

          <FormSection delay={0.1}>
            <ResponseForm
              startRange={plan.startRange}
              endRange={plan.endRange}
              numDays={plan.numDays}
              onSubmit={handleSubmit}
              isSubmitting={createResponseMutation.isPending}
            />
          </FormSection>
        </div>
      </main>
    </PageLayout>
  )
}