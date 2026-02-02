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
import { cn, pluralize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useShare } from '@/hooks/use-clipboard'
import { AlternativeSuggestionsModal } from './alternative-suggestions-modal'

import { RECOMMENDATION_STATUS } from './recommendation-types'

import type { RecommendationResult, RecommendationStatus, AlternativeWindow } from './recommendation-types'

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
  const statusStyles = getStatusStyles(status)
  const hasAlternatives = alternatives.length > 0
  const isPerfect = status === RECOMMENDATION_STATUS.PERFECT
  const needsSuggestions = !isPerfect

  const isCurrentUserBlocker = currentUserResponseId === recommendation.blockerId
  const isCurrentUserConstrainer = !!currentUserResponseId && !!recommendation.constrainingPersonIds?.includes(currentUserResponseId)
  const personalizedCTA = derivePersonalizedCTA({
    isCurrentUserBlocker,
    isCurrentUserConstrainer,
    priority,
    blockerShiftDirection: recommendation.blockerShiftDirection,
  })

  const isDurationTooLong = priority === 4
  const showDurationEditCTA = isDurationTooLong && !!shorterTripSuggestion && !!onEditDuration
  const showPerfectMatchActions = isPerfect && hasResponded
  const showAddDatesPrompt = !hasResponded && !isDurationTooLong
  const showBlockerCTA = hasResponded && !isPerfect && !!personalizedCTA && !isDurationTooLong
  const showGenericEditCTA = hasResponded && !isPerfect && !personalizedCTA && !isDurationTooLong

  const dateRangeDisplay = bestWindow && formatDateRangeDisplay(bestWindow.start, bestWindow.end)
  const availabilityText = deriveAvailabilityText(bestWindow, isPerfect)

  const showAlternativeWindows = needsSuggestions && !!recommendation.alternativeWindows?.length && !isDurationTooLong
  const showShorterTripWindows = needsSuggestions && isDurationTooLong && !!shorterTripSuggestion

  const handleCheckFlights = () => {
    window.open('https://www.google.com/travel/flights', '_blank')
  }

  const handleAddToCalendar = () => {
    if (!bestWindow) return
    const calendarUrl = buildGoogleCalendarUrl(planName, bestWindow.start, bestWindow.end)
    window.open(calendarUrl, '_blank')
  }

  const handleShare = () => {
    const shareText = dateRangeDisplay
      ? `Check out our trip dates: ${dateRangeDisplay}`
      : 'Check out our trip plan!'
    share({ title: planName, text: shareText, url: window.location.href })
  }

  const handleOpenSuggestions = () => setIsSuggestionsModalOpen(true)

  return (
    <>
      <Card variant="action" className={cn('p-6 md:p-8 h-full', className)}>
        <CardContent className="p-0 flex flex-col items-center text-center gap-4">
          <StatusIconBadge icon={StatusIcon} bgColor={statusStyles.bgColor} iconColor={statusStyles.iconColor} />
          <HeadlineText text={headline} />
          <p className="text-lg text-text-secondary">Your ideal trip dates are:</p>
          {dateRangeDisplay && <DateRangeDisplay dateRange={dateRangeDisplay} />}

          {availabilityText && (
            <AvailabilitySection icon={StatusIcon} iconColor={statusStyles.iconColor} text={availabilityText} />
          )}

          {needsSuggestions && (
            <SuggestionBox
              recommendationText={recommendation.recommendation}
              secondaryText={recommendation.secondary}
              hasAlternatives={hasAlternatives}
              onSeeAlternatives={handleOpenSuggestions}
            />
          )}

          {showAlternativeWindows && recommendation.alternativeWindows && (
            <AlternativeWindowsList windows={recommendation.alternativeWindows} />
          )}

          {showShorterTripWindows && shorterTripSuggestion && (
            <ShorterTripSection duration={shorterTripSuggestion.duration} windows={shorterTripSuggestion.windows} />
          )}

          <div className="w-full max-w-lg pt-2 flex flex-col gap-3">
            {showDurationEditCTA && shorterTripSuggestion && onEditDuration && (
              <DurationEditActions
                duration={shorterTripSuggestion.duration}
                onEditDuration={onEditDuration}
                onEditAvailability={onEditAvailability}
              />
            )}

            {showPerfectMatchActions && (
              <PerfectMatchActions
                onCheckFlights={handleCheckFlights}
                onAddToCalendar={handleAddToCalendar}
                onShare={handleShare}
              />
            )}

            {showAddDatesPrompt && (
              <AddDatesActions onEditAvailability={onEditAvailability} onShare={handleShare} />
            )}

            {showBlockerCTA && personalizedCTA && (
              <BlockerActions
                label={personalizedCTA.label}
                isCreator={isCreator}
                onEditAvailability={onEditAvailability}
                onEditPlan={onEditPlan}
                onShare={handleShare}
              />
            )}

            {showGenericEditCTA && (
              <GenericEditActions
                isCreator={isCreator}
                onEditAvailability={onEditAvailability}
                onEditPlan={onEditPlan}
                onShare={handleShare}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <AlternativeSuggestionsModal
        open={isSuggestionsModalOpen}
        onOpenChange={setIsSuggestionsModalOpen}
        alternatives={alternatives}
      />
    </>
  )
}

const OUTLINE_BUTTON_CLASS = 'w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3'

interface StatusIconBadgeProps {
  icon: React.ElementType
  bgColor: string
  iconColor: string
}

function StatusIconBadge({ icon: Icon, bgColor, iconColor }: StatusIconBadgeProps) {
  return (
    <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', bgColor)}>
      <Icon className={cn('w-8 h-8', iconColor)} />
    </div>
  )
}

function HeadlineText({ text }: { text: string }) {
  return <h2 className="text-2xl md:text-3xl font-bold text-foreground">{text}</h2>
}

function DateRangeDisplay({ dateRange }: { dateRange: string }) {
  return (
    <h3 className="text-4xl md:text-5xl lg:text-5xl font-black text-foreground tracking-tight">
      {dateRange}
    </h3>
  )
}

interface AvailabilitySectionProps {
  icon: React.ElementType
  iconColor: string
  text: string
}

function AvailabilitySection({ icon: Icon, iconColor, text }: AvailabilitySectionProps) {
  return (
    <>
      <Separator className="w-full max-w-lg" />
      <div className="flex items-center gap-2">
        <Icon className={cn('w-5 h-5', iconColor)} />
        <span className="text-foreground font-bold">{text}</span>
      </div>
      <Separator className="w-full max-w-lg" />
    </>
  )
}

interface SuggestionBoxProps {
  recommendationText: string
  secondaryText?: string
  hasAlternatives: boolean
  onSeeAlternatives: () => void
}

function SuggestionBox({ recommendationText, secondaryText, hasAlternatives, onSeeAlternatives }: SuggestionBoxProps) {
  return (
    <div className="bg-surface-darker rounded-lg p-4 max-w-lg w-full text-left">
      <p className="text-foreground">{recommendationText}</p>
      {secondaryText && <p className="text-text-secondary mt-2 text-sm">{secondaryText}</p>}
      {hasAlternatives && (
        <Button variant="link" onClick={onSeeAlternatives} className="p-0 h-auto font-medium text-primary mt-3">
          See Alternatives →
        </Button>
      )}
    </div>
  )
}

interface ShorterTripSectionProps {
  duration: number
  windows: AlternativeWindow[]
}

function ShorterTripSection({ duration, windows }: ShorterTripSectionProps) {
  return (
    <div className="w-full max-w-lg">
      <p className="text-text-secondary text-sm mb-2">Perfect {duration}-day windows:</p>
      <AlternativeWindowsList windows={windows} />
    </div>
  )
}

function AlternativeWindowsList({ windows }: { windows: AlternativeWindow[] }) {
  if (windows.length === 0) return null

  return (
    <div className="text-sm text-text-secondary">
      <span className="font-medium">Other options: </span>
      {windows.map((alternativeWindow, index) => (
        <span key={`${alternativeWindow.start}-${alternativeWindow.end}`}>
          {index > 0 && ', '}
          {formatDateRangeDisplay(alternativeWindow.start, alternativeWindow.end)} ({alternativeWindow.percentage}%)
        </span>
      ))}
    </div>
  )
}

interface DurationEditActionsProps {
  duration: number
  onEditDuration: () => void
  onEditAvailability: () => void
}

function DurationEditActions({ duration, onEditDuration, onEditAvailability }: DurationEditActionsProps) {
  return (
    <>
      <Button onClick={onEditDuration} size="cta">
        Change to {duration} Days
        <Pencil className="w-5 h-5 ml-2" />
      </Button>
      <Button onClick={onEditAvailability} variant="outline" size="lg" className={OUTLINE_BUTTON_CLASS}>
        Edit Availability
      </Button>
    </>
  )
}

interface PerfectMatchActionsProps {
  onCheckFlights: () => void
  onAddToCalendar: () => void
  onShare: () => void
}

function PerfectMatchActions({ onCheckFlights, onAddToCalendar, onShare }: PerfectMatchActionsProps) {
  return (
    <>
      <Button onClick={onCheckFlights} size="cta">
        Check Flights
        <Plane className="w-5 h-5 ml-2" />
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onAddToCalendar} variant="outline" size="lg" className="border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3">
          <Calendar className="w-4 h-4 mr-2" />
          Add to Cal
        </Button>
        <Button onClick={onShare} variant="outline" size="lg" className="border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </>
  )
}

