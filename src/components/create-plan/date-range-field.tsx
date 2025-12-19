import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Field, FieldContent, FieldError } from '@/components/ui/field'
import { getFieldErrors, type DateRangeField as DateRangeFieldType } from './types'

interface DateRangeFieldProps {
  field: DateRangeFieldType
}

export function DateRangeField({ field }: DateRangeFieldProps) {
  return (
    <Card className="bg-card shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Possible Dates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldContent>
            <CalendarComponent
              mode="range"
              selected={field.state.value}
              onSelect={(range) => field.handleChange(range)}
              numberOfMonths={1}
              className="w-full"
            />
            <FieldError errors={getFieldErrors(field.state.meta.errors)} />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  )
}