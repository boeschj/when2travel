import { eachDayOfInterval, format, parseISO } from "date-fns";
import { describe, expect, it } from "vitest";

import type { RespondentAvailability } from "./availability-analysis";
import { analyzeAvailability, getMaxConsecutiveAvailableDays } from "./availability-analysis";

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

describe("analyzeAvailability", () => {
  it("marks the best window perfect when everyone is free", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-10",
      numDays: 5,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-10")),
        makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-10")),
      ],
    });

    expect(analysis.bestWindow?.isPerfect).toBe(true);
    expect(analysis.bestWindow?.start).toBe("2026-07-01");
    expect(analysis.bestUnlock).toBeNull();
    expect(analysis.constrainers).toEqual([]);
  });

  it("keeps isPerfect exact even when the percentage rounds to 100", () => {
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

    expect(analysis.bestWindow?.percentage).toBe(100);
    expect(analysis.bestWindow?.isPerfect).toBe(false);
  });

  it("finds the unlock with the smallest ask across all single-blocker windows", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-08",
      numDays: 5,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-08")),
        makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-08")),
        makeRespondent("c", "Cam", [
          "2026-07-01",
          "2026-07-03",
          "2026-07-04",
          "2026-07-06",
          "2026-07-07",
          "2026-07-08",
        ]),
      ],
    });

    expect(analysis.bestUnlock?.blockerId).toBe("c");
    expect(analysis.bestUnlock?.datesToFree).toEqual(["2026-07-05"]);
    expect(analysis.bestUnlock?.window.start).toBe("2026-07-03");
    expect(analysis.bestUnlock?.window.isPerfect).toBe(false);
  });

  it("returns no unlock when every window has multiple blockers", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-08",
      numDays: 5,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-03")),
        makeRespondent("b", "Ben", datesBetween("2026-07-06", "2026-07-08")),
      ],
    });

    expect(analysis.bestUnlock).toBeNull();
  });

  it("suggests a shorter trip from the merged run instead of counting overlapping windows", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-20",
      numDays: 12,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-10")),
        makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-10")),
      ],
    });

    expect(analysis.shorterTripSuggestion?.duration).toBe(10);
    expect(analysis.shorterTripSuggestion?.windowCount).toBe(1);
    expect(analysis.shorterTripSuggestion?.windows).toEqual([
      expect.objectContaining({ start: "2026-07-01", end: "2026-07-10" }),
    ]);
  });

  it("does not suggest a trip more than three days shorter than requested", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-20",
      numDays: 12,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-05")),
        makeRespondent("b", "Ben", datesBetween("2026-07-01", "2026-07-05")),
      ],
    });

    expect(analysis.shorterTripSuggestion).toBeNull();
  });

  it("flags a respondent with enough scattered days but no consecutive run as a constrainer", () => {
    const scatteredDays = [
      "2026-07-01",
      "2026-07-03",
      "2026-07-05",
      "2026-07-07",
      "2026-07-09",
      "2026-07-11",
      "2026-07-13",
    ];
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-14",
      numDays: 7,
      responses: [
        makeRespondent("a", "Ana", datesBetween("2026-07-01", "2026-07-14")),
        makeRespondent("b", "Ben", scatteredDays),
      ],
    });

    expect(analysis.constrainers).toEqual([
      expect.objectContaining({ id: "b", maxConsecutiveDays: 1 }),
    ]);
  });

  it("keeps constrainers with duplicate names distinct by id", () => {
    const analysis = analyzeAvailability({
      startRange: "2026-07-01",
      endRange: "2026-07-10",
      numDays: 5,
      responses: [
        makeRespondent("alex-1", "Alex", ["2026-07-01"]),
        makeRespondent("alex-2", "Alex", ["2026-07-02", "2026-07-03"]),
      ],
    });

    const constrainerIds = analysis.constrainers.map(constrainer => constrainer.id);
    expect(constrainerIds).toEqual(["alex-1", "alex-2"]);
  });
});

describe("getMaxConsecutiveAvailableDays", () => {
  it("measures the longest consecutive run within the plan range", () => {
    const maxConsecutiveDays = getMaxConsecutiveAvailableDays({
      availableDates: ["2026-07-01", "2026-07-02", "2026-07-04", "2026-07-05", "2026-07-06"],
      startRange: "2026-07-01",
      endRange: "2026-07-10",
    });

    expect(maxConsecutiveDays).toBe(3);
  });

  it("ignores available dates outside the plan range", () => {
    const maxConsecutiveDays = getMaxConsecutiveAvailableDays({
      availableDates: ["2026-06-28", "2026-06-29", "2026-06-30", "2026-07-01"],
      startRange: "2026-07-01",
      endRange: "2026-07-10",
    });

    expect(maxConsecutiveDays).toBe(1);
  });
});
