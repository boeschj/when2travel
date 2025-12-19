import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export function CtaSection() {
  return (
    <div className="relative z-10 w-full py-20 px-5">
      <motion.div
        className="max-w-[1120px] mx-auto bg-gradient-to-br from-card to-background rounded-[3rem] p-10 md:p-20 text-center border border-border relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-foreground text-3xl md:text-5xl font-black tracking-tight">Give it a shot</h2>
            <p className="text-muted-foreground text-lg">
              It's free. You don't need an account. Takes under a minute to set up.
            </p>
          </div>
          <Link to={ROUTES.CREATE}>
            <Button size="lg" className="min-w-[200px] shadow-[0_0_30px_rgba(70,236,19,0.4)]">
              Make a plan
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
