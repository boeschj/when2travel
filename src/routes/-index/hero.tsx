import { AppLink } from '@/components/shared/app-link'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { useFirstKnownPlanId } from '@/hooks/use-auth-tokens'

const HERO_IMAGES: string[] = [
  '/images/hero-1.webp',
  '/images/hero-2.webp',
  '/images/hero-3.webp',
]

const PRIMARY_CTA_GLOW =
  'shadow-[0_0_40px_rgba(70,236,19,0.3)] hover:shadow-[0_0_60px_rgba(70,236,19,0.5)] hover:-translate-y-1'

export function Hero() {
  const mostRecentPlanId = useFirstKnownPlanId()

  const primaryCtaRoute = mostRecentPlanId ? ROUTES.TRIPS : ROUTES.CREATE
  const primaryCtaLabel = mostRecentPlanId ? 'My Trips' : 'Start Planning'

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] w-full overflow-hidden pt-20"
    >
      <BackgroundImages />
      <BackgroundOverlays />

      <div className="flex flex-col max-w-[1120px] w-full gap-12 relative z-20 px-5 md:px-10">
        <div className="flex flex-col items-center justify-center gap-8 text-center max-w-[900px] mx-auto">
          <HeroHeading />
          <HeroSubheading />
          <HeroActions
            primaryCtaRoute={primaryCtaRoute}
            primaryCtaLabel={primaryCtaLabel}
          />
        </div>
      </div>
    </section>
  )
}

function BackgroundImages() {
  if (HERO_IMAGES.length === 0) return null

  return (
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
  )
}

function BackgroundOverlays() {
  return (
    <>
      <div className="absolute inset-0 bg-black md:hidden z-0" aria-hidden="true" />
      <div className="absolute inset-0 hidden md:block bg-linear-to-t from-black via-black/70 to-black/60 z-0" aria-hidden="true" />
      <div className="absolute inset-0 hidden md:block bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,transparent_70%)] z-0" aria-hidden="true" />
    </>
  )
}

function HeroHeading() {
  return (
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
  )
}

function HeroSubheading() {
  return (
    <p className="text-white/90 text-lg md:text-2xl font-medium leading-relaxed max-w-[680px] mx-auto">
      The fastest way to find dates that work for everyone. Create a plan,
      share the link, see when everyone's free.
    </p>
  )
}

interface HeroActionsProps {
  primaryCtaRoute: string
  primaryCtaLabel: string
}

function HeroActions({ primaryCtaRoute, primaryCtaLabel }: HeroActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-5 pt-6 w-full justify-center">
      <AppLink to={primaryCtaRoute} className="w-full sm:w-auto">
        <Button
          size="xl"
          className={`w-full sm:w-auto ${PRIMARY_CTA_GLOW}`}
        >
          <span>{primaryCtaLabel}</span>
          <ArrowRight className="size-5" aria-hidden="true" />
        </Button>
      </AppLink>
      <Button
        variant="outline"
        size="xl"
        className="w-full sm:w-auto bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm text-white hover:-translate-y-1"
      >
        <PlayCircle className="size-5 text-primary" aria-hidden="true" />
        <span>See Demo</span>
      </Button>
    </div>
  )
}
