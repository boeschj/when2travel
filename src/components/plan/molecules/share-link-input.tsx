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
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    if (!navigator.share || !planName) return

    try {
      await navigator.share({
        title: `Join our trip: ${planName}`,
        text: `I'm organizing a trip and would love to know when you're available!`,
        url: link,
      })
    } catch (err) {
      // User cancelled share - silently ignore
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to share')
      }
    }
  }

  return (
    <div className={cn('flex w-full items-center gap-2', className)}>
      <div
        className="relative flex flex-1 items-center rounded-2xl bg-input shadow-inner h-14 group cursor-pointer"
        onClick={handleCopy}
      >
        <Input
          className="w-full bg-transparent border-none text-foreground px-5 text-sm font-medium focus:ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 truncate select-all cursor-pointer pointer-events-none"
          value={link}
          readOnly
          tabIndex={-1}
        />
        <div className="pr-2">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
            size="sm"
            variant={canShare ? 'secondary' : 'default'}
            className="h-10 px-5 rounded-xl"
          >
            {copied ? (
              <Check className="size-4 scale-110" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      {canShare && (
        <Button
          onClick={handleShare}
          size="sm"
          className="h-14 px-5 rounded-2xl shrink-0"
        >
          <Share2 className="size-4" />
          Share
        </Button>
      )}
    </div>
  )
}
