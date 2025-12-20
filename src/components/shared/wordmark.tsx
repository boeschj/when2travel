import { Link } from '@tanstack/react-router'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'
import Logo from './logo'

const wordmarkVariants = cva(
  'flex items-center',
  {
    variants: {
      size: {
        small: 'gap-2',
        medium: 'gap-3',
        large: 'gap-4',
      },
      color: {
        primary: 'text-foreground',
        foreground: 'text-foreground',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
      },
    },
    defaultVariants: {
      size: 'medium',
      color: 'primary',
    }
  }
)

const textVariants = cva(
  'font-bold leading-tight tracking-[-0.015em]',
  {
    variants: {
      size: {
        small: 'text-lg',
        medium: 'text-2xl',
        large: 'text-3xl',
      },
    },
    defaultVariants: {
      size: 'medium',
    }
  }
)

export type WordmarkProps = VariantProps<typeof wordmarkVariants> & {
  asLink?: boolean
  className?: string
}

export function Wordmark({
  asLink = true,
  size = 'medium',
  color = 'primary',
  className
}: WordmarkProps) {
  const content = (
    <>
      <Logo size={size} color={color} />
      <span className={textVariants({ size })}>
      PlanTheTrip
      </span>
    </>
  )

  if (asLink) {
    return (
      <Link
        to={ROUTES.HOME}
        className={cn(wordmarkVariants({ size, color }), className)}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={cn(wordmarkVariants({ size, color }), className)}>
      {content}
    </div>
  )
}
