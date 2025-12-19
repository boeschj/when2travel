import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Copy, Check, Share2 } from 'lucide-react'

interface ShareLinkInputProps {
  link: string
  planName?: string
  className?: string
}

export function ShareLinkInput({
  link,
  planName,
  className
}: ShareLinkInputProps) {
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator !== 'undefined' && !!navigator.share && !!planName

  const handleCopy = async () => {
    // Try native share API first if available
    if (navigator.share && planName) {
      try {
        await navigator.share({
          title: `Join our trip: ${planName}`,
          text: `I'm organizing a trip and would love to know when you're available!`,
          url: link,
        })
        return
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        if ((err as Error).name === 'AbortError') return
      }
    }

    // Fall back to clipboard copy
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <div
      className={cn(
        'relative flex w-full items-center rounded-2xl bg-input shadow-inner h-14 group',
        'focus-within:ring-2 focus-within:ring-primary/50 transition-all',
        className
      )}
    >
      <Input
        className="w-full bg-transparent border-none text-foreground px-5 text-sm font-medium focus:ring-0 placeholder:text-muted-foreground/50 truncate"
        value={link}
        readOnly
        onClick={(e) => e.currentTarget.select()}
      />
      <div className="pr-2">
        <Button
          onClick={handleCopy}
          size="sm"
          className="h-10 px-5 rounded-xl"
        >
          {copied ? (
            <Check className={cn('size-4 transition-transform', copied && 'scale-110')} />
          ) : canShare ? (
            <Share2 className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
          {copied ? 'Copied!' : canShare ? 'Share' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
