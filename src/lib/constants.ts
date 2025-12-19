import type { MotionNodeAnimationOptions, Transition } from "motion/react";

export const ANIMATION_CONSTANTS: Record<string, { animate: MotionNodeAnimationOptions['animate']; transition: Transition }> = {
  gradientBlob1: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.05, 0.08, 0.05],
    },
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  gradientBlob2: {
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.1, 0.15, 0.1],
    },
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: 1,
    },
  },
}

export const AVAILABILITY_THRESHOLDS = {
  HIGH: 0.8,
  PARTIAL: 0.5,
}
