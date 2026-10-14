import type { ReactNode } from "react";
import { CalendarX2, CheckCircle2, Copy, Pencil, Share2, ThumbsUp, XCircle } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";

import { buildColorMap, cn } from "@/lib/utils";

import { ResultsLegend } from "../plan/-results/availability-legend";
import { DemoJulyHeatmap } from "./demo-july-heatmap";
import { DEMO_PLAN } from "./demo-plan-data";

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

const FILTER_ACTIVE_NAME = "Sam";
const FILTER_DIMMED_NAMES = ["Joe", "Priya"] as const;
const DEMO_BLOCKER_NAME = "Charles";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const EASE_IN = [0.42, 0, 1, 1] as const;
const GRID_VIEWPORT = { once: true, amount: 0.25 } as const;
const ENTRY_STEP_SECONDS = 0.3;
const ENTRY_MOVE_STEP = { duration: ENTRY_STEP_SECONDS, ease: EASE_OUT_QUART } as const;
const ENTRY_STATE = {
  STACKED: "stacked",
  SPREAD: "spread",
} as const;

const CARD_FADE_SECONDS = 0.6;
const CARD_STAGGER_SECONDS = 0.15;
const CARD_ENTRY_DELAY_SECONDS = {
  SHARE: 0,
  HEATMAP: CARD_STAGGER_SECONDS,
  CONFLICTS: CARD_STAGGER_SECONDS * 2,
  CREATE: CARD_STAGGER_SECONDS * 3,
} as const;
const VISUAL_ANIMATION_SECONDS = {
  SHARE: ENTRY_STEP_SECONDS * 2,
  HEATMAP: ENTRY_STEP_SECONDS * 2,
  CONFLICTS: ENTRY_STEP_SECONDS * 3,
} as const;
const VISUAL_ENTRY_DELAY_SECONDS = {
  SHARE: CARD_FADE_SECONDS,
  HEATMAP: CARD_FADE_SECONDS + VISUAL_ANIMATION_SECONDS.SHARE,
  CONFLICTS: CARD_FADE_SECONDS + VISUAL_ANIMATION_SECONDS.SHARE + VISUAL_ANIMATION_SECONDS.HEATMAP,
  CREATE:
    CARD_FADE_SECONDS +
    VISUAL_ANIMATION_SECONDS.SHARE +
    VISUAL_ANIMATION_SECONDS.HEATMAP +
    VISUAL_ANIMATION_SECONDS.CONFLICTS,
} as const;

const SHARE_LINK_CARD_POSE = {
  stacked: { x: 80, y: 56, rotate: 0 },
  spread: { x: 0, y: 0, rotate: -3 },
} as const;
const SHARE_MESSAGE_CARD_POSE = {
  stacked: { x: -80, y: -56, rotate: 0 },
  spread: { x: 0, y: 0, rotate: 2 },
} as const;
const CONFLICT_NOTE_POSE = {
  stacked: { x: "150%", rotate: 0 },
  spread: { x: 0, rotate: -2 },
} as const;
const HEATMAP_FILTER_START_X = "42%";
const HEATMAP_BEST_WINDOW_START_X = "-41%";
const CONFLICT_RESPONDENTS_START_X = "150%";
const HEATMAP_FILTER_TILT = -3;
const HEATMAP_BEST_WINDOW_TILT = 3;

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
          <motion.div
            className="mx-auto grid max-w-[1240px] grid-cols-1 gap-5 lg:grid-cols-12"
            initial={ENTRY_STATE.STACKED}
            whileInView={ENTRY_STATE.SPREAD}
            viewport={GRID_VIEWPORT}
          >
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
          </motion.div>
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
      className={cn(CARD_SHELL, className)}
    >
      <div
        inert
        className="relative h-[300px] sm:h-[340px]"
      >
        {visual}
      </div>
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
  const iconVariants = buildScaleInVariants(VISUAL_ENTRY_DELAY_SECONDS.CONFLICTS);

  return (
    <motion.article
      variants={cardFadeVariants}
      className={cn(
        CARD_SHELL,
        "lg:col-span-8 lg:grid lg:min-h-[440px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]",
      )}
    >
      <div className="flex flex-col justify-between gap-10 p-8 sm:p-10">
        <motion.span
          className="shadow-object bg-surface-dark grid size-16 place-items-center rounded-[20px] border border-[#2f4a27]"
          variants={iconVariants}
        >
          <CalendarX2 className="text-primary size-7" />
        </motion.span>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{FEATURE_COPY.conflicts.title}</h3>
          <p className="text-text-secondary mt-3 max-w-[36ch] text-base leading-relaxed text-pretty">
            {FEATURE_COPY.conflicts.description}
          </p>
        </div>
      </div>
      <div
        inert
        className="relative h-[320px] lg:h-auto"
      >
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
          <Copy className="size-4 shrink-0" />
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
  const respondentColors = buildDemoRespondentColors();
  const tiltDelaySeconds = entryDelaySeconds + ENTRY_STEP_SECONDS;
  const filterTrackVariants = buildSlideInVariants(HEATMAP_FILTER_START_X, entryDelaySeconds);
  const bestWindowTrackVariants = buildSlideInVariants(
    HEATMAP_BEST_WINDOW_START_X,
    entryDelaySeconds,
  );
  const filterTiltVariants = buildTiltVariants(HEATMAP_FILTER_TILT, tiltDelaySeconds);
  const bestWindowTiltVariants = buildTiltVariants(HEATMAP_BEST_WINDOW_TILT, tiltDelaySeconds);

  return (
    <>
      <motion.div
        className="absolute inset-0 hidden lg:block"
        variants={filterTrackVariants}
      >
        <motion.div
          className={cn(FLOATING_PANEL, "top-14 -left-4 grid gap-2 p-4")}
          variants={filterTiltVariants}
        >
          <PersonChip
            name={FILTER_ACTIVE_NAME}
            color={respondentColors[FILTER_ACTIVE_NAME]}
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
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute inset-0 hidden lg:block"
        variants={bestWindowTrackVariants}
      >
        <motion.div
          className={cn(
            FLOATING_PANEL,
            "top-24 -right-6 grid w-[200px] justify-items-center gap-1 p-5 text-center",
          )}
          variants={bestWindowTiltVariants}
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
        </motion.div>
      </motion.div>
      <div className={cn(FLOATING_PANEL, "top-6 left-1/2 -translate-x-1/2 p-4")}>
        <DemoJulyHeatmap className="[zoom:0.55]" />
        <ResultsLegend className="mt-2 justify-center whitespace-nowrap" />
      </div>
    </>
  );
}

