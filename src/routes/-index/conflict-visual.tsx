import { Suspense } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import {
  buildFadeInVariants,
  buildScaleInVariants,
  ENTRY_STEP_SECONDS,
  FLOATING_PANEL,
} from "./bento-shared";
import { DEMO_CURRENT_USER_ID, DEMO_PLAN, DEMO_RESPONDENT_COLOR_MAP } from "./demo-plan-data";
import { LazySeeAlternativesButton, SeeAlternativesPlaceholder } from "./lazy-demos";
import { StatusChip } from "./respondent-chips-demo";
import { useRespondentSelection } from "./use-respondent-selection";

const CONFLICT_NOTE = "Charles can't make Jul 15. If they can free that day up, everyone's in.";
const DEMO_BLOCKER_NAME = "Charles";

interface ConflictVisualProps {
  entryDelaySeconds: number;
}

export function ConflictVisual({ entryDelaySeconds }: ConflictVisualProps) {
  const { selectedRespondentId, toggleRespondent } = useRespondentSelection();

  const actionDelaySeconds = entryDelaySeconds + ENTRY_STEP_SECONDS;
  const noteVariants = buildScaleInVariants(entryDelaySeconds);
  const actionVariants = buildFadeInVariants(actionDelaySeconds);
  const statusChips = DEMO_PLAN.responses.map(response => {
    const statusChip = {
      id: response.id,
      name: response.name,
      color: DEMO_RESPONDENT_COLOR_MAP[response.id]?.hex,
      isBlocker: response.name === DEMO_BLOCKER_NAME,
      isCurrentUser: response.id === DEMO_CURRENT_USER_ID,
      isSelected: response.id === selectedRespondentId,
      onToggle: () => toggleRespondent(response.id),
    };
    return statusChip;
  });

  return (
    <>
      <div
        className={cn(
          FLOATING_PANEL,
          "flex flex-wrap gap-2 p-5 max-lg:static lg:top-14 lg:left-4 lg:w-[480px]",
        )}
      >
        {statusChips.map(statusChip => (
          <StatusChip
            key={statusChip.id}
            name={statusChip.name}
            color={statusChip.color}
            isBlocker={statusChip.isBlocker}
            isCurrentUser={statusChip.isCurrentUser}
            isSelected={statusChip.isSelected}
            onClick={statusChip.onToggle}
          />
        ))}
      </div>
      <motion.div
        className={cn(
          FLOATING_PANEL,
          "hover-lift -rotate-2 p-5 text-sm leading-snug max-lg:static lg:top-[200px] lg:left-16 lg:w-[340px]",
        )}
        variants={noteVariants}
      >
        {CONFLICT_NOTE}
        <motion.div variants={actionVariants}>
          <Suspense fallback={<SeeAlternativesPlaceholder />}>
            <LazySeeAlternativesButton />
          </Suspense>
        </motion.div>
      </motion.div>
    </>
  );
}
