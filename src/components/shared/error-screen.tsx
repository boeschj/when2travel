import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from './logo'

interface ErrorScreenProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorScreen({
  title = 'Something went wrong',
  message = 'We couldn\'t load this page. Please try again.',
  onRetry,
}: ErrorScreenProps) {
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
