import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DateRange } from 'react-day-picker'

interface PlanSummaryCardProps {
  numDays: number
  dateRange: DateRange | undefined
  canSubmit: boolean
  isSubmitting: boolean
  isCreating: boolean
}

export function PlanSummaryCard({
  numDays,
  dateRange,
  canSubmit,
  isSubmitting,
  isCreating
}: PlanSummaryCardProps) {
  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <Badge variant="outline" className="text-primary border-primary mb-2">
          Summary
        </Badge>
        <p className="text-foreground font-medium leading-snug">
          Planning a <span className="font-bold">{numDays} day</span> trip
          {dateRange?.from && dateRange?.to && (
            <>
              {' '}between{' '}
              <span className="font-bold">
                {dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' - '}
                {dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </>
          )}
          .
        </p>
      </CardContent>
      <CardFooter>
        <motion.div className="w-full" whileHover={!isCreating && canSubmit ? { scale: 1.02 } : {}} whileTap={!isCreating && canSubmit ? { scale: 0.98 } : {}}>
          <Button
            type="submit"
            disabled={!canSubmit || isCreating}
            className="w-full shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            size="lg"
          >
            {isCreating || isSubmitting ? (
              <>Creating Plan...</>
            ) : (
              <>
                Next: Invite Friends
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  )
}