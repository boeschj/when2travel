import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { buildColorMap } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import { ResultsLegend } from "../plan/-results/availability-legend";
import { DateAvailabilityDialog } from "../plan/-results/date-availability-popover";
import { PlanHeader } from "../plan/-results/plan-header";
import { RespondentChips } from "../plan/-results/respondent-chips";
import { ResultsCalendar } from "../plan/-results/results-calendar";
import { ResultsProvider } from "../plan/-results/results-context";
import {
  getPopoverParticipants,
  mapResponsesToRespondents,
} from "../plan/-results/results-page-utils";
import { SmartRecommendationsCard } from "../plan/-results/smart-recommendations-card";
import { useAvailabilityAnalysis } from "../plan/-results/use-availability-analysis";
import { DEMO_CURRENT_USER_ID, DEMO_PLAN } from "./demo-plan-data";

const DEMO_URL = "planthetrip.co/hawaii-2026";

const TRAFFIC_LIGHTS = ["#FF5F57", "#FEBC2E", "#28C840"] as const;

export function LivePlanDemo() {
  const navigate = useNavigate();
  const [selectedRespondentId, setSelectedRespondentId] = useState<string | null>(null);
  const [popoverDate, setPopoverDate] = useState<Date | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const availability = useAvailabilityAnalysis(DEMO_PLAN);
  const recommendation = availability?.recommendation ?? null;
  const bestWindow = availability?.recommendedWindow ?? null;

  const isCurrentUser = (id: string) => id === DEMO_CURRENT_USER_ID;
  const respondents = mapResponsesToRespondents(DEMO_PLAN.responses, isCurrentUser);
  const respondentColorMap = buildColorMap(respondents.map(respondent => respondent.id));

  const popoverParticipants = getPopoverParticipants({
    popoverDate,
    responses: DEMO_PLAN.responses,
    hasResponseToken: isCurrentUser,
    colorMap: respondentColorMap,
  });
  const popoverAvailableCount = popoverParticipants.filter(
    participant => participant.isAvailable,
  ).length;

  const goToCreate = () => void navigate({ to: "/create" });

  const handleDateClick = (date: Date) => {
    setPopoverDate(date);
    setIsPopoverOpen(true);
  };

  return (
    <div className="bg-background overflow-hidden rounded-2xl border border-white/10 text-left shadow-[0_30px_70px_-35px_rgba(12,32,19,0.55)]">
      <BrowserBar />

      <div className="bg-background p-4 sm:p-6 md:p-8">
        <ResultsProvider
          plan={DEMO_PLAN}
          respondents={respondents}
          respondentColorMap={respondentColorMap}
          bestWindow={bestWindow}
          selectedRespondentId={selectedRespondentId}
          onRespondentClick={setSelectedRespondentId}
          onDateClick={handleDateClick}
        >
          <div className="flex flex-col gap-6">
            <PlanHeader
              name={DEMO_PLAN.name}
              numDays={DEMO_PLAN.numDays}
              startRange={DEMO_PLAN.startRange}
              endRange={DEMO_PLAN.endRange}
              variant="results"
            />

            {recommendation && (
              <SmartRecommendationsCard
                recommendationResult={recommendation}
                planName={DEMO_PLAN.name}
                isCreator
                hasResponded
                currentUserResponseId={DEMO_CURRENT_USER_ID}
                onEditPlan={goToCreate}
                onEditAvailability={goToCreate}
                onEditDuration={goToCreate}
              />
            )}

            <div className="bg-surface-dark border-border flex flex-col overflow-hidden rounded-2xl border p-4 md:p-6">
              <RespondentChips />
              <Separator className="my-4" />
              <HeatmapHeader />
              <ResultsCalendar />
            </div>
          </div>
        </ResultsProvider>

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
    </div>
  );
}

function BrowserBar() {
  return (
    <div className="border-border bg-background/60 flex items-center gap-2 border-b px-4 py-3">
      {TRAFFIC_LIGHTS.map(color => (
        <span
          key={color}
          className="h-3 w-3 rounded-full"
          style={{ background: color }}
          aria-hidden="true"
        />
      ))}
      <span className="text-muted-foreground ml-3 flex items-center gap-1.5 text-xs font-semibold">
        <span className="bg-primary h-1.5 w-1.5 rounded-full" />
        {DEMO_URL}
      </span>
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