function AddDatesActions({ onEditAvailability, onShare }: { onEditAvailability: () => void; onShare: () => void }) {
  return (
    <>
      <Button onClick={onEditAvailability} size="cta">
        Add Dates
        <UserPlus className="w-5 h-5 ml-2" />
      </Button>
      <Button onClick={onShare} variant="outline" size="lg" className={OUTLINE_BUTTON_CLASS}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </>
  )
}

interface SecondaryActionButtonProps {
  isCreator: boolean
  onEditPlan: () => void
  onShare: () => void
}

function SecondaryActionButton({ isCreator, onEditPlan, onShare }: SecondaryActionButtonProps) {
  if (isCreator) {
    return (
      <Button onClick={onEditPlan} variant="outline" size="lg" className={OUTLINE_BUTTON_CLASS}>
        Edit Plan
      </Button>
    )
  }

  return (
    <Button onClick={onShare} variant="outline" size="lg" className={OUTLINE_BUTTON_CLASS}>
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  )
}

interface BlockerActionsProps {
  label: string
  isCreator: boolean
  onEditAvailability: () => void
  onEditPlan: () => void
  onShare: () => void
}

function BlockerActions({ label, isCreator, onEditAvailability, onEditPlan, onShare }: BlockerActionsProps) {
  return (
    <>
      <Button onClick={onEditAvailability} size="cta">
        {label}
        <Pencil className="w-5 h-5 ml-2" />
      </Button>
      <SecondaryActionButton isCreator={isCreator} onEditPlan={onEditPlan} onShare={onShare} />
    </>
  )
}

