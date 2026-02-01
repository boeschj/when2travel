import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface FormSectionProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right'
  className?: string
}

export function FormSection({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: FormSectionProps) {
  const animations = {
    up: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } },
  }

  const { initial, animate } = animations[direction]

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      {children}
    </div>
  )
}

interface FormContainerProps {
  children: ReactNode
}

export function FormContainer({ children }: FormContainerProps) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pb-20 pt-10 relative z-10">
      <div className="w-full max-w-4xl flex flex-col gap-12">
        {children}
      </div>
    </main>
  )
}