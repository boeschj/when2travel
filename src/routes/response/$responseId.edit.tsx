import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/api'
import { ResponseForm } from '@/components/plan/organisms/response-form'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ResponseFormData } from '@/lib/types'
import { ROUTES } from '@/lib/routes'
import { CalendarDays, Trash2 } from 'lucide-react'
import { SimpleHeader } from '@/components/shared/app-header'
import { useResponseEditTokens } from '@/hooks/use-auth-tokens'

export const Route = createFileRoute(ROUTES.RESPONSE_EDIT)({
  component: EditResponsePage,
})

function EditResponsePage() {
  const { responseId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { getResponseEditToken, getResponsePlanId, removeResponseToken } = useResponseEditTokens()

  const editToken = getResponseEditToken(responseId)
  const storedPlanId = getResponsePlanId(responseId)

  const { data, isLoading, error } = useQuery({
    queryKey: ['response-with-plan', responseId],
    queryFn: async () => {
      if (!editToken) {
        throw new Error('No edit permission for this response')
      }

      if (!storedPlanId) {
        throw new Error('Could not find the plan for this response. Please navigate from the plan page.')
      }

      const res = await client.plans[':id'].$get({
        param: { id: storedPlanId },
      })

      if (!res.ok) {
        throw new Error('Failed to fetch plan')
      }

      const plan = await res.json()
      const matchingResponse = plan.responses?.find(r => r.id === responseId)

      if (!matchingResponse) {
        throw new Error('Response not found in plan')
      }

      return { plan, response: matchingResponse }
    },
    enabled: !!editToken,
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
    onSuccess: async () => {
      toast.success('Your availability has been updated!')
      if (data?.plan.id) {
        await queryClient.refetchQueries({ queryKey: ['plan', data.plan.id] })
        navigate({
          to: ROUTES.PLAN,
          params: { planId: data.plan.id },
        })
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update availability')
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
        await queryClient.refetchQueries({ queryKey: ['plan', data.plan.id] })
        navigate({
          to: ROUTES.PLAN,
          params: { planId: data.plan.id },
        })
      }
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
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl">
            {error?.message || 'Failed to load response'}
          </div>
          <p className="text-text-secondary">
            Please try navigating from the plan page.
          </p>
        </div>
      </div>
    )
  }

  const { plan, response } = data

  return (
    <div className="min-h-screen bg-background-dark">
      <SimpleHeader />

      <main className="grow flex flex-col items-center w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-[960px] flex flex-col gap-8 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-2 p-2"
          >
            <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
              Edit Your Availability
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary">
                <CalendarDays className="w-5 h-5" />
                <p className="text-lg font-normal leading-normal">{plan.name}</p>
              </div>
              <Button
                onClick={handleDelete}
                variant="ghost"
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                disabled={deleteResponseMutation.isPending}
              >
                <Trash2 className="mr-2 w-5 h-5" />
                Delete Response
              </Button>
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
              onSubmit={handleSubmit}
              isSubmitting={updateResponseMutation.isPending}
            />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
