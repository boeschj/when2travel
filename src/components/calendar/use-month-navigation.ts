import { useState, useCallback } from 'react'
import { addMonths, subMonths, startOfMonth } from 'date-fns'

export function useMonthNavigation(initialDate: Date) {
  const [month, setMonth] = useState(() => startOfMonth(initialDate))

  const goToPrevious = useCallback(() => {
    setMonth(prev => subMonths(prev, 1))
  }, [])

  const goToNext = useCallback(() => {
    setMonth(prev => addMonths(prev, 1))
  }, [])

  return { month, setMonth, goToPrevious, goToNext }
}
