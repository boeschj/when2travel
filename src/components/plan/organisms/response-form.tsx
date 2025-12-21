import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useResponseFormState } from '@/hooks/use-response-form-state'
import { NameInputCard } from '../molecules/name-input-card'
import { SelectDatesCard } from '../molecules/select-dates-card'
import { ManageDatesCard } from '../molecules/manage-dates-card'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'
import type { ResponseFormData, PlanWithResponses } from '@/lib/types'

type WarningType = 'noDates' | 'noCompatibleWindows' | null

interface ResponseFormProps {
  startRange: PlanWithResponses['startRange']
  endRange: PlanWithResponses['endRange']
  numDays: number
  initialName?: string
  initialDates?: string[]
  onSubmit: (data: ResponseFormData) => void
  isSubmitting?: boolean
  className?: string
}

export function ResponseForm({
  startRange,
  endRange,
  numDays,
  initialName = '',
  initialDates = [],
  onSubmit,
  isSubmitting,
  className
}: ResponseFormProps) {
  const {
    name,
    setName,
    selectedDates,
    selectedRangeIds,
    rangeStart,
    availableRanges,
    unavailableRanges,
    compatibleWindowsCount,
    hasSelectedRanges,
    handleDateClick,
    toggleRangeSelection,
    deleteSelectedRanges,
    markAllAs,
    getFormData
  } = useResponseFormState({
    startRange,
    endRange,
    numDays,
    initialName,
    initialDates
  })

  const [nameError, setNameError] = useState<string | null>(null)
  const [warningType, setWarningType] = useState<WarningType>(null)
  const [pendingFormData, setPendingFormData] = useState<ResponseFormData | null>(null)

  const validateName = (value: string): string | null => {
    const trimmed = value.trim()
    if (!trimmed) return 'Name is required'
    if (trimmed.length < 2) return 'Name must be at least 2 characters'
    if (trimmed.length > 50) return 'Name must be less than 50 characters'
    return null
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (nameError) setNameError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = getFormData()

    // Validate name
    const error = validateName(formData.name)
    if (error) {
      setNameError(error)
      return
    }

    // Check for date warnings
    if (formData.availableDates.length === 0) {
      setPendingFormData(formData)
      setWarningType('noDates')
      return
    }

    if (compatibleWindowsCount === 0) {
      setPendingFormData(formData)
      setWarningType('noCompatibleWindows')
      return
    }

    onSubmit(formData)
  }

  const handleConfirmSubmit = () => {
    if (pendingFormData) {
      onSubmit(pendingFormData)
    }
    setWarningType(null)
    setPendingFormData(null)
  }

  const handleCancelSubmit = () => {
    setWarningType(null)
    setPendingFormData(null)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="flex flex-col xl:flex-row xl:items-stretch gap-6">
        <SelectDatesCard
          startRange={startRange}
          endRange={endRange}
          selectedDates={Array.from(selectedDates)}
          compatibleWindowsCount={compatibleWindowsCount}
          rangeStart={rangeStart}
          onDateClick={handleDateClick}
          onMarkAllAs={markAllAs}
          availableRanges={availableRanges}
          unavailableRanges={unavailableRanges}
          selectedRangeIds={selectedRangeIds}
          hasSelectedRanges={hasSelectedRanges}
          onToggleRangeSelection={toggleRangeSelection}
          onDeleteSelected={deleteSelectedRanges}
        />

        <ManageDatesCard
          availableRanges={availableRanges}
          unavailableRanges={unavailableRanges}
          selectedRangeIds={selectedRangeIds}
          hasSelectedRanges={hasSelectedRanges}
          onToggleRangeSelection={toggleRangeSelection}
          onDeleteSelected={deleteSelectedRanges}
        />
      </div>

      <NameInputCard
        name={name}
        onNameChange={handleNameChange}
        isSubmitting={isSubmitting}
        error={nameError ?? undefined}
      />

      <AlertDialog open={warningType !== null} onOpenChange={(open) => !open && handleCancelSubmit()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {warningType === 'noDates' && 'Wait! You have no available dates'}
              {warningType === 'noCompatibleWindows' && 'Wait! You have no compatible time ranges'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {warningType === 'noDates' && (
                "This will indicate you're unavailable for the entire period. Are you sure you want to continue?"
              )}
              {warningType === 'noCompatibleWindows' && (
                `Your selected dates don't include any ${numDays}-day windows. Your availability may not match what the group is looking for. Are you sure you want to continue?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSubmit}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>Submit anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
