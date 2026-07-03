import { addDays, eachDayOfInterval, format } from "date-fns";
import { z } from "zod";

const createdPlanSchema = z.object({ id: z.string() });

const DEFAULT_BASE_URL = "http://localhost:5173";
const BASE_URL_FLAG = "--base";
const ISO_DATE_FORMAT = "yyyy-MM-dd";
const RANGE_START_OFFSET_DAYS = 30;

const SCENARIO_NAME = {
  PERFECT: "perfect",
  UNLOCK: "unlock",
  CONSTRAINED_MAJORITY: "constrained-majority",
  CONSTRAINED_MINORITY: "constrained-minority",
  NO_RESPONSES: "no-responses",
} as const;

type ScenarioName = (typeof SCENARIO_NAME)[keyof typeof SCENARIO_NAME];

interface SeedRespondent {
  name: string;
  availableDates: string[];
}

interface SeedScenario {
  name: ScenarioName;
  planName: string;
  numDays: number;
  startRange: string;
  endRange: string;
  respondents: SeedRespondent[];
}

const baseUrl = parseBaseUrl(process.argv.slice(2));
const rangeStart = addDays(new Date(), RANGE_START_OFFSET_DAYS);
const scenarios = buildScenarios({ rangeStart });

for (const scenario of scenarios) {
  const planUrl = await seedScenario({ baseUrl, scenario });
  console.log(`${scenario.name} → ${planUrl}`);
}

function parseBaseUrl(args: string[]): string {
  const flagIndex = args.indexOf(BASE_URL_FLAG);
  const hasBaseFlag = flagIndex !== -1;
  if (!hasBaseFlag) {
    return DEFAULT_BASE_URL;
  }

  const flagValue = args[flagIndex + 1];
  if (!flagValue) {
    throw new Error(`${BASE_URL_FLAG} flag requires a URL value`);
  }
  return flagValue;
}

function buildScenarios({ rangeStart }: { rangeStart: Date }): SeedScenario[] {
  const tenDayRange = buildDateRange({ start: rangeStart, lengthInDays: 10 });
  const sixDayRange = buildDateRange({ start: rangeStart, lengthInDays: 6 });

  const perfectScenario: SeedScenario = {
    name: SCENARIO_NAME.PERFECT,
    planName: "QA Perfect Match",
    numDays: 5,
    startRange: tenDayRange.startDate,
    endRange: tenDayRange.endDate,
    respondents: [
      { name: "Ana", availableDates: tenDayRange.allDates },
      { name: "Ben", availableDates: tenDayRange.allDates },
    ],
  };

  const unlockScenario: SeedScenario = {
    name: SCENARIO_NAME.UNLOCK,
    planName: "QA Single Blocker",
    numDays: 5,
    startRange: tenDayRange.startDate,
    endRange: tenDayRange.endDate,
    respondents: [
      { name: "Ana", availableDates: tenDayRange.allDates },
      { name: "Ben", availableDates: tenDayRange.allDates },
      { name: "Cam", availableDates: tenDayRange.allDates.slice(2, 6) },
    ],
  };

  const constrainedMajorityScenario: SeedScenario = {
    name: SCENARIO_NAME.CONSTRAINED_MAJORITY,
    planName: "QA Constrained Majority",
    numDays: 5,
    startRange: sixDayRange.startDate,
    endRange: sixDayRange.endDate,
    respondents: [
      { name: "Ana", availableDates: sixDayRange.allDates },
      { name: "Ben", availableDates: sixDayRange.allDates },
      { name: "Cam", availableDates: sixDayRange.allDates },
      { name: "Dee", availableDates: sixDayRange.allDates.slice(0, 1) },
      { name: "Eli", availableDates: sixDayRange.allDates.slice(1, 2) },
    ],
  };

  const constrainedMinorityScenario: SeedScenario = {
    name: SCENARIO_NAME.CONSTRAINED_MINORITY,
    planName: "QA Constrained Minority",
    numDays: 5,
    startRange: sixDayRange.startDate,
    endRange: sixDayRange.endDate,
    respondents: [
      { name: "Ana", availableDates: sixDayRange.allDates },
      {
        name: "Ben",
        availableDates: pickDates({ allDates: sixDayRange.allDates, dayIndexes: [0, 2] }),
      },
      {
        name: "Cam",
        availableDates: pickDates({ allDates: sixDayRange.allDates, dayIndexes: [1, 4] }),
      },
    ],
  };

  const noResponsesScenario: SeedScenario = {
    name: SCENARIO_NAME.NO_RESPONSES,
    planName: "QA Waiting For Responses",
    numDays: 5,
    startRange: tenDayRange.startDate,
    endRange: tenDayRange.endDate,
    respondents: [],
  };

  return [
    perfectScenario,
    unlockScenario,
    constrainedMajorityScenario,
    constrainedMinorityScenario,
    noResponsesScenario,
  ];
}

function pickDates({
  allDates,
  dayIndexes,
}: {
  allDates: string[];
  dayIndexes: number[];
}): string[] {
  const pickedDates = allDates.filter((_, dayIndex) => dayIndexes.includes(dayIndex));
  return pickedDates;
}

function buildDateRange({ start, lengthInDays }: { start: Date; lengthInDays: number }): {
  startDate: string;
  endDate: string;
  allDates: string[];
} {
  const end = addDays(start, lengthInDays - 1);
  const daysInRange = eachDayOfInterval({ start, end });
  const allDates = daysInRange.map(day => format(day, ISO_DATE_FORMAT));

  const dateRange = {
    startDate: format(start, ISO_DATE_FORMAT),
    endDate: format(end, ISO_DATE_FORMAT),
    allDates,
  };
  return dateRange;
}

async function seedScenario({
  baseUrl,
  scenario,
}: {
  baseUrl: string;
  scenario: SeedScenario;
}): Promise<string> {
  const planId = await createPlan({ baseUrl, scenario });

  for (const respondent of scenario.respondents) {
    await createResponse({ baseUrl, planId, respondent });
  }

  const planUrl = `${baseUrl}/plan/${planId}`;
  return planUrl;
}

async function createPlan({
  baseUrl,
  scenario,
}: {
  baseUrl: string;
  scenario: SeedScenario;
}): Promise<string> {
  const response = await fetch(`${baseUrl}/api/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: scenario.planName,
      numDays: scenario.numDays,
      startRange: scenario.startRange,
      endRange: scenario.endRange,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create plan "${scenario.planName}": ${response.status} ${errorBody}`,
    );
  }

  const createdPlan = createdPlanSchema.parse(await response.json());
  return createdPlan.id;
}

async function createResponse({
  baseUrl,
  planId,
  respondent,
}: {
  baseUrl: string;
  planId: string;
  respondent: SeedRespondent;
}): Promise<void> {
  const response = await fetch(`${baseUrl}/api/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId,
      name: respondent.name,
      availableDates: respondent.availableDates,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create response for "${respondent.name}": ${response.status} ${errorBody}`,
    );
  }
}
