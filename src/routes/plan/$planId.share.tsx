import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { planKeys } from '@/lib/queries'
import { SharePanel } from './-share/share-panel'
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

  const hasExistingResponse = !!userResponse
  const formattedDateRange = formatDateRange(plan)

  const navigateToAddAvailability = () => {
    navigate({
      to: ROUTES.PLAN_RESPOND,
      params: { planId },
    })
  }

  const navigateToEditAvailability = () => {
    if (!userResponse) return
    navigate({
      to: ROUTES.RESPONSE_EDIT,
      params: { responseId: userResponse.id },
    })
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      <AppHeader planId={planId} variant="transparent" />

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-10 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-fit flex-col gap-10"
        >
          <ShareHeading
            planName={plan.name}
            numDays={plan.numDays}
            dateRange={formattedDateRange}
          />

          <SharePanel
            planId={planId}
            planName={plan.name}
            onAddAvailability={navigateToAddAvailability}
            onViewAvailability={navigateToEditAvailability}
            hasUserResponse={hasExistingResponse}
          />
        </motion.div>
      </main>
    </div>
  )
}

interface ShareHeadingProps {
  planName: string
  numDays: number
  dateRange: string
}

function ShareHeading({ planName, numDays, dateRange }: ShareHeadingProps) {
  return (
    <div className="flex w-full flex-col gap-2 text-center">
      <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-foreground md:text-4xl">
        Your plan: {planName} is ready to share!
      </h1>
      <p className="text-lg font-bold text-muted-foreground md:text-xl">
        for {numDays} days {dateRange}
      </p>
    </div>
  )
}

function formatDateRange(plan: { startRange: string; endRange: string }) {
  const start = parseISO(plan.startRange)
  const end = parseISO(plan.endRange)
  return `from ${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
}
