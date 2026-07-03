import { addDays } from "date-fns";
import { AlertCircle, AlertTriangle, CheckCircle2, ThumbsUp, Users } from "lucide-react";

import { formatDateShort, formatRangeDisplay } from "@/lib/date/formatter";
import type { ISODateString } from "@/lib/date/types";
import { assertISODateString, parseISODate, toISODateString } from "@/lib/date/types";
import { pluralize } from "@/lib/utils";

import type { ScoredWindow } from "./availability-analysis";
import type { Recommendation, RecommendationStatus } from "./recommendation-types";
import { RECOMMENDATION_KIND, RECOMMENDATION_STATUS } from "./recommendation-types";

function toGoogleCalendarDate(iso: ISODateString): string {
  return iso.replaceAll("-", "");
}

/**
 * Google Calendar all-day events treat the end date as exclusive,
 * so the trip's inclusive end date must be pushed forward one day.
 */
export function buildGoogleCalendarUrl(
  planName: string,
  startDate: string,
  endDate: string,
): string {
  const start = assertISODateString(startDate);
  const inclusiveEnd = assertISODateString(endDate);
  const exclusiveEnd = toISODateString(addDays(parseISODate(inclusiveEnd), 1));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: planName,
    dates: `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(exclusiveEnd)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function formatDateRangeDisplay(start: string, end: string): string {
  const startDate = assertISODateString(start);
  const endDate = assertISODateString(end);
  const formattedRange = formatRangeDisplay(startDate, endDate, " – ");
  return formattedRange;
}

export function getStatusIcon(status: RecommendationStatus) {
  switch (status) {
    case RECOMMENDATION_STATUS.PERFECT: {
      return CheckCircle2;
    }
    case RECOMMENDATION_STATUS.GREAT: {
      return ThumbsUp;
    }
    case RECOMMENDATION_STATUS.GOOD: {
      return Users;
    }
    case RECOMMENDATION_STATUS.POSSIBLE: {
      return AlertCircle;
    }
    case RECOMMENDATION_STATUS.UNLIKELY: {
      return AlertTriangle;
    }
  }
}

export function getStatusStyles(status: RecommendationStatus): {
  iconColor: string;
  bgColor: string;
  accentColor: string;
} {
  switch (status) {
    case RECOMMENDATION_STATUS.PERFECT:
    case RECOMMENDATION_STATUS.GREAT: {
      return { iconColor: "text-primary", bgColor: "bg-primary/20", accentColor: "text-primary" };
    }
    case RECOMMENDATION_STATUS.GOOD:
    case RECOMMENDATION_STATUS.POSSIBLE: {
      return {
        iconColor: "text-status-yellow",
        bgColor: "bg-status-yellow/20",
        accentColor: "text-status-yellow",
      };
    }
    case RECOMMENDATION_STATUS.UNLIKELY: {
      return {
        iconColor: "text-status-red",
        bgColor: "bg-status-red/20",
        accentColor: "text-status-red",
      };
    }
  }
}

export interface PersonalizedCTA {
  label: string;
}

export function derivePersonalizedCTA({
  recommendation,
  currentUserResponseId,
}: {
  recommendation: Recommendation;
  currentUserResponseId: string | undefined;
}): PersonalizedCTA | null {
  if (!currentUserResponseId) {
    return null;
  }

  const isUnlockForCurrentUser =
    recommendation.kind === RECOMMENDATION_KIND.UNLOCK &&
    recommendation.blockerId === currentUserResponseId;
  if (isUnlockForCurrentUser) {
    return buildUnlockCTA(recommendation.datesToFree);
  }

  if (recommendation.kind === RECOMMENDATION_KIND.CONSTRAINED_SCHEDULE) {
    const isCurrentUserConstrainer = recommendation.constrainers.some(
      constrainer => constrainer.id === currentUserResponseId,
    );
    if (isCurrentUserConstrainer) {
      return { label: "Add More Dates" };
    }
  }

  return null;
}

export function deriveAvailabilityText(bestWindow: ScoredWindow | null): string | null {
  if (!bestWindow) {
    return null;
  }

  const peopleLabel = pluralize(bestWindow.totalCount, "person", "people");
  if (bestWindow.isPerfect) {
    return `All ${bestWindow.totalCount} ${peopleLabel} available`;
  }
  return `${bestWindow.availableCount}/${bestWindow.totalCount} ${peopleLabel} available`;
}

function buildUnlockCTA(datesToFree: ISODateString[]): PersonalizedCTA {
  const [onlyDate] = datesToFree;
  const isSingleDate = datesToFree.length === 1 && onlyDate;
  if (isSingleDate) {
    return { label: `Free Up ${formatDateShort(onlyDate)}` };
  }
  return { label: "Update Your Dates" };
}
