import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Wordmark } from '@/components/shared/wordmark'
import { ROUTES } from '@/lib/routes'
import { useMostRecentPlanId } from '@/hooks/use-auth-tokens'

export function Header() {
  const mostRecentPlanId = useMostRecentPlanId()

  return (
    <header className="fixed top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4">
        <div className="flex items-center justify-between">
          <Wordmark />
          <nav aria-label="Main navigation" className="flex items-center gap-4 md:gap-8">
            <Button
              variant="link"
              className="hidden md:block text-gray-300 hover:text-primary p-0 h-auto"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              How it works
            </Button>
            {mostRecentPlanId ? (
              <Link to={ROUTES.PLAN} params={{ planId: mostRecentPlanId }}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary"
                >
                  View Plan
                </Button>
              </Link>
            ) : (
              <Link to={ROUTES.CREATE}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary"
                >
                  New Trip
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
