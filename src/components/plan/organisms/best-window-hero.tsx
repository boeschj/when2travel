import { format, parseISO } from 'date-fns'
import { Plane, Calendar, Share2, Users, UserPlus, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useShare } from '@/hooks/use-clipboard'
import type { CompatibleDateRange } from '@/lib/types'

interface BestWindowHeroProps {
  bestWindow: CompatibleDateRange
  planName: string
  onSeeOtherDates: () => void
  showAddAvailability?: boolean
  onAddAvailability?: () => void
  className?: string
}

export function BestWindowHero({
  bestWindow,
  planName,
  onSeeOtherDates,
  showAddAvailability,
  onAddAvailability,
  className
}: BestWindowHeroProps) {
  const { share } = useShare()

  const startDate = parseISO(bestWindow.start)
  const endDate = parseISO(bestWindow.end)
  const formattedDateRange = `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`
  const availabilityLabel = `All ${bestWindow.totalCount} people available`

  const handleCheckFlights = () => {
    window.open('https://www.google.com/travel/flights', '_blank')
  }

  const handleAddToCalendar = () => {
    const googleCalendarUrl = buildGoogleCalendarUrl({
      eventName: planName,
      startDate: bestWindow.start,
      endDate: bestWindow.end,
    })
    window.open(googleCalendarUrl, '_blank')
  }

  const handleShare = () => {
    share({
      title: planName,
      text: `Check out our trip dates: ${formattedDateRange}`,
      url: window.location.href
    })
  }

  return (
    <>
      <DateHighlightCard
        formattedDateRange={formattedDateRange}
        availabilityLabel={availabilityLabel}
        onSeeOtherDates={onSeeOtherDates}
        className={className}
      />

      {showAddAvailability && (
        <AddAvailabilityCard
          onAddAvailability={onAddAvailability}
          className={className}
        />
      )}

      {!showAddAvailability && (
        <NextStepsCard
          onCheckFlights={handleCheckFlights}
          onAddToCalendar={handleAddToCalendar}
          onShare={handleShare}
          className={className}
        />
      )}
    </>
  )
}

interface DateHighlightCardProps {
  formattedDateRange: string
  availabilityLabel: string
  onSeeOtherDates: () => void
  className?: string
}

function DateHighlightCard({ formattedDateRange, availabilityLabel, onSeeOtherDates, className }: DateHighlightCardProps) {
  return (
    <Card variant="action" className={cn('p-6 md:p-8', className)}>
      <CardContent className="p-0 flex flex-col items-center text-center gap-4">
        <p className="text-muted-foreground text-lg md:text-xl font-medium">
          Everyone's in! Your ideal trip dates are:
        </p>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
          {formattedDateRange}
        </h2>

        <AvailabilityInfo
          label={availabilityLabel}
          onSeeOtherDates={onSeeOtherDates}
        />
      </CardContent>
    </Card>
  )
}

interface AvailabilityInfoProps {
  label: string
  onSeeOtherDates: () => void
}

function AvailabilityInfo({ label, onSeeOtherDates }: AvailabilityInfoProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">
          {label}
        </span>
      </div>
      <Button
        variant="link"
        onClick={onSeeOtherDates}
        className="p-0 h-auto underline font-medium"
      >
        See Other Compatible Dates →
      </Button>
    </div>
  )
}

interface AddAvailabilityCardProps {
  onAddAvailability?: () => void
  className?: string
}

function AddAvailabilityCard({ onAddAvailability, className }: AddAvailabilityCardProps) {
  return (
    <Card className={cn('p-6 md:p-8', className)}>
      <CardContent className="p-0 flex flex-col gap-4">
        <AddAvailabilityHeader />
        <p className="text-text-secondary text-sm">
          Let the group know when you're free to travel
        </p>
        <Button
          onClick={onAddAvailability}
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
        >
          Add Dates
          <UserPlus className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}

function AddAvailabilityHeader() {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
        Add Your Availability
      </h3>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-text-secondary hover:text-foreground transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px]">
          Already responded? You may have cleared your browser data or switched browsers. If you see your name below, you're all set!
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

interface NextStepsCardProps {
  onCheckFlights: () => void
  onAddToCalendar: () => void
  onShare: () => void
  className?: string
}

function NextStepsCard({ onCheckFlights, onAddToCalendar, onShare, className }: NextStepsCardProps) {
  return (
    <Card className={cn('p-6 md:p-8', className)}>
      <CardContent className="p-0 flex flex-col gap-4">
        <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
          Next Steps
        </h3>
        <div className="flex flex-col gap-3">
          <Button
            onClick={onCheckFlights}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
          >
            Check Flights
            <Plane className="w-5 h-5 ml-2" />
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onAddToCalendar}
              variant="outline"
              size="lg"
              className="border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add to Cal
            </Button>
            <Button
              onClick={onShare}
              variant="outline"
              size="lg"
              className="border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface GoogleCalendarUrlParams {
  eventName: string
  startDate: string
  endDate: string
}

function buildGoogleCalendarUrl({ eventName, startDate, endDate }: GoogleCalendarUrlParams): string {
  const stripDashes = (isoDate: string) => isoDate.replace(/-/g, '')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventName,
    dates: `${stripDashes(startDate)}/${stripDashes(endDate)}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
