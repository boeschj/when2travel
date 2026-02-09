import { addDays, differenceInDays, eachDayOfInterval } from "date-fns";

import { parseAPIDate, toISODateString } from "@/lib/date/types";
import type { PlanResponse } from "@/lib/types";

import type {
  AlternativeWindow,
  BlockerInfo,
  ScoredWindow,
  ShorterTripSuggestion,
} from "./recommendation-types";

export function generateAllWindows(
  startRange: string,
  endRange: string,
  numDays: number,
): { start: string; end: string }[] {
  const rangeStart = parseAPIDate(startRange);
  const rangeEnd = parseAPIDate(endRange);
  const rangeDays = differenceInDays(rangeEnd, rangeStart) + 1;

  const hasInsufficientDays = rangeDays < numDays;
  if (hasInsufficientDays) {
    return [];
  }

  const windows: { start: string; end: string }[] = [];
  for (let i = 0; i <= rangeDays - numDays; i++) {
    const windowStart = addDays(rangeStart, i);
    const windowEnd = addDays(windowStart, numDays - 1);
    windows.push({
      start: toISODateString(windowStart),
      end: toISODateString(windowEnd),
    });
  }

  return windows;
}

export function scoreWindows(
  startRange: string,
  endRange: string,
  numDays: number,
  responses: PlanResponse[],
): ScoredWindow[] {
  const allWindows = generateAllWindows(startRange, endRange, numDays);
  const scoredWindows = allWindows.map(w =>
    scoreWindow({
      start: w.start,
      end: w.end,
      responses,
      planStart: startRange,
      planEnd: endRange,
    }),
  );
  const sortedWindows = [...scoredWindows].sort(
    (a, b) => b.percentage - a.percentage || a.start.localeCompare(b.start),
  );
  return sortedWindows;
}

interface ScoreWindowParams {
  start: string;
  end: string;
  responses: PlanResponse[];
  planStart: string;
  planEnd: string;
}

function scoreWindow({
  start,
  end,
  responses,
  planStart,
  planEnd,
}: ScoreWindowParams): ScoredWindow {
  const windowDates = eachDayOfInterval({
    start: parseAPIDate(start),
    end: parseAPIDate(end),
  }).map(d => toISODateString(d));

  const totalCount = responses.length;
  const blockers: BlockerInfo[] = [];
  let availableCount = 0;

  for (const response of responses) {
    const availableSet = new Set(response.availableDates);
    const missingDates = windowDates.filter(d => !availableSet.has(d));

    if (missingDates.length === 0) {
      availableCount++;
    } else {
      const blockerInfo = analyzeBlocker({
        response,
        windowStart: start,
        windowEnd: end,
        planStart,
        planEnd,
        missingDates,
      });
      blockers.push(blockerInfo);
    }
  }

  return {
    start,
    end,
    availableCount,
    totalCount,
    percentage: Math.round((availableCount / totalCount) * 100),
    blockers,
  };
}

interface AnalyzeBlockerParams {
  response: PlanResponse;
  windowStart: string;
  windowEnd: string;
  planStart: string;
  planEnd: string;
  missingDates: string[];
}

function analyzeBlocker({
  response,
  windowStart,
  windowEnd,
  planStart,
  planEnd,
  missingDates,
}: AnalyzeBlockerParams): BlockerInfo {
  const availableSet = new Set(response.availableDates);

  const dayBefore = toISODateString(addDays(parseAPIDate(windowStart), -1));
  const dayAfter = toISODateString(addDays(parseAPIDate(windowEnd), 1));

  const beforeInRange = dayBefore >= planStart;
  const afterInRange = dayAfter <= planEnd;

  const hasAdjacentBefore = beforeInRange && availableSet.has(dayBefore);
  const hasAdjacentAfter = afterInRange && availableSet.has(dayAfter);

  let shiftDirection: "earlier" | "later" | null = null;
  let shiftDays = 0;

  const firstMissingDate = missingDates[0];
  const lastMissingDate = missingDates.at(-1);

  if ((hasAdjacentBefore || hasAdjacentAfter) && firstMissingDate && lastMissingDate) {
    if (hasAdjacentBefore) {
      shiftDirection = "earlier";
      shiftDays = missingDates.length;
    } else if (hasAdjacentAfter) {
      shiftDirection = "later";
      shiftDays = missingDates.length;
    }
  }

  return {
    id: response.id,
    name: response.name,
    missingDates,
    missingCount: missingDates.length,
    hasAdjacentBefore,
    hasAdjacentAfter,
    shiftDirection,
    shiftDays,
  };
}

