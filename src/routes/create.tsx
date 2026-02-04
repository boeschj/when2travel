import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppForm, withForm, AppFieldControl, AppFieldError } from '@/components/ui/tanstack-form'
import { client, parseErrorResponse } from '@/lib/api'
import { planKeys } from '@/lib/queries'
import { ApiError } from '@/lib/errors'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { format, parseISO } from 'date-fns'
import { PLAN_VALIDATION, DATE_FORMAT } from '@/lib/constants/validation'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { DateRangeField } from './-create/date-range-field'
import { DurationPicker } from './-create/duration-picker'
import { PlanSummaryCard } from './-create/plan-summary-card'
import { TripNameInput, TripNameEditIcon } from './-create/trip-name-field'
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

interface PlanFormValues {
  tripName: string
  numDays: number
  dateRange: DateRange | undefined
}

const planFormSchema = z.object({
  tripName: z
    .string()
    .min(1, 'Trip name is required')
    .min(PLAN_VALIDATION.NAME_MIN_LENGTH, `At least ${PLAN_VALIDATION.NAME_MIN_LENGTH} characters`)
    .max(PLAN_VALIDATION.NAME_MAX_LENGTH, `Must be less than ${PLAN_VALIDATION.NAME_MAX_LENGTH} characters`),
  numDays: z
    .number()
    .min(PLAN_VALIDATION.DAYS_MIN, `At least ${PLAN_VALIDATION.DAYS_MIN} day`)
    .max(PLAN_VALIDATION.DAYS_MAX, `Cannot exceed ${PLAN_VALIDATION.DAYS_MAX} days`),
  dateRange: z.object({ from: z.date(), to: z.date() }, { error: 'Please select both start and end dates' }),
})

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
  const { savePlanEditToken, getPlanEditToken } = usePlanEditTokens()
  const { planId, returnUrl } = Route.useSearch()

  const isEditMode = Boolean(planId)
  const editToken = planId ? getPlanEditToken(planId) : null

  const canEditPlan = isEditMode && editToken && planId
  if (canEditPlan) {
    return (
      <EditModeContent
        planId={planId}
        editToken={editToken}
        returnUrl={returnUrl}
      />
    )
  }

  const isMissingEditPermission = isEditMode && !editToken
  if (isMissingEditPermission) {
    return (
      <PageLayout>
        <BackgroundEffects />
        <PermissionDeniedState />
      </PageLayout>
    )
  }

  return (
    <CreateModeContent savePlanEditToken={savePlanEditToken} />
  )
}

const planFormDefaults: PlanFormValues = {
  tripName: '',
  numDays: 7,
  dateRange: undefined,
}

interface PlanFormContentProps {
  isEditMode: boolean
  isPending: boolean
  planId?: string
}

const PlanFormContent = withForm({
  defaultValues: planFormDefaults,
  props: {} as PlanFormContentProps,
  render: function PlanFormContentRender({ form, isEditMode, isPending, planId }) {
    return (
      <PageLayout>
        <BackgroundEffects />
        <AppHeader planId={planId} />

        <FormContainer>
          <FormSection className="space-y-6 text-center md:text-left">
            <PageHeading isEditMode={isEditMode} />
            <form.AppField name="tripName">
              {() => (
                <div className="relative group">
                  <AppFieldControl>
                    <TripNameInput />
                  </AppFieldControl>
                  <TripNameEditIcon />
                  <AppFieldError />
                </div>
              )}
            </form.AppField>
          </FormSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <FormSection className="lg:col-span-7" direction="left" delay={0.2}>
              <form.AppField name="dateRange" children={() => <DateRangeField />} />
            </FormSection>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <FormSection className="flex-1" direction="right" delay={0.3}>
                <form.AppField name="numDays" children={() => <DurationPicker />} />
              </FormSection>

              <FormSection delay={0.4}>
                <form.Subscribe
                  selector={(state) => ({
                    numDays: state.values.numDays,
                    dateRange: state.values.dateRange,
                    isDirty: state.isDirty,
                  })}
                  children={({ numDays, dateRange, isDirty }) => (
                    <PlanSummaryCard
                      numDays={numDays}
                      dateRange={dateRange}
                      isPending={isPending}
                      isEditMode={isEditMode}
                      planId={planId}
                      hasChanges={isDirty}
                    />
                  )}
                />
              </FormSection>
            </div>
          </div>
        </FormContainer>

        {isEditMode && (
          <form.Subscribe
            selector={(state) => state.isDirty}
            children={(isDirty) => (
              <NavigationBlocker
                shouldBlock={isDirty}
                onDiscard={() => form.reset()}
              />
            )}
          />
        )}
      </PageLayout>
    )
  },
})

