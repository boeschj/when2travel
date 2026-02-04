import { createFileRoute } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { motion } from "motion/react";

import { AppHeader } from "@/components/shared/app-header";
import { ErrorScreen } from "@/components/shared/error-screen";

import { CreateTripCard } from "./-trips/create-trip-card";
import { EmptyState } from "./-trips/empty-state";
import StorageBanner from "./-trips/storage-banner";
import { TripCard } from "./-trips/trip-card";
import { TripCardSkeleton } from "./-trips/trip-card-skeleton";
import { useUserTrips } from "./-trips/use-user-trips";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [{ title: "Your Trips | PlanTheTrip" }],
  }),
  component: TripsPage,
  pendingComponent: () => null,
  errorComponent: TripsErrorComponent,
});

function TripsErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="We couldn't load your trips. Please try again."
      onRetry={reset}
    />
  );
}

const FADE_UP_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function TripsPage() {
  const { trips, isLoading, error } = useUserTrips();

  if (error) {
    throw error;
  }

  const showEmptyState = trips.length === 0 && !isLoading;
  const showSkeletons = isLoading && trips.length === 0;

  return (
    <div className="bg-background text-foreground relative flex min-h-screen w-full flex-col">
      <AppHeader />

      <main className="flex flex-1 flex-col px-6 pt-10 pb-20 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <PageHeading />
          <AnimatedBanner />

          {showEmptyState && <AnimatedEmptyState />}
          {!showEmptyState && (
            <TripGrid>
              <CreateTripCard />
              {showSkeletons && <LoadingSkeletons />}
              {!showSkeletons &&
                trips.map(trip => (
                  <TripCard
                    key={trip.planId}
                    plan={trip.plan}
                    role={trip.role}
                  />
                ))}
            </TripGrid>
          )}
        </div>
      </main>
    </div>
  );
}

function PageHeading() {
  return (
    <motion.div
      {...FADE_UP_ANIMATION}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      <h1 className="text-foreground text-4xl font-black tracking-tight md:text-5xl">
        Your Adventures
      </h1>
      <p className="text-muted-foreground text-lg">
        Welcome back! Here are the trips saved on this device. Manage your plans and check response
        status below.
      </p>
    </motion.div>
  );
}

function AnimatedBanner() {
  return (
    <motion.div
      {...FADE_UP_ANIMATION}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <StorageBanner />
    </motion.div>
  );
}

function AnimatedEmptyState() {
  return (
    <motion.div
      {...FADE_UP_ANIMATION}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <EmptyState />
    </motion.div>
  );
}

function TripGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      {...FADE_UP_ANIMATION}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </motion.div>
  );
}

function LoadingSkeletons() {
  return (
    <>
      <TripCardSkeleton />
      <TripCardSkeleton />
    </>
  );
}
