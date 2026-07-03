import { differenceInDays } from "date-fns";

import { formatDateShort, formatRangeDisplay } from "@/lib/date/formatter";
import type { ISODateString } from "@/lib/date/types";
import { parseISODate } from "@/lib/date/types";
import { pluralize } from "@/lib/utils";

import type {
  AlternativeWindow,
  AvailabilityAnalysis,
  ScoredWindow,
} from "./availability-analysis";
import { toAlternativeWindow } from "./availability-analysis";
import type {
  ConstrainedScheduleRecommendation,
  CrampedRangeRecommendation,
  ExploringRecommendation,
  GoodEnoughRecommendation,
  PerfectMatchRecommendation,
  Recommendation,
  ShorterTripRecommendation,
  UnlockRecommendation,
} from "./recommendation-types";
import {
  formatNameList,
  getWindowStatus,
  RECOMMENDATION_KIND,
  RECOMMENDATION_STATUS,
  STATUS_THRESHOLDS,
} from "./recommendation-types";

const CRAMPED_RANGE_RATIO = 1.5;
const MAX_ALTERNATIVE_WINDOWS = 3;
const MAX_LISTED_DATES = 3;

type RecommendationRule = (analysis: AvailabilityAnalysis) => Recommendation | null;

const PRIORITIZED_RULES: RecommendationRule[] = [
  recommendPerfectMatch,
  recommendUnlock,
  recommendShorterTrip,
  recommendConstrainedSchedule,
  recommendGoodEnough,
  recommendCrampedRange,
];

export function deriveRecommendation(analysis: AvailabilityAnalysis): Recommendation {
  for (const rule of PRIORITIZED_RULES) {
    const recommendation = rule(analysis);
    if (recommendation) {
      return recommendation;
    }
  }
  return recommendExploring(analysis);
}

export function buildAlternativeWindows(analysis: AvailabilityAnalysis): AlternativeWindow[] {
  const { scoredWindows, bestWindow } = analysis;
  if (!bestWindow) {
    return [];
  }

  const seenBlockerSignatures = new Set([getBlockerSignature(bestWindow)]);
  const alternativeWindows: AlternativeWindow[] = [];

  for (const window of scoredWindows) {
    const hasEnoughAlternatives = alternativeWindows.length >= MAX_ALTERNATIVE_WINDOWS;
    if (hasEnoughAlternatives) {
      break;
    }

    const isUseless = window.availableCount === 0;
    if (isUseless) {
      continue;
    }

    const signature = getBlockerSignature(window);
    const isSameOptionShifted = seenBlockerSignatures.has(signature);
    if (isSameOptionShifted) {
      continue;
    }

    seenBlockerSignatures.add(signature);
    alternativeWindows.push(toAlternativeWindow(window));
  }

  return alternativeWindows;
}

function recommendPerfectMatch(analysis: AvailabilityAnalysis): PerfectMatchRecommendation | null {
  const { bestWindow } = analysis;
  if (!bestWindow?.isPerfect) {
    return null;
  }

  return {
    kind: RECOMMENDATION_KIND.PERFECT_MATCH,
    status: RECOMMENDATION_STATUS.PERFECT,
    headline: "Pack your bags!",
    advice: "You found the sweet spot. Time to book!",
    bestWindow,
  };
}

function recommendUnlock(analysis: AvailabilityAnalysis): UnlockRecommendation | null {
  const unlock = analysis.bestUnlock;
  if (!unlock) {
    return null;
  }

  const missingDatesDisplay = formatDateList(unlock.datesToFree);
  const daysToFree = pluralize(unlock.datesToFree.length, "that day", "those days");

  return {
    kind: RECOMMENDATION_KIND.UNLOCK,
    status: getWindowStatus(unlock.window),
    headline: "So close!",
    advice: `${unlock.blockerName} can't make ${missingDatesDisplay}. If they can free ${daysToFree} up, everyone's in.`,
    bestWindow: unlock.window,
    blockerId: unlock.blockerId,
    blockerName: unlock.blockerName,
    datesToFree: unlock.datesToFree,
  };
}

function recommendShorterTrip(analysis: AvailabilityAnalysis): ShorterTripRecommendation | null {
  const suggestion = analysis.shorterTripSuggestion;
  if (!suggestion) {
    return null;
  }

  const hasSingleWindow = suggestion.windowCount === 1;
  const windowCountText = hasSingleWindow ? "There's a" : `There are ${suggestion.windowCount}`;
  const pluralizedWindow = pluralize(suggestion.windowCount, "window");

  return {
    kind: RECOMMENDATION_KIND.SHORTER_TRIP,
    status: getWindowStatus(analysis.bestWindow),
    headline: "Quick trip, anyone?",
    advice: `${analysis.numDays} days doesn't quite fit everyone, but ${suggestion.duration} days works perfectly. ${windowCountText} ${suggestion.duration}-day ${pluralizedWindow} where everyone's free.`,
    bestWindow: analysis.bestWindow,
    suggestion,
  };
}

