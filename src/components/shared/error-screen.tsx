import { Link } from '@tanstack/react-router'
import { AlertCircle, Home, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import Logo from './logo'

interface ErrorScreenProps {
  title?: string
  message?: string
  onRetry?: () => void
  variant?: 'default' | 'not-found'
}

export function ErrorScreen({
  title = 'Something went wrong',
  message = 'We couldn\'t load this page. Please try again.',
  onRetry,
  variant = 'default',
}: ErrorScreenProps) {
  if (variant === 'not-found') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
        {/* Background 404 text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[20rem] md:text-[30rem] font-black text-muted/10 leading-none">
            404
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          {/* Image with pin */}
          <div className="relative mb-8">
            <div className="w-64 h-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-border/20">
              <img
                src="/images/hero-3.webp"
                alt="Misty forest landscape"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Location pin */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="relative">
                <MapPin className="w-12 h-12 text-primary fill-primary" />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-background" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8">
            {message}
          </p>

          {/* Button */}
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
      <Logo size="large" color="muted" />
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-5" />
          <span className="text-xl font-semibold">{title}</span>
        </div>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  )
}
