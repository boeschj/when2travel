import { buildColorMap } from "@/lib/utils";

import { ResultsCalendar } from "../plan/-results/results-calendar";
import { ResultsProvider } from "../plan/-results/results-context";
import { mapResponsesToRespondents } from "../plan/-results/results-page-utils";
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
  const respondents = mapResponsesToRespondents(DEMO_JULY_PLAN.responses, isDemoCurrentUser);
  const respondentIds = respondents.map(respondent => respondent.id);
  const respondentColorMap = buildColorMap(respondentIds);

  return (
    <ResultsProvider
      plan={DEMO_JULY_PLAN}
      respondents={respondents}
      respondentColorMap={respondentColorMap}
      bestWindow={null}
      selectedRespondentId={null}
      onRespondentClick={ignoreInteraction}
      onDateClick={ignoreInteraction}
    >
      <ResultsCalendar
        numberOfMonths={1}
        showNavigation={false}
        className={className}
      />
    </ResultsProvider>
  );
}

function isDemoCurrentUser(responseId: string): boolean {
  const isCurrentUser = responseId === DEMO_CURRENT_USER_ID;
  return isCurrentUser;
}

function ignoreInteraction(): void {
  // Display-only calendar: clicks on demo dates intentionally do nothing.
}
