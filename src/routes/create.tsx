import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { hc } from 'hono/client'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { ROUTES } from '@/lib/routes'
import { toast } from 'sonner'
import { z } from 'zod'
import type { AppType } from '../../worker'
import {
  BackgroundEffects,
  CreatePlanHeader,
  DateRangeField,
  DurationPicker,
  PlanSummaryCard,
  TripNameField,
} from '@/components/create-plan'
import { PageLayout, FormContainer, FormSection } from '@/components/create-plan/form-layout'

const client = hc<AppType>('/api')
const $createPlan = client.plans.$post

type CreatePlanInput = InferRequestType<typeof $createPlan>['json']
type CreatePlanResponse = InferResponseType<typeof $createPlan>

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

const createPlanSchema = z.object({
  tripName: z
    .string()
    .min(1, 'Trip name is required')
    .min(3, 'Trip name must be at least 3 characters')
    .max(100, 'Trip name must be less than 100 characters'),
  numDays: z
    .number()
    .min(1, 'Trip must be at least 1 day')
    .max(60, 'Trip cannot exceed 60 days'),
  dateRange: z
    .custom<DateRange | undefined>()
    .refine(
      (range) => {
        if (!range) return false
        return range.from && range.to
      },
      { message: 'Please select both start and end dates' }
    )
    .refine(
      (range) => {
        if (!range?.from || !range?.to) return true
        return range.to >= range.from
      },
      { message: 'End date must be after start date' }
    ),
})

export const Route = createFileRoute(ROUTES.CREATE)({
  component: CreatePlanPage,
})

function CreatePlanPage() {
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
      localStorage.setItem(`editToken:${data.id}`, data.editToken)
      toast.success('Plan created successfully!')
      console.log('Created plan:', data.id)
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create plan. Please try again.')
    },
  })

  const form = useForm({
    defaultValues: {
      tripName: '',
      numDays: 7,
      dateRange: undefined as DateRange | undefined,
    },
    validators: {
      onChange: createPlanSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.dateRange?.from || !value.dateRange?.to) {
        return
      }

      const startRange = format(value.dateRange.from, 'yyyy-MM-dd')
      const endRange = format(value.dateRange.to, 'yyyy-MM-dd')

      createPlanMutation.mutate({
        name: value.tripName.trim(),
        numDays: value.numDays,
        startRange,
        endRange,
      })
    },
  })

  const isCreating = createPlanMutation.isPending

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <PageLayout>
        <BackgroundEffects />
        <CreatePlanHeader />

        <FormContainer>
          <FormSection className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Let's start{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
                planning.
              </span>
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
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                  })}
                  children={({ numDays, dateRange, canSubmit, isSubmitting }) => (
                    <PlanSummaryCard
                      numDays={numDays}
                      dateRange={dateRange}
                      canSubmit={canSubmit}
                      isSubmitting={isSubmitting}
                      isCreating={isCreating}
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
