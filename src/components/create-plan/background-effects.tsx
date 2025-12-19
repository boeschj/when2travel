import { motion } from 'motion/react'

export function BackgroundEffects() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ background: 'hsl(var(--primary) / 0.05)' }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  )
}