interface ValidateShiftedWindowParams {
  originalStart: string;
  shiftDays: number;
  direction: "earlier" | "later";
  planStart: string;
  planEnd: string;
  numDays: number;
}

export function validateShiftedWindow({
  originalStart,
  shiftDays,
  direction,
  planStart,
  planEnd,
  numDays,
}: ValidateShiftedWindowParams): boolean {
  const originalDate = parseAPIDate(originalStart);
  const shiftedStart =
    direction === "earlier" ? addDays(originalDate, -shiftDays) : addDays(originalDate, shiftDays);
  const shiftedEnd = addDays(shiftedStart, numDays - 1);

  const shiftedStartStr = toISODateString(shiftedStart);
  const shiftedEndStr = toISODateString(shiftedEnd);

  const isStartInRange = shiftedStartStr >= planStart;
  const isEndInRange = shiftedEndStr <= planEnd;
  const isValid = isStartInRange && isEndInRange;
  return isValid;
}

export function findShorterPerfectWindows(
  responses: PlanResponse[],
  startRange: string,
  endRange: string,
  originalDuration: number,
): ShorterTripSuggestion | null {
  const minDuration = Math.max(1, originalDuration - 3);

  for (let d = originalDuration - 1; d >= minDuration; d--) {
    const scored = scoreWindows(startRange, endRange, d, responses);
    const perfectWindows = scored.filter(w => w.percentage === 100);

    const hasPerfectWindows = perfectWindows.length > 0;
    if (hasPerfectWindows) {
      const topThreeWindows = perfectWindows.slice(0, 3);
      const mappedWindows = topThreeWindows.map(w => ({
        start: w.start,
        end: w.end,
        percentage: 100,
        availableCount: w.availableCount,
        totalCount: w.totalCount,
        missing: [],
      }));

      const suggestion: ShorterTripSuggestion = {
        duration: d,
        windowCount: perfectWindows.length,
        windows: mappedWindows,
      };
      return suggestion;
    }
  }

  return null;
}

export function findConstrainingPeople(
  topWindows: ScoredWindow[],
  responses: PlanResponse[],
  numDays: number,
): { id: string; name: string; availableDays: number }[] {
  const hasInsufficientWindows = topWindows.length < 3;
  if (hasInsufficientWindows) {
    return [];
  }

  const blockerCounts = new Map<string, { id: string; count: number }>();

  for (const window of topWindows) {
    for (const blocker of window.blockers) {
      const existing = blockerCounts.get(blocker.name);
      if (existing) {
        existing.count++;
      } else {
        blockerCounts.set(blocker.name, { id: blocker.id, count: 1 });
      }
    }
  }

  const constrainers: { id: string; name: string; availableDays: number }[] = [];
  for (const [name, { id, count }] of blockerCounts) {
    const isFrequentBlocker = count >= 3;
    if (isFrequentBlocker) {
      const response = responses.find(r => r.id === id);
      const availableDays = response?.availableDates.length ?? 0;
      const hasInsufficientDays = availableDays < numDays;
      if (hasInsufficientDays) {
        constrainers.push({ id, name, availableDays });
      }
    }
  }

  const sortedConstrainers = [...constrainers].sort((a, b) => a.availableDays - b.availableDays);
  return sortedConstrainers;
}

export function toAlternativeWindow(w: ScoredWindow): AlternativeWindow {
  const missingNames = w.blockers.map(b => b.name);
  const alternativeWindow: AlternativeWindow = {
    start: w.start,
    end: w.end,
    percentage: w.percentage,
    availableCount: w.availableCount,
    totalCount: w.totalCount,
    missing: missingNames,
  };
  return alternativeWindow;
}