function recommendConstrainedSchedule(
  analysis: AvailabilityAnalysis,
): ConstrainedScheduleRecommendation | null {
  const { constrainers, bestWindow, numDays } = analysis;
  if (constrainers.length === 0) {
    return null;
  }

  const bestPercentage = bestWindow?.percentage ?? 0;
  const hasMajority = bestPercentage >= STATUS_THRESHOLDS.POSSIBLE;
  const headline = hasMajority ? "We have a majority!" : "Tricky schedules!";

  return {
    kind: RECOMMENDATION_KIND.CONSTRAINED_SCHEDULE,
    status: getWindowStatus(bestWindow),
    headline,
    advice: buildConstrainerAdvice({ constrainers, numDays }),
    bestWindow,
    constrainers,
  };
}

function recommendGoodEnough(analysis: AvailabilityAnalysis): GoodEnoughRecommendation | null {
  const { bestWindow } = analysis;
  if (!bestWindow) {
    return null;
  }

  const isGoodEnough = bestWindow.percentage >= STATUS_THRESHOLDS.GREAT;
  if (!isGoodEnough) {
    return null;
  }

  return {
    kind: RECOMMENDATION_KIND.GOOD_ENOUGH,
    status: getWindowStatus(bestWindow),
    headline: "Looking good!",
    advice:
      "This is your best window! You could also try tweaking the date range to get everyone aligned.",
    bestWindow,
  };
}

function recommendCrampedRange(analysis: AvailabilityAnalysis): CrampedRangeRecommendation | null {
  const { rangeLengthInDays, numDays, bestWindow } = analysis;

  const isCramped = rangeLengthInDays < numDays * CRAMPED_RANGE_RATIO;
  if (!isCramped) {
    return null;
  }

  return {
    kind: RECOMMENDATION_KIND.CRAMPED_RANGE,
    status: getWindowStatus(bestWindow),
    headline: "Feeling cramped 😅",
    advice: `Fitting ${numDays} days into a ${rangeLengthInDays}-day window is tight! Try expanding the date range for more flexibility.`,
    bestWindow,
  };
}

function recommendExploring(analysis: AvailabilityAnalysis): ExploringRecommendation {
  const { bestWindow } = analysis;
  const hasAnyOverlap = (bestWindow?.availableCount ?? 0) > 0;

  const overlapAdvice =
    "The heatmap below shows where people overlap. Play with the dates to find a better fit!";
  const noOverlapAdvice = "No overlap yet. Waiting for more responses or try different dates.";

  let advice = noOverlapAdvice;
  if (hasAnyOverlap) {
    advice = overlapAdvice;
  }

  return {
    kind: RECOMMENDATION_KIND.EXPLORING,
    status: getWindowStatus(bestWindow),
    headline: "Still exploring 🏔️",
    advice,
    bestWindow,
  };
}

function buildConstrainerAdvice({
  constrainers,
  numDays,
}: {
  constrainers: AvailabilityAnalysis["constrainers"];
  numDays: number;
}): string {
  const [firstConstrainer] = constrainers;
  const isSingleConstrainer = constrainers.length === 1;

  if (isSingleConstrainer && firstConstrainer) {
    const hasNoAvailability = firstConstrainer.maxConsecutiveDays === 0;
    if (hasNoAvailability) {
      return `${firstConstrainer.name} hasn't marked any available dates yet. Nudge them to fill in the calendar!`;
    }

    const pluralizedDay = pluralize(firstConstrainer.maxConsecutiveDays, "day");
    return `${firstConstrainer.name} can only do ${firstConstrainer.maxConsecutiveDays} ${pluralizedDay} in a row, which rules out a ${numDays}-day trip. Worth checking if they can open up more dates!`;
  }

  const names = formatNameList(constrainers.map(constrainer => constrainer.name));
  return `${names} can't fit ${numDays} days in a row yet. Worth checking if they can open up more dates!`;
}

export function formatDateList(dates: ISODateString[]): string {
  const sortedDates = [...dates].sort((firstDate, secondDate) =>
    firstDate.localeCompare(secondDate),
  );
  const [firstDate, secondDate, thirdDate] = sortedDates;
  const lastDate = sortedDates.at(-1);

  if (!firstDate || !lastDate) {
    return "";
  }

  const isSingleDate = sortedDates.length === 1;
  if (isSingleDate) {
    return formatDateShort(firstDate);
  }

  const spanInDays = differenceInDays(parseISODate(lastDate), parseISODate(firstDate)) + 1;
  const isContiguous = spanInDays === sortedDates.length;
  if (isContiguous) {
    return formatRangeDisplay(firstDate, lastDate, " – ");
  }

  const isTwoDates = sortedDates.length === 2;
  if (isTwoDates && secondDate) {
    return `${formatDateShort(firstDate)} and ${formatDateShort(secondDate)}`;
  }

  const isThreeDates = sortedDates.length === MAX_LISTED_DATES;
  if (isThreeDates && secondDate && thirdDate) {
    return `${formatDateShort(firstDate)}, ${formatDateShort(secondDate)}, and ${formatDateShort(thirdDate)}`;
  }

  const listedDates = sortedDates.slice(0, MAX_LISTED_DATES).map(date => formatDateShort(date));
  const remainingCount = sortedDates.length - MAX_LISTED_DATES;
  return `${listedDates.join(", ")}, and ${remainingCount} more`;
}

function getBlockerSignature(window: ScoredWindow): string {
  const blockerIds = window.blockers.map(blocker => blocker.id);
  const sortedBlockerIds = blockerIds.toSorted((firstId, secondId) =>
    firstId.localeCompare(secondId),
  );
  return sortedBlockerIds.join("|");
}
