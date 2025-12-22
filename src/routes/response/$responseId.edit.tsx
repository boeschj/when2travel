import { useState, useCallback } from 'react'
import { createFileRoute, useNavigate, useBlocker } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/api'
import { planKeys, responseKeys } from '@/lib/queries'
import { ResponseForm } from '@/components/plan/organisms/response-form'
import { motion } from 'motion/react'
import { toast } from 'sonner'
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
import type { ResponseFormData, PlanWithResponses } from '@/lib/types'
import { ROUTES } from '@/lib/routes'
import { z } from 'zod'
import { CalendarDays } from 'lucide-react'
import { AppHeader } from '@/components/shared/app-header'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { ErrorScreen } from '@/components/shared/error-screen'
import { useResponseEditTokens } from '@/hooks/use-auth-tokens'

const searchSchema = z.object({
  returnUrl: z.string().optional(),
})

export const Route = createFileRoute(ROUTES.RESPONSE_EDIT)({
  component: EditResponsePage,
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

function EditResponsePage() {
  const { responseId } = Route.useParams()
  const { returnUrl } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { getResponseEditToken, getResponsePlanId, removeResponseToken } = useResponseEditTokens()

  const [isDirty, setIsDirty] = useState(false)
  const [resetFormFn, setResetFormFn] = useState<(() => void) | null>(null)

  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsDirty(dirty)
  }, [])

  const handleResetRef = useCallback((reset: () => void) => {
    setResetFormFn(() => reset)
  }, [])

  const editToken = getResponseEditToken(responseId)
  const storedPlanId = getResponsePlanId(responseId)

  const { data, isLoading, error, refetch } = useQuery({
    ...responseKeys.withPlan(responseId, storedPlanId ?? ''),
    enabled: !!editToken && !!storedPlanId,
  })

  const updateResponseMutation = useMutation({
    mutationFn: async (formData: ResponseFormData) => {
      if (!editToken) {
        throw new Error('No edit permission')
      }

      const res = await client.responses[':id'].$put({
        param: { id: responseId },
        json: {
          name: formData.name,
          availableDates: formData.availableDates,
          editToken,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to update response')
      }

      return res.json()
    },
    onMutate: async (newData) => {
      if (!data?.plan.id) return

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: planKeys.detail(data.plan.id).queryKey })

      // Snapshot the previous value
      const previousPlan = queryClient.getQueryData<PlanWithResponses>(planKeys.detail(data.plan.id).queryKey)

      // Optimistically update the plan's responses
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
    onSuccess: async () => {
      // Reset form to clear dirty state before navigating
      resetFormFn?.()
      toast.success('Your availability has been updated!')
      // Defer navigation to next tick so form state updates first
      setTimeout(() => {
        if (returnUrl) {
          navigate({ to: returnUrl })
        } else if (data?.plan.id) {
          navigate({
            to: ROUTES.PLAN,
            params: { planId: data.plan.id },
          })
        }
      }, 0)
    },
    onError: (err: Error, _newData, context) => {
      // Rollback on error
      if (data?.plan.id && context?.previousPlan) {
        queryClient.setQueryData<PlanWithResponses>(planKeys.detail(data.plan.id).queryKey, context.previousPlan)
      }
      toast.error(err.message || 'Failed to update availability')
    },
    onSettled: () => {
      // Refetch to ensure consistency
      if (data?.plan.id) {
        queryClient.invalidateQueries({ queryKey: planKeys.detail(data.plan.id).queryKey })
      }
    },
  })

  const deleteResponseMutation = useMutation({
    mutationFn: async () => {
      if (!editToken) {
        throw new Error('No edit permission')
      }

      const res = await client.responses[':id'].$delete({
        param: { id: responseId },
        json: { editToken },
      })

      if (!res.ok) {
        throw new Error('Failed to delete response')
      }

      return res.json()
    },
    onSuccess: async () => {
      removeResponseToken(responseId)
      toast.success('Your response has been deleted')
      if (data?.plan.id) {
        await queryClient.refetchQueries({ queryKey: planKeys.detail(data.plan.id).queryKey })
      }
      // After leaving a trip, go to trips page (or returnUrl if provided)
      navigate({ to: returnUrl ?? ROUTES.TRIPS })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete response')
    },
  })

  const handleSubmit = (formData: ResponseFormData) => {
    updateResponseMutation.mutate(formData)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your response?')) {
      deleteResponseMutation.mutate()
    }
  }

  if (!editToken) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl">No edit permission</div>
          <p className="text-text-secondary">You can only edit your own responses.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error || !data) {
    return (
      <ErrorScreen
        title="Failed to load response"
        message={error?.message || 'Please try navigating from the plan page.'}
        onRetry={() => refetch()}
      />
    )
  }

  const { plan, response } = data

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      <AppHeader planId={plan.id} />

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pb-20 pt-10">
        <div className="w-full md:w-fit mx-auto flex flex-col gap-12">
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
              <p className="text-lg font-normal leading-normal">{plan.name}</p>
            </div>
          </motion.div>

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
              existingNames={plan.responses?.filter((r) => r.id !== responseId).map((r) => r.name) ?? []}
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
        shouldBlock={isDirty}
        onDiscard={() => resetFormFn?.()}
      />
    </div>
  )
}
