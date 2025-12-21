import { createFileRoute, useNavigate, useBlocker } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { client } from '@/lib/api'
import { planKeys } from '@/lib/queries'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { format, differenceInDays, parseISO } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { ROUTES } from '@/lib/routes'
import { toast } from 'sonner'
import {
  BackgroundEffects,
  DateRangeField,
  DurationPicker,
  PlanSummaryCard,
  TripNameField,
} from '@/components/create-plan'
import { AppHeader } from '@/components/shared/app-header'
import { PageLayout, FormContainer, FormSection } from '@/components/create-plan/form-layout'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { z } from 'zod'
import { usePlanEditTokens } from '@/hooks/use-auth-tokens'

const $createPlan = client.plans.$post
const $updatePlan = client.plans[':id'].$put

type CreatePlanInput = InferRequestType<typeof $createPlan>['json']
type CreatePlanResponse = InferResponseType<typeof $createPlan>
type UpdatePlanInput = InferRequestType<typeof $updatePlan>['json']
type UpdatePlanResponse = InferResponseType<typeof $updatePlan>

type ErrorResponse = {
	error: string
}

function isErrorResponse(value: unknown): value is ErrorResponse {
	return (
		typeof value === 'object' &&
		value !== null &&
		'error' in value &&
		typeof (value as Record<string, unknown>).error === 'string'
	)
}

const searchSchema = z.object({
  planId: z.string().optional(),
  returnUrl: z.string().optional(),
})

export const Route = createFileRoute(ROUTES.CREATE)({
  component: CreatePlanPage,
  validateSearch: searchSchema,
})