interface EditModeContentProps {
  planId: string
  editToken: string
  returnUrl: string | undefined
}

function EditModeContent({
  planId,
  editToken,
  returnUrl,
}: EditModeContentProps) {
  const { data: existingPlan } = useSuspenseQuery(planKeys.detail(planId))

  const { form, updatePlanMutation } = useUpdatePlanForm({
    planId,
    editToken,
    returnUrl,
    existingPlan,
  })

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <PlanFormContent
          form={form}
          isEditMode
          isPending={updatePlanMutation.isPending}
          planId={planId}
        />
      </form>
    </form.AppForm>
  )
}

interface UseUpdatePlanFormProps {
  planId: string
  editToken: string
  returnUrl: string | undefined
  existingPlan: { name: string; numDays: number; startRange: string; endRange: string }
}

function useUpdatePlanForm({
  planId,
  editToken,
  returnUrl,
  existingPlan,
}: UseUpdatePlanFormProps) {
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const editDefaults: PlanFormValues = {
    tripName: existingPlan.name,
    numDays: existingPlan.numDays,
    dateRange: { from: parseISO(existingPlan.startRange), to: parseISO(existingPlan.endRange) },
  }

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
      form.reset(form.state.values)
      toast.success('Plan updated successfully!')
      if (returnUrl) {
        queueMicrotask(() => navigate({ to: returnUrl }))
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

  const form = useAppForm({
    defaultValues: editDefaults,
    validators: { onSubmit: planFormSchema },
    onSubmit: ({ value }) => {
      const transformed = transformFormValues(value)
      updatePlanMutation.mutate({ editToken, ...transformed })
    },
  })

  return { form, updatePlanMutation }
}

interface CreateModeContentProps {
  savePlanEditToken: (id: string, token: string) => void
}

function CreateModeContent({ savePlanEditToken }: CreateModeContentProps) {
  const { form, createPlanMutation } = useCreatePlanForm({ savePlanEditToken })

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <PlanFormContent
          form={form}
          isEditMode={false}
          isPending={createPlanMutation.isPending}
        />
      </form>
    </form.AppForm>
  )
}

interface UseCreatePlanFormProps {
  savePlanEditToken: (id: string, token: string) => void
}

function useCreatePlanForm({ savePlanEditToken }: UseCreatePlanFormProps) {
  const navigate = useNavigate({ from: Route.fullPath })

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

  const form = useAppForm({
    defaultValues: planFormDefaults,
    validators: { onSubmit: planFormSchema },
    onSubmit: ({ value }) => {
      const transformed = transformFormValues(value)
      createPlanMutation.mutate(transformed)
    },
  })

  return { form, createPlanMutation }
}

function CreateErrorComponent({ reset }: ErrorComponentProps) {
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

function transformFormValues(values: PlanFormValues) {
  const { from, to } = values.dateRange ?? {}
  if (!from || !to) throw new Error('Date range is required')

  return {
    name: values.tripName.trim(),
    numDays: values.numDays,
    startRange: format(from, DATE_FORMAT.ISO),
    endRange: format(to, DATE_FORMAT.ISO),
  }
}