function ConflictVisual({ entryDelaySeconds }: EntryDelayProps) {
  const respondentColors = buildDemoRespondentColors();
  const respondentsVariants = buildSlideInVariants(CONFLICT_RESPONDENTS_START_X, entryDelaySeconds);
  const noteVariants = buildMoveThenTiltVariants(
    CONFLICT_NOTE_POSE,
    entryDelaySeconds + ENTRY_STEP_SECONDS,
  );

  return (
    <>
      <motion.div
        className={cn(FLOATING_PANEL, "top-10 left-4 flex w-[480px] flex-wrap gap-2 p-5 lg:top-14")}
        variants={respondentsVariants}
      >
        {DEMO_PLAN.responses.map(response => (
          <StatusChip
            key={response.id}
            name={response.name}
            color={respondentColors[response.name]}
            isBlocker={response.name === DEMO_BLOCKER_NAME}
          />
        ))}
      </motion.div>
      <motion.div
        className={cn(
          FLOATING_PANEL,
          "top-[170px] left-16 w-[340px] p-5 text-sm leading-snug lg:top-[200px]",
        )}
        variants={noteVariants}
      >
        {VISUAL_COPY.conflictNote}
        <span className="text-primary mt-2 block text-[13.5px] font-semibold">
          {VISUAL_COPY.conflictLink}
        </span>
      </motion.div>
    </>
  );
}

function CreateVisual({ entryDelaySeconds }: EntryDelayProps) {
  const calendarVariants = buildScaleInVariants(entryDelaySeconds);

  return (
    <motion.div
      className={cn(
        FLOATING_PANEL,
        "top-10 left-1/2 grid w-[300px] -translate-x-1/2 -rotate-3 justify-items-center gap-4 p-5 lg:[zoom:0.85] xl:[zoom:1]",
      )}
      variants={calendarVariants}
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
    </motion.div>
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
        "border-border bg-card flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13.5px] font-semibold",
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
    <span className="border-border bg-card flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13.5px] font-semibold">
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
  const fadeTransition = { duration: CARD_FADE_SECONDS, ease: EASE_IN, delay: delaySeconds };
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

function buildSlideInVariants(startX: string, delaySeconds: number) {
  const slideInVariants = {
    [ENTRY_STATE.STACKED]: { x: startX },
    [ENTRY_STATE.SPREAD]: { x: 0, transition: buildEntryStep(delaySeconds) },
  };
  return slideInVariants;
}

function buildTiltVariants(rotate: number, delaySeconds: number) {
  const tiltVariants = {
    [ENTRY_STATE.STACKED]: { rotate: 0 },
    [ENTRY_STATE.SPREAD]: { rotate, transition: buildEntryStep(delaySeconds) },
  };
  return tiltVariants;
}

function buildScaleInVariants(delaySeconds: number) {
  const scaleInVariants = {
    [ENTRY_STATE.STACKED]: { scale: 0.6, opacity: 0 },
    [ENTRY_STATE.SPREAD]: { scale: 1, opacity: 1, transition: buildEntryStep(delaySeconds) },
  };
  return scaleInVariants;
}
