import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ROUTE_IDS } from '@/lib/routes'
import { AppHeader } from '@/components/shared/app-header'
import { StorageBanner } from '@/components/trips/storage-banner'
import { TripCard } from '@/components/trips/trip-card'
import { TripCardSkeleton } from '@/components/trips/trip-card-skeleton'
import { EmptyState } from '@/components/trips/empty-state'
import { useUserTrips } from '@/hooks/use-user-trips'

export const Route = createFileRoute(ROUTE_IDS.TRIPS)({
  component: TripsPage,
})

function TripsPage() {
  const { trips, isLoading, hasTrips } = useUserTrips()

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background text-foreground">
      <AppHeader />

      <main className="flex-1 flex flex-col px-6 md:px-12 lg:px-20 pb-20 pt-10">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Your Adventures
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back! Here are the trips saved on this computer. Manage your plans and check response status below.
            </p>
          </motion.div>

          {/* Storage Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StorageBanner />
          </motion.div>

          {/* Content */}
          {!hasTrips && !isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <EmptyState />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {isLoading && trips.length === 0 ? (
                // Initial loading state
                <>
                  <TripCardSkeleton />
                  <TripCardSkeleton />
                  <TripCardSkeleton />
                </>
              ) : (
                trips.map((trip) =>
                  trip.isLoading ? (
                    <TripCardSkeleton key={trip.planId} />
                  ) : trip.plan ? (
                    <TripCard
                      key={trip.planId}
                      plan={trip.plan}
                      role={trip.role}
                    />
                  ) : null
                )
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
