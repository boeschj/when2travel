import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { planKeys } from '@/lib/queries'
import { ApiError } from '@/lib/errors'
import { SharePanel } from './-share/share-panel'
import { motion } from 'motion/react'
import { format, parseISO } from 'date-fns'
import { ROUTES } from '@/lib/routes'
import { AppHeader } from '@/components/shared/app-header'
import { ErrorScreen } from '@/components/shared/error-screen'
import { NotFound } from '@/components/shared/not-found'
import { useCurrentUserResponse } from '@/hooks/use-auth-tokens'

import type { ErrorComponentProps } from '@tanstack/react-router'

export const Route = createFileRoute(ROUTES.PLAN_SHARE)({
  loader: async ({ context: { queryClient }, params: { planId } }) => {
    try {
      await queryClient.ensureQueryData(planKeys.detail(planId))
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  component: ShareTripPage,
  notFoundComponent: NotFound,
  errorComponent: ShareErrorComponent,
  pendingComponent: () => null,
})

function ShareTripPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()
  const { data: plan } = useSuspenseQuery(planKeys.detail(planId))
  const userResponse = useCurrentUserResponse(plan?.responses)

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

function ShareErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message={error.message || "We couldn't load this page. Please try again."}
      onRetry={reset}
    />
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
