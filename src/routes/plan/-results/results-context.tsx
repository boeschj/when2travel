import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

import type { CompatibleDateRange, PlanResponse } from "@/lib/types";
import type { AvatarColor } from "@/lib/utils";

interface Respondent {
  id: string;
  name: string;
  availableDates: string[];
  isCurrentUser: boolean;
}

interface ResultsValueContextType {
  plan: {
    name: string;
    startRange: string;
    endRange: string;
    numDays: number;
    responses: PlanResponse[] | null;
  };
  respondents: Respondent[];
  respondentColorMap: Record<string, AvatarColor>;
  bestWindow: CompatibleDateRange | null;
  selectedRespondentId: string | null;
}

interface ResultsActionsContextType {
  onRespondentClick: (id: string | null) => void;
  onDateClick: (date: Date) => void;
}

const ResultsValueContext = createContext<ResultsValueContextType | null>(null);
const ResultsActionsContext = createContext<ResultsActionsContextType | null>(null);

interface ResultsProviderProps extends ResultsValueContextType, ResultsActionsContextType {
  children: ReactNode;
}

export function ResultsProvider({
  children,
  plan,
  respondents,
  respondentColorMap,
  bestWindow,
  selectedRespondentId,
  onRespondentClick,
  onDateClick,
}: ResultsProviderProps) {
  const valueContext = useMemo<ResultsValueContextType>(
    () => ({
      plan,
      respondents,
      respondentColorMap,
      bestWindow,
      selectedRespondentId,
    }),
    [plan, respondents, respondentColorMap, bestWindow, selectedRespondentId],
  );

  const actionsContext = useMemo<ResultsActionsContextType>(
    () => ({
      onRespondentClick,
      onDateClick,
    }),
    [onRespondentClick, onDateClick],
  );

  return (
    <ResultsValueContext.Provider value={valueContext}>
      <ResultsActionsContext.Provider value={actionsContext}>
        {children}
      </ResultsActionsContext.Provider>
    </ResultsValueContext.Provider>
  );
}

export function useResultsValue(): ResultsValueContextType {
  const context = useContext(ResultsValueContext);
  if (!context) {
    throw new Error("useResultsValue must be used within a ResultsProvider");
  }
  return context;
}

export function useResultsActions(): ResultsActionsContextType {
  const context = useContext(ResultsActionsContext);
  if (!context) {
    throw new Error("useResultsActions must be used within a ResultsProvider");
  }
  return context;
}

export type { Respondent, ResultsValueContextType, ResultsActionsContextType };
