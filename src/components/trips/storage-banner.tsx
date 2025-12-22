import { useAtom } from 'jotai'
import { Cookie, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { tripsBannerDismissedAtom } from '@/lib/atoms'

export function StorageBanner() {
  const [dismissed, setDismissed] = useAtom(tripsBannerDismissedAtom)

  if (dismissed) return null

  return (
    <Alert className="relative pr-12 rounded-lg">
      <Cookie className="h-4 w-4" />
      <AlertDescription>
        <span className="font-semibold text-foreground">Browser Storage:</span>{' '}
        These trips are stored in your browser's local cache. Avoid clearing your browsing data to keep this list, or bookmark your trip links directly.
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute right-3 top-3"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
