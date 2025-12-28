import { useState, useMemo, useCallback } from 'react'
import { eachDayOfInterval, parseISO, format, isWithinInterval } from 'date-fns'
import { groupDatesIntoRanges } from '@/lib/utils'
import type { DateRange, ResponseFormData } from '@/lib/types'

interface UseResponseFormStateProps {
  startRange: string
  endRange: string
  numDays: number
  initialName?: string
  initialDates?: string[]
}

interface UseResponseFormStateReturn {
  name: string
  setName: (name: string) => void
  selectedDates: Set<string>
  selectedRangeIds: Set<string>
  rangeStart: Date | null
  allTripDates: string[]
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  compatibleWindowsCount: number
  hasSelectedRanges: boolean
  isDirty: boolean
  handleDateClick: (date: Date) => void
  toggleRangeSelection: (rangeId: string) => void
  deleteSelectedRanges: () => void
  markAllAs: (status: 'available' | 'unavailable') => void
  getFormData: () => ResponseFormData
  reset: () => void
}

export function useResponseFormState({
  startRange,
  endRange,
  numDays,
  initialName = '',
  initialDates = []
}: UseResponseFormStateProps): UseResponseFormStateReturn {
  const [name, setName] = useState(initialName)
  const [selectedDates, setSelectedDates] = useState<Set<string>>(
    new Set(initialDates)
  )
  const [selectedRangeIds, setSelectedRangeIds] = useState<Set<string>>(new Set())
  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  const allTripDates = useMemo(() => {
    return eachDayOfInterval({
      start: parseISO(startRange),
      end: parseISO(endRange)
    }).map(d => format(d, 'yyyy-MM-dd'))
  }, [startRange, endRange])

  const availableRanges = useMemo(
    () => groupDatesIntoRanges(Array.from(selectedDates), 'available'),
    [selectedDates]
  )

  const unavailableDatesArray = useMemo(() => {
    return allTripDates.filter(date => !selectedDates.has(date))
  }, [allTripDates, selectedDates])

  const unavailableRanges = useMemo(
    () => groupDatesIntoRanges(unavailableDatesArray, 'unavailable'),
    [unavailableDatesArray]
  )

  const compatibleWindowsCount = useMemo(() => {
    return availableRanges
      .filter(range => range.days >= numDays)
      .reduce((total, range) => total + (range.days - numDays + 1), 0)
  }, [availableRanges, numDays])

  const totalRanges = availableRanges.length + unavailableRanges.length
  const isSingleFullRange = totalRanges === 1 && selectedRangeIds.size === 1
  const hasSelectedRanges = selectedRangeIds.size > 0 && !isSingleFullRange

  const isDirty = useMemo(() => {
    if (name !== initialName) return true

    const initialSet = new Set(initialDates)
    if (selectedDates.size !== initialSet.size) return true

    for (const date of selectedDates) {
      if (!initialSet.has(date)) return true
    }

    return false
  }, [name, selectedDates, initialName, initialDates])

  const dateRange = useMemo(() => ({
    start: parseISO(startRange),
    end: parseISO(endRange)
  }), [startRange, endRange])

  // TODO: Refactor into state machine - this has 5 branches handling tap/double-tap/range selection
  const handleDateClick = useCallback((date: Date) => {
    if (!isWithinInterval(date, dateRange)) return

    const dateStr = format(date, 'yyyy-MM-dd')
    const isRangeStartDate = rangeStart !== null && format(rangeStart, 'yyyy-MM-dd') === dateStr

    if (isRangeStartDate) {
      setRangeStart(null)
      return
    }

    const isAlreadySelected = selectedDates.has(dateStr)

    if (isAlreadySelected) {
      setSelectedDates(prev => {
        const newDates = new Set(prev)
        newDates.delete(dateStr)
        return newDates
      })
      setRangeStart(null)
      return
    }

    if (rangeStart === null) {
      setRangeStart(date)
      setSelectedDates(prev => {
        const newDates = new Set(prev)
        newDates.add(dateStr)
        return newDates
      })
    } else {
      const start = rangeStart < date ? rangeStart : date
      const end = rangeStart < date ? date : rangeStart
      const dates = eachDayOfInterval({ start, end })

      setSelectedDates(prev => {
        const newDates = new Set(prev)
        dates.forEach(d => {
          newDates.add(format(d, 'yyyy-MM-dd'))
        })
        return newDates
      })
      setRangeStart(null)
    }
  }, [rangeStart, dateRange, selectedDates])


  const toggleRangeSelection = useCallback((rangeId: string) => {
    setSelectedRangeIds(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(rangeId)) {
        newSelected.delete(rangeId)
      } else {
        newSelected.add(rangeId)
      }
      return newSelected
    })
  }, [])

  const deleteSelectedRanges = useCallback(() => {
    const totalRangeCount = availableRanges.length + unavailableRanges.length
    const allRangesSelected = selectedRangeIds.size === totalRangeCount

    if (allRangesSelected) {
      setSelectedDates(new Set())
      setSelectedRangeIds(new Set())
      return
    }

    setSelectedDates(prev => {
      const newDates = new Set(prev)

      selectedRangeIds.forEach(rangeId => {
        const availableRange = availableRanges.find(r => r.id === rangeId)
        if (availableRange) {
          const dates = eachDayOfInterval({
            start: parseISO(availableRange.start),
            end: parseISO(availableRange.end)
          })
          dates.forEach(d => newDates.delete(format(d, 'yyyy-MM-dd')))
        }

        const unavailableRange = unavailableRanges.find(r => r.id === rangeId)
        if (unavailableRange) {
          const dates = eachDayOfInterval({
            start: parseISO(unavailableRange.start),
            end: parseISO(unavailableRange.end)
          })
          dates.forEach(d => newDates.add(format(d, 'yyyy-MM-dd')))
        }
      })

      return newDates
    })
    setSelectedRangeIds(new Set())
  }, [selectedRangeIds, availableRanges, unavailableRanges])

  const markAllAs = useCallback((status: 'available' | 'unavailable') => {
    setRangeStart(null)
    if (status === 'available') {
      setSelectedDates(new Set(allTripDates))
    } else {
      setSelectedDates(new Set())
    }
  }, [allTripDates])

  const getFormData = useCallback((): ResponseFormData => ({
    name: name.trim(),
    availableDates: Array.from(selectedDates).sort()
  }), [name, selectedDates])

  const reset = useCallback(() => {
    setName(initialName)
    setSelectedDates(new Set(initialDates))
    setSelectedRangeIds(new Set())
    setRangeStart(null)
  }, [initialName, initialDates])

  return {
    name,
    setName,
    selectedDates,
    selectedRangeIds,
    rangeStart,
    allTripDates,
    availableRanges,
    unavailableRanges,
    compatibleWindowsCount,
    hasSelectedRanges,
    isDirty,
    handleDateClick,
    toggleRangeSelection,
    deleteSelectedRanges,
    markAllAs,
    getFormData,
    reset
  }
}
