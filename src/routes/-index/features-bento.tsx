import { useState } from "react";
import type { ReactNode } from "react";
import { CalendarX2, CheckCircle2, Pencil, Share2, ThumbsUp, XCircle } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";

import { buildColorMap, cn } from "@/lib/utils";

import { ResultsLegend } from "../plan/-results/availability-legend";
import { CopyLinkButton } from "./copy-link-button";
import { DemoJulyHeatmap } from "./demo-july-heatmap";
import { DEMO_PLAN } from "./demo-plan-data";
import { SeeAlternativesButton } from "./see-alternatives-button";

const SECTION_COPY = {
  eyebrow: "Features",
  heading: "Everything you need to lock in the dates",
  subheading:
    'No spreadsheets, no "so what weekend works for everyone???" Just a link and a calendar that fills itself in.',
  moreFeatures: "Plus per-person filters, auto-picked best windows, and more.",
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
  heatmap: {
    title: "Live availability heatmap",
    description:
      "Watch the calendar light up as people respond. Green means go, so you can spot the perfect overlap without scrolling through replies.",
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
  deliveredLabel: "Delivered",
  recommendationHeading: "So close!",
  recommendationDates: "Jul 13 – 19",
  recommendationPeople: "6/7 people available",
  conflictNote: "Charles can't make Jul 15. If they can free that day up, everyone's in.",
} as const;

const RANGE_DAY_KIND = {
  BEFORE: "before",
  ENDPOINT: "endpoint",
  MIDDLE: "middle",
  AFTER: "after",
} as const;

type RangeDayKind = (typeof RANGE_DAY_KIND)[keyof typeof RANGE_DAY_KIND];

const RANGE_DAY_TEXT_CLASS: Record<RangeDayKind, string> = {
  [RANGE_DAY_KIND.BEFORE]: "text-muted-foreground opacity-50",
  [RANGE_DAY_KIND.ENDPOINT]: "text-foreground",
  [RANGE_DAY_KIND.MIDDLE]: "text-white",
  [RANGE_DAY_KIND.AFTER]: "text-foreground",
};

const RANGE_DAY_FILL_CLASS: Partial<Record<RangeDayKind, string>> = {
  [RANGE_DAY_KIND.ENDPOINT]: "bg-primary shadow-glow",
  [RANGE_DAY_KIND.MIDDLE]: "bg-primary/20",
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

const FILTER_NAMES = ["Sam", "Joe", "Priya"] as const;
const DEMO_BLOCKER_NAME = "Charles";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const EASE_OUT = [0, 0, 0.58, 1] as const;
const EASE_IN = [0.42, 0, 1, 1] as const;
const CARD_VIEWPORT = { once: true, amount: 0.15 } as const;
const ENTRY_STEP_SECONDS = 0.3;
const ENTRY_MOVE_STEP = { duration: ENTRY_STEP_SECONDS, ease: EASE_OUT_QUART } as const;
const ENTRY_STATE = {
  STACKED: "stacked",
  SPREAD: "spread",
} as const;

const CARD_FADE_SECONDS = 0.4;
const SLOW_FILL_SECONDS = 0.35;
const PRESSED = { scale: 0.95 } as const;
const PRESS_TRANSITION = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } as const;
const HIDDEN = { opacity: 0 } as const;
const VISIBLE = { opacity: 1 } as const;
const SLOW_FILL_STAGGER_SECONDS = 0.15;
const CARD_STAGGER_SECONDS = 0.15;
const CARD_ENTRY_DELAY_SECONDS = {
  SHARE: 0,
  HEATMAP: CARD_STAGGER_SECONDS,
  CONFLICTS: 0,
  CREATE: CARD_STAGGER_SECONDS,
} as const;
const VISUAL_ENTRY_DELAY_SECONDS = {
  SHARE: CARD_ENTRY_DELAY_SECONDS.SHARE + CARD_FADE_SECONDS,
  HEATMAP: CARD_ENTRY_DELAY_SECONDS.HEATMAP + CARD_FADE_SECONDS,
  CONFLICTS: CARD_ENTRY_DELAY_SECONDS.CONFLICTS + CARD_FADE_SECONDS,
  CREATE: CARD_ENTRY_DELAY_SECONDS.CREATE + CARD_FADE_SECONDS,
} as const;

const SHARE_LINK_CARD_POSE = {
  stacked: { x: 80, y: 56, rotate: 0 },
  spread: { x: 0, y: 0, rotate: -3 },
} as const;
const SHARE_MESSAGE_CARD_POSE = {
  stacked: { x: -80, y: -56, rotate: 0 },
  spread: { x: 0, y: 0, rotate: 2 },
} as const;

const CARD_SHELL =
  "relative flex min-w-0 flex-col overflow-clip rounded-[32px] border border-border bg-card";
const FLOATING_PANEL =
  "shadow-object absolute rounded-[22px] border border-[#2f4a27] bg-surface-dark";

export function FeaturesBento() {
  return (
    <section
      id="how-it-works"
      className="px-4 pt-24 sm:pt-28 lg:px-5"
    >
      <div className="bg-felt-texture rounded-[40px] border border-[#1f3319] px-3.5 py-16 sm:px-7 sm:py-24">
        <SectionHeader />
        <MotionConfig reducedMotion="user">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-5 lg:grid-cols-12">
            <FeatureCard
              className="lg:col-span-5"
              copy={FEATURE_COPY.share}
              entryDelaySeconds={CARD_ENTRY_DELAY_SECONDS.SHARE}
              visual={<ShareVisual entryDelaySeconds={VISUAL_ENTRY_DELAY_SECONDS.SHARE} />}
            />
            <FeatureCard
              className="lg:col-span-7"
              copy={FEATURE_COPY.heatmap}
              entryDelaySeconds={CARD_ENTRY_DELAY_SECONDS.HEATMAP}
              visual={<HeatmapVisual entryDelaySeconds={VISUAL_ENTRY_DELAY_SECONDS.HEATMAP} />}
            />
            <ConflictCard />
            <FeatureCard
              className="border-2 border-dashed border-[#2f4a27] bg-transparent shadow-none lg:col-span-4"
              copy={FEATURE_COPY.create}
              entryDelaySeconds={CARD_ENTRY_DELAY_SECONDS.CREATE}
              visual={<CreateVisual entryDelaySeconds={VISUAL_ENTRY_DELAY_SECONDS.CREATE} />}
            />
          </div>
        </MotionConfig>
        <p className="text-text-secondary mt-14 text-center text-lg">{SECTION_COPY.moreFeatures}</p>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="mx-auto mb-16 grid max-w-[720px] justify-items-center gap-4 text-center">
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
  entryDelaySeconds: number;
  visual: ReactNode;
}

interface EntryDelayProps {
  entryDelaySeconds: number;
}

function FeatureCard({ className, copy, entryDelaySeconds, visual }: FeatureCardProps) {
  const cardFadeVariants = buildCardFadeVariants(entryDelaySeconds);

  return (
    <motion.article
      variants={cardFadeVariants}
      initial={ENTRY_STATE.STACKED}
      whileInView={ENTRY_STATE.SPREAD}
      viewport={CARD_VIEWPORT}
      className={cn(CARD_SHELL, className)}
    >
      <div className="relative h-[300px] sm:h-[340px]">{visual}</div>
      <div className="px-8 pt-4 pb-10 text-center">
        <h3 className="text-2xl font-bold tracking-tight">{copy.title}</h3>
        <p className="text-text-secondary mx-auto mt-3 max-w-[40ch] text-base leading-relaxed text-pretty">
          {copy.description}
        </p>
      </div>
    </motion.article>
  );
}

function ConflictCard() {
  const cardFadeVariants = buildCardFadeVariants(CARD_ENTRY_DELAY_SECONDS.CONFLICTS);

  return (
    <motion.article
      variants={cardFadeVariants}
      initial={ENTRY_STATE.STACKED}
      whileInView={ENTRY_STATE.SPREAD}
      viewport={CARD_VIEWPORT}
      className={cn(
        CARD_SHELL,
        "lg:col-span-8 lg:grid lg:min-h-[440px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]",
      )}
    >
      <div className="flex flex-col justify-between gap-10 p-8 sm:p-10">
        <span className="shadow-object bg-surface-dark grid size-16 place-items-center rounded-[20px] border border-[#2f4a27]">
          <CalendarX2 className="text-primary size-7" />
        </span>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{FEATURE_COPY.conflicts.title}</h3>
          <p className="text-text-secondary mt-3 max-w-[36ch] text-base leading-relaxed text-pretty">
            {FEATURE_COPY.conflicts.description}
          </p>
        </div>
      </div>
      <div className="relative h-[320px] lg:h-auto">
        <ConflictVisual entryDelaySeconds={VISUAL_ENTRY_DELAY_SECONDS.CONFLICTS} />
      </div>
    </motion.article>
  );
}

function ShareVisual({ entryDelaySeconds }: EntryDelayProps) {
  const linkCardVariants = buildMoveThenTiltVariants(SHARE_LINK_CARD_POSE, entryDelaySeconds);
  const messageCardVariants = buildMoveThenTiltVariants(SHARE_MESSAGE_CARD_POSE, entryDelaySeconds);

  return (
    <>
      <motion.div
        className={cn(FLOATING_PANEL, "top-16 left-6 z-10 grid w-[320px] gap-3 p-4")}
        variants={linkCardVariants}
      >
        <div className="bg-surface-darker flex min-w-0 items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-semibold">
          <span className="truncate">{VISUAL_COPY.shareUrl}</span>
          <CopyLinkButton />
        </div>
        <span className="bg-primary text-primary-foreground flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-extrabold">
          <Share2 className="size-4" />
          {VISUAL_COPY.shareLabel}
        </span>
      </motion.div>
      <motion.div
        className={cn(
          FLOATING_PANEL,
          "top-[190px] right-6 grid w-[270px] justify-items-end gap-1 bg-[#0d0d0e] p-4 font-[-apple-system,BlinkMacSystemFont,system-ui,sans-serif]",
        )}
        variants={messageCardVariants}
      >
        <span className="rounded-[18px] rounded-br-md bg-[#0a84ff] px-3 py-[7px] text-[15px] tracking-[-0.02em] text-white">
          {VISUAL_COPY.groupMessage}
        </span>
        <span className="text-[11px] font-medium text-[#8e8e93]">{VISUAL_COPY.deliveredLabel}</span>
      </motion.div>
    </>
  );
}

function HeatmapVisual({ entryDelaySeconds }: EntryDelayProps) {
  const [selectedRespondentId, setSelectedRespondentId] = useState<string | null>(null);

  const respondentColors = buildDemoRespondentColors();
  const hasSelection = selectedRespondentId !== null;
  const filterRows = FILTER_NAMES.map((name, rowIndex) => {
    const respondentId = findDemoRespondentId(name);
    const isFirstRow = rowIndex === 0;
    const rowDelaySeconds = entryDelaySeconds + (rowIndex - 1) * SLOW_FILL_STAGGER_SECONDS;
    const fadeInVariants = isFirstRow
      ? undefined
      : buildSlowFillVariants(HIDDEN, VISIBLE, rowDelaySeconds);
    const isSelected = respondentId === selectedRespondentId;
    const isDimmed = hasSelection && !isSelected;
    const filterRow = { name, respondentId, fadeInVariants, isSelected, isDimmed };
    return filterRow;
  });

  const handleRespondentToggle = (respondentId: string) => {
    setSelectedRespondentId(current => (current === respondentId ? null : respondentId));
  };

  return (
    <>
      <div className={cn(FLOATING_PANEL, "top-14 -left-4 hidden -rotate-3 gap-2 p-4 lg:grid")}>
        {filterRows.map(filterRow => (
          <motion.div
            key={filterRow.name}
            variants={filterRow.fadeInVariants}
          >
            <PersonChip
              name={filterRow.name}
              color={respondentColors[filterRow.name]}
              isSelected={filterRow.isSelected}
              isDimmed={filterRow.isDimmed}
              onClick={() => handleRespondentToggle(filterRow.respondentId)}
            />
          </motion.div>
        ))}
      </div>
      <div
        className={cn(
          FLOATING_PANEL,
          "top-24 -right-6 hidden w-[200px] rotate-3 justify-items-center gap-1 p-5 text-center lg:grid",
        )}
      >
        <span className="bg-surface-darker text-primary mb-1 grid size-10 place-items-center rounded-full">
          <ThumbsUp className="size-4" />
        </span>
        <span className="font-extrabold">{VISUAL_COPY.recommendationHeading}</span>
        <span className="text-[26px] leading-tight font-extrabold tracking-[-0.045em]">
          {VISUAL_COPY.recommendationDates}
        </span>
        <span className="text-text-secondary text-xs font-bold">
          {VISUAL_COPY.recommendationPeople}
        </span>
      </div>
      <div className={cn(FLOATING_PANEL, "top-6 left-1/2 -translate-x-1/2 p-4")}>
        <DemoJulyHeatmap
          className="[zoom:0.55]"
          selectedRespondentId={selectedRespondentId}
        />
        <ResultsLegend className="mt-2 justify-center whitespace-nowrap" />
      </div>
    </>
  );
}

function ConflictVisual({ entryDelaySeconds }: EntryDelayProps) {
  const respondentColors = buildDemoRespondentColors();
  const noteVariants = buildScaleInVariants(entryDelaySeconds);
  const actionVariants = buildFadeInVariants(entryDelaySeconds + ENTRY_STEP_SECONDS);

  return (
    <>
      <div
        className={cn(FLOATING_PANEL, "top-10 left-4 flex w-[480px] flex-wrap gap-2 p-5 lg:top-14")}
      >
        {DEMO_PLAN.responses.map(response => (
          <StatusChip
            key={response.id}
            name={response.name}
            color={respondentColors[response.name]}
            isBlocker={response.name === DEMO_BLOCKER_NAME}
          />
        ))}
      </div>
      <motion.div
        className={cn(
          FLOATING_PANEL,
          "hover-lift top-[170px] left-16 w-[340px] -rotate-2 p-5 text-sm leading-snug lg:top-[200px]",
        )}
        variants={noteVariants}
      >
        {VISUAL_COPY.conflictNote}
        <motion.div variants={actionVariants}>
          <SeeAlternativesButton />
        </motion.div>
      </motion.div>
    </>
  );
}

function CreateVisual({ entryDelaySeconds }: EntryDelayProps) {
  const filledRangeDays = CREATE_RANGE_DAYS.filter(
    rangeDay => rangeDay.kind in RANGE_DAY_FILL_CLASS,
  );
  const rangeDayCells = CREATE_RANGE_DAYS.map(rangeDay => {
    const fillOrder = filledRangeDays.indexOf(rangeDay);
    const fillDelaySeconds = entryDelaySeconds + fillOrder * SLOW_FILL_STAGGER_SECONDS;
    const rangeDayCell = { ...rangeDay, fillDelaySeconds };
    return rangeDayCell;
  });

  return (
    <div
      className={cn(
        FLOATING_PANEL,
        "top-10 left-1/2 grid w-[300px] -translate-x-1/2 -rotate-3 justify-items-center gap-4 p-5 lg:[zoom:0.85] xl:[zoom:1]",
      )}
    >
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
        {rangeDayCells.map(rangeDayCell => (
          <RangeDayCell
            key={rangeDayCell.day}
            day={rangeDayCell.day}
            kind={rangeDayCell.kind}
            fillDelaySeconds={rangeDayCell.fillDelaySeconds}
          />
        ))}
      </div>
    </div>
  );
}

function RangeDayCell({
  day,
  kind,
  fillDelaySeconds,
}: {
  day: number;
  kind: RangeDayKind;
  fillDelaySeconds: number;
}) {
  const fillClass = RANGE_DAY_FILL_CLASS[kind];
  const isEndpoint = kind === RANGE_DAY_KIND.ENDPOINT;
  const fillVariants = buildSlowFillVariants(HIDDEN, VISIBLE, fillDelaySeconds);
  const endpointTextVariants = buildSlowFillVariants(
    { color: "var(--color-foreground)" },
    { color: "var(--color-primary-foreground)" },
    fillDelaySeconds,
  );
  const textVariants = isEndpoint ? endpointTextVariants : undefined;

  return (
    <span
      className={cn(
        "relative grid size-9 place-items-center rounded-full text-[13px]",
        RANGE_DAY_TEXT_CLASS[kind],
      )}
    >
      {fillClass && (
        <motion.span
          className={cn("absolute inset-0 rounded-full", fillClass)}
          variants={fillVariants}
        />
      )}
      <motion.span
        className="relative"
        variants={textVariants}
      >
        {day}
      </motion.span>
    </span>
  );
}

function PersonChip({
  name,
  color,
  isSelected,
  isDimmed,
  onClick,
}: {
  name: string;
  color: string | undefined;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
}) {
  const selectedRingStyle = isSelected ? { boxShadow: `0 0 0 1.5px ${color}` } : undefined;

  return (
    <motion.button
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "border-border bg-card hover-lift flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13.5px] font-semibold transition-opacity",
        isDimmed && "opacity-50",
      )}
      style={selectedRingStyle}
      whileTap={PRESSED}
      transition={PRESS_TRANSITION}
      onClick={onClick}
    >
      <InitialAvatar
        name={name}
        color={color}
      />
      {name}
    </motion.button>
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
    <motion.span
      className="border-border bg-card hover-lift flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13.5px] font-semibold"
      whileTap={PRESSED}
      transition={PRESS_TRANSITION}
    >
      <InitialAvatar
        name={name}
        color={color}
      />
      {name}
      <StatusIcon
        className={cn("size-4", isBlocker && "text-destructive", !isBlocker && "text-primary")}
      />
    </motion.span>
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

function buildEntryStep(delaySeconds: number) {
  const entryStep = { ...ENTRY_MOVE_STEP, delay: delaySeconds };
  return entryStep;
}

function buildCardFadeVariants(delaySeconds: number) {
  const fadeTransition = { duration: CARD_FADE_SECONDS, ease: EASE_OUT, delay: delaySeconds };
  const cardFadeVariants = {
    [ENTRY_STATE.STACKED]: { opacity: 0 },
    [ENTRY_STATE.SPREAD]: { opacity: 1, transition: fadeTransition },
  };
  return cardFadeVariants;
}

function buildMoveThenTiltVariants(
  pose: { stacked: TargetAndTransition; spread: TargetAndTransition },
  delaySeconds: number,
): Variants {
  const moveStep = buildEntryStep(delaySeconds);
  const tiltStep = buildEntryStep(delaySeconds + ENTRY_STEP_SECONDS);
  const moveThenTiltVariants = {
    [ENTRY_STATE.STACKED]: pose.stacked,
    [ENTRY_STATE.SPREAD]: {
      ...pose.spread,
      transition: { x: moveStep, y: moveStep, rotate: tiltStep },
    },
  };
  return moveThenTiltVariants;
}

function buildFadeInVariants(delaySeconds: number) {
  const fadeInVariants = {
    [ENTRY_STATE.STACKED]: { opacity: 0 },
    [ENTRY_STATE.SPREAD]: { opacity: 1, transition: buildEntryStep(delaySeconds) },
  };
  return fadeInVariants;
}

function buildScaleInVariants(delaySeconds: number) {
  const scaleInVariants = {
    [ENTRY_STATE.STACKED]: { scale: 0.6, opacity: 0 },
    [ENTRY_STATE.SPREAD]: { scale: 1, opacity: 1, transition: buildEntryStep(delaySeconds) },
  };
  return scaleInVariants;
}

function buildSlowFillVariants(
  unfilled: TargetAndTransition,
  filled: TargetAndTransition,
  delaySeconds: number,
): Variants {
  const fillTransition = { duration: SLOW_FILL_SECONDS, ease: EASE_IN, delay: delaySeconds };
  const slowFillVariants = {
    [ENTRY_STATE.STACKED]: unfilled,
    [ENTRY_STATE.SPREAD]: { ...filled, transition: fillTransition },
  };
  return slowFillVariants;
}

function findDemoRespondentId(name: string): string {
  const response = DEMO_PLAN.responses.find(candidate => candidate.name === name);
  if (!response) {
    throw new Error(`Demo plan has no respondent named ${name}`);
  }
  return response.id;
}
