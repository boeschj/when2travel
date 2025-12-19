import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { client } from '@/lib/api'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { format, differenceInDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { ROUTES } from '@/lib/routes'
import { toast } from 'sonner'
import {
  BackgroundEffects,
  CreatePlanHeader,
  DateRangeField,
  DurationPicker,
  PlanSummaryCard,
  TripNameField,
} from '@/components/create-plan'
import { PageLayout, FormContainer, FormSection } from '@/components/create-plan/form-layout'

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

export const Route = createFileRoute(ROUTES.CREATE)({
  component: CreatePlanPage,
})

function CreatePlanPage() {
  const navigate = useNavigate()
  
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
      navigate({
        to: ROUTES.PLAN_SHARE,
        params: { planId: data.id },
      })
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
  })

  const isCreating = createPlanMutation.isPending

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

    createPlanMutation.mutate({
      name: values.tripName.trim(),
      numDays: values.numDays,
      startRange,
      endRange,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
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
                  })}
                  children={({ numDays, dateRange }) => (
                    <PlanSummaryCard
                      numDays={numDays}
                      dateRange={dateRange}
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
