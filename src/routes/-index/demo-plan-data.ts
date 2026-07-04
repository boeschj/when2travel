import { eachDayOfInterval } from "date-fns";

import type { ISODateString } from "@/lib/date/types";
import { parseAPIDate, toISODateString } from "@/lib/date/types";
import type { PlanWithResponses } from "@/lib/types";

export const DEMO_CURRENT_USER_ID = "demo-resp-you";

const DEMO_PLAN_ID = "demo-hawaii-2026";
const DEMO_TIMESTAMP = "2026-05-01T12:00:00.000Z";
const DEMO_START_RANGE = "2026-06-01";
const DEMO_END_RANGE = "2026-07-31";
const DEMO_NUM_DAYS = 7;

type DateSpan = readonly [start: string, end: string];

interface DemoRespondentSeed {
  id: string;
  name: string;
  spans: readonly DateSpan[];
}

// Availability is hand-authored so the real recommendation engine lands on a
// single-blocker "unlock": everyone is free Jul 13-19 except Charles, who is
// missing only Jul 15. That yields "So close! Charles can't make Jul 15".
const DEMO_RESPONDENT_SEEDS: readonly DemoRespondentSeed[] = [
  {
    id: DEMO_CURRENT_USER_ID,
    name: "You",
    spans: [
      ["2026-06-05", "2026-06-08"],
      ["2026-06-20", "2026-06-22"],
      ["2026-07-04", "2026-07-31"],
    ],
  },
  {
    id: "demo-resp-joe",
    name: "Joe",
    spans: [
      ["2026-06-01", "2026-06-03"],
      ["2026-06-14", "2026-06-16"],
      ["2026-07-06", "2026-07-26"],
    ],
  },
  {
    id: "demo-resp-sam",
    name: "Sam",
    spans: [
      ["2026-06-01", "2026-06-02"],
      ["2026-06-18", "2026-07-20"],
    ],
  },
  {
    id: "demo-resp-allison",
    name: "Allison",
    spans: [
      ["2026-06-10", "2026-06-12"],
      ["2026-07-10", "2026-07-31"],
    ],
  },
  {
    id: "demo-resp-priya",
    name: "Priya",
    spans: [
      ["2026-06-25", "2026-06-28"],
      ["2026-07-01", "2026-07-19"],
    ],
  },
  {
    id: "demo-resp-marcus",
    name: "Marcus",
    spans: [
      ["2026-06-06", "2026-06-09"],
      ["2026-07-13", "2026-07-24"],
    ],
  },
  {
    id: "demo-resp-charles",
    name: "Charles",
    spans: [
      ["2026-06-13", "2026-06-15"],
      ["2026-07-05", "2026-07-14"],
      ["2026-07-16", "2026-07-19"],
      ["2026-07-27", "2026-07-30"],
    ],
  },
];

function expandSpansToDates(spans: readonly DateSpan[]): ISODateString[] {
  const dates = spans.flatMap(([start, end]) => {
    const daysInSpan = eachDayOfInterval({
      start: parseAPIDate(start),
      end: parseAPIDate(end),
    });
    return daysInSpan.map(day => toISODateString(day));
  });
  return dates;
}

function buildDemoResponse(seed: DemoRespondentSeed) {
  return {
    id: seed.id,
    planId: DEMO_PLAN_ID,
    name: seed.name,
    availableDates: expandSpansToDates(seed.spans),
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  };
}

export const DEMO_PLAN: PlanWithResponses = {
  id: DEMO_PLAN_ID,
  name: "Hawaii Trip 2026",
  numDays: DEMO_NUM_DAYS,
  startRange: DEMO_START_RANGE,
  endRange: DEMO_END_RANGE,
  createdAt: DEMO_TIMESTAMP,
  updatedAt: DEMO_TIMESTAMP,
  responses: DEMO_RESPONDENT_SEEDS.map(seed => buildDemoResponse(seed)),
};
