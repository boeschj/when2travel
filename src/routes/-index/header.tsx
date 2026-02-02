import { AppLink } from '@/components/shared/app-link'
import { Button } from '@/components/ui/button'
import { Wordmark } from '@/components/shared/wordmark'
import { ROUTES } from '@/lib/routes'
import { useFirstKnownPlanId } from '@/hooks/use-auth-tokens'

export function Header() {
  const mostRecentPlanId = useFirstKnownPlanId()

  const hasExistingPlan = Boolean(mostRecentPlanId)

  return (
    <header className="fixed top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-white/5">
      <HeaderContainer>
        <div className="flex items-center justify-between">
          <Wordmark />
          <Navigation hasExistingPlan={hasExistingPlan} />
        </div>
      </HeaderContainer>
    </header>
  )
}

function HeaderContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4">
      {children}
    </div>
  )
}

function Navigation({ hasExistingPlan }: { hasExistingPlan: boolean }) {
  return (
    <nav aria-label="Main navigation" className="flex items-center gap-4 md:gap-8">
      <HowItWorksLink />
      <TripActionButton hasExistingPlan={hasExistingPlan} />
    </nav>
  )
}

function HowItWorksLink() {
  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Button
      variant="link"
      className="hidden md:block text-gray-300 hover:text-primary p-0 h-auto"
      onClick={scrollToHowItWorks}
    >
      How it works
    </Button>
  )
}

function TripActionButton({ hasExistingPlan }: { hasExistingPlan: boolean }) {
  const route = hasExistingPlan ? ROUTES.TRIPS : ROUTES.CREATE
  const label = hasExistingPlan ? 'My Trips' : 'New Trip'

  return (
    <AppLink to={route}>
      <Button
        size="sm"
        variant="outline"
        className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary"
      >
        {label}
      </Button>
    </AppLink>
  )
}
