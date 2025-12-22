import { useState, useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Fallback copy method for browsers that block the Clipboard API (e.g., Firefox Focus)
 */
function fallbackCopy(text: string): void {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

/**
 * Copy text to clipboard with fallback support
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      fallbackCopy(text)
    }
    return true
  } catch {
    try {
      fallbackCopy(text)
      return true
    } catch {
      return false
    }
  }
}

interface UseCopyToClipboardOptions {
  successMessage?: string
  errorMessage?: string
  resetDelay?: number
}

/**
 * Hook for copying text to clipboard with state management and toast notifications
 */
export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const {
    successMessage = 'Link copied to clipboard!',
    errorMessage = 'Failed to copy link',
    resetDelay = 2000,
  } = options

  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    const success = await copyToClipboard(text)

    if (success) {
      setCopied(true)
      toast.success(successMessage)
      setTimeout(() => setCopied(false), resetDelay)
    } else {
      toast.error(errorMessage)
    }

    return success
  }, [successMessage, errorMessage, resetDelay])

  return { copied, copy }
}

interface ShareData {
  title: string
  text: string
  url: string
}

interface UseShareOptions {
  fallbackToClipboard?: boolean
  errorMessage?: string
}

/**
 * Check if the native share API is available
 */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share
}

/**
 * Hook for native share functionality with clipboard fallback
 */
export function useShare(options: UseShareOptions = {}) {
  const {
    fallbackToClipboard = true,
    errorMessage = 'Failed to share',
  } = options

  const share = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        // User cancelled share - silently ignore
        if ((error as Error).name === 'AbortError') {
          return false
        }
        // Share failed, try clipboard fallback
        if (fallbackToClipboard) {
          const success = await copyToClipboard(data.url)
          if (success) {
            toast.success('Link copied to clipboard!')
          } else {
            toast.error(errorMessage)
          }
          return success
        }
        toast.error(errorMessage)
        return false
      }
    }

    // No native share, use clipboard
    if (fallbackToClipboard) {
      const success = await copyToClipboard(data.url)
      if (success) {
        toast.success('Link copied to clipboard!')
      } else {
        toast.error(errorMessage)
      }
      return success
    }

    return false
  }, [fallbackToClipboard, errorMessage])

  return { share, canShare: canShare() }
}
