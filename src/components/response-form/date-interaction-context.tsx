import { createContext, useContext, useMemo } from 'react'

import type { ReactNode } from 'react'
import type { DateRange } from '@/lib/types'
import type { DateStatus } from './use-date-interaction'

interface DateInteractionValueContextType {
  startRange: string
  endRange: string
  selectedDatesSet: Set<string>
  rangeStart: Date | null
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  selectedRangeIds: Set<string>
  hasSelectedRanges: boolean
  compatibleWindowsCount: number
}

interface DateInteractionActionsContextType {
  handleDateClick: (date: Date) => void
  markAllAs: (status: DateStatus) => void
  toggleRangeSelection: (rangeId: string) => void
  deleteSelectedRanges: () => void
}

const DateInteractionValueContext = createContext<DateInteractionValueContextType | null>(null)
const DateInteractionActionsContext = createContext<DateInteractionActionsContextType | null>(null)

interface DateInteractionProviderProps
  extends DateInteractionValueContextType,
    DateInteractionActionsContextType {
  children: ReactNode
}

export function DateInteractionProvider({
  children,
  startRange,
  endRange,
  selectedDatesSet,
  rangeStart,
  availableRanges,
  unavailableRanges,
  selectedRangeIds,
  hasSelectedRanges,
  compatibleWindowsCount,
  handleDateClick,
  markAllAs,
  toggleRangeSelection,
  deleteSelectedRanges,
}: DateInteractionProviderProps) {
  const valueContext = useMemo<DateInteractionValueContextType>(
    () => ({
      startRange,
      endRange,
      selectedDatesSet,
      rangeStart,
      availableRanges,
      unavailableRanges,
      selectedRangeIds,
      hasSelectedRanges,
      compatibleWindowsCount,
    }),
    [
      startRange,
      endRange,
      selectedDatesSet,
      rangeStart,
      availableRanges,
      unavailableRanges,
      selectedRangeIds,
      hasSelectedRanges,
      compatibleWindowsCount,
    ]
  )

  const actionsContext = useMemo<DateInteractionActionsContextType>(
    () => ({
      handleDateClick,
      markAllAs,
      toggleRangeSelection,
      deleteSelectedRanges,
    }),
    [handleDateClick, markAllAs, toggleRangeSelection, deleteSelectedRanges]
  )

  return (
    <DateInteractionValueContext.Provider value={valueContext}>
      <DateInteractionActionsContext.Provider value={actionsContext}>
        {children}
      </DateInteractionActionsContext.Provider>
    </DateInteractionValueContext.Provider>
  )
}

export function useDateInteractionValue(): DateInteractionValueContextType {
  const context = useContext(DateInteractionValueContext)
  if (!context) {
    throw new Error('useDateInteractionValue must be used within a DateInteractionProvider')
  }
  return context
}

export function useDateInteractionActions(): DateInteractionActionsContextType {
  const context = useContext(DateInteractionActionsContext)
  if (!context) {
    throw new Error('useDateInteractionActions must be used within a DateInteractionProvider')
  }
  return context
}

export type { DateInteractionValueContextType, DateInteractionActionsContextType }
