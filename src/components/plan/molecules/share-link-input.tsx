import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Share2 } from 'lucide-react'
import { useCopyToClipboard, useShare } from '@/hooks/use-clipboard'

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
  const { copied, copy } = useCopyToClipboard()
  const { share, canShare } = useShare()

  const handleCopy = () => copy(link)

  const handleShare = () => {
    if (!planName) return
    share({
      title: `Join our trip: ${planName}`,
      text: `I'm organizing a trip and would love to know when you're available!`,
      url: link,
    })
  }

  const showShareButton = canShare && !!planName

  let copyIcon = <Copy className="size-4" />
  let copyLabel = 'Copy'
  if (copied) {
    copyIcon = <Check className="size-4 scale-110" />
    copyLabel = 'Copied!'
  }

  let copyVariant: 'secondary' | 'default' = 'default'
  if (showShareButton) {
    copyVariant = 'secondary'
  }

  const handleCopyButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleCopy()
  }

  return (
    <div className={cn('flex w-full items-center gap-2', className)}>
      <LinkDisplay link={link} onClick={handleCopy}>
        <CopyButton
          onClick={handleCopyButtonClick}
          variant={copyVariant}
          icon={copyIcon}
          label={copyLabel}
        />
      </LinkDisplay>
      {showShareButton && (
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

interface LinkDisplayProps {
  link: string
  onClick: () => void
  children: React.ReactNode
}

function LinkDisplay({ link, onClick, children }: LinkDisplayProps) {
  return (
    <div
      className="relative flex flex-1 items-center rounded-2xl bg-input shadow-inner h-14 group cursor-pointer"
      onClick={onClick}
    >
      <Input
        className="w-full bg-transparent border-none text-foreground px-5 text-sm font-medium focus:ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 truncate select-all cursor-pointer pointer-events-none"
        value={link}
        readOnly
        tabIndex={-1}
        hideHelperText
      />
      <div className="pr-2">
        {children}
      </div>
    </div>
  )
}

interface CopyButtonProps {
  onClick: (e: React.MouseEvent) => void
  variant: 'secondary' | 'default'
  icon: React.ReactNode
  label: string
}

function CopyButton({ onClick, variant, icon, label }: CopyButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      variant={variant}
      className="h-10 px-5 rounded-xl"
    >
      {icon}
      {label}
    </Button>
  )
}
