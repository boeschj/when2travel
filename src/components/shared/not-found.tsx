import { Link } from '@tanstack/react-router'
import { Home, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[20rem] md:text-[30rem] font-black text-muted/10 leading-none">
          404
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="relative mb-8">
          <div className="w-64 h-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-border/20">
            <img
              src="/images/hero-3.webp"
              alt="Misty forest landscape"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="relative">
              <MapPin className="w-12 h-12 text-primary fill-primary" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-background" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
          Off the Map?
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          We couldn't find the page you're looking for. It seems this trip doesn't exist, or you may have taken a wrong turn on your journey.
        </p>

        <Button asChild size="lg" className="gap-2">
          <Link to={ROUTES.TRIPS}>
            <Home className="w-5 h-5" />
            Back to Home Base
          </Link>
        </Button>
      </div>
    </div>
  )
}
