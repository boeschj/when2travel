import type React from 'react'
import { useState, useRef } from 'react'
import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDeleteResponse } from '@/lib/mutations'
import { client, parseErrorResponse } from '@/lib/api'
import { planKeys, responseKeys } from '@/lib/queries'
import { ApiError } from '@/lib/errors'
import { ResponseForm } from '@/components/response-form/response-form'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { NavigationBlocker } from '@/components/navigation-blocker'
import type { ResponseFormData, PlanWithResponses } from '@/lib/types'
import { z } from 'zod'
import { CalendarDays } from 'lucide-react'
import { AppHeader } from '@/components/shared/app-header'
import { ErrorScreen } from '@/components/shared/error-screen'
import { NotFound } from '@/components/shared/not-found'
import { useResponseEditTokens } from '@/hooks/use-auth-tokens'
import { getStorageRecord, STORAGE_KEYS } from '@/lib/storage'

import type { ErrorComponentProps } from '@tanstack/react-router'

const searchSchema = z.object({
  returnUrl: z.string().optional(),
})

export const Route = createFileRoute('/response/$responseId/edit')({
  loader: async ({ context: { queryClient }, params: { responseId } }) => {
    const editTokens = getStorageRecord(STORAGE_KEYS.responseEditTokens)
    const planIds = getStorageRecord(STORAGE_KEYS.responsePlanIds)
    const editToken = editTokens[responseId]
    const storedPlanId = planIds[responseId]

    if (!editToken || !storedPlanId) return

    try {
      await queryClient.ensureQueryData(responseKeys.withPlan(responseId, storedPlanId))
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  head: () => ({
    meta: [{ title: 'Edit Availability | PlanTheTrip' }],
  }),
  component: EditResponsePage,
  notFoundComponent: NotFound,
  errorComponent: EditResponseErrorComponent,
  pendingComponent: () => null,
  validateSearch: searchSchema,
})

function EditResponsePage() {
  const { responseId } = Route.useParams()
  const { returnUrl } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const { getResponseEditToken, getResponsePlanId } = useResponseEditTokens()
  const [isDirty, setIsDirty] = useState(false)
  // HACK: Look for ways to replace this during refactor
  const resetFormRef = useRef<(() => void) | null>(null)

  const editToken = getResponseEditToken(responseId)
  const storedPlanId = getResponsePlanId(responseId)

  if (!editToken || !storedPlanId) {
    return <NoPermissionScreen />
  }

  return (
    <EditResponseContent
      responseId={responseId}
      editToken={editToken}
      storedPlanId={storedPlanId}
      returnUrl={returnUrl}
      navigate={navigate}
      queryClient={queryClient}
      isDirty={isDirty}
      setIsDirty={setIsDirty}
      resetFormRef={resetFormRef}
    />
  )
}

interface EditResponseContentProps {
  responseId: string
  editToken: string
  storedPlanId: string
  returnUrl: string | undefined
  navigate: ReturnType<typeof useNavigate>
  queryClient: ReturnType<typeof useQueryClient>
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
  resetFormRef: React.RefObject<(() => void) | null>
}

function EditResponseContent({
  responseId,
  editToken,
  storedPlanId,
  returnUrl,
  navigate,
  queryClient,
  isDirty,
  setIsDirty,
  resetFormRef,
}: EditResponseContentProps) {
  const { data } = useSuspenseQuery(responseKeys.withPlan(responseId, storedPlanId))

  const updateResponseMutation = useMutation({
    mutationFn: async (formData: ResponseFormData) => {
      const res = await client.responses[':id'].$put({
        param: { id: responseId },
        json: {
          name: formData.name,
          availableDates: formData.availableDates,
          editToken,
        },
      })
      if (!res.ok) throw await parseErrorResponse(res, 'Failed to update response')
      return res.json()
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: planKeys.detail(data.plan.id).queryKey })

      const previousPlan = queryClient.getQueryData<PlanWithResponses>(planKeys.detail(data.plan.id).queryKey)

      queryClient.setQueryData<PlanWithResponses>(planKeys.detail(data.plan.id).queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          responses: old.responses?.map((r) =>
            r.id === responseId
              ? { ...r, name: newData.name, availableDates: newData.availableDates }
              : r
          ),
        }
      })

      return { previousPlan }
    },
    onSuccess: () => {
      resetFormRef.current?.()
      toast.success('Your availability has been updated!')
      setTimeout(() => {
        if (returnUrl) {
          navigate({ to: returnUrl })
        } else {
          navigate({
            to: '/plan/$planId',
            params: { planId: data.plan.id },
          })
        }
      }, 0)
    },
    onError: (err, _newData, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData<PlanWithResponses>(planKeys.detail(data.plan.id).queryKey, context.previousPlan)
      }
      toast.error(err.message || 'Failed to update availability')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(data.plan.id).queryKey })
    },
  })

  const deleteResponseMutation = useDeleteResponse({
    onSuccess: () => {
      toast.success('Your response has been deleted')
      navigate({ to: returnUrl ?? '/trips' })
    },
  })

  const handleSubmit = (formData: ResponseFormData) => {
    updateResponseMutation.mutate(formData)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your response?')) {
      deleteResponseMutation.mutate({ responseId, planId: data.plan.id })
    }
  }

  const handleDirtyChange = (dirty: boolean) => {
    setIsDirty(dirty)
  }

  const handleResetRef = (reset: () => void) => {
    resetFormRef.current = reset
  }

  const { plan, response } = data
  const otherRespondentNames = plan.responses?.filter((r) => r.id !== responseId).map((r) => r.name) ?? []

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      <AppHeader planId={plan.id} />
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pb-20 pt-10">
        <div className="w-full md:w-fit mx-auto flex flex-col gap-12">
          <PageHeading planName={plan.name} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ResponseForm
              startRange={plan.startRange}
              endRange={plan.endRange}
              numDays={plan.numDays}
              initialName={response.name}
              initialDates={response.availableDates}
              existingNames={otherRespondentNames}
              onSubmit={handleSubmit}
              isSubmitting={updateResponseMutation.isPending}
              isEditMode
              onDirtyChange={handleDirtyChange}
              onResetRef={handleResetRef}
              onDelete={handleDelete}
              isDeleting={deleteResponseMutation.isPending}
            />
          </motion.div>
        </div>
      </main>

      <NavigationBlocker
        shouldBlock={isDirty && !updateResponseMutation.isPending && !updateResponseMutation.isSuccess && !deleteResponseMutation.isPending}
        onDiscard={() => resetFormRef.current?.()}
      />
    </div>
  )
}

function EditResponseErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Failed to load response"
      message="Please try navigating from the plan page."
      onRetry={reset}
    />
  )
}

function PageHeading({ planName }: { planName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em] text-foreground">
        Edit Your Availability
      </h1>
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarDays className="size-5" />
        <p className="text-lg font-normal leading-normal">{planName}</p>
      </div>
    </motion.div>
  )
}


function NoPermissionScreen() {
  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-red-500 text-xl">No edit permission</div>
        <p className="text-text-secondary">You can only edit your own responses.</p>
      </div>
    </div>
  )
}
