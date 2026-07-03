import { eachDayOfInterval } from "date-fns";

import type { ISODateString } from "@/lib/date/types";
import { parseAPIDate, toISODateString } from "@/lib/date/types";

const MAX_TRIP_SHORTENING_DAYS = 3;

export interface RespondentAvailability {
  id: string;
  name: string;
  availableDates: string[];
}

export interface DateWindow {
  start: ISODateString;
  end: ISODateString;
}

export interface WindowBlocker {
  id: string;
  name: string;
  missingDates: ISODateString[];
}

export interface ScoredWindow extends DateWindow {
  availableCount: number;
  totalCount: number;
  percentage: number;
  isPerfect: boolean;
  blockers: WindowBlocker[];
}

export interface AlternativeWindow extends DateWindow {
  availableCount: number;
  totalCount: number;
  percentage: number;
  missing: string[];
}

export interface FullAvailabilityRun extends DateWindow {
  lengthInDays: number;
}

export interface UnlockOption {
  blockerId: string;
  blockerName: string;
  datesToFree: ISODateString[];
  window: ScoredWindow;
}

export interface Constrainer {
  id: string;
  name: string;
  maxConsecutiveDays: number;
}

export interface ShorterTripSuggestion {
  duration: number;
  windowCount: number;
  windows: AlternativeWindow[];
}

export interface AvailabilityAnalysis {
  numDays: number;
  rangeLengthInDays: number;
  totalCount: number;
  scoredWindows: ScoredWindow[];
  bestWindow: ScoredWindow | null;
  fullAvailabilityRuns: FullAvailabilityRun[];
  bestUnlock: UnlockOption | null;
  shorterTripSuggestion: ShorterTripSuggestion | null;
  constrainers: Constrainer[];
}

interface AnalyzeAvailabilityParams {
  startRange: string;
  endRange: string;
  numDays: number;
  responses: RespondentAvailability[];
}

export function analyzeAvailability({
  startRange,
  endRange,
  numDays,
  responses,
}: AnalyzeAvailabilityParams): AvailabilityAnalysis {
  const allDates = listDatesInRange({ startRange, endRange });
  const availabilityByResponseId = buildAvailabilitySets({ responses });

  const scoredWindows = scoreAllWindows({ allDates, numDays, responses, availabilityByResponseId });
  const bestWindow = scoredWindows[0] ?? null;

  const fullAvailabilityRuns = findFullAvailabilityRuns({
    allDates,
    responses,
    availabilityByResponseId,
  });

  const bestUnlock = findBestUnlock({ scoredWindows });
  const shorterTripSuggestion = buildShorterTripSuggestion({
    fullAvailabilityRuns,
    numDays,
    totalCount: responses.length,
  });
  const constrainers = findConstrainers({ responses, startRange, endRange, numDays });

  const analysis: AvailabilityAnalysis = {
    numDays,
    rangeLengthInDays: allDates.length,
    totalCount: responses.length,
    scoredWindows,
    bestWindow,
    fullAvailabilityRuns,
    bestUnlock,
    shorterTripSuggestion,
    constrainers,
  };
  return analysis;
}

export function getMaxConsecutiveAvailableDays({
  availableDates,
  startRange,
  endRange,
}: {
  availableDates: string[];
  startRange: string;
  endRange: string;
}): number {
  const allDates = listDatesInRange({ startRange, endRange });
  const availableDateSet = new Set(availableDates);

  let maxConsecutiveDays = 0;
  let currentConsecutiveDays = 0;

  for (const date of allDates) {
    if (availableDateSet.has(date)) {
      currentConsecutiveDays++;
      maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays);
    } else {
      currentConsecutiveDays = 0;
    }
  }

  return maxConsecutiveDays;
}

export function toAlternativeWindow(window: ScoredWindow): AlternativeWindow {
  const missingNames = window.blockers.map(blocker => blocker.name);
  const alternativeWindow: AlternativeWindow = {
    start: window.start,
    end: window.end,
    availableCount: window.availableCount,
    totalCount: window.totalCount,
    percentage: window.percentage,
    missing: missingNames,
  };
  return alternativeWindow;
}

function listDatesInRange({
  startRange,
  endRange,
}: {
  startRange: string;
  endRange: string;
}): ISODateString[] {
  const datesInRange = eachDayOfInterval({
    start: parseAPIDate(startRange),
    end: parseAPIDate(endRange),
  });
  const isoDates = datesInRange.map(date => toISODateString(date));
  return isoDates;
}

function buildAvailabilitySets({
  responses,
}: {
  responses: RespondentAvailability[];
}): Map<string, Set<string>> {
  const availabilityByResponseId = new Map<string, Set<string>>();
  for (const response of responses) {
    availabilityByResponseId.set(response.id, new Set(response.availableDates));
  }
  return availabilityByResponseId;
}

function scoreAllWindows({
  allDates,
  numDays,
  responses,
  availabilityByResponseId,
}: {
  allDates: ISODateString[];
  numDays: number;
  responses: RespondentAvailability[];
  availabilityByResponseId: Map<string, Set<string>>;
}): ScoredWindow[] {
  const windowCount = allDates.length - numDays + 1;
  const hasInsufficientDays = windowCount <= 0;
  if (hasInsufficientDays) {
    return [];
  }

  const scoredWindows: ScoredWindow[] = [];
  for (let windowIndex = 0; windowIndex < windowCount; windowIndex++) {
    const windowDates = allDates.slice(windowIndex, windowIndex + numDays);
    const scoredWindow = scoreWindow({ windowDates, responses, availabilityByResponseId });
    scoredWindows.push(scoredWindow);
  }

  return sortByMostAvailableFirst({ scoredWindows });
}

