import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { DateRange } from 'react-day-picker'

interface PlanSummaryCardProps {
  numDays: number
  dateRange: DateRange | undefined
  isCreating: boolean
}

export function PlanSummaryCard({
  numDays,
  dateRange,
  isCreating
}: PlanSummaryCardProps) {
  return (
    <Card className="bg-primary/10 border-primary/20 rounded-3xl p-6 shadow-none">
      <CardContent className="p-0 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Summary</p>
            <p className="text-foreground font-medium leading-snug">
              Planning a <span className="font-bold text-foreground whitespace-nowrap">{numDays} day</span> trip
              {dateRange?.from && dateRange?.to ? (
                <>
                  {' '}between{' '}
                  <span className="font-bold text-foreground whitespace-nowrap">
                    {dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {'.'}
                  </span>
                </>
              ) : (
                <span className="invisible">
                  {' '}between <span className="font-bold whitespace-nowrap">Jan 1 - Jan 31</span>
                </span>
              )}
              
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 mt-4">
        <motion.div className="w-full" whileHover={!isCreating ? { scale: 1.02 } : {}} whileTap={!isCreating ? { scale: 0.98 } : {}}>
          <Button
            type="submit"
            disabled={isCreating}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] h-auto"
          >
            {isCreating ? (
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