function NavigationBlocker({ shouldBlock, onDiscard }: { shouldBlock: boolean; onDiscard: () => void }) {
  const { proceed, reset, status } = useBlocker({ shouldBlockFn: () => shouldBlock, withResolver: true })

  const handleDiscard = () => {
    onDiscard()
    proceed?.()
  }

  return (
    <AlertDialog open={status === 'blocked'} onOpenChange={(open) => !open && reset?.()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. If you leave now, your edits will be discarded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => reset?.()}>Go Back</AlertDialogCancel>
          <AlertDialogAction onClick={handleDiscard}>Discard Changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CreatePlanPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { savePlanEditToken, getPlanEditToken } = usePlanEditTokens()

  const { planId, returnUrl } = Route.useSearch()
  const isEditMode = Boolean(planId)
  const editToken = planId ? getPlanEditToken(planId) : null

  // Fetch existing plan data when in edit mode
  const { data: existingPlan, isLoading: isLoadingPlan } = useQuery({
    ...planKeys.detail(planId ?? ''),
    enabled: isEditMode,
  })

  const createPlanMutation = useMutation({
    mutationFn: async (data: CreatePlanInput): Promise<CreatePlanResponse> => {
      const res = await $createPlan({ json: data })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to create plan' }))
        const errorMessage = isErrorResponse(error) ? error.error : 'Failed to create plan'
        throw new Error(errorMessage)
      }

      return res.json()
    },
    onSuccess: (data) => {
      savePlanEditToken(data.id, data.editToken)
      toast.success('Plan created successfully!')
      navigate({
        to: ROUTES.PLAN_SHARE,
        params: { planId: data.id },
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create plan. Please try again.')
    },
  })

  const updatePlanMutation = useMutation({
    mutationFn: async (data: UpdatePlanInput): Promise<UpdatePlanResponse> => {
      if (!planId) throw new Error('No plan ID for update')

      const res = await $updatePlan({
        param: { id: planId },
        json: data,
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to update plan' }))
        const errorMessage = isErrorResponse(error) ? error.error : 'Failed to update plan'
        throw new Error(errorMessage)
      }

      return res.json()
    },
    onMutate: async (newData) => {
      if (!planId) return

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: planKeys.detail(planId).queryKey })

      // Snapshot the previous value
      const previousPlan = queryClient.getQueryData(planKeys.detail(planId).queryKey)

      // Optimistically update to the new value
      queryClient.setQueryData(planKeys.detail(planId).queryKey, (old: typeof previousPlan) =>
        old ? {
          ...old,
          name: newData.name,
          numDays: newData.numDays,
          startRange: newData.startRange,
          endRange: newData.endRange,
        } : old
      )

      return { previousPlan }
    },
    onSuccess: () => {
      // Reset form baseline to current values so isDirty becomes false
      form.reset(form.state.values)
      toast.success('Plan updated successfully!')
      // Defer navigation to next tick so form state updates first
      if (returnUrl) {
        setTimeout(() => navigate({ to: returnUrl }), 0)
      }
    },
    onError: (error: Error, _newData, context) => {
      // Rollback to the previous value on error
      if (planId && context?.previousPlan) {
        queryClient.setQueryData(planKeys.detail(planId).queryKey, context.previousPlan)
      }
      toast.error(error.message || 'Failed to update plan. Please try again.')
    },
    onSettled: () => {
      // Refetch after error or success to ensure we have the latest data
      if (planId) {
        queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey })
      }
    },
  })

  // Pass async data directly to defaultValues - this is the idiomatic TanStack Form pattern
  // for async initial values. The form initializes with these as the baseline, so isDirty starts false.
  const form = useForm({
    defaultValues: {
      tripName: existingPlan?.name ?? '',
      numDays: existingPlan?.numDays ?? 7,
      dateRange: existingPlan
        ? { from: parseISO(existingPlan.startRange), to: parseISO(existingPlan.endRange) }
        : undefined as DateRange | undefined,
    },
  })

  const isPending = createPlanMutation.isPending || updatePlanMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const values = form.state.values

    // Validate trip name
    if (!values.tripName || values.tripName.trim().length === 0) {
      toast.error('Trip name is required')
      return
    }

    if (values.tripName.trim().length < 3) {
      toast.error('Trip name must be at least 3 characters')
      return
    }

    if (values.tripName.trim().length > 100) {
      toast.error('Trip name must be less than 100 characters')
      return
    }

    // Validate num days
    if (values.numDays < 1) {
      toast.error('Trip must be at least 1 day')
      return
    }

    if (values.numDays > 60) {
      toast.error('Trip cannot exceed 60 days')
      return
    }

    // Validate date range
    if (!values.dateRange?.from || !values.dateRange?.to) {
      toast.error('Please select both start and end dates')
      return
    }

    // Validate trip length vs date range
    const daysInRange = differenceInDays(values.dateRange.to, values.dateRange.from) + 1
    if (daysInRange < values.numDays) {
      toast.error(`Trip length (${values.numDays} days) cannot be longer than the selected date range (${daysInRange} days)`)
      return
    }

    const startRange = format(values.dateRange.from, 'yyyy-MM-dd')
    const endRange = format(values.dateRange.to, 'yyyy-MM-dd')

    if (isEditMode && editToken) {
      updatePlanMutation.mutate({
        editToken,
        name: values.tripName.trim(),
        numDays: values.numDays,
        startRange,
        endRange,
      })
    } else {
      createPlanMutation.mutate({
        name: values.tripName.trim(),
        numDays: values.numDays,
        startRange,
        endRange,
      })
    }
  }

  // Show loading state while fetching plan data in edit mode
  if (isEditMode && isLoadingPlan) {
    return (
      <PageLayout>
        <BackgroundEffects />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-foreground">Loading plan...</div>
        </div>
      </PageLayout>
    )
  }

  // If in edit mode but no edit token, redirect back
  if (isEditMode && !editToken) {
    return (
      <PageLayout>
        <BackgroundEffects />
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-foreground">You don't have permission to edit this plan.</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageLayout>
        <BackgroundEffects />
        <AppHeader planId={planId} responses={existingPlan?.responses} />

        <FormContainer>
          <FormSection className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              {isEditMode ? (
                <>
                  Edit your{' '}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
                    plan.
                  </span>
                </>
              ) : (
                <>
                  Let's start{' '}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
                    planning.
                  </span>
                </>
              )}
            </h1>
            <form.Field name="tripName" children={(field) => <TripNameField field={field} />} />
          </FormSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <FormSection className="lg:col-span-7" direction="left" delay={0.2}>
              <form.Field name="dateRange" children={(field) => <DateRangeField field={field} />} />
            </FormSection>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <FormSection className="flex-1" direction="right" delay={0.3}>
                <form.Field name="numDays" children={(field) => <DurationPicker field={field} />} />
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
    </form>
  )
}
