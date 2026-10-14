import { useState } from "react";

import { buildColorMap } from "@/lib/utils";

import { DateAvailabilityDialog } from "../plan/-results/date-availability-popover";
import { ResultsCalendar } from "../plan/-results/results-calendar";
import { ResultsProvider } from "../plan/-results/results-context";
import {
  getPopoverParticipants,
  mapResponsesToRespondents,
} from "../plan/-results/results-page-utils";
import { DEMO_CURRENT_USER_ID, DEMO_PLAN } from "./demo-plan-data";

const DEMO_BEST_WINDOW_MONTH_START = "2026-07-01";

const DEMO_JULY_PLAN = {
  ...DEMO_PLAN,
  startRange: DEMO_BEST_WINDOW_MONTH_START,
};

interface DemoJulyHeatmapProps {
  className?: string;
}

export function DemoJulyHeatmap({ className }: DemoJulyHeatmapProps) {
  const [dialogDate, setDialogDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const respondents = mapResponsesToRespondents(DEMO_JULY_PLAN.responses, isDemoCurrentUser);
  const respondentIds = respondents.map(respondent => respondent.id);
  const respondentColorMap = buildColorMap(respondentIds);

  const dialogParticipants = getPopoverParticipants({
    popoverDate: dialogDate,
    responses: DEMO_JULY_PLAN.responses,
    hasResponseToken: isDemoCurrentUser,
    colorMap: respondentColorMap,
  });
  const dialogAvailableCount = dialogParticipants.filter(
    participant => participant.isAvailable,
  ).length;

  const handleDateClick = (date: Date) => {
    setDialogDate(date);
    setIsDialogOpen(true);
  };

  return (
    <ResultsProvider
      plan={DEMO_JULY_PLAN}
      respondents={respondents}
      respondentColorMap={respondentColorMap}
      bestWindow={null}
      selectedRespondentId={null}
      onRespondentClick={ignoreRespondentClick}
      onDateClick={handleDateClick}
    >
      <ResultsCalendar
        numberOfMonths={1}
        showNavigation={false}
        className={className}
      />
      {dialogDate && (
        <DateAvailabilityDialog
          date={dialogDate}
          availableCount={dialogAvailableCount}
          totalCount={respondents.length}
          participants={dialogParticipants}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </ResultsProvider>
  );
}

function isDemoCurrentUser(responseId: string): boolean {
  const isCurrentUser = responseId === DEMO_CURRENT_USER_ID;
  return isCurrentUser;
}

function ignoreRespondentClick(): void {
  // The demo has no respondent chips, so there is nothing to filter by.
}
