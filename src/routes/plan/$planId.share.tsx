import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { planKeys } from '@/lib/queries'
import { SharePanel } from '@/components/plan/organisms/share-panel'
import { motion } from 'motion/react'
import { format, parseISO } from 'date-fns'
import { ROUTES } from '@/lib/routes'
import { AppHeader } from '@/components/shared/app-header'
import { useCurrentUserResponse } from '@/hooks/use-auth-tokens'

export const Route = createFileRoute(ROUTES.PLAN_SHARE)({
  component: ShareTripPage,
})

function ShareTripPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()

  const { data: plan, isLoading, error } = useQuery(planKeys.detail(planId))
  const userResponse = useCurrentUserResponse(plan?.responses)

  const handleAddAvailability = () => {
    navigate({
      to: ROUTES.PLAN_RESPOND,
      params: { planId },
    })
  }

  const handleViewAvailability = () => {
    if (userResponse) {
      navigate({
        to: ROUTES.RESPONSE_EDIT,
        params: { responseId: userResponse.id },
      })
    }
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
      <AppHeader planId={planId} responses={plan.responses} variant="transparent" />

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
            onViewAvailability={handleViewAvailability}
            hasUserResponse={!!userResponse}
          />
        </motion.div>
      </main>
    </div>
  )
}
