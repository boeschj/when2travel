import { useState } from "react";
import { motion } from "motion/react";

import { AlternativeSuggestionsModal } from "../plan/-results/alternative-suggestions-modal";
import { useAvailabilityAnalysis } from "../plan/-results/use-availability-analysis";
import { DEMO_PLAN } from "./demo-plan-data";
import { PRESS_TRANSITION, PRESSED } from "./landing-motion";

const SEE_ALTERNATIVES_COPY = {
  buttonLabel: "See Alternatives →",
} as const;

export function SeeAlternativesButton() {
  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false);
  const availabilityAnalysis = useAvailabilityAnalysis(DEMO_PLAN);

  const alternativeWindows = availabilityAnalysis?.recommendation.alternativeWindows ?? [];

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
        {SEE_ALTERNATIVES_COPY.buttonLabel}
      </motion.button>
      <AlternativeSuggestionsModal
        open={isAlternativesOpen}
        onOpenChange={setIsAlternativesOpen}
        alternatives={alternativeWindows}
      />
    </>
  );
}
