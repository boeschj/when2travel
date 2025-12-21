import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShareLinkInput } from '../molecules/share-link-input'
import { ShareButton } from '../atoms/share-button'
import { Share2, CalendarPlus } from 'lucide-react'

interface SharePanelProps {
  planId: string
  planName: string
  onAddAvailability?: () => void
  className?: string
}

export function SharePanel({
  planId,
  planName,
  onAddAvailability,
  className
}: SharePanelProps) {
  const shareLink = `${window.location.origin}/plan/${planId}/respond`

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Join our trip: ${planName}`)
    const body = encodeURIComponent(
      `I'm organizing a trip and would love to know when you're available!\n\nClick here to add your availability: ${shareLink}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join our trip: ${planName}!\nAdd your availability here: ${shareLink}`
    )
    window.open(`https://wa.me/?text=${text}`)
  }

  const handleTelegramShare = () => {
    const text = encodeURIComponent(
      `Join our trip: ${planName}!\nAdd your availability here:`
    )
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${text}`)
  }

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <Card
        variant="action"
        className={cn(
          'p-6 md:p-8 flex flex-col justify-between',
          className
        )}
      >
        <CardContent className="flex flex-col gap-8 p-0">
          {/* Share Link Section */}
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
                <ShareButton platform="email" onClick={handleEmailShare} />
                <ShareButton platform="whatsapp" onClick={handleWhatsAppShare} />
                <ShareButton platform="telegram" onClick={handleTelegramShare} />
              </div>
            </div>
          </div>

          {onAddAvailability && (
            <>
              <div className="w-full h-px bg-border" />

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-primary shrink-0 animate-pulse" />
                  <div>
                    <p className="text-foreground font-bold text-sm">Action Required</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Don't forget to enter your own dates to get the ball rolling!
                    </p>
                  </div>
                </div>

                <Button
                  onClick={onAddAvailability}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
                >
                  <CalendarPlus className="size-5 mr-2" />
                  Add My Availability
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
