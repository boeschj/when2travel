import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { planKeys } from '@/lib/queries'
import { SharePanel } from '@/components/plan/organisms/share-panel'
import { motion } from 'motion/react'
import { format, parseISO } from 'date-fns'
import { ROUTES } from '@/lib/routes'
import { AppHeader } from '@/components/shared/app-header'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { ErrorScreen } from '@/components/shared/error-screen'
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
    return <LoadingScreen />
  }

  if (error || !plan) {
    return (
      <ErrorScreen
        variant="not-found"
        title="Off the Map?"
        message="We couldn't find the page you're looking for. It seems this trip doesn't exist, or you may have taken a wrong turn on your journey."
      />
    )
  }

  const formatDateRange = () => {
    const start = parseISO(plan.startRange)
    const end = parseISO(plan.endRange)
    return `from ${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      <AppHeader planId={planId} variant="transparent" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-fit mx-auto flex flex-col gap-10"
        >
          <div className="flex flex-col gap-2 w-full text-center">
            <h1 className="text-foreground text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              Your plan: {plan.name} is ready to share!
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-bold">
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
