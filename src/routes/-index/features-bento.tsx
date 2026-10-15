import type { ReactNode } from "react";
import { CalendarX2, Pencil, Share2 } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import {
  buildCardFadeVariants,
  buildMoveThenTiltVariants,
  buildSlowFillVariants,
  CARD_VIEWPORT,
  ENTRY_STATE,
  FLOATING_PANEL,
  getVisualEntryDelaySeconds,
  HIDDEN,
  SLOW_FILL_STAGGER_SECONDS,
  VISIBLE,
} from "./bento-shared";
import { ConflictVisual } from "./conflict-visual";
import { CopyLinkButton } from "./copy-link-button";
import { HeatmapVisual } from "./heatmap-visual";

const SECTION_COPY = {
  eyebrow: "Features",
  heading: "Plan your trip in five minutes.",
  subheading: "We help you nail down the dates so you can actually book the thing.",
} as const;

const FEATURE_COPY = {
  create: {
    title: "Create your trip",
    description: "Name it, set the date range, pick how many days you need. Done in 10 seconds.",
  },
  share: {
    title: "Share the link",
    description:
      "Drop it in the group chat. No downloads, no signups. People just tap and pick their dates.",
  },
  heatmap: {
    title: "See who's free when",
    description:
      "The calendar fills in as people respond. Perfect overlap? Book it. Conflicts? We'll show you exactly what's blocking and help you find a window that works.",
  },
  conflicts: {
    title: "Book it",
    description:
      "We surface the best window automatically. No more guessing, no more back-and-forth.",
  },
} as const;

