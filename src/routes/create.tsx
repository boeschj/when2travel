import { createFileRoute } from '@tanstack/react-router'
import { PlaneTakeoff, Calendar, Clock, ArrowRight, Edit } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { ROUTES } from '@/lib/routes'

export const Route = createFileRoute(ROUTES.CREATE)({
  component: CreatePlanPage,
})

function CreatePlanPage() {
  const [tripName, setTripName] = useState('')
  const [numDays, setNumDays] = useState(7)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'hsl(var(--primary) / 0.05)' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 z-10 relative">
        <div className="flex items-center gap-3 text-foreground">
          <div className="flex items-center justify-center size-10 rounded-full bg-foreground/10 text-primary">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">when2travel</h2>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3 bg-foreground/5 rounded-full px-5 py-2 border border-foreground/10">
            <span className="text-sm font-medium text-foreground/60">Step 1 of 3</span>
            <div className="h-4 w-[1px] bg-foreground/10"></div>
            <span className="text-sm font-bold text-foreground">Trip Details</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pb-20 pt-10 relative z-10">
        <div className="w-full max-w-4xl flex flex-col gap-12">
          {/* Hero Section & Name Input */}
          <motion.div
            className="space-y-6 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Let's start{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                planning.
              </span>
            </h1>
            <div className="relative group">
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-0 border-b-2 border-foreground/20 pl-0 pr-12 py-4 text-3xl md:text-5xl font-bold text-foreground placeholder:text-foreground/20 focus:ring-0 focus:border-primary transition-colors duration-300 ease-out outline-none"
                placeholder="Name your trip (e.g., Euro Summer '24)"
              />
              <Edit className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 w-10 h-10 group-focus-within:text-primary transition-colors" />
            </div>
          </motion.div>

          {/* Interactive Zone */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Date Range Picker */}
            <motion.div
              className="lg:col-span-7 bg-card rounded-3xl p-6 md:p-8 border border-border shadow-2xl shadow-black/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Possible Dates</h3>
                </div>
              </div>

              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                numberOfMonths={1}
                className="w-full"
              />
            </motion.div>

            {/* Duration Picker */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <motion.div
                className="flex-1 bg-card rounded-3xl p-6 md:p-8 border border-border flex flex-col items-center justify-center text-center shadow-2xl shadow-black/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Trip Length</h3>
                </div>
                <div className="flex items-center gap-6 w-full justify-center">
                  <motion.button
                    onClick={() => setNumDays(Math.max(1, numDays - 1))}
                    className="size-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl font-bold">−</span>
                  </motion.button>
                  <div className="flex flex-col items-center">
                    <motion.span
                      key={numDays}
                      className="text-6xl font-black text-foreground tracking-tighter tabular-nums leading-none"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {numDays}
                    </motion.span>
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
                      Days
                    </span>
                  </div>
                  <motion.button
                    onClick={() => setNumDays(Math.min(60, numDays + 1))}
                    className="size-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl font-bold">+</span>
                  </motion.button>
                </div>
                <p className="text-sm text-muted-foreground mt-8 max-w-[200px]">
                  This is the duration everyone needs to be available for.
                </p>
              </motion.div>

              {/* Summary / Next Action */}
              <motion.div
                className="bg-primary/10 rounded-3xl p-6 border border-primary/20 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                      Summary
                    </p>
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
                  </div>
                </div>
                <motion.button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)] flex items-center justify-center gap-2 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next: Invite Friends
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
