import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { client } from '@/lib/api'
import { ResponseForm } from '@/components/plan/organisms/response-form'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import type { ResponseFormData } from '@/lib/types'
import { ROUTES } from '@/lib/routes'

const $createResponse = client.responses.$post

export const Route = createFileRoute(ROUTES.PLAN_RESPOND)({
  component: MarkAvailabilityPage,
})

function MarkAvailabilityPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()

  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => {
      const res = await client.plans[':id'].$get({
        param: { id: planId },
      })
      if (!res.ok) {
        throw new Error('Failed to fetch plan')
      }
      return res.json()
    },
  })

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
    onSuccess: (data) => {
      localStorage.setItem(`responseEditToken:${data.id}`, data.editToken)
      localStorage.setItem(`responsePlanId:${data.id}`, planId)
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
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background-dark/80 border-b border-border px-4 sm:px-10 py-3">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between">
          <div className="flex items-center gap-3 text-white cursor-pointer select-none hover:opacity-80 transition-opacity">
            <div className="size-6 text-primary">
              <span className="material-symbols-outlined text-2xl">travel_explore</span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">when2travel</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex text-white text-sm font-medium hover:text-primary transition-colors">
              How it works
            </button>
            <button className="flex items-center justify-center overflow-hidden rounded-full h-9 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all">
              <span className="truncate">Log In</span>
            </button>
          </div>
        </div>
      </header>

      <main className="grow flex flex-col items-center w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-[960px] flex flex-col gap-8 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-2 p-2"
          >
            <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
              When can you go?
            </h1>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
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
              onSubmit={handleSubmit}
              isSubmitting={createResponseMutation.isPending}
            />
          </motion.div>
        </div>
      </main>
    </div>
  )
}