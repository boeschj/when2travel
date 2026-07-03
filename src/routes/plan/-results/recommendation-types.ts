import type { ISODateString } from "@/lib/date/types";
import { pluralize } from "@/lib/utils";

import type {
  AlternativeWindow,
  Constrainer,
  ScoredWindow,
  ShorterTripSuggestion,
} from "./availability-analysis";

export const RECOMMENDATION_STATUS = {
  PERFECT: "perfect",
  GREAT: "great",
  GOOD: "good",
  POSSIBLE: "possible",
  UNLIKELY: "unlikely",
} as const;

export type RecommendationStatus =
  (typeof RECOMMENDATION_STATUS)[keyof typeof RECOMMENDATION_STATUS];

export const STATUS_THRESHOLDS = {
  GREAT: 80,
  GOOD: 67,
  POSSIBLE: 50,
} as const;

export const RECOMMENDATION_KIND = {
  PERFECT_MATCH: "perfect-match",
  UNLOCK: "unlock",
  SHORTER_TRIP: "shorter-trip",
  CONSTRAINED_SCHEDULE: "constrained-schedule",
  GOOD_ENOUGH: "good-enough",
  CRAMPED_RANGE: "cramped-range",
  EXPLORING: "exploring",
} as const;

export type RecommendationKind = (typeof RECOMMENDATION_KIND)[keyof typeof RECOMMENDATION_KIND];

interface RecommendationBase {
  status: RecommendationStatus;
  headline: string;
  advice: string;
  bestWindow: ScoredWindow | null;
}

export interface PerfectMatchRecommendation extends RecommendationBase {
  kind: typeof RECOMMENDATION_KIND.PERFECT_MATCH;
  bestWindow: ScoredWindow;
}

export interface UnlockRecommendation extends RecommendationBase {
  kind: typeof RECOMMENDATION_KIND.UNLOCK;
  bestWindow: ScoredWindow;
  blockerId: string;
  blockerName: string;
  datesToFree: ISODateString[];
}

export interface ShorterTripRecommendation extends RecommendationBase {
  kind: typeof RECOMMENDATION_KIND.SHORTER_TRIP;
  suggestion: ShorterTripSuggestion;
}

export interface ConstrainedScheduleRecommendation extends RecommendationBase {
  kind: typeof RECOMMENDATION_KIND.CONSTRAINED_SCHEDULE;
  constrainers: Constrainer[];
}

export interface GoodEnoughRecommendation extends RecommendationBase {
  kind: typeof RECOMMENDATION_KIND.GOOD_ENOUGH;
  bestWindow: ScoredWindow;
}

export interface CrampedRangeRecommendation extends RecommendationBase {
  kind: typeof RECOMMENDATION_KIND.CRAMPED_RANGE;
}

export interface ExploringRecommendation extends RecommendationBase {
  kind: typeof RECOMMENDATION_KIND.EXPLORING;
}

export type Recommendation =
  | PerfectMatchRecommendation
  | UnlockRecommendation
  | ShorterTripRecommendation
  | ConstrainedScheduleRecommendation
  | GoodEnoughRecommendation
  | CrampedRangeRecommendation
  | ExploringRecommendation;

export interface RecommendationResult {
  primary: Recommendation;
  alternativeWindows: AlternativeWindow[];
}

export function getWindowStatus(window: ScoredWindow | null): RecommendationStatus {
  if (!window) return RECOMMENDATION_STATUS.UNLIKELY;
  if (window.isPerfect) return RECOMMENDATION_STATUS.PERFECT;
  if (window.percentage >= STATUS_THRESHOLDS.GREAT) return RECOMMENDATION_STATUS.GREAT;
  if (window.percentage >= STATUS_THRESHOLDS.GOOD) return RECOMMENDATION_STATUS.GOOD;
  if (window.percentage >= STATUS_THRESHOLDS.POSSIBLE) return RECOMMENDATION_STATUS.POSSIBLE;
  return RECOMMENDATION_STATUS.UNLIKELY;
}

const MAX_LISTED_NAMES = 3;

export function formatNameList(names: string[]): string {
  const [first, second, third] = names;

  if (!first) {
    return "";
  }

  const isSingleName = names.length === 1;
  if (isSingleName) {
    return first;
  }

  const isTwoNames = names.length === 2 && second;
  if (isTwoNames) {
    const formatted = `${first} and ${second}`;
    return formatted;
  }

  const isThreeNames = names.length === MAX_LISTED_NAMES && second && third;
  if (isThreeNames) {
    const formatted = `${first}, ${second}, and ${third}`;
    return formatted;
  }

  const displayNames = names.slice(0, MAX_LISTED_NAMES);
  const remaining = names.length - MAX_LISTED_NAMES;
  const joinedNames = displayNames.join(", ");
  const pluralizedOther = pluralize(remaining, "other");
  const formatted = `${joinedNames}, and ${remaining} ${pluralizedOther}`;
  return formatted;
}
