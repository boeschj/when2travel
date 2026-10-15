import type { TargetAndTransition, Variants } from "motion/react";

import { EASE_IN, EASE_OUT, EASE_OUT_QUART } from "./landing-motion";

export const ENTRY_STATE = {
  STACKED: "stacked",
  SPREAD: "spread",
} as const;

export const CARD_VIEWPORT = { once: true, amount: 0.15 } as const;
export const ENTRY_STEP_SECONDS = 0.3;
export const SLOW_FILL_STAGGER_SECONDS = 0.15;
export const HIDDEN = { opacity: 0 } as const;
export const VISIBLE = { opacity: 1 } as const;

export const FLOATING_PANEL =
  "shadow-object absolute rounded-[22px] border border-felt-edge bg-surface-dark";

const CARD_FADE_SECONDS = 0.4;
const SLOW_FILL_SECONDS = 0.35;
const SCALED_DOWN = { scale: 0.6, opacity: 0 } as const;
const SCALED_UP = { scale: 1, opacity: 1 } as const;
const ENTRY_MOVE_STEP = { duration: ENTRY_STEP_SECONDS, ease: EASE_OUT_QUART } as const;

export function getVisualEntryDelaySeconds(cardEntryDelaySeconds: number): number {
  const visualEntryDelaySeconds = cardEntryDelaySeconds + CARD_FADE_SECONDS;
  return visualEntryDelaySeconds;
}

export function buildEntryStep(delaySeconds: number) {
  const entryStep = { ...ENTRY_MOVE_STEP, delay: delaySeconds };
  return entryStep;
}

export function buildCardFadeVariants(delaySeconds: number): Variants {
  const fadeTransition = { duration: CARD_FADE_SECONDS, ease: EASE_OUT, delay: delaySeconds };
  const cardFadeVariants = {
    [ENTRY_STATE.STACKED]: HIDDEN,
    [ENTRY_STATE.SPREAD]: { ...VISIBLE, transition: fadeTransition },
  };
  return cardFadeVariants;
}

export function buildMoveThenTiltVariants({
  stacked,
  spread,
  delaySeconds,
}: {
  stacked: TargetAndTransition;
  spread: TargetAndTransition;
  delaySeconds: number;
}): Variants {
  const tiltDelaySeconds = delaySeconds + ENTRY_STEP_SECONDS;
  const moveStep = buildEntryStep(delaySeconds);
  const tiltStep = buildEntryStep(tiltDelaySeconds);
  const moveThenTiltVariants = {
    [ENTRY_STATE.STACKED]: stacked,
    [ENTRY_STATE.SPREAD]: {
      ...spread,
      transition: { x: moveStep, y: moveStep, rotate: tiltStep },
    },
  };
  return moveThenTiltVariants;
}

export function buildFadeInVariants(delaySeconds: number): Variants {
  const fadeInVariants = {
    [ENTRY_STATE.STACKED]: HIDDEN,
    [ENTRY_STATE.SPREAD]: { ...VISIBLE, transition: buildEntryStep(delaySeconds) },
  };
  return fadeInVariants;
}

export function buildScaleInVariants(delaySeconds: number): Variants {
  const scaleInVariants = {
    [ENTRY_STATE.STACKED]: SCALED_DOWN,
    [ENTRY_STATE.SPREAD]: { ...SCALED_UP, transition: buildEntryStep(delaySeconds) },
  };
  return scaleInVariants;
}

export function buildSlowFillVariants({
  unfilled,
  filled,
  delaySeconds,
}: {
  unfilled: TargetAndTransition;
  filled: TargetAndTransition;
  delaySeconds: number;
}): Variants {
  const fillTransition = { duration: SLOW_FILL_SECONDS, ease: EASE_IN, delay: delaySeconds };
  const slowFillVariants = {
    [ENTRY_STATE.STACKED]: unfilled,
    [ENTRY_STATE.SPREAD]: { ...filled, transition: fillTransition },
  };
  return slowFillVariants;
}
