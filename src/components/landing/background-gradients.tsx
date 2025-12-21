import { motion } from 'motion/react'
import { ANIMATION_CONSTANTS } from '@/lib/constants'

export function BackgroundGradients() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern"
      aria-hidden="true"
    >
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"
        animate={ANIMATION_CONSTANTS.gradientBlob1.animate}
        transition={ANIMATION_CONSTANTS.gradientBlob1.transition}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px]"
        animate={ANIMATION_CONSTANTS.gradientBlob2.animate}
        transition={ANIMATION_CONSTANTS.gradientBlob2.transition}
      />
      {/* Additional subtle glow for the hero area */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-primary/3 blur-[150px] rounded-full" />
    </div>
  )
}
