import { Link } from '@tanstack/react-router'
import { Plane } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'

interface WordmarkProps {
  asLink?: boolean
  className?: string
}

export function Wordmark({ asLink = true, className }: WordmarkProps) {
  const content = (
    <>
      <div className="size-8 flex items-center justify-center text-primary">
        <Plane className="size-8" />
      </div>
      <span className="text-lg font-bold leading-tight tracking-[-0.015em]">
        when2travel
      </span>
    </>
  )

  if (asLink) {
    return (
      <Link
        to={ROUTES.HOME}
        className={cn('flex items-center gap-3 text-foreground', className)}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 text-foreground', className)}>
      {content}
    </div>
  )
}
