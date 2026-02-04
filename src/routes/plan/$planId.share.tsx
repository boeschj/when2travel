import { useCurrentUserResponse } from "@/hooks/use-auth-tokens";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { motion } from "motion/react";

import { planKeys } from "@/lib/queries";
import { ErrorScreen } from "@/components/shared/error-screen";

import { SharePanel } from "./-share/share-panel";

export const Route = createFileRoute("/plan/$planId/share")({
  head: () => ({
    meta: [{ title: "Share Trip | PlanTheTrip" }],
  }),
  component: ShareTripPage,
  errorComponent: ShareErrorComponent,
  pendingComponent: () => null,
});

function ShareTripPage() {
  const { planId } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: plan } = useSuspenseQuery(planKeys.detail(planId));
  const userResponse = useCurrentUserResponse(plan.responses);

  const hasExistingResponse = !!userResponse;
  const formattedDateRange = formatDateRange(plan);

  const navigateToAddAvailability = () => {
    void navigate({
      to: "/plan/$planId/respond",
      params: { planId },
    });
  };

  const navigateToEditAvailability = () => {
    if (!userResponse) return;
    void navigate({
      to: "/response/$responseId/edit",
      params: { responseId: userResponse.id },
    });
  };

  return (
    <div className="bg-background text-foreground relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-10 pb-20 md:px-12 lg:px-20">
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
  );
}

function ShareErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="We couldn't load this page. Please try again."
      onRetry={reset}
    />
  );
}

interface ShareHeadingProps {
  planName: string;
  numDays: number;
  dateRange: string;
}

function ShareHeading({ planName, numDays, dateRange }: ShareHeadingProps) {
  return (
    <div className="flex w-full flex-col gap-2 text-center">
      <h1 className="text-foreground text-3xl leading-tight font-black tracking-[-0.033em] md:text-4xl">
        Your plan: {planName} is ready to share!
      </h1>
      <p className="text-muted-foreground text-lg font-bold md:text-xl">
        for {numDays} days {dateRange}
      </p>
    </div>
  );
}

function formatDateRange(plan: { startRange: string; endRange: string }) {
  const start = parseISO(plan.startRange);
  const end = parseISO(plan.endRange);
  return `from ${format(start, "MMM d")} - ${format(end, "MMM d")}`;
}
