import { buildAbsoluteUrl } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShareLinkInput } from './share-link-input'
import { ShareButton } from './share-button'
import { Share2, CalendarPlus, Eye } from 'lucide-react'

interface SharePanelProps {
  planId: string
  planName: string
  onAddAvailability?: () => void
  onViewAvailability?: () => void
  hasUserResponse?: boolean
  className?: string
}

export function SharePanel({
  planId,
  planName,
  onAddAvailability,
  onViewAvailability,
  hasUserResponse,
  className
}: SharePanelProps) {
  const shareLink = buildShareLink(planId)
  const showAvailabilitySection = Boolean(onAddAvailability || onViewAvailability)

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <Card
        variant="action"
        className={cn('p-6 md:p-8 flex flex-col justify-between', className)}
      >
        <CardContent className="flex flex-col gap-8 p-0">
          <ShareInviteSection shareLink={shareLink} planName={planName} />

          {showAvailabilitySection && (
            <>
              <div className="w-full h-px bg-border" />
              <AvailabilitySection
                hasUserResponse={hasUserResponse}
                onAddAvailability={onAddAvailability}
                onViewAvailability={onViewAvailability}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ShareInviteSectionProps {
  shareLink: string
  planName: string
}

function ShareInviteSection({ shareLink, planName }: ShareInviteSectionProps) {
  const openEmailShare = () => {
    const subject = encodeURIComponent(`Join our trip: ${planName}`)
    const body = encodeURIComponent(
      `I'm organizing a trip and would love to know when you're available!\n\nClick here to add your availability: ${shareLink}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const openWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join our trip: ${planName}!\nAdd your availability here: ${shareLink}`
    )
    window.open(`https://wa.me/?text=${text}`)
  }

  const openTelegramShare = () => {
    const text = encodeURIComponent(
      `Join our trip: ${planName}!\nAdd your availability here:`
    )
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${text}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 text-foreground">
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          <Share2 className="size-5" />
        </div>
        <h3 className="text-xl font-bold">Share Invite Link</h3>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        Copy this unique link to send to your group. Anyone with the link can vote on dates.
      </p>

      <div className="flex flex-col gap-3">
        <ShareLinkInput link={shareLink} planName={planName} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Or share via
        </p>
        <div className="flex gap-3">
          <ShareButton platform="email" onClick={openEmailShare} />
          <ShareButton platform="whatsapp" onClick={openWhatsAppShare} />
          <ShareButton platform="telegram" onClick={openTelegramShare} />
        </div>
      </div>
    </div>
  )
}

interface AvailabilitySectionProps {
  hasUserResponse?: boolean
  onAddAvailability?: () => void
  onViewAvailability?: () => void
}

function AvailabilitySection({
  hasUserResponse,
  onAddAvailability,
  onViewAvailability
}: AvailabilitySectionProps) {
  const statusLabel = hasUserResponse
    ? "You've added your availability"
    : "Action Required"

  const statusDescription = hasUserResponse
    ? "View or edit your submitted dates anytime."
    : "Don't forget to enter your own dates to get the ball rolling!"

  const showPulse = !hasUserResponse

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-1 size-2 rounded-full bg-primary shrink-0',
            showPulse && 'animate-pulse'
          )}
        />
        <div>
          <p className="text-foreground font-bold text-sm">{statusLabel}</p>
          <p className="text-muted-foreground text-xs mt-1">{statusDescription}</p>
        </div>
      </div>

      {hasUserResponse ? (
        <Button
          onClick={onViewAvailability}
          variant="secondary"
          className="w-full font-extrabold text-lg py-4 rounded-full transition-all h-auto"
        >
          <Eye className="size-5 mr-2" />
          View My Availability
        </Button>
      ) : (
        <Button onClick={onAddAvailability} size="cta">
          <CalendarPlus className="size-5 mr-2" />
          Add My Availability
        </Button>
      )}
    </div>
  )
}

function buildShareLink(planId: string) {
  return buildAbsoluteUrl('/plan/$planId/respond', { planId })
}
