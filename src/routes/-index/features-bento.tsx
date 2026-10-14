import type { ReactNode } from "react";
import { CheckCircle2, Copy, Pencil, Share2, ThumbsUp, XCircle } from "lucide-react";

import { buildColorMap, cn } from "@/lib/utils";

import { ResultsLegend } from "../plan/-results/availability-legend";
import { DemoJulyHeatmap } from "./demo-july-heatmap";
import { DEMO_PLAN } from "./demo-plan-data";

const SECTION_COPY = {
  eyebrow: "Features",
  heading: "Everything you need to lock in the dates",
  subheading:
    'No spreadsheets, no "so what weekend works for everyone???" Just a link and a calendar that fills itself in.',
} as const;

const FEATURE_COPY = {
  create: {
    title: "Create in 10 seconds",
    description: "Name it, set a window, pick how many days. Done before your coffee's cold.",
  },
  share: {
    title: "Share one link",
    description: "Drop it in the group chat. No downloads, no accounts, friends just tap and pick.",
  },
  filter: {
    title: "Filter by person",
    description:
      "Tap anyone to see just their dates on the heatmap. Spot who's flexible in a glance.",
  },
  heatmap: {
    title: "Live availability heatmap",
    description:
      "Watch the calendar light up as people respond. Green means go, so you can spot the perfect overlap without scrolling through replies.",
  },
  bestWindow: {
    title: "Best window, found for you",
    description: "We rank every window by who can make it and hand you the winner.",
  },
  conflicts: {
    title: "Spot the conflicts",
    description:
      "One person blocking the perfect week? PlanTheTrip points them out and instantly surfaces the next-best window that works for everyone, so you can decide instead of debate.",
  },
} as const;

const VISUAL_COPY = {
  tripName: "Ibiza 2026",
  shareUrl: "justplanthetrip.com/plan/ibiza",
  shareLabel: "Share",
  groupMessage: "everyone PICK YOUR DATES 🙏",
  bestOverlap: "Best overlap: Jul 13 – 19 · 6/7 free",
  recommendationHeading: "So close!",
  recommendationKicker: "Your ideal trip dates are:",
  recommendationDates: "Jul 13 – 19",
  recommendationPeople: "6/7 people available",
  conflictNote: "Charles can't make Jul 15. If they can free that day up, everyone's in.",
  conflictLink: "See Alternatives →",
} as const;

const RANGE_DAY_KIND = {
  BEFORE: "before",
  ENDPOINT: "endpoint",
  MIDDLE: "middle",
  AFTER: "after",
} as const;

type RangeDayKind = (typeof RANGE_DAY_KIND)[keyof typeof RANGE_DAY_KIND];

const RANGE_DAY_CLASS: Record<RangeDayKind, string> = {
  [RANGE_DAY_KIND.BEFORE]: "text-muted-foreground opacity-50",
  [RANGE_DAY_KIND.ENDPOINT]: "bg-primary text-primary-foreground shadow-glow",
  [RANGE_DAY_KIND.MIDDLE]: "bg-primary/20 text-white",
  [RANGE_DAY_KIND.AFTER]: "text-foreground",
};

const CREATE_RANGE_DAYS = [
  { day: 11, kind: RANGE_DAY_KIND.BEFORE },
  { day: 12, kind: RANGE_DAY_KIND.ENDPOINT },
  { day: 13, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 14, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 15, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 16, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 17, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 18, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 19, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 20, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 21, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 22, kind: RANGE_DAY_KIND.MIDDLE },
  { day: 23, kind: RANGE_DAY_KIND.ENDPOINT },
  { day: 24, kind: RANGE_DAY_KIND.AFTER },
] as const;

const SUNDAY_FIRST_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const FILTER_PERSON_NAME = "Sam";
const FILTER_DIMMED_NAMES = ["Joe", "Priya"] as const;
const FILTER_WEEKS_START_DAY = 13;
const FILTER_DAY_COUNT = 14;
const DEMO_BLOCKER_NAME = "Charles";
const DEMO_YEAR_MONTH_PREFIX = "2026-07-";

const CARD_SHELL =
  "flex min-w-0 flex-col rounded-[28px] border border-border bg-card p-3.5 pb-6 shadow-[0_12px_24px_-14px_rgba(0,0,0,0.6)]";
const VISUAL_PANEL =
  "grid grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden rounded-[20px] border border-[#243c1e] bg-[#172713] p-[18px]";

