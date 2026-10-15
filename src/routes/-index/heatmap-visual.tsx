import { Suspense } from "react";
import { ThumbsUp } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { ResultsLegend } from "../plan/-results/availability-legend";
import {
  buildSlowFillVariants,
  FLOATING_PANEL,
  HIDDEN,
  SLOW_FILL_STAGGER_SECONDS,
  VISIBLE,
} from "./bento-shared";
import { DEMO_PLAN, DEMO_RESPONDENT_COLOR_MAP } from "./demo-plan-data";
import { DemoHeatmapPlaceholder, LazyDemoJulyHeatmap } from "./lazy-demos";
import { PersonChip } from "./respondent-chips-demo";
import { useRespondentSelection } from "./use-respondent-selection";

const BEST_WINDOW_COPY = {
  heading: "So close!",
  dates: "Jul 13 – 19",
  people: "6/7 people available",
} as const;

const FILTER_NAMES = ["Sam", "Joe", "Priya"] as const;
const HEATMAP_ZOOM_CLASS = "[zoom:0.55]";

interface HeatmapVisualProps {
  entryDelaySeconds: number;
}

export function HeatmapVisual({ entryDelaySeconds }: HeatmapVisualProps) {
  const { selectedRespondentId, selectRespondent, toggleRespondent } = useRespondentSelection();

  const hasSelection = selectedRespondentId !== null;
  const filterRows = FILTER_NAMES.map((name, rowIndex) => {
    const filterRow = buildFilterRow({
      name,
      rowIndex,
      entryDelaySeconds,
      selectedRespondentId,
      hasSelection,
    });
    const onToggle = () => toggleRespondent(filterRow.respondentId);
    return { ...filterRow, onToggle };
  });

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
              color={filterRow.color}
              isSelected={filterRow.isSelected}
              isDimmed={filterRow.isDimmed}
              onClick={filterRow.onToggle}
            />
          </motion.div>
        ))}
      </div>
      <BestWindowPanel />
      <div className={cn(FLOATING_PANEL, "top-6 left-1/2 -translate-x-1/2 p-4")}>
        <Suspense fallback={<DemoHeatmapPlaceholder className={HEATMAP_ZOOM_CLASS} />}>
          <LazyDemoJulyHeatmap
            className={HEATMAP_ZOOM_CLASS}
            selectedRespondentId={selectedRespondentId}
            onRespondentSelect={selectRespondent}
          />
        </Suspense>
        <ResultsLegend className="mt-2 justify-center whitespace-nowrap" />
      </div>
    </>
  );
}

function BestWindowPanel() {
  return (
    <div
      className={cn(
        FLOATING_PANEL,
        "top-24 -right-6 hidden w-[200px] rotate-3 justify-items-center gap-1 p-5 text-center lg:grid",
      )}
    >
      <span className="bg-surface-darker text-primary mb-1 grid size-10 place-items-center rounded-full">
        <ThumbsUp className="size-4" />
      </span>
      <span className="font-extrabold">{BEST_WINDOW_COPY.heading}</span>
      <span className="text-[26px] leading-tight font-extrabold tracking-[-0.045em]">
        {BEST_WINDOW_COPY.dates}
      </span>
      <span className="text-text-secondary text-xs font-bold">{BEST_WINDOW_COPY.people}</span>
    </div>
  );
}

function buildFilterRow({
  name,
  rowIndex,
  entryDelaySeconds,
  selectedRespondentId,
  hasSelection,
}: {
  name: string;
  rowIndex: number;
  entryDelaySeconds: number;
  selectedRespondentId: string | null;
  hasSelection: boolean;
}) {
  const respondentId = findDemoRespondentId(name);
  const color = DEMO_RESPONDENT_COLOR_MAP[respondentId]?.hex;
  const isAlreadyShown = rowIndex === 0;
  const staggerIndex = rowIndex - 1;
  const rowDelaySeconds = entryDelaySeconds + staggerIndex * SLOW_FILL_STAGGER_SECONDS;
  const staggeredFadeIn = buildSlowFillVariants({
    unfilled: HIDDEN,
    filled: VISIBLE,
    delaySeconds: rowDelaySeconds,
  });
  const fadeInVariants = isAlreadyShown ? undefined : staggeredFadeIn;
  const isSelected = respondentId === selectedRespondentId;
  const isDimmed = hasSelection && !isSelected;
  const filterRow = { name, respondentId, color, fadeInVariants, isSelected, isDimmed };
  return filterRow;
}

function findDemoRespondentId(name: string): string {
  const response = DEMO_PLAN.responses.find(candidate => candidate.name === name);
  if (!response) {
    throw new Error(`Demo plan has no respondent named ${name}`);
  }
  return response.id;
}
