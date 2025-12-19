import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RespondentCard } from '../molecules/respondent-card'
import { format, parseISO } from 'date-fns'
import type { CompatibleDateRange, Respondent } from '@/lib/types'

interface ResultsSidebarProps {
  compatibleRanges?: CompatibleDateRange[]
  respondents: Respondent[]
  onShareResults?: () => void
  onCreateNewEvent?: () => void
  onEditResponse?: (respondentId: string) => void
  className?: string
}

export function ResultsSidebar({
  compatibleRanges = [],
  respondents,
  onShareResults,
  onCreateNewEvent,
  onEditResponse,
  className
}: ResultsSidebarProps) {
  const formatDateRange = (start: string, end: string) => {
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
  }

  const calculateDays = (start: string, end: string) => {
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {compatibleRanges.length > 0 && (
        <Card className="bg-surface-dark border border-primary/30 shadow-[0_0_20px_rgba(70,236,19,0.1)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">recommend</span>
              <CardTitle className="text-lg">Compatible Date Ranges</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {compatibleRanges.map((range, index) => {
              const days = calculateDays(range.start, range.end)
              const isBestMatch = range.availableCount === range.totalCount && index === 0

              return (
                <div
                  key={`${range.start}-${range.end}`}
                  className={cn(
                    'p-3 rounded-lg border transition-colors cursor-pointer group',
                    isBestMatch
                      ? 'bg-primary/10 border-primary/20 hover:bg-primary/20'
                      : 'bg-surface-dark border-border hover:border-text-secondary'
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-bold text-sm">
                      {formatDateRange(range.start, range.end)}
                    </span>
                    {isBestMatch && (
                      <Badge className="bg-primary text-surface-dark text-[10px] font-bold px-1.5 py-0.5">
                        Best Match
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span>{days} Days</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      {range.availableCount}/{range.totalCount}
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card className="bg-surface-dark border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary text-sm">
            The group has spoken! Lock it in.
          </p>
          <div className="flex flex-col gap-3">
            {onShareResults && (
              <Button
                onClick={onShareResults}
                className="w-full bg-primary hover:bg-primary/90 text-background-dark shadow-[0_0_15px_rgba(70,236,19,0.3)]"
              >
                <span className="material-symbols-outlined mr-2">ios_share</span>
                Share Results Link
              </Button>
            )}
            {onCreateNewEvent && (
              <Button
                onClick={onCreateNewEvent}
                variant="outline"
                className="w-full border-border hover:border-white hover:text-white"
              >
                <span className="material-symbols-outlined mr-2">add_circle</span>
                Create New Event
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-dark border-border flex-1 h-auto min-h-[300px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Respondents</CardTitle>
            <Badge variant="secondary" className="bg-border text-white">
              {respondents.length}/{respondents.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {respondents.map(respondent => (
              <RespondentCard
                key={respondent.id}
                name={respondent.name}
                availableDates={respondent.availableDates}
                isCurrentUser={respondent.isCurrentUser}
                onClick={onEditResponse ? () => onEditResponse(respondent.id) : undefined}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}