import { motion } from "motion/react";

export function BackgroundEffects() {
  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-0 h-full w-full overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        className="absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full blur-[120px]"
        style={{ background: "hsl(var(--primary) / 0.05)" }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-[40%] -left-[10%] h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}