interface GenericEditActionsProps {
  isCreator: boolean
  onEditAvailability: () => void
  onEditPlan: () => void
  onShare: () => void
}

function GenericEditActions({ isCreator, onEditAvailability, onEditPlan, onShare }: GenericEditActionsProps) {
  return (
    <>
      <Button onClick={onEditAvailability} size="cta">
        Edit Availability
        <Pencil className="w-5 h-5 ml-2" />
      </Button>
      <SecondaryActionButton isCreator={isCreator} onEditPlan={onEditPlan} onShare={onShare} />
    </>
  )
}

function buildGoogleCalendarUrl(planName: string, startDate: string, endDate: string): string {
  const formatDateForCalendar = (iso: string) => iso.replace(/-/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: planName,
    dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function formatDateRangeDisplay(start: string, end: string): string {
  const startDate = parseISO(start)
  const endDate = parseISO(end)
  return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`
}

function getStatusIcon(status: RecommendationStatus) {
  switch (status) {
    case RECOMMENDATION_STATUS.PERFECT:
      return CheckCircle2
    case RECOMMENDATION_STATUS.GREAT:
      return ThumbsUp
    case RECOMMENDATION_STATUS.GOOD:
      return Users
    case RECOMMENDATION_STATUS.POSSIBLE:
      return AlertCircle
    case RECOMMENDATION_STATUS.UNLIKELY:
      return AlertTriangle
  }
}

function getStatusStyles(status: RecommendationStatus) {
  switch (status) {
    case RECOMMENDATION_STATUS.PERFECT:
    case RECOMMENDATION_STATUS.GREAT:
      return { iconColor: 'text-primary', bgColor: 'bg-primary/20', accentColor: 'text-primary' }
    case RECOMMENDATION_STATUS.GOOD:
    case RECOMMENDATION_STATUS.POSSIBLE:
      return { iconColor: 'text-status-yellow', bgColor: 'bg-status-yellow/20', accentColor: 'text-status-yellow' }
    case RECOMMENDATION_STATUS.UNLIKELY:
      return { iconColor: 'text-status-red', bgColor: 'bg-status-red/20', accentColor: 'text-status-red' }
  }
}

interface PersonalizedCTAInput {
  isCurrentUserBlocker: boolean
  isCurrentUserConstrainer: boolean
  priority: number
  blockerShiftDirection?: string
}

interface PersonalizedCTAResult {
  label: string
  emphasis: boolean
}

function derivePersonalizedCTA({ isCurrentUserBlocker, isCurrentUserConstrainer, priority, blockerShiftDirection }: PersonalizedCTAInput): PersonalizedCTAResult | null {
  if (isCurrentUserBlocker) {
    if (priority === 2 && blockerShiftDirection) {
      const directionLabel = blockerShiftDirection === 'earlier' ? 'Earlier' : 'Later'
      return { label: `Shift Your Dates ${directionLabel}`, emphasis: true }
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

function deriveAvailabilityText(
  bestWindow: { totalCount: number; availableCount: number } | undefined,
  isPerfect: boolean,
): string | null {
  if (!bestWindow) return null

  if (isPerfect) {
    return `All ${bestWindow.totalCount} ${pluralize(bestWindow.totalCount, 'person', 'people')} available`
  }

  return `${bestWindow.availableCount}/${bestWindow.totalCount} ${pluralize(bestWindow.totalCount, 'person', 'people')} available`
}