export function FeaturesBento() {
  return (
    <section
      id="how-it-works"
      className="px-4 pt-24 sm:pt-28 lg:px-5"
    >
      <div className="rounded-[40px] border border-[#1f3319] bg-[#142012] px-3.5 py-16 sm:px-7 sm:py-[72px]">
        <SectionHeader />
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-4 md:grid-cols-6">
          <FeatureCard
            className="md:col-span-2"
            copy={FEATURE_COPY.create}
            visual={<CreateVisual />}
          />
          <FeatureCard
            className="md:col-span-2"
            copy={FEATURE_COPY.share}
            visual={<ShareVisual />}
          />
          <FeatureCard
            className="md:col-span-2"
            copy={FEATURE_COPY.filter}
            visual={<FilterVisual />}
          />
          <FeatureCard
            className="md:col-span-4"
            copy={FEATURE_COPY.heatmap}
            visual={<HeatmapVisual />}
          />
          <FeatureCard
            className="md:col-span-2"
            copy={FEATURE_COPY.bestWindow}
            visual={<BestWindowVisual />}
          />
          <ConflictCard />
        </div>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="mx-auto mb-12 grid max-w-[660px] justify-items-center gap-3.5 text-center">
      <span className="border-border bg-card text-text-secondary rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold">
        {SECTION_COPY.eyebrow}
      </span>
      <h2 className="text-[clamp(2rem,4.4vw,3.3rem)] leading-[1.04] font-extrabold tracking-[-0.04em] text-balance">
        {SECTION_COPY.heading}
      </h2>
      <p className="text-text-secondary text-lg leading-relaxed text-pretty">
        {SECTION_COPY.subheading}
      </p>
    </div>
  );
}

interface FeatureCardProps {
  className: string;
  copy: { title: string; description: string };
  visual: ReactNode;
}

function FeatureCard({ className, copy, visual }: FeatureCardProps) {
  return (
    <article className={cn(CARD_SHELL, className)}>
      <div
        inert
        className={cn(VISUAL_PANEL, "h-[236px]")}
      >
        {visual}
      </div>
      <h3 className="mt-5 px-2 text-xl font-bold tracking-tight">{copy.title}</h3>
      <p className="text-text-secondary mt-2 px-2 text-[15px] leading-relaxed">
        {copy.description}
      </p>
    </article>
  );
}

function ConflictCard() {
  return (
    <article
      className={cn(
        CARD_SHELL,
        "gap-6 md:col-span-6 md:grid md:grid-cols-[1.15fr_1fr] md:items-center md:gap-8 md:p-[18px] md:pr-8",
      )}
    >
      <div
        inert
        className={cn(VISUAL_PANEL, "min-h-[210px]")}
      >
        <ConflictVisual />
      </div>
      <div className="px-2 md:px-0">
        <h3 className="text-2xl font-bold tracking-tight">{FEATURE_COPY.conflicts.title}</h3>
        <p className="text-text-secondary mt-2.5 text-base leading-relaxed">
          {FEATURE_COPY.conflicts.description}
        </p>
      </div>
    </article>
  );
}

function CreateVisual() {
  return (
    <div className="grid w-full max-w-[290px] justify-items-center gap-4">
      <div className="border-primary flex w-full items-center justify-between border-b-2 pb-1.5 text-[22px] font-extrabold tracking-tight">
        {VISUAL_COPY.tripName}
        <Pencil className="text-primary size-5" />
      </div>
      <div className="grid grid-cols-7 gap-x-1 gap-y-1.5">
        {SUNDAY_FIRST_WEEKDAYS.map(weekday => (
          <span
            key={weekday}
            className="text-muted-foreground text-center text-[10px] font-bold tracking-wider uppercase"
          >
            {weekday}
          </span>
        ))}
        {CREATE_RANGE_DAYS.map(rangeDay => (
          <span
            key={rangeDay.day}
            className={cn(
              "grid size-9 place-items-center rounded-full text-[13px]",
              RANGE_DAY_CLASS[rangeDay.kind],
            )}
          >
            {rangeDay.day}
          </span>
        ))}
      </div>
    </div>
  );
}

function ShareVisual() {
  return (
    <div className="grid w-full max-w-[300px] grid-cols-[minmax(0,1fr)] gap-3.5">
      <div className="flex gap-2">
        <div className="bg-surface-darker flex min-w-0 flex-1 items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-semibold">
          <span className="truncate">{VISUAL_COPY.shareUrl}</span>
          <Copy className="size-4 shrink-0" />
        </div>
        <span className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-2xl px-3 text-[13px] font-extrabold">
          <Share2 className="size-4" />
          {VISUAL_COPY.shareLabel}
        </span>
      </div>
      <span className="justify-self-end rounded-[18px] rounded-br-md bg-[#0a84ff] px-3 py-[7px] font-[-apple-system,BlinkMacSystemFont,system-ui,sans-serif] text-[15px] tracking-[-0.02em] text-white">
        {VISUAL_COPY.groupMessage}
      </span>
    </div>
  );
}

function FilterVisual() {
  const respondentColors = buildDemoRespondentColors();
  const filteredPerson = findDemoResponse(FILTER_PERSON_NAME);
  const filteredColor = respondentColors[filteredPerson.name];
  const days = Array.from(
    { length: FILTER_DAY_COUNT },
    (_, index) => FILTER_WEEKS_START_DAY + index,
  );

  return (
    <div className="grid justify-items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        <PersonChip
          name={filteredPerson.name}
          color={filteredColor}
          isActive
        />
        {FILTER_DIMMED_NAMES.map(name => (
          <PersonChip
            key={name}
            name={name}
            color={respondentColors[name]}
            isActive={false}
          />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => (
          <FilteredDay
            key={day}
            day={day}
            color={filteredColor}
            isAvailable={isAvailableInJuly(filteredPerson.availableDates, day)}
          />
        ))}
      </div>
    </div>
  );
}

function HeatmapVisual() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      <DemoJulyHeatmap className="[zoom:0.62]" />
      <div className="grid gap-4">
        <ResultsLegend />
        <span className="max-w-[240px] rounded-[22px] bg-[#2e4a28] px-4 py-3 text-sm font-semibold">
          {VISUAL_COPY.bestOverlap}
        </span>
      </div>
    </div>
  );
}

