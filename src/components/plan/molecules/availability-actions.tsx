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
import { formatDateRangeDisplay, cn, pluralize } from '@/lib/utils'
import type { DateRange } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

/** ManageDatesDropdown - Dropdown for viewing and managing selected date ranges */

interface DateRangeCheckboxItemProps {
  range: DateRange
  checked: boolean
  onToggle: () => void
}

function DateRangeCheckboxItem({
  range,
  checked,
  onToggle
}: DateRangeCheckboxItemProps) {
  const dateRangeDisplay = formatDateRangeDisplay(range)
  const dayCountLabel = `${range.days} ${pluralize(range.days, 'day')}`

  return (
    <DropdownMenuCheckboxItem
      checked={checked}
      onCheckedChange={onToggle}
      onSelect={(e) => e.preventDefault()}
    >
      <div className="flex flex-col">
        <span>{dateRangeDisplay}</span>
        <span className="text-xs text-muted-foreground">{dayCountLabel}</span>
      </div>
    </DropdownMenuCheckboxItem>
  )
}

interface ManageDatesDropdownHeaderProps {
  hasSelectedRanges: boolean
  onDeleteSelected: () => void
}

function ManageDatesDropdownHeader({
  hasSelectedRanges,
  onDeleteSelected
}: ManageDatesDropdownHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <DropdownMenuLabel className="p-0">Manage Dates</DropdownMenuLabel>
      <Button
        variant="outline"
        size="sm"
        onClick={onDeleteSelected}
        className={cn(
          'h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10',
          !hasSelectedRanges && 'invisible'
        )}
      >
        <Trash2 className="size-3 mr-1" />
        Clear
      </Button>
    </div>
  )
}

interface DateRangeSectionProps {
  label: string
  ranges: DateRange[]
  selectedRangeIds: Set<string>
  onToggleRangeSelection: (rangeId: string) => void
}

function DateRangeSection({
  label,
  ranges,
  selectedRangeIds,
  onToggleRangeSelection
}: DateRangeSectionProps) {
  return (
    <>
      <DropdownMenuLabel>{label}</DropdownMenuLabel>
      {ranges.map(range => (
        <DateRangeCheckboxItem
          key={range.id}
          range={range}
          checked={selectedRangeIds.has(range.id)}
          onToggle={() => onToggleRangeSelection(range.id)}
        />
      ))}
    </>
  )
}

function EmptyDatesState() {
  return (
    <div className="px-2 py-3 text-sm text-muted-foreground text-center">
      No dates selected yet
    </div>
  )
}

interface ManageDatesDropdownProps {
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  selectedRangeIds: Set<string>
  hasSelectedRanges: boolean
  hasAnyRanges: boolean
  onToggleRangeSelection: (rangeId: string) => void
  onDeleteSelected: () => void
}

function ManageDatesDropdown({
  availableRanges,
  unavailableRanges,
  selectedRangeIds,
  hasSelectedRanges,
  hasAnyRanges,
  onToggleRangeSelection,
  onDeleteSelected
}: ManageDatesDropdownProps) {
  const hasAvailableRanges = availableRanges.length > 0
  const hasUnavailableRanges = unavailableRanges.length > 0
  const shouldShowSeparator = hasAvailableRanges && hasUnavailableRanges

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 xl:hidden">
          <CalendarDays className="size-4 mr-1" />
          <span>Manage</span>
          <ChevronDown className="size-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <ManageDatesDropdownHeader
          hasSelectedRanges={hasSelectedRanges}
          onDeleteSelected={onDeleteSelected}
        />
        <DropdownMenuSeparator />

        {hasAvailableRanges && (
          <DateRangeSection
            label="Available Dates"
            ranges={availableRanges}
            selectedRangeIds={selectedRangeIds}
            onToggleRangeSelection={onToggleRangeSelection}
          />
        )}

        {shouldShowSeparator && <DropdownMenuSeparator />}

        {hasUnavailableRanges && (
          <DateRangeSection
            label="Unavailable Dates"
            ranges={unavailableRanges}
            selectedRangeIds={selectedRangeIds}
            onToggleRangeSelection={onToggleRangeSelection}
          />
        )}

        {!hasAnyRanges && <EmptyDatesState />}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** QuickActionsDropdown - Dropdown for bulk availability actions */

const QUICK_ACTIONS = [
  {
    status: 'available' as const,
    icon: CheckCircle,
    label: 'Mark all available',
    iconClassName: 'text-primary'
  },
  {
    status: 'unavailable' as const,
    icon: Ban,
    label: 'Mark all unavailable',
    iconClassName: ''
  }
] as const

interface QuickActionMenuItemProps {
  status: 'available' | 'unavailable'
  icon: LucideIcon
  label: string
  iconClassName: string
  onMarkAllAs: (status: 'available' | 'unavailable') => void
}

function QuickActionMenuItem({
  status,
  icon: Icon,
  label,
  iconClassName,
  onMarkAllAs
}: QuickActionMenuItemProps) {
  const handleClick = () => onMarkAllAs(status)

  return (
    <DropdownMenuItem onClick={handleClick}>
      <Icon className={iconClassName} />
      {label}
    </DropdownMenuItem>
  )
}

interface QuickActionsDropdownProps {
  onMarkAllAs: (status: 'available' | 'unavailable') => void
}

function QuickActionsDropdown({ onMarkAllAs }: QuickActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <span>Quick actions</span>
          <ChevronDown className="size-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {QUICK_ACTIONS.map(action => (
          <QuickActionMenuItem
            key={action.status}
            {...action}
            onMarkAllAs={onMarkAllAs}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** AvailabilityActions - Main export combining manage and quick action dropdowns */

interface AvailabilityActionsProps {
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  selectedRangeIds: Set<string>
  hasSelectedRanges: boolean
  hasAnyRanges: boolean
  onToggleRangeSelection: (rangeId: string) => void
  onDeleteSelected: () => void
  onMarkAllAs: (status: 'available' | 'unavailable') => void
}

export function AvailabilityActions({
  availableRanges,
  unavailableRanges,
  selectedRangeIds,
  hasSelectedRanges,
  hasAnyRanges,
  onToggleRangeSelection,
  onDeleteSelected,
  onMarkAllAs
}: AvailabilityActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ManageDatesDropdown
        availableRanges={availableRanges}
        unavailableRanges={unavailableRanges}
        selectedRangeIds={selectedRangeIds}
        hasSelectedRanges={hasSelectedRanges}
        hasAnyRanges={hasAnyRanges}
        onToggleRangeSelection={onToggleRangeSelection}
        onDeleteSelected={onDeleteSelected}
      />
      <QuickActionsDropdown onMarkAllAs={onMarkAllAs} />
    </div>
  )
}
