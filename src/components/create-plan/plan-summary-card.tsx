import { ArrowRight, Save } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DateRange } from 'react-day-picker'

interface PlanSummaryCardProps {
  numDays: number
  dateRange: DateRange | undefined
  isPending: boolean
  isEditMode?: boolean
  planId?: string
  hasChanges?: boolean
}

export function PlanSummaryCard({
  numDays,
  dateRange,
  isPending,
  isEditMode = false,
  planId,
  hasChanges = false,
}: PlanSummaryCardProps) {
  const hasDateRange = Boolean(dateRange?.from && dateRange?.to)
  const formattedDateRange = formatDateRange(dateRange)
  const isEditing = isEditMode && Boolean(planId)

  return (
    <Card variant="action" className="p-6">
      <CardContent className="p-0 flex flex-col gap-4">
        <SummaryText
          numDays={numDays}
          hasDateRange={hasDateRange}
          formattedDateRange={formattedDateRange}
        />
      </CardContent>
      <CardFooter className="p-0 mt-4">
        <FooterAction
          isEditing={isEditing}
          isPending={isPending}
          hasChanges={hasChanges}
        />
      </CardFooter>
    </Card>
  )
}

function SummaryText({
  numDays,
  hasDateRange,
  formattedDateRange,
}: {
  numDays: number
  hasDateRange: boolean
  formattedDateRange: string
}) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
          Summary
        </p>
        <p className="text-foreground font-medium leading-snug">
          Planning a{' '}
          <span className="font-bold text-foreground whitespace-nowrap">
            {numDays} day
          </span>{' '}
          trip
          <DateRangeLabel
            hasDateRange={hasDateRange}
            formattedDateRange={formattedDateRange}
          />
        </p>
      </div>
    </div>
  )
}

function DateRangeLabel({
  hasDateRange,
  formattedDateRange,
}: {
  hasDateRange: boolean
  formattedDateRange: string
}) {
  if (!hasDateRange) {
    return (
      <span className="invisible">
        {' '}
        between{' '}
        <span className="font-bold whitespace-nowrap">Jan 1 - Jan 31</span>
      </span>
    )
  }

  return (
    <>
      {' '}
      between{' '}
      <span className="font-bold text-foreground whitespace-nowrap">
        {formattedDateRange}.
      </span>
    </>
  )
}

const ACTION_BUTTON_CLASS =
  'w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto'

function SaveChangesButton({
  isPending,
  hasChanges,
}: {
  isPending: boolean
  hasChanges: boolean
}) {
  const isDisabled = isPending || !hasChanges
  const hoverAnimation = isDisabled ? {} : { scale: 1.02 }
  const tapAnimation = isDisabled ? {} : { scale: 0.98 }
  const showTooltip = !hasChanges && !isPending

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="w-full"
          whileHover={hoverAnimation}
          whileTap={tapAnimation}
        >
          <Button
            type="submit"
            disabled={isDisabled}
            className={ACTION_BUTTON_CLASS}
          >
            <SaveChangesIcon isPending={isPending} />
            Save Changes
          </Button>
        </motion.div>
      </TooltipTrigger>
      {showTooltip && (
        <TooltipContent>
          <p>No new changes to save</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}

function CreatePlanButton({ isPending }: { isPending: boolean }) {
  const hoverAnimation = isPending ? {} : { scale: 1.02 }
  const tapAnimation = isPending ? {} : { scale: 0.98 }

  if (isPending) {
    return (
      <motion.div className="w-full">
        <Button type="submit" disabled className={ACTION_BUTTON_CLASS}>
          Creating Plan...
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="w-full"
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
    >
      <Button type="submit" className={ACTION_BUTTON_CLASS}>
        Next: Invite Friends
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  )
}

function FooterAction({
  isEditing,
  isPending,
  hasChanges,
}: {
  isEditing: boolean
  isPending: boolean
  hasChanges: boolean
}) {
  if (isEditing) {
    return <SaveChangesButton isPending={isPending} hasChanges={hasChanges} />
  }
  return <CreatePlanButton isPending={isPending} />
}

function SaveChangesIcon({ isPending }: { isPending: boolean }) {
  if (isPending) {
    return <Spinner className="mr-2 w-5 h-5" />
  }
  return <Save className="mr-2 w-5 h-5" />
}

function formatDateRange(dateRange: DateRange | undefined): string {
  if (!dateRange?.from || !dateRange?.to) return ''
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const from = dateRange.from.toLocaleDateString('en-US', options)
  const to = dateRange.to.toLocaleDateString('en-US', options)
  return `${from} - ${to}`
}
