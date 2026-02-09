import { useMemo, useState } from "react";
import {
  useCurrentUserResponse,
  usePlanAuthContext,
  useResponseEditTokens,
} from "@/hooks/use-auth-tokens";
import { copyToClipboard } from "@/hooks/use-clipboard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { useDeletePlan } from "@/lib/mutations";
import { planKeys } from "@/lib/queries";
import type { PlanResponse } from "@/lib/types";
import { buildColorMap } from "@/lib/utils";
import { ErrorScreen } from "@/components/shared/error-screen";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { ResultsLegend } from "./-results/availability-legend";
import { DateAvailabilityDialog } from "./-results/date-availability-popover";
import { PlanHeader } from "./-results/plan-header";
import type { RecommendationResult } from "./-results/recommendation-types";
import { RespondentChips } from "./-results/respondent-chips";
import { ResultsCalendar } from "./-results/results-calendar";
import { ResultsProvider, useResultsValue } from "./-results/results-context";
import {
  buildDeleteConfig,
  buildShareUrl,
  getPopoverParticipants,
  mapResponsesToRespondents,
} from "./-results/results-page-utils";
import { SmartRecommendationsCard } from "./-results/smart-recommendations-card";
import { useCompatibleRanges } from "./-results/use-compatible-ranges";
import { useSmartRecommendation } from "./-results/use-smart-recommendation";

export const Route = createFileRoute("/plan/$planId/")({
  component: PlanResultsPage,
  errorComponent: PlanErrorComponent,
  pendingComponent: () => null,
});

function PlanResultsPage() {
  const { planId } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const { hasResponseToken } = useResponseEditTokens();
  const { isCreator } = usePlanAuthContext(planId);
  const [selectedRespondentId, setSelectedRespondentId] = useState<string | null>(null);
  const [popoverDate, setPopoverDate] = useState<Date | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: plan } = useSuspenseQuery(planKeys.detail(planId));

  const deletePlanMutation = useDeletePlan({
    onSuccess: () => {
      toast.success("Plan deleted successfully");
      void navigate({ to: "/trips" });
    },
  });

  const compatibleRanges = useCompatibleRanges(plan);
  const recommendation = useSmartRecommendation(plan);
  const currentUserResponse = useCurrentUserResponse(plan.responses);

  const bestWindow = compatibleRanges[0] ?? null;
  const respondents = useMemo(
    () => mapResponsesToRespondents(plan.responses, hasResponseToken),
    [plan.responses, hasResponseToken],
  );

  const respondentColorMap = useMemo(
    () => buildColorMap(respondents.map(r => r.id)),
    [respondents],
  );
  const popoverParticipants = getPopoverParticipants({
    popoverDate,
    responses: plan.responses,
    hasResponseToken,
    colorMap: respondentColorMap,
  });
  const popoverAvailableCount = popoverParticipants.filter(p => p.isAvailable).length;
  const shareUrl = buildShareUrl(planId);

  function handleShareLink() {
    void copyToClipboard(shareUrl);
    toast.success("Link copied to clipboard");
  }

  function handleEditAvailability() {
    const returnUrl = globalThis.location.pathname;
    if (currentUserResponse) {
      void navigate({
        to: "/response/$responseId/edit",
        params: { responseId: currentUserResponse.id },
        search: { returnUrl },
      });
      return;
    }
    void navigate({
      to: "/plan/$planId/respond",
      params: { planId },
      search: { returnUrl },
    });
  }

  function handleEditPlan() {
    void navigate({ to: "/create", search: { planId, returnUrl: globalThis.location.pathname } });
  }

  function handleDateClick(date: Date) {
    setPopoverDate(date);
    setIsPopoverOpen(true);
  }

  const hasRespondents = respondents.length > 0;

  const deleteConfig = buildDeleteConfig({
    isCreator,
    onConfirm: () => deletePlanMutation.mutate(planId),
    isPending: deletePlanMutation.isPending,
    responsesCount: respondents.length,
  });

  return (
    <div className="bg-background text-foreground relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <main className="flex flex-1 flex-col items-center px-6 pt-4 pb-20 md:px-12 md:pt-10 xl:px-20">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
          <PlanHeader
            name={plan.name}
            numDays={plan.numDays}
            startRange={plan.startRange}
            endRange={plan.endRange}
            variant="results"
            showMenu={isCreator}
            onEdit={handleEditPlan}
            onShare={handleShareLink}
            deleteConfig={deleteConfig}
          />

          {!hasRespondents && (
            <NoRespondentsState
              onAddAvailability={handleEditAvailability}
              onShare={handleShareLink}
            />
          )}

          {hasRespondents && (
            <ResultsProvider
              plan={plan}
              respondents={respondents}
              respondentColorMap={respondentColorMap}
              bestWindow={bestWindow}
              selectedRespondentId={selectedRespondentId}
              onRespondentClick={setSelectedRespondentId}
              onDateClick={handleDateClick}
            >
              <ResultsGrid
                recommendation={recommendation}
                isCreator={isCreator}
                currentUserResponse={currentUserResponse}
                onEditPlan={handleEditPlan}
                onEditAvailability={handleEditAvailability}
              />
            </ResultsProvider>
          )}

          <DateAvailabilityDialog
            date={popoverDate ?? new Date()}
            availableCount={popoverAvailableCount}
            totalCount={respondents.length}
            participants={popoverParticipants}
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
            onSelectRespondent={setSelectedRespondentId}
          />
        </div>
      </main>
    </div>
  );
}

function PlanErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="We're having trouble loading this trip. Please try again in a moment."
      onRetry={reset}
    />
  );
}

interface NoRespondentsStateProps {
  onAddAvailability: () => void;
  onShare: () => void;
}

function NoRespondentsState({ onAddAvailability, onShare }: NoRespondentsStateProps) {
  return (
    <div className="bg-surface-dark border-border rounded-2xl border p-6 md:p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary/20 flex h-16 w-16 items-center justify-center rounded-full">
          <Users className="text-primary h-8 w-8" />
        </div>
        <h2 className="text-foreground text-2xl font-bold md:text-3xl">Waiting for responses</h2>
        <p className="text-text-secondary text-lg">
          Share this plan with your group to start collecting availability.
        </p>

        <div className="flex w-full max-w-lg flex-col gap-3 pt-2">
          <Button
            onClick={onAddAvailability}
            size="cta"
          >
            Add Dates
            <UserPlus className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={onShare}
            variant="outline"
            size="lg"
            className="border-border hover:border-primary hover:text-primary h-auto w-full rounded-full py-3 font-semibold"
          >
            Share Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ResultsGridProps {
  recommendation: RecommendationResult | null;
  isCreator: boolean;
  currentUserResponse: PlanResponse | null | undefined;
  onEditPlan: () => void;
  onEditAvailability: () => void;
}

function ResultsGrid({
  recommendation,
  isCreator,
  currentUserResponse,
  onEditPlan,
  onEditAvailability,
}: ResultsGridProps) {
  const { plan } = useResultsValue();
  const hasResponded = !!currentUserResponse;

  return (
    <div className="grid grid-cols-1 gap-6 min-[1350px]:grid-cols-[minmax(300px,420px)_1fr] min-[1350px]:items-stretch min-[1350px]:gap-10">
      <div className="order-1 min-[1350px]:h-full">
        {recommendation && (
          <SmartRecommendationsCard
            recommendationResult={recommendation}
            planName={plan.name}
            isCreator={isCreator}
            hasResponded={hasResponded}
            currentUserResponseId={currentUserResponse?.id}
            onEditPlan={onEditPlan}
            onEditAvailability={onEditAvailability}
            onEditDuration={onEditPlan}
          />
        )}
      </div>

      <div className="order-2 min-w-0 min-[1350px]:h-full">
        <div className="bg-surface-dark border-border flex flex-col overflow-hidden rounded-2xl border p-4 min-[1350px]:h-full md:p-6">
          <RespondentChips />
          <Separator className="my-4" />
          <HeatmapHeader />
          <ResultsCalendar />
        </div>
      </div>
    </div>
  );
}

function HeatmapHeader() {
  return (
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <h3 className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
        Availability Heatmap
      </h3>
      <ResultsLegend />
    </div>
  );
}
