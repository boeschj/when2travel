import { AppLink } from '@/components/shared/app-link'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="relative z-10 w-full py-20 px-5 bg-black">
      <div className="max-w-[1120px] mx-auto">
        <CtaCard>
          <GlowEffect position="top-left" />
          <GlowEffect position="bottom-right" />
          <CtaContent />
        </CtaCard>
      </div>
    </section>
  )
}

function CtaCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-linear-to-b from-background to-black rounded-xl p-10 md:p-24 text-center border border-white/5 relative overflow-hidden group">
      {children}
    </div>
  )
}

function GlowEffect({ position }: { position: 'top-left' | 'bottom-right' }) {
  const isTopLeft = position === 'top-left'

  const positionClasses = isTopLeft
    ? 'top-0 left-1/4 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-700'
    : 'bottom-0 right-1/4 bg-blue-500/5'

  return (
    <div
      className={`absolute w-96 h-96 rounded-full blur-[100px] pointer-events-none ${positionClasses}`}
      aria-hidden="true"
    />
  )
}

function CtaContent() {
  return (
    <div className="relative z-10 flex flex-col items-center gap-10">
      <CtaHeading />
      <CtaButton />
    </div>
  )
}

function CtaHeading() {
  return (
    <div className="flex flex-col gap-4 items-center">
      <h2
        id="cta-heading"
        className="text-white text-4xl md:text-6xl font-black tracking-tight"
      >
        Don't let the trip die in the group chat.
      </h2>
      <p className="text-white/80 text-xl font-medium max-w-[600px] text-center">
        25% of group trips never happen because no one can agree on dates.
        Be the one who makes it happen.
      </p>
    </div>
  )
}

function CtaButton() {
  return (
    <AppLink to="/create">
      <Button
        size="xl"
        className="min-w-[220px] shadow-glow-lg hover:shadow-glow-xl hover:-translate-y-1"
      >
        Start Planning Now
      </Button>
    </AppLink>
  )
}
