import { Link } from '@tanstack/react-router'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { useMostRecentPlanId } from '@/hooks/use-auth-tokens'

const HERO_IMAGES: string[] = [
  '/images/hero-1.webp',
  '/images/hero-2.webp',
  '/images/hero-3.webp',
]

export function Hero() {
  const mostRecentPlanId = useMostRecentPlanId()

  return (
    <section aria-labelledby="hero-heading" className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] w-full overflow-hidden pt-20">
      {/* Background image panes */}
      {HERO_IMAGES.length > 0 && (
        <div
          className="absolute inset-0 z-0 hidden md:grid grid-cols-3 gap-1 select-none pointer-events-none"
          aria-hidden="true"
        >
          {HERO_IMAGES.map((src, i) => (
            <div
              key={i}
              className="relative h-full w-full overflow-hidden bg-gray-900"
            >
              <img
                alt=""
                src={src}
                className="h-full w-auto max-w-none object-cover object-center"
              />
            </div>
          ))}
        </div>
      )}

      {/* Gradient overlays - darkens toward bottom and center for text readability */}
      <div className="absolute inset-0 bg-black md:hidden z-0" aria-hidden="true" />
      <div className="absolute inset-0 hidden md:block bg-linear-to-t from-black via-black/70 to-black/60 z-0" aria-hidden="true" />
      <div className="absolute inset-0 hidden md:block bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,transparent_70%)] z-0" aria-hidden="true" />

      <div className="flex flex-col max-w-[1120px] w-full gap-12 relative z-20 px-5 md:px-10">
        <div className="flex flex-col items-center justify-center gap-8 text-center max-w-[900px] mx-auto">
          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter"
          >
            Get the trip out of{' '}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-green-200">
              the group chat.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 text-lg md:text-2xl font-medium leading-relaxed max-w-[680px] mx-auto">
            The fastest way to find dates that work for everyone. Create a plan,
            share the link, see when everyone's free.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 pt-6 w-full justify-center">
            {mostRecentPlanId ? (
              <Link to={ROUTES.TRIPS} className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full sm:w-auto shadow-[0_0_40px_rgba(70,236,19,0.3)] hover:shadow-[0_0_60px_rgba(70,236,19,0.5)] hover:-translate-y-1"
                >
                  <span>My Trips</span>
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Button>
              </Link>
            ) : (
              <Link to={ROUTES.CREATE} className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full sm:w-auto shadow-[0_0_40px_rgba(70,236,19,0.3)] hover:shadow-[0_0_60px_rgba(70,236,19,0.5)] hover:-translate-y-1"
                >
                  <span>Start Planning</span>
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="xl"
              className="w-full sm:w-auto bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm text-white hover:-translate-y-1"
            >
              <PlayCircle className="size-5 text-primary" aria-hidden="true" />
              <span>See Demo</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
