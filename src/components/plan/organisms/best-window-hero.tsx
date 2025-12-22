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

function buildGoogleCalendarUrl(planName: string, startDate: string, endDate: string): string {
  const formatDate = (iso: string) => iso.replace(/-/g, '')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: planName,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
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

  const handleCheckFlights = () => {
    window.open('https://www.google.com/travel/flights', '_blank')
  }

  const handleAddToCalendar = () => {
    const url = buildGoogleCalendarUrl(planName, bestWindow.start, bestWindow.end)
    window.open(url, '_blank')
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
      <Card variant="action" className={cn('p-6 md:p-8', className)}>
        <CardContent className="p-0 flex flex-col items-center text-center gap-4">
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Everyone's in! Your ideal trip dates are:
          </p>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
            {formattedDateRange}
          </h2>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                All {bestWindow.totalCount} people available
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
        </CardContent>
      </Card>

      <Card className={cn('p-6 md:p-8', className)}>
        <CardContent className="p-0 flex flex-col gap-4">
          {showAddAvailability ? (
            <>
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
            </>
          ) : (
            <>
              <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
                Next Steps
              </h3>
              <div className="flex flex-col gap-3">
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
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
