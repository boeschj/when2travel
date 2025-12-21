import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="relative z-10 w-full py-20 px-5 bg-black">
      <div className="max-w-[1120px] mx-auto">
        <div className="bg-gradient-to-b from-[#152211] to-black rounded-[3rem] p-10 md:p-24 text-center border border-white/5 relative overflow-hidden group">
          {/* Glow effects */}
          <div
            className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-700"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center gap-10">
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
            <Link to={ROUTES.CREATE}>
              <Button
                size="xl"
                className="min-w-[220px] shadow-[0_0_40px_rgba(70,236,19,0.3)] hover:shadow-[0_0_60px_rgba(70,236,19,0.5)] hover:-translate-y-1"
              >
                Start Planning Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
