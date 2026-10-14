import { useState } from "react";
import { motion } from "motion/react";

import { AlternativeSuggestionsModal } from "../plan/-results/alternative-suggestions-modal";
import { useAvailabilityAnalysis } from "../plan/-results/use-availability-analysis";
import { DEMO_PLAN } from "./demo-plan-data";

const SEE_ALTERNATIVES_LABEL = "See Alternatives →";
const PRESSED = { scale: 0.95 } as const;
const PRESS_TRANSITION = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } as const;

export function SeeAlternativesButton() {
  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false);
  const availability = useAvailabilityAnalysis(DEMO_PLAN);

  const alternativeWindows = availability?.recommendation.alternativeWindows ?? [];

  const handleOpenAlternatives = () => setIsAlternativesOpen(true);

  return (
    <>
      <motion.button
        type="button"
        className="text-primary mt-2 block origin-left cursor-pointer text-[13.5px] font-semibold underline-offset-4 hover:underline"
        whileTap={PRESSED}
        transition={PRESS_TRANSITION}
        onClick={handleOpenAlternatives}
      >
        {SEE_ALTERNATIVES_LABEL}
      </motion.button>
      <AlternativeSuggestionsModal
        open={isAlternativesOpen}
        onOpenChange={setIsAlternativesOpen}
        alternatives={alternativeWindows}
      />
    </>
  );
}
