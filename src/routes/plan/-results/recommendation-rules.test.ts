import { eachDayOfInterval, format, parseISO } from "date-fns";
import { describe, expect, it } from "vitest";

import { assertISODateString } from "@/lib/date/types";

import type { RespondentAvailability } from "./availability-analysis";
import { analyzeAvailability } from "./availability-analysis";
import {
  buildAlternativeWindows,
  deriveRecommendation,
  formatDateList,
} from "./recommendation-rules";
import { RECOMMENDATION_KIND } from "./recommendation-types";

function datesBetween(start: string, end: string): string[] {
  const dates = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
  return dates.map(date => format(date, "yyyy-MM-dd"));
}

function makeRespondent(
  id: string,
  name: string,
  availableDates: string[],
): RespondentAvailability {
  return { id, name, availableDates };
}

describe("deriveRecommendation", () => {
  it("recommends the perfect window when one exists", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-10",
      numDays: 5,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-10")),
        makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-10")),
      ],
    });

    const recommendation = deriveRecommendation(analysis);
    expect(recommendation.kind).toBe(RECOMMENDATION_KIND.PERFECT_MATCH);
  });

  it("only makes unlock claims that are verifiable from the availability data", () => {
    const responses = [
      makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-10")),
      makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-10")),
      makeRespondent("c", "Cam", datesBetween("2026-07-03", "2026-07-06")),
    ];
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-10",
      numDays: 5,
      responses,
    });

    const recommendation = deriveRecommendation(analysis);
    if (recommendation.kind !== RECOMMENDATION_KIND.UNLOCK) {
      throw new Error(`Expected an unlock recommendation, got ${recommendation.kind}`);
    }

    const noWindowIsPerfect = analysis.scoredWindows.every(window => !window.isPerfect);
    expect(noWindowIsPerfect).toBe(true);

    const unlockWindowDates = datesBetween(
      recommendation.bestWindow.start,
      recommendation.bestWindow.end,
    );
    const blocker = responses.find(response => response.id === recommendation.blockerId);
    const blockerAvailability = new Set(blocker?.availableDates);
    const actualMissingDates = unlockWindowDates.filter(date => !blockerAvailability.has(date));
    expect(recommendation.datesToFree).toEqual(actualMissingDates);

    const everyoneElse = responses.filter(response => response.id !== recommendation.blockerId);
    for (const respondent of everyoneElse) {
      const availability = new Set(respondent.availableDates);
      const isFullyAvailableInWindow = unlockWindowDates.every(date => availability.has(date));
      expect(isFullyAvailableInWindow).toBe(true);
    }
  });

  it("does not claim a perfect match when the percentage merely rounds to 100", () => {
    const fullRange = datesBetween("2026-07-01", "2026-07-05");
    const availableRespondents = Array.from({ length: 199 }, (_, index) =>
      makeRespondent(`r${index}`, `Person ${index}`, fullRange),
    );
    const almostAvailable = makeRespondent("blocker", "Blake", [
      "2026-07-01",
      "2026-07-02",
      "2026-07-04",
      "2026-07-05",
    ]);

    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-05",
      numDays: 5,
      responses: [...availableRespondents, almostAvailable],
    });

    const recommendation = deriveRecommendation(analysis);
    expect(recommendation.kind).toBe(RECOMMENDATION_KIND.UNLOCK);
    expect(analysis.bestWindow?.percentage).toBe(100);
  });

  it("claims a majority only when the best window actually has one", () => {
    const minorityAnalysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-06",
      numDays: 5,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-06")),
        makeRespondent("b", "Ben", ["2026-07-01", "2026-07-03"]),
        makeRespondent("c", "Cam", ["2026-07-02", "2026-07-05"]),
      ],
    });

    const minorityRecommendation = deriveRecommendation(minorityAnalysis);
    expect(minorityRecommendation.kind).toBe(RECOMMENDATION_KIND.CONSTRAINED_SCHEDULE);
    expect(minorityRecommendation.headline).not.toBe("We have a majority!");

    const majorityAnalysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-06",
      numDays: 5,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-06")),
        makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-06")),
        makeRespondent("c", "Cam", datesBetween("2026-07-01", "2026-07-06")),
        makeRespondent("d", "Dee", ["2026-07-01"]),
        makeRespondent("e", "Eli", ["2026-07-02"]),
      ],
    });

    const majorityRecommendation = deriveRecommendation(majorityAnalysis);
    expect(majorityRecommendation.kind).toBe(RECOMMENDATION_KIND.CONSTRAINED_SCHEDULE);
    expect(majorityRecommendation.headline).toBe("We have a majority!");
  });
});

describe("buildAlternativeWindows", () => {
  it("dedupes shifted windows that ask the same people to move", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-10",
      numDays: 5,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-10")),
        makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-05")),
        makeRespondent("c", "Cam", datesBetween("2026-07-06", "2026-07-10")),
      ],
    });

    const alternativeWindows = buildAlternativeWindows(analysis);

    expect(analysis.bestWindow?.start).toBe("2026-07-01");
    expect(alternativeWindows).toEqual([
      expect.objectContaining({ start: "2026-07-06", missing: ["Ben"] }),
      expect.objectContaining({ missing: ["Ben", "Cam"] }),
    ]);
  });

  it("collapses all windows blocked by the same person into no alternatives", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-10",
      numDays: 5,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-10")),
        makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-10")),
        makeRespondent("c", "Cam", datesBetween("2026-07-03", "2026-07-06")),
      ],
    });

    const alternativeWindows = buildAlternativeWindows(analysis);
    expect(alternativeWindows).toEqual([]);
  });
});

describe("formatDateList", () => {
  it("formats contiguous dates as a range", () => {
    const dates = ["2026-07-03", "2026-07-04", "2026-07-05"].map(date => assertISODateString(date));
    expect(formatDateList(dates)).toBe("Jul 3 – 5");
  });

  it("does not collapse non-contiguous dates into a range", () => {
    const dates = ["2026-07-03", "2026-07-05"].map(date => assertISODateString(date));
    expect(formatDateList(dates)).toBe("Jul 3 and Jul 5");
  });

  it("truncates long non-contiguous lists", () => {
    const dates = ["2026-07-01", "2026-07-03", "2026-07-05", "2026-07-07", "2026-07-09"].map(date =>
      assertISODateString(date),
    );
    expect(formatDateList(dates)).toBe("Jul 1, Jul 3, Jul 5, and 2 more");
  });
});
