import { useState, useCallback } from 'react'
import { toast } from 'sonner'

function createHiddenTextArea(text: string): HTMLTextAreaElement {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  return textArea
}

function copyViaLegacyTextArea(text: string): boolean {
  const textArea = createHiddenTextArea(text)
  document.body.appendChild(textArea)
  textArea.select()
  const didCopy = document.execCommand('copy')
  document.body.removeChild(textArea)
  return didCopy
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    return copyViaLegacyTextArea(text)
  } catch {
    try {
      return copyViaLegacyTextArea(text)
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

export function useCopyToClipboard(options?: UseCopyToClipboardOptions) {
  const successMessage = options?.successMessage ?? 'Link copied to clipboard!'
  const errorMessage = options?.errorMessage ?? 'Failed to copy link'
  const resetDelay = options?.resetDelay ?? 2000

  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    const didCopy = await copyToClipboard(text)

    if (didCopy) {
      setCopied(true)
      toast.success(successMessage)
      setTimeout(() => setCopied(false), resetDelay)
    } else {
      toast.error(errorMessage)
    }

    return didCopy
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

export function canShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share
}

async function copyUrlWithToast(url: string, errorMessage: string): Promise<boolean> {
  const didCopy = await copyToClipboard(url)

  if (didCopy) {
    toast.success('Link copied to clipboard!')
  } else {
    toast.error(errorMessage)
  }

  return didCopy
}

export function useShare(options?: UseShareOptions) {
  const fallbackToClipboard = options?.fallbackToClipboard ?? true
  const errorMessage = options?.errorMessage ?? 'Failed to share'

  const share = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        const isUserCancellation = error instanceof Error && error.name === 'AbortError'
        if (isUserCancellation) return false

        if (fallbackToClipboard) {
          return copyUrlWithToast(data.url, errorMessage)
        }

        toast.error(errorMessage)
        return false
      }
    }

    if (fallbackToClipboard) {
      return copyUrlWithToast(data.url, errorMessage)
    }

    return false
  }, [fallbackToClipboard, errorMessage])

  return { share, canShare: canShare() }
}
