import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { client, parseErrorResponse } from '@/lib/api'
import { planKeys } from '@/lib/queries'
import { ApiError } from '@/lib/errors'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { format, differenceInDays, parseISO } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { DateRangeField } from './-create/date-range-field'
import { DurationPicker } from './-create/duration-picker'
import { PlanSummaryCard } from './-create/plan-summary-card'
import { TripNameField } from './-create/trip-name-field'
import { BackgroundEffects } from '@/components/layout/background-effects'
import { AppHeader } from '@/components/shared/app-header'
import { PageLayout, FormContainer, FormSection } from '@/components/layout/form-layout'
import { ErrorScreen } from '@/components/shared/error-screen'
import { NotFound } from '@/components/shared/not-found'
import { NavigationBlocker } from '@/components/navigation-blocker'
import { z } from 'zod'
import { usePlanEditTokens } from '@/hooks/use-auth-tokens'

import type { ErrorComponentProps } from '@tanstack/react-router'

const $createPlan = client.plans.$post
const $updatePlan = client.plans[':id'].$put

type CreatePlanInput = InferRequestType<typeof $createPlan>['json']
type CreatePlanResponse = InferResponseType<typeof $createPlan>
type UpdatePlanInput = InferRequestType<typeof $updatePlan>['json']
type UpdatePlanResponse = InferResponseType<typeof $updatePlan>

const searchSchema = z.object({
  planId: z.string().optional(),
  returnUrl: z.string().optional(),
})