function BestWindowVisual() {
  return (
    <div className="grid justify-items-center gap-1 text-center">
      <span className="bg-surface-darker text-primary mb-1.5 grid size-12 place-items-center rounded-full">
        <ThumbsUp className="size-5" />
      </span>
      <span className="text-lg font-extrabold">{VISUAL_COPY.recommendationHeading}</span>
      <span className="text-text-secondary text-[13px]">{VISUAL_COPY.recommendationKicker}</span>
      <span className="text-[34px] leading-tight font-extrabold tracking-[-0.045em]">
        {VISUAL_COPY.recommendationDates}
      </span>
      <span className="mt-1 flex items-center gap-1.5 text-[13px] font-bold">
        <ThumbsUp className="text-primary size-4" />
        {VISUAL_COPY.recommendationPeople}
      </span>
    </div>
  );
}

function ConflictVisual() {
  const respondentColors = buildDemoRespondentColors();

  return (
    <div className="grid justify-items-center gap-4">
      <div className="flex max-w-[520px] flex-wrap justify-center gap-2">
        {DEMO_PLAN.responses.map(response => (
          <StatusChip
            key={response.id}
            name={response.name}
            color={respondentColors[response.name]}
            isBlocker={response.name === DEMO_BLOCKER_NAME}
          />
        ))}
      </div>
      <div className="max-w-[360px] rounded-[22px] bg-[#2e4a28] px-[18px] py-3.5 text-sm leading-snug">
        {VISUAL_COPY.conflictNote}
        <span className="text-primary mt-2 block text-[13.5px] font-semibold">
          {VISUAL_COPY.conflictLink}
        </span>
      </div>
    </div>
  );
}

function PersonChip({
  name,
  color,
  isActive,
}: {
  name: string;
  color: string | undefined;
  isActive: boolean;
}) {
  const activeRingStyle = isActive ? { boxShadow: `0 0 0 1.5px ${color}` } : undefined;

  return (
    <span
      className={cn(
        "border-border bg-surface-dark flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13.5px] font-semibold",
        !isActive && "opacity-50",
      )}
      style={activeRingStyle}
    >
      <InitialAvatar
        name={name}
        color={color}
      />
      {name}
    </span>
  );
}

function StatusChip({
  name,
  color,
  isBlocker,
}: {
  name: string;
  color: string | undefined;
  isBlocker: boolean;
}) {
  const StatusIcon = isBlocker ? XCircle : CheckCircle2;

  return (
    <span className="border-border bg-surface-dark flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13.5px] font-semibold">
      <InitialAvatar
        name={name}
        color={color}
      />
      {name}
      <StatusIcon
        className={cn("size-4", isBlocker && "text-destructive", !isBlocker && "text-primary")}
      />
    </span>
  );
}

function FilteredDay({
  day,
  color,
  isAvailable,
}: {
  day: number;
  color: string | undefined;
  isAvailable: boolean;
}) {
  const availableStyle = { backgroundColor: color, boxShadow: `0 0 10px ${color}66` };
  const unavailableStyle = { backgroundColor: "var(--color-border)", opacity: 0.5 };
  const dayStyle = isAvailable ? availableStyle : unavailableStyle;

  return (
    <span
      className={cn(
        "grid size-9 place-items-center rounded-full text-[13px] font-bold",
        isAvailable && "text-primary-foreground",
        !isAvailable && "text-foreground",
      )}
      style={dayStyle}
    >
      {day}
    </span>
  );
}

function InitialAvatar({ name, color }: { name: string; color: string | undefined }) {
  const initial = name.charAt(0);

  return (
    <span
      className="text-primary-foreground grid size-6 place-items-center rounded-full text-[11px] font-bold"
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  );
}

function buildDemoRespondentColors(): Record<string, string | undefined> {
  const respondentIds = DEMO_PLAN.responses.map(response => response.id);
  const colorMap = buildColorMap(respondentIds);
  const nameColorEntries = DEMO_PLAN.responses.map(
    response => [response.name, colorMap[response.id]?.hex] as const,
  );
  const colorsByName = Object.fromEntries(nameColorEntries);
  return colorsByName;
}

function findDemoResponse(name: string) {
  const response = DEMO_PLAN.responses.find(candidate => candidate.name === name);
  if (!response) {
    throw new Error(`Demo plan has no respondent named ${name}`);
  }
  return response;
}

function isAvailableInJuly(availableDates: string[], day: number): boolean {
  const paddedDay = String(day).padStart(2, "0");
  const isoDate = `${DEMO_YEAR_MONTH_PREFIX}${paddedDay}`;
  const isAvailable = availableDates.includes(isoDate);
  return isAvailable;
}