function scoreWindow({
  windowDates,
  responses,
  availabilityByResponseId,
}: {
  windowDates: ISODateString[];
  responses: RespondentAvailability[];
  availabilityByResponseId: Map<string, Set<string>>;
}): ScoredWindow {
  const totalCount = responses.length;
  const blockers: WindowBlocker[] = [];

  for (const response of responses) {
    const availableDateSet = availabilityByResponseId.get(response.id);
    const missingDates = windowDates.filter(date => !availableDateSet?.has(date));

    const isFullyAvailable = missingDates.length === 0;
    if (!isFullyAvailable) {
      blockers.push({ id: response.id, name: response.name, missingDates });
    }
  }

  const availableCount = totalCount - blockers.length;
  const windowStart = windowDates[0];
  const windowEnd = windowDates.at(-1);
  if (!windowStart || !windowEnd) {
    throw new Error("scoreWindow requires a non-empty window");
  }

  const scoredWindow: ScoredWindow = {
    start: windowStart,
    end: windowEnd,
    availableCount,
    totalCount,
    percentage: Math.round((availableCount / totalCount) * 100),
    isPerfect: availableCount === totalCount,
    blockers,
  };
  return scoredWindow;
}

function sortByMostAvailableFirst({
  scoredWindows,
}: {
  scoredWindows: ScoredWindow[];
}): ScoredWindow[] {
  const sortedWindows = [...scoredWindows].sort((firstWindow, secondWindow) => {
    if (secondWindow.availableCount !== firstWindow.availableCount) {
      return secondWindow.availableCount - firstWindow.availableCount;
    }
    return firstWindow.start.localeCompare(secondWindow.start);
  });
  return sortedWindows;
}

function findFullAvailabilityRuns({
  allDates,
  responses,
  availabilityByResponseId,
}: {
  allDates: ISODateString[];
  responses: RespondentAvailability[];
  availabilityByResponseId: Map<string, Set<string>>;
}): FullAvailabilityRun[] {
  const hasNoResponses = responses.length === 0;
  if (hasNoResponses) {
    return [];
  }

  const runs: FullAvailabilityRun[] = [];
  let runStart: ISODateString | null = null;
  let runLength = 0;

  const closeCurrentRun = (runEnd: ISODateString | undefined) => {
    if (runStart && runEnd && runLength > 0) {
      runs.push({ start: runStart, end: runEnd, lengthInDays: runLength });
    }
    runStart = null;
    runLength = 0;
  };

  for (const [dateIndex, date] of allDates.entries()) {
    const isEveryoneAvailable = responses.every(response =>
      availabilityByResponseId.get(response.id)?.has(date),
    );

    if (isEveryoneAvailable) {
      runStart ??= date;
      runLength++;
      continue;
    }
    closeCurrentRun(allDates[dateIndex - 1]);
  }
  closeCurrentRun(allDates.at(-1));

  return runs;
}

function findBestUnlock({ scoredWindows }: { scoredWindows: ScoredWindow[] }): UnlockOption | null {
  let bestUnlock: UnlockOption | null = null;

  for (const window of scoredWindows) {
    const singleBlocker = window.blockers.length === 1 ? window.blockers[0] : undefined;
    if (!singleBlocker) continue;

    const isCheaperAsk =
      !bestUnlock || singleBlocker.missingDates.length < bestUnlock.datesToFree.length;
    if (isCheaperAsk) {
      bestUnlock = {
        blockerId: singleBlocker.id,
        blockerName: singleBlocker.name,
        datesToFree: singleBlocker.missingDates,
        window,
      };
    }
  }

  return bestUnlock;
}

function buildShorterTripSuggestion({
  fullAvailabilityRuns,
  numDays,
  totalCount,
}: {
  fullAvailabilityRuns: FullAvailabilityRun[];
  numDays: number;
  totalCount: number;
}): ShorterTripSuggestion | null {
  const longestRunLength = Math.max(0, ...fullAvailabilityRuns.map(run => run.lengthInDays));

  const fitsOriginalTrip = longestRunLength >= numDays;
  const isTooShortToSuggest = longestRunLength < numDays - MAX_TRIP_SHORTENING_DAYS;
  if (longestRunLength === 0 || fitsOriginalTrip || isTooShortToSuggest) {
    return null;
  }

  const longestRuns = fullAvailabilityRuns.filter(run => run.lengthInDays === longestRunLength);
  const suggestedWindows = longestRuns.map(run => ({
    start: run.start,
    end: run.end,
    availableCount: totalCount,
    totalCount,
    percentage: 100,
    missing: [],
  }));

  const suggestion: ShorterTripSuggestion = {
    duration: longestRunLength,
    windowCount: longestRuns.length,
    windows: suggestedWindows,
  };
  return suggestion;
}

function findConstrainers({
  responses,
  startRange,
  endRange,
  numDays,
}: {
  responses: RespondentAvailability[];
  startRange: string;
  endRange: string;
  numDays: number;
}): Constrainer[] {
  const constrainers: Constrainer[] = [];

  for (const response of responses) {
    const maxConsecutiveDays = getMaxConsecutiveAvailableDays({
      availableDates: response.availableDates,
      startRange,
      endRange,
    });

    const canFitTrip = maxConsecutiveDays >= numDays;
    if (!canFitTrip) {
      constrainers.push({ id: response.id, name: response.name, maxConsecutiveDays });
    }
  }

  const sortedConstrainers = [...constrainers].sort(
    (firstConstrainer, secondConstrainer) =>
      firstConstrainer.maxConsecutiveDays - secondConstrainer.maxConsecutiveDays,
  );
  return sortedConstrainers;
}
