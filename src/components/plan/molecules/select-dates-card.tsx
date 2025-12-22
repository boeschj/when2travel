import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { ChevronDown, CheckCircle, Ban, CalendarDays, Trash2 } from 'lucide-react'
import { AvailabilityCalendar } from '../organisms/availability-calendar'
import { formatDateRangeDisplay } from '@/lib/utils'
import type { DateRange } from '@/lib/types'

interface SelectDatesCardProps {
  startRange: string
  endRange: string
  selectedDates: string[]
  compatibleWindowsCount: number
  rangeStart: Date | null
  onDateClick: (date: Date) => void
  onMarkAllAs: (status: 'available' | 'unavailable') => void
  // Manage dates props (for mobile dropdown)
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  selectedRangeIds: Set<string>
  hasSelectedRanges: boolean
  onToggleRangeSelection: (rangeId: string) => void
  onDeleteSelected: () => void
}

export function SelectDatesCard({
  startRange,
  endRange,
  selectedDates,
  compatibleWindowsCount,
  rangeStart,
  onDateClick,
  onMarkAllAs,
  availableRanges,
  unavailableRanges,
  selectedRangeIds,
  hasSelectedRanges,
  onToggleRangeSelection,
  onDeleteSelected
}: SelectDatesCardProps) {
  const hasSelectedDates = selectedDates.length > 0
  const hasAnyRanges = availableRanges.length > 0 || unavailableRanges.length > 0

  return (
    <Card className="p-4 w-fit">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h3 className="text-foreground text-lg font-bold">Set your availability</h3>

        <div className="flex items-center gap-2">
          {/* Mobile: Manage Dates dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 xl:hidden">
                <CalendarDays className="size-4 mr-1" />
                Manage
                <ChevronDown className="size-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Manage Dates</DropdownMenuLabel>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDeleteSelected}
                  className={`h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ${!hasSelectedRanges && 'invisible'}`}
                >
                  <Trash2 className="size-3 mr-1" />
                  Clear
                </Button>
              </div>
              <DropdownMenuSeparator />

              {availableRanges.length > 0 && (
                <>
                  <DropdownMenuLabel>Available Dates</DropdownMenuLabel>
                  {availableRanges.map(range => (
                    <DropdownMenuCheckboxItem
                      key={range.id}
                      checked={selectedRangeIds.has(range.id)}
                      onCheckedChange={() => onToggleRangeSelection(range.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex flex-col">
                        <span>{formatDateRangeDisplay(range)}</span>
                        <span className="text-xs text-muted-foreground">
                          {range.days} {range.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}

              {availableRanges.length > 0 && unavailableRanges.length > 0 && (
                <DropdownMenuSeparator />
              )}

              {unavailableRanges.length > 0 && (
                <>
                  <DropdownMenuLabel>Unavailable Dates</DropdownMenuLabel>
                  {unavailableRanges.map(range => (
                    <DropdownMenuCheckboxItem
                      key={range.id}
                      checked={selectedRangeIds.has(range.id)}
                      onCheckedChange={() => onToggleRangeSelection(range.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex flex-col">
                        <span>{formatDateRangeDisplay(range)}</span>
                        <span className="text-xs text-muted-foreground">
                          {range.days} {range.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}

              {!hasAnyRanges && (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                  No dates selected yet
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Quick actions
                <ChevronDown className="size-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onMarkAllAs('available')}>
                <CheckCircle className="text-primary" />
                Mark all available
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMarkAllAs('unavailable')}>
                <Ban />
                Mark all unavailable
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 -mt-2">
        <p className="text-muted-foreground text-sm">
          Tap once to start a range, tap again to complete it.
        </p>
        <Badge className={`shrink-0 ${!hasSelectedDates ? 'invisible' : compatibleWindowsCount === 0 ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
          {compatibleWindowsCount} compatible {compatibleWindowsCount === 1 ? 'window' : 'windows'}
        </Badge>
      </div>

      <AvailabilityCalendar
        startRange={startRange}
        endRange={endRange}
        selectedDates={selectedDates}
        rangeStart={rangeStart}
        onDateClick={onDateClick}
        mode="select"
        showNavigation={true}
        numberOfMonths={2}
      />
    </Card>
  )
}
