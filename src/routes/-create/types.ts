import type { DateRange } from 'react-day-picker'

export interface CreatePlanFormData {
  tripName: string
  numDays: number
  dateRange: DateRange | undefined
}

export type CreatePlanFieldName = keyof CreatePlanFormData

export type CreatePlanFieldValue<TName extends CreatePlanFieldName> = CreatePlanFormData[TName]

export interface FormFieldState<TValue> {
  value: TValue
  meta: {
    // TanStack Form can return non-string error objects (e.g. StandardSchema issues)
    errors: unknown[]
    isValidating?: boolean
    isTouched?: boolean
    isValid?: boolean
  }
}

export interface FormField<TValue> {
  name: string
  state: FormFieldState<TValue>
  handleChange: (value: TValue) => void
  handleBlur?: () => void
}

export type TripNameField = FormField<string>
export type NumDaysField = Omit<FormField<number>, 'handleBlur'>
export type DateRangeField = Omit<FormField<DateRange | undefined>, 'handleBlur' | 'name'>