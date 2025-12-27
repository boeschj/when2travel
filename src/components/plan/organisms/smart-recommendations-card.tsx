import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  CheckCircle2,
  ThumbsUp,
  Users,
  AlertCircle,
  AlertTriangle,
  Plane,
  Calendar,
  Share2,
  UserPlus,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useShare } from '@/hooks/use-clipboard'
import { AlternativeSuggestionsModal } from '@/components/plan/molecules/alternative-suggestions-modal'
import type { RecommendationResult, RecommendationStatus, AlternativeWindow } from '@/lib/recommendation-types'

interface SmartRecommendationsCardProps {
  recommendationResult: RecommendationResult
  planName: string
  isCreator: boolean
  hasResponded: boolean
  currentUserResponseId?: string
  onEditPlan: () => void
  onEditAvailability: () => void
  onEditDuration?: () => void
  className?: string
}

/** Build Google Calendar URL for the best window dates */
function buildGoogleCalendarUrl(planName: string, startDate: string, endDate: string): string {
  const formatDate = (iso: string) => iso.replace(/-/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: planName,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Format date range for display */
function formatDateRangeDisplay(start: string, end: string): string {
  const startDate = parseISO(start)
  const endDate = parseISO(end)
  return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`
}

/** Get icon component for status */
function getStatusIcon(status: RecommendationStatus) {
  switch (status) {
    case 'perfect':
      return CheckCircle2
    case 'great':
      return ThumbsUp
    case 'good':
      return Users
    case 'possible':
      return AlertCircle
    case 'unlikely':
      return AlertTriangle
  }
}

/** Get styling for status */
function getStatusStyles(status: RecommendationStatus) {
  switch (status) {
    case 'perfect':
    case 'great':
      return {
        iconColor: 'text-primary',
        bgColor: 'bg-primary/20',
        accentColor: 'text-primary',
      }
    case 'good':
    case 'possible':
      return {
        iconColor: 'text-status-yellow',
        bgColor: 'bg-status-yellow/20',
        accentColor: 'text-status-yellow',
      }
    case 'unlikely':
      return {
        iconColor: 'text-status-red',
        bgColor: 'bg-status-red/20',
        accentColor: 'text-status-red',
      }
  }
}

export function SmartRecommendationsCard({
  recommendationResult,
  planName,
  isCreator,
  hasResponded,
  currentUserResponseId,
  onEditPlan,
  onEditAvailability,
  onEditDuration,
  className,
}: SmartRecommendationsCardProps) {
  const { share } = useShare()
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false)

  const { primary: recommendation, alternatives } = recommendationResult
  const { status, headline, bestWindow, priority, shorterTripSuggestion } = recommendation

  const StatusIcon = getStatusIcon(status)
  const styles = getStatusStyles(status)
  const hasAlternatives = alternatives.length > 0

  // Determine if current user is the blocker/constrainer for personalized CTAs
  const isCurrentUserBlocker = currentUserResponseId && recommendation.blockerId === currentUserResponseId
  const isCurrentUserConstrainer = currentUserResponseId && recommendation.constrainingPersonIds?.includes(currentUserResponseId)

  // Get personalized CTA based on recommendation type
  const getPersonalizedCTA = (): { label: string; emphasis: boolean } | null => {
    if (isCurrentUserBlocker) {
      if (priority === 2 && recommendation.blockerShiftDirection) {
        const direction = recommendation.blockerShiftDirection === 'earlier' ? 'Earlier' : 'Later'
        return { label: `Shift Your Dates ${direction}`, emphasis: true }
      }
      if (priority === 3) {
        return { label: 'Update Your Dates', emphasis: true }
      }
    }
    if (isCurrentUserConstrainer && priority === 5) {
      return { label: 'Add More Dates', emphasis: true }
    }
    return null
  }

  const personalizedCTA = getPersonalizedCTA()

  const handleCheckFlights = () => {
    window.open('https://www.google.com/travel/flights', '_blank')
  }

  const handleAddToCalendar = () => {
    if (!bestWindow) return
    const url = buildGoogleCalendarUrl(planName, bestWindow.start, bestWindow.end)
    window.open(url, '_blank')
  }

  const handleShare = () => {
    const dateRange = bestWindow
      ? formatDateRangeDisplay(bestWindow.start, bestWindow.end)
      : ''
    share({
      title: planName,
      text: dateRange ? `Check out our trip dates: ${dateRange}` : `Check out our trip plan!`,
      url: window.location.href,
    })
  }

  const isPerfect = status === 'perfect'
  const needsSuggestions = !isPerfect // Show suggestions only when not everyone is available

  // Build availability text for below the date
  const availabilityText = bestWindow
    ? isPerfect
      ? `All ${bestWindow.totalCount} ${bestWindow.totalCount === 1 ? 'person' : 'people'} available`
      : `${bestWindow.availableCount}/${bestWindow.totalCount} ${bestWindow.totalCount === 1 ? 'person' : 'people'} available`
    : null

  return (
    <>
      {/* Combined recommendation + actions card */}
      <Card
        variant="action"
        className={cn('p-6 md:p-8 h-full', className)}
      >
        <CardContent className="p-0 flex flex-col items-center text-center gap-4">
          {/* Status icon and headline */}
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              styles.bgColor
            )}
          >
            <StatusIcon className={cn('w-8 h-8', styles.iconColor)} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{headline}</h2>

          {/* Static subtitle */}
          <p className="text-lg text-text-secondary">Your ideal trip dates are:</p>

          {/* Date display - always show */}
          {bestWindow && (
            <h3 className="text-4xl md:text-5xl lg:text-5xl font-black text-foreground tracking-tight">
              {formatDateRangeDisplay(bestWindow.start, bestWindow.end)}
            </h3>
          )}

          {/* Availability with dynamic icon - always show */}
          {availabilityText && (
            <>
              <Separator className="w-full max-w-lg" />
              <div className="flex items-center gap-2">
                <StatusIcon className={cn('w-5 h-5', styles.iconColor)} />
                <span className="text-foreground font-bold">{availabilityText}</span>
              </div>
              <Separator className="w-full max-w-lg" />
            </>
          )}

          {/* Recommendation message - only show if not perfect */}
          {needsSuggestions && (
            <div className="bg-surface-darker rounded-lg p-4 max-w-lg w-full text-left">
              <p className="text-foreground">{recommendation.recommendation}</p>
              {recommendation.secondary && (
                <p className="text-text-secondary mt-2 text-sm">{recommendation.secondary}</p>
              )}
              {hasAlternatives && (
                <Button
                  variant="link"
                  onClick={() => setIsSuggestionsModalOpen(true)}
                  className="p-0 h-auto font-medium text-primary mt-3"
                >
                  See Alternatives →
                </Button>
              )}
            </div>
          )}

          {/* Alternative windows - only show if not perfect */}
          {needsSuggestions && recommendation.alternativeWindows &&
            recommendation.alternativeWindows.length > 0 &&
            priority !== 4 && (
              <AlternativeWindowsList windows={recommendation.alternativeWindows} />
            )}

          {/* P4: Shorter trip windows - only show if not perfect */}
          {needsSuggestions && priority === 4 && shorterTripSuggestion && (
            <div className="w-full max-w-lg">
              <p className="text-text-secondary text-sm mb-2">
                Perfect {shorterTripSuggestion.duration}-day windows:
              </p>
              <AlternativeWindowsList windows={shorterTripSuggestion.windows} />
            </div>
          )}

          {/* Actions section */}
          <div className="w-full max-w-lg pt-2 flex flex-col gap-3">
            {/* P4: Show edit duration CTA */}
            {priority === 4 && shorterTripSuggestion && onEditDuration && (
              <>
                <Button
                  onClick={onEditDuration}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
                >
                  Change to {shorterTripSuggestion.duration} Days
                  <Pencil className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={onEditAvailability}
                  variant="outline"
                  size="lg"
                  className="w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
                >
                  Edit Availability
                </Button>
              </>
            )}

            {/* Perfect match + responded: flights/calendar/share */}
            {isPerfect && hasResponded && (
              <>
                <Button
                  onClick={handleCheckFlights}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
                >
                  Check Flights
                  <Plane className="w-5 h-5 ml-2" />
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddToCalendar}
                    variant="outline"
                    size="lg"
                    className="border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Cal
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                    className="border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </>
            )}

            {/* User hasn't responded yet */}
            {!hasResponded && priority !== 4 && (
              <>
                <Button
                  onClick={onEditAvailability}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
                >
                  Add Dates
                  <UserPlus className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </>
            )}

            {/* User is the blocker/constrainer */}
            {hasResponded && !isPerfect && personalizedCTA && priority !== 4 && (
              <>
                <Button
                  onClick={onEditAvailability}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
                >
                  {personalizedCTA.label}
                  <Pencil className="w-5 h-5 ml-2" />
                </Button>
                {isCreator ? (
                  <Button
                    onClick={onEditPlan}
                    variant="outline"
                    size="lg"
                    className="w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
                  >
                    Edit Plan
                  </Button>
                ) : (
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                    className="w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
              </>
            )}

            {/* User has responded but not perfect, no personalized CTA */}
            {hasResponded && !isPerfect && !personalizedCTA && priority !== 4 && (
              <>
                <Button
                  onClick={onEditAvailability}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
                >
                  Edit Availability
                  <Pencil className="w-5 h-5 ml-2" />
                </Button>
                {isCreator ? (
                  <Button
                    onClick={onEditPlan}
                    variant="outline"
                    size="lg"
                    className="w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
                  >
                    Edit Plan
                  </Button>
                ) : (
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                    className="w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternative suggestions modal */}
      <AlternativeSuggestionsModal
        open={isSuggestionsModalOpen}
        onOpenChange={setIsSuggestionsModalOpen}
        alternatives={alternatives}
      />
    </>
  )
}

/** Display list of alternative windows (informational only) */
function AlternativeWindowsList({ windows }: { windows: AlternativeWindow[] }) {
  if (windows.length === 0) return null

  return (
    <div className="text-sm text-text-secondary">
      <span className="font-medium">Other options: </span>
      {windows.map((w, i) => (
        <span key={`${w.start}-${w.end}`}>
          {i > 0 && ', '}
          {formatDateRangeDisplay(w.start, w.end)} ({w.percentage}%)
        </span>
      ))}
    </div>
  )
}
