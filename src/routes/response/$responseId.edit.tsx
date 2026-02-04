import { useState } from 'react'
import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useDeleteResponse, useUpdateResponse } from '@/lib/mutations'
import { responseKeys } from '@/lib/queries'
import { ApiError } from '@/lib/errors'
import { ResponseForm } from '@/components/response-form/response-form'
import { useAppForm } from '@/components/ui/tanstack-form'
import { motion } from 'motion/react'
import { NavigationBlocker } from '@/components/navigation-blocker'
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
import { CalendarDays } from 'lucide-react'
import { AppHeader } from '@/components/shared/app-header'
import { ErrorScreen } from '@/components/shared/error-screen'
import { NotFound } from '@/components/shared/not-found'
import { useResponseEditTokens } from '@/hooks/use-auth-tokens'
import { getStorageRecord, STORAGE_KEYS } from '@/lib/storage'
import { toast } from 'sonner'

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
  const { getResponseEditToken, getResponsePlanId } = useResponseEditTokens()

  const editToken = getResponseEditToken(responseId)
  const storedPlanId = getResponsePlanId(responseId)

  if (!editToken || !storedPlanId) {
    return <NoPermissionScreen />
  }

  return (
    <EditResponseContent
      responseId={responseId}
      storedPlanId={storedPlanId}
      returnUrl={returnUrl}
    />
  )
}

interface EditResponseContentProps {
  responseId: string
  storedPlanId: string
  returnUrl: string | undefined
}

function EditResponseContent({
  responseId,
  storedPlanId,
  returnUrl,
}: EditResponseContentProps) {
  const navigate = useNavigate({ from: Route.fullPath })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { plan, response } = useSuspenseQuery(responseKeys.withPlan(responseId, storedPlanId)).data

  const otherRespondentNames = plan.responses
    ?.filter((existingResponse) => existingResponse.id !== responseId)
    .map((existingResponse) => existingResponse.name) ?? []

  const updateResponseMutation = useUpdateResponse({
    onSuccess: () => {
      form.reset(form.state.values)
      const destination = returnUrl || `/plan/${plan.id}`
      queueMicrotask(() => navigate({ to: destination }))
    },
  })

  const form = useAppForm({
    defaultValues: {
      name: response.name,
      selectedDates: response.availableDates,
    },
    onSubmit: ({ value }) => {
      updateResponseMutation.mutate({
        responseId,
        planId: plan.id,
        ...value,
      })
    },
  })

  const deleteResponseMutation = useDeleteResponse({
    onSuccess: () => {
      toast.success('Your response has been deleted')
      navigate({ to: returnUrl || '/trips' })
    },
  })

  const handleDeleteRequest = () => setIsDeleteDialogOpen(true)

  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false)
    deleteResponseMutation.mutate({ responseId, planId: plan.id })
  }

  const isMutationActive = updateResponseMutation.isPending || updateResponseMutation.isSuccess || deleteResponseMutation.isPending
  const shouldBlockNavigation = form.state.isDirty && !isMutationActive

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
            <form.AppForm>
              <ResponseForm
                form={form}
                startRange={plan.startRange}
                endRange={plan.endRange}
                numDays={plan.numDays}
                existingNames={otherRespondentNames}
                isSubmitting={updateResponseMutation.isPending}
                isEditMode
                onDelete={handleDeleteRequest}
                isDeleting={deleteResponseMutation.isPending}
              />
            </form.AppForm>
          </motion.div>
        </div>
      </main>

      <NavigationBlocker
        shouldBlock={shouldBlockNavigation}
        onDiscard={() => form.reset()}
      />

      <DeleteResponseDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

function EditResponseErrorComponent({ reset }: ErrorComponentProps) {
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

interface DeleteResponseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function DeleteResponseDialog({ open, onOpenChange, onConfirm }: DeleteResponseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Response</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your response? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
