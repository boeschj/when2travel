import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { client } from '@/lib/api'
import { SharePanel } from '@/components/plan/organisms/share-panel'
import { Wordmark } from '@/components/ui/wordmark'
import { motion } from 'motion/react'
import { format, parseISO } from 'date-fns'
import { ROUTES } from '@/lib/routes'

export const Route = createFileRoute(ROUTES.PLAN_SHARE)({
  component: ShareTripPage,
})

function ShareTripPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()

  const { data: plan, isLoading, error } = useQuery({
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

  const handleAddAvailability = () => {
    navigate({
      to: ROUTES.PLAN_RESPOND,
      params: { planId },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-red-500">Failed to load plan</div>
      </div>
    )
  }

  const formatDateRange = () => {
    const start = parseISO(plan.startRange)
    const end = parseISO(plan.endRange)
    return `from ${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <header className="w-full border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="px-4 md:px-10 py-3 max-w-7xl mx-auto flex items-center justify-between">
          <Wordmark />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl mx-auto flex flex-col gap-10"
        >
          <div className="flex flex-col gap-2 w-full text-center">
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              Your plan: {plan.name} is ready to share!
            </h1>
            <p className="text-text-secondary text-lg md:text-xl font-bold">
              for {plan.numDays} days {formatDateRange()}
            </p>
          </div>

          <SharePanel
            planId={planId}
            planName={plan.name}
            onAddAvailability={handleAddAvailability}
          />
        </motion.div>
      </main>
    </div>
  )
}