export const Route = createFileRoute('/create')({
  loader: async ({ context: { queryClient }, location }) => {
    const { planId } = searchSchema.parse(location.search)
    if (!planId) return

    try {
      await queryClient.ensureQueryData(planKeys.detail(planId))
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  head: () => ({
    meta: [{ title: 'Create a Trip | PlanTheTrip' }],
  }),
  component: CreatePlanPage,
  notFoundComponent: NotFound,
  errorComponent: CreateErrorComponent,
  pendingComponent: () => null,
  validateSearch: searchSchema,
})

function CreatePlanPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const { savePlanEditToken, getPlanEditToken } = usePlanEditTokens()
  const { planId, returnUrl } = Route.useSearch()

  const isEditMode = Boolean(planId)
  const editToken = planId ? getPlanEditToken(planId) : null

  if (isEditMode && editToken && planId) {
    return (
      <EditModeContent
        planId={planId}
        editToken={editToken}
        returnUrl={returnUrl}
        navigate={navigate}
        queryClient={queryClient}
      />
    )
  }

  if (isEditMode && !editToken) {
    return (
      <PageLayout>
        <BackgroundEffects />
        <PermissionDeniedState />
      </PageLayout>
    )
  }

  return (
    <CreateModeContent
      navigate={navigate}
      savePlanEditToken={savePlanEditToken}
    />
  )
}

interface EditModeContentProps {
  planId: string
  editToken: string
  returnUrl: string | undefined
  navigate: ReturnType<typeof useNavigate>
  queryClient: ReturnType<typeof useQueryClient>
}

function EditModeContent({
  planId,
  editToken,
  returnUrl,
  navigate,
  queryClient,
}: EditModeContentProps) {
  const { data: existingPlan } = useSuspenseQuery(planKeys.detail(planId))

  const updatePlanMutation = useMutation({
    mutationFn: async (input: UpdatePlanInput): Promise<UpdatePlanResponse> => {
      const response = await $updatePlan({ param: { id: planId }, json: input })
      if (!response.ok) throw await parseErrorResponse(response, 'Failed to update plan')
      return response.json()
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: planKeys.detail(planId).queryKey })
      const previousPlan = queryClient.getQueryData(planKeys.detail(planId).queryKey)
      queryClient.setQueryData(planKeys.detail(planId).queryKey, (old: typeof previousPlan) =>
        old ? { ...old, name: newData.name, numDays: newData.numDays, startRange: newData.startRange, endRange: newData.endRange } : old
      )
      return { previousPlan }
    },
    onSuccess: () => {
      planForm.reset(planForm.state.values)
      toast.success('Plan updated successfully!')
      if (returnUrl) {
        setTimeout(() => navigate({ to: returnUrl }), 0)
      }
    },
    onError: (error: Error, _newData, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(planKeys.detail(planId).queryKey, context.previousPlan)
      }
      toast.error(error.message || 'Failed to update plan. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey })
    },
  })

  const defaultDateRange = { from: parseISO(existingPlan.startRange), to: parseISO(existingPlan.endRange) }

  const planForm = useForm({
    defaultValues: {
      tripName: existingPlan.name,
      numDays: existingPlan.numDays,
      dateRange: defaultDateRange as DateRange | undefined,
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const validatedValues = validateFormValues(planForm.state.values)
    if (!validatedValues) return

    updatePlanMutation.mutate({ editToken, ...validatedValues })
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageLayout>
        <BackgroundEffects />
        <AppHeader planId={planId} />

        <FormContainer>
          <FormSection className="space-y-6 text-center md:text-left">
            <PageHeading isEditMode />
            <planForm.Field name="tripName" children={(field) => <TripNameField field={field} />} />
          </FormSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <FormSection className="lg:col-span-7" direction="left" delay={0.2}>
              <planForm.Field name="dateRange" children={(field) => <DateRangeField field={field} />} />
            </FormSection>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <FormSection className="flex-1" direction="right" delay={0.3}>
                <planForm.Field name="numDays" children={(field) => <DurationPicker field={field} />} />
              </FormSection>

              <FormSection delay={0.4}>
                <planForm.Subscribe
                  selector={(state) => ({
                    numDays: state.values.numDays,
                    dateRange: state.values.dateRange,
                    isDirty: state.isDirty,
                  })}
                  children={({ numDays, dateRange, isDirty }) => (
                    <PlanSummaryCard
                      numDays={numDays}
                      dateRange={dateRange}
                      isPending={updatePlanMutation.isPending}
                      isEditMode
                      planId={planId}
                      hasChanges={isDirty}
                    />
                  )}
                />
              </FormSection>
            </div>
          </div>
        </FormContainer>

        <planForm.Subscribe
          selector={(state) => state.isDirty}
          children={(isDirty) => (
            <NavigationBlocker
              shouldBlock={isDirty}
              onDiscard={() => planForm.reset()}
            />
          )}
        />
      </PageLayout>
    </form>
  )
}

interface CreateModeContentProps {
  navigate: ReturnType<typeof useNavigate>
  savePlanEditToken: (id: string, token: string) => void
}

function CreateModeContent({ navigate, savePlanEditToken }: CreateModeContentProps) {
  const createPlanMutation = useMutation({
    mutationFn: async (input: CreatePlanInput): Promise<CreatePlanResponse> => {
      const response = await $createPlan({ json: input })
      if (!response.ok) throw await parseErrorResponse(response, 'Failed to create plan')
      return response.json()
    },
    onSuccess: (createdPlan) => {
      savePlanEditToken(createdPlan.id, createdPlan.editToken)
      toast.success('Plan created successfully!')
      navigate({ to: '/plan/$planId/share', params: { planId: createdPlan.id } })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create plan. Please try again.')
    },
  })

  const planForm = useForm({
    defaultValues: {
      tripName: '',
      numDays: 7,
      dateRange: undefined as DateRange | undefined,
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const validatedValues = validateFormValues(planForm.state.values)
    if (!validatedValues) return

    createPlanMutation.mutate(validatedValues)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageLayout>
        <BackgroundEffects />
        <AppHeader />

        <FormContainer>
          <FormSection className="space-y-6 text-center md:text-left">
            <PageHeading isEditMode={false} />
            <planForm.Field name="tripName" children={(field) => <TripNameField field={field} />} />
          </FormSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <FormSection className="lg:col-span-7" direction="left" delay={0.2}>
              <planForm.Field name="dateRange" children={(field) => <DateRangeField field={field} />} />
            </FormSection>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <FormSection className="flex-1" direction="right" delay={0.3}>
                <planForm.Field name="numDays" children={(field) => <DurationPicker field={field} />} />
              </FormSection>

              <FormSection delay={0.4}>
                <planForm.Subscribe
                  selector={(state) => ({
                    numDays: state.values.numDays,
                    dateRange: state.values.dateRange,
                    isDirty: state.isDirty,
                  })}
                  children={({ numDays, dateRange, isDirty }) => (
                    <PlanSummaryCard
                      numDays={numDays}
                      dateRange={dateRange}
                      isPending={createPlanMutation.isPending}
                      isEditMode={false}
                      hasChanges={isDirty}
                    />
                  )}
                />
              </FormSection>
            </div>
          </div>
        </FormContainer>
      </PageLayout>
    </form>
  )
}

function CreateErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="We couldn't load this page. Please try again."
      onRetry={reset}
    />
  )
}


interface PageHeadingProps {
  isEditMode: boolean
}

function PageHeading({ isEditMode }: PageHeadingProps) {
  if (isEditMode) {
    return (
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
        Edit your{' '}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
          plan.
        </span>
      </h1>
    )
  }

  return (
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
      Let's start{' '}
      <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
        planning.
      </span>
    </h1>
  )
}

function PermissionDeniedState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="text-foreground">You don't have permission to edit this plan.</div>
    </div>
  )
}

interface FormValues {
  tripName: string
  numDays: number
  dateRange: DateRange | undefined
}

function validateFormValues(values: FormValues): { name: string; numDays: number; startRange: string; endRange: string } | null {
  if (!values.tripName || values.tripName.trim().length === 0) {
    toast.error('Trip name is required')
    return null
  }
  if (values.tripName.trim().length < 3) {
    toast.error('Trip name must be at least 3 characters')
    return null
  }
  if (values.tripName.trim().length > 100) {
    toast.error('Trip name must be less than 100 characters')
    return null
  }
  if (values.numDays < 1) {
    toast.error('Trip must be at least 1 day')
    return null
  }
  if (values.numDays > 60) {
    toast.error('Trip cannot exceed 60 days')
    return null
  }
  if (!values.dateRange?.from || !values.dateRange?.to) {
    toast.error('Please select both start and end dates')
    return null
  }

  const daysInRange = differenceInDays(values.dateRange.to, values.dateRange.from) + 1
  if (daysInRange < values.numDays) {
    toast.error(`Trip length (${values.numDays} days) cannot be longer than the selected date range (${daysInRange} days)`)
    return null
  }

  return {
    name: values.tripName.trim(),
    numDays: values.numDays,
    startRange: format(values.dateRange.from, 'yyyy-MM-dd'),
    endRange: format(values.dateRange.to, 'yyyy-MM-dd'),
  }
}