const VISUAL_COPY = {
  tripName: "Hawaii Trip 2026",
  shareUrl: "justplanthetrip.com/plan/hawaii",
  shareLabel: "Share",
  groupMessage: "everyone PICK YOUR DATES 🙏",
  deliveredLabel: "Delivered",
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

const FILLED_RANGE_DAYS = CREATE_RANGE_DAYS.filter(
  rangeDay => rangeDay.kind in RANGE_DAY_FILL_CLASS,
);

const SUNDAY_FIRST_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const CARD_STAGGER_SECONDS = 0.15;
const CARD_ENTRY_DELAY_SECONDS = {
  SHARE: 0,
  HEATMAP: CARD_STAGGER_SECONDS,
  CONFLICTS: 0,
  CREATE: CARD_STAGGER_SECONDS,
} as const;

const SHARE_LINK_CARD_POSE = {
  stacked: { x: 80, y: 56, rotate: 0 },
  spread: { x: 0, y: 0, rotate: -3 },
} as const;
const SHARE_MESSAGE_CARD_POSE = {
  stacked: { x: -80, y: -56, rotate: 0 },
  spread: { x: 0, y: 0, rotate: 2 },
} as const;

const ENDPOINT_TEXT_UNFILLED = { color: "var(--color-foreground)" } as const;
const ENDPOINT_TEXT_FILLED = { color: "var(--color-primary-foreground)" } as const;

const CARD_SHELL =
  "relative flex min-w-0 flex-col overflow-clip rounded-[32px] border border-border bg-card";

interface FeatureCardProps {
  className: string;
  copy: { title: string; description: string };
  entryDelaySeconds: number;
  visual: ReactNode;
}

interface VisualProps {
  entryDelaySeconds: number;
}

export function FeaturesBento() {
  const shareVisualDelay = getVisualEntryDelaySeconds(CARD_ENTRY_DELAY_SECONDS.SHARE);
  const heatmapVisualDelay = getVisualEntryDelaySeconds(CARD_ENTRY_DELAY_SECONDS.HEATMAP);
  const createVisualDelay = getVisualEntryDelaySeconds(CARD_ENTRY_DELAY_SECONDS.CREATE);

  return (
    <section
      id="how-it-works"
      className="px-4 pt-24 sm:pt-28 lg:px-5"
    >
      <div className="bg-felt-texture border-surface-dark rounded-[40px] border px-3.5 py-16 sm:px-7 sm:py-24">
        <SectionHeader />
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-5 lg:grid-cols-12">
          <FeatureCard
            className="lg:col-span-5"
            copy={FEATURE_COPY.share}
            entryDelaySeconds={CARD_ENTRY_DELAY_SECONDS.SHARE}
            visual={<ShareVisual entryDelaySeconds={shareVisualDelay} />}
          />
          <FeatureCard
            className="lg:col-span-7"
            copy={FEATURE_COPY.heatmap}
            entryDelaySeconds={CARD_ENTRY_DELAY_SECONDS.HEATMAP}
            visual={<HeatmapVisual entryDelaySeconds={heatmapVisualDelay} />}
          />
          <ConflictCard />
          <FeatureCard
            className="border-felt-edge border-2 border-dashed bg-transparent shadow-none lg:col-span-4"
            copy={FEATURE_COPY.create}
            entryDelaySeconds={CARD_ENTRY_DELAY_SECONDS.CREATE}
            visual={<CreateVisual entryDelaySeconds={createVisualDelay} />}
          />
        </div>
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

function FeatureCard({ className, copy, entryDelaySeconds, visual }: FeatureCardProps) {
  const cardFadeVariants = buildCardFadeVariants(entryDelaySeconds);
  const cardClassName = cn(CARD_SHELL, className);

  return (
    <motion.article
      variants={cardFadeVariants}
      initial={ENTRY_STATE.STACKED}
      whileInView={ENTRY_STATE.SPREAD}
      viewport={CARD_VIEWPORT}
      className={cardClassName}
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
  const conflictVisualDelay = getVisualEntryDelaySeconds(CARD_ENTRY_DELAY_SECONDS.CONFLICTS);
  const cardClassName = cn(
    CARD_SHELL,
    "lg:col-span-8 lg:grid lg:min-h-[440px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]",
  );

  return (
    <motion.article
      variants={cardFadeVariants}
      initial={ENTRY_STATE.STACKED}
      whileInView={ENTRY_STATE.SPREAD}
      viewport={CARD_VIEWPORT}
      className={cardClassName}
    >
      <div className="flex flex-col justify-between gap-10 p-8 sm:p-10">
        <span className="shadow-object bg-surface-dark border-felt-edge grid size-16 place-items-center rounded-[20px] border">
          <CalendarX2 className="text-primary size-7" />
        </span>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{FEATURE_COPY.conflicts.title}</h3>
          <p className="text-text-secondary mt-3 max-w-[36ch] text-base leading-relaxed text-pretty">
            {FEATURE_COPY.conflicts.description}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-8 lg:relative lg:block lg:p-0">
        <ConflictVisual entryDelaySeconds={conflictVisualDelay} />
      </div>
    </motion.article>
  );
}

function ShareVisual({ entryDelaySeconds }: VisualProps) {
  const linkCardVariants = buildMoveThenTiltVariants({
    ...SHARE_LINK_CARD_POSE,
    delaySeconds: entryDelaySeconds,
  });
  const messageCardVariants = buildMoveThenTiltVariants({
    ...SHARE_MESSAGE_CARD_POSE,
    delaySeconds: entryDelaySeconds,
  });

  return (
    <>
      <motion.div
        className={cn(
          FLOATING_PANEL,
          "top-16 left-6 z-10 grid w-[min(320px,calc(100%-3rem))] gap-3 p-4",
        )}
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
          "bg-ios-screen top-[190px] right-6 grid w-[min(270px,calc(100%-3rem))] justify-items-end gap-1 p-4 font-[-apple-system,BlinkMacSystemFont,system-ui,sans-serif]",
        )}
        variants={messageCardVariants}
      >
        <span className="bg-ios-blue rounded-[18px] rounded-br-md px-3 py-[7px] text-[15px] tracking-[-0.02em] text-white">
          {VISUAL_COPY.groupMessage}
        </span>
        <span className="text-ios-secondary text-[11px] font-medium">
          {VISUAL_COPY.deliveredLabel}
        </span>
      </motion.div>
    </>
  );
}

function CreateVisual({ entryDelaySeconds }: VisualProps) {
  const rangeDayCells = CREATE_RANGE_DAYS.map(rangeDay => {
    const fillOrder = FILLED_RANGE_DAYS.indexOf(rangeDay);
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
  const fillVariants = buildSlowFillVariants({
    unfilled: HIDDEN,
    filled: VISIBLE,
    delaySeconds: fillDelaySeconds,
  });
  const endpointTextVariants = buildSlowFillVariants({
    unfilled: ENDPOINT_TEXT_UNFILLED,
    filled: ENDPOINT_TEXT_FILLED,
    delaySeconds: fillDelaySeconds,
  });
  const textVariants = isEndpoint ? endpointTextVariants : undefined;
  const cellClassName = cn(
    "relative grid size-9 place-items-center rounded-full text-[13px]",
    RANGE_DAY_TEXT_CLASS[kind],
  );
  const fillClassName = cn("absolute inset-0 rounded-full", fillClass);

  return (
    <span className={cellClassName}>
      {fillClass && (
        <motion.span
          className={fillClassName}
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
