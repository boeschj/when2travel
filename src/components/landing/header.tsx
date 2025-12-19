import { Link } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-3 text-foreground">
            <div className="size-8 flex items-center justify-center text-primary">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">when2travel</h2>
          </Link>
          <div className="flex items-center gap-4 md:gap-8">
            <a
              className="hidden md:block text-muted-foreground hover:text-primary text-sm font-semibold transition-colors"
              href="#how-it-works"
            >
              How it works
            </a>
            <Link to={ROUTES.CREATE}>
              <Button size="sm">New Trip</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
