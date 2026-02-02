import { useBlocker } from '@tanstack/react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface NavigationBlockerProps {
  shouldBlock: boolean
  onDiscard: () => void
}

export function NavigationBlocker({ shouldBlock, onDiscard }: NavigationBlockerProps) {
  const { proceed, reset, status } = useBlocker({ shouldBlockFn: () => shouldBlock, enableBeforeUnload: shouldBlock, withResolver: true })

  const isBlocked = status === 'blocked'

  const handleDiscard = () => {
    onDiscard()
    proceed?.()
  }

  return (
    <AlertDialog open={isBlocked} onOpenChange={(open) => !open && reset?.()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. If you leave now, your edits will be discarded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => reset?.()}>Go Back</AlertDialogCancel>
          <AlertDialogAction onClick={handleDiscard}>Discard Changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
