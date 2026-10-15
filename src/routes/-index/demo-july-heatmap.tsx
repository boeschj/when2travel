import { useState } from "react";

import { DateAvailabilityDialog } from "../plan/-results/date-availability-popover";
import { ResultsCalendar } from "../plan/-results/results-calendar";
import { ResultsProvider } from "../plan/-results/results-context";
import {
  getPopoverParticipants,
  mapResponsesToRespondents,
} from "../plan/-results/results-page-utils";
import { DEMO_CURRENT_USER_ID, DEMO_PLAN, DEMO_RESPONDENT_COLOR_MAP } from "./demo-plan-data";

const DEMO_BEST_WINDOW_MONTH_START = "2026-07-01";

const DEMO_JULY_PLAN = {
  ...DEMO_PLAN,
  startRange: DEMO_BEST_WINDOW_MONTH_START,
};

const DEMO_RESPONDENTS = mapResponsesToRespondents(DEMO_JULY_PLAN.responses, isDemoCurrentUser);
const DEMO_RESPONDENT_COUNT = DEMO_RESPONDENTS.length;

interface DemoJulyHeatmapProps {
  className?: string;
  selectedRespondentId: string | null;
  onRespondentSelect: (respondentId: string | null) => void;
}

export function DemoJulyHeatmap({
  className,
  selectedRespondentId,
  onRespondentSelect,
}: DemoJulyHeatmapProps) {
  const { dialogDate, isDialogOpen, setIsDialogOpen, dialogParticipants, handleDateClick } =
    useDateAvailabilityDialog();

  const dialogAvailableCount = dialogParticipants.filter(
    participant => participant.isAvailable,
  ).length;

  return (
    <ResultsProvider
      plan={DEMO_JULY_PLAN}
      respondents={DEMO_RESPONDENTS}
      respondentColorMap={DEMO_RESPONDENT_COLOR_MAP}
      bestWindow={null}
      selectedRespondentId={selectedRespondentId}
      onRespondentClick={onRespondentSelect}
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
          totalCount={DEMO_RESPONDENT_COUNT}
          participants={dialogParticipants}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSelectRespondent={onRespondentSelect}
        />
      )}
    </ResultsProvider>
  );
}

function useDateAvailabilityDialog() {
  const [dialogDate, setDialogDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dialogParticipants = getPopoverParticipants({
    popoverDate: dialogDate,
    responses: DEMO_JULY_PLAN.responses,
    hasResponseToken: isDemoCurrentUser,
    colorMap: DEMO_RESPONDENT_COLOR_MAP,
  });

  const handleDateClick = (date: Date) => {
    setDialogDate(date);
    setIsDialogOpen(true);
  };

  return { dialogDate, isDialogOpen, setIsDialogOpen, dialogParticipants, handleDateClick };
}

function isDemoCurrentUser(responseId: string): boolean {
  const isCurrentUser = responseId === DEMO_CURRENT_USER_ID;
  return isCurrentUser;
}
