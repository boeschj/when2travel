import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { HeatmapCalendar } from './heatmap-calendar'

export function Hero() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center pt-10 pb-20 px-5 md:px-10">
      <div className="flex flex-col max-w-[1120px] w-full gap-16 lg:gap-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <motion.div
            className="flex flex-col gap-6 flex-1 text-center lg:text-left z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-foreground text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tighter">
              Get plans{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-green-200">
                out of the group chat
              </span>
            </h1>
            <h2 className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-[600px] mx-auto lg:mx-0">
              Set a timeframe, send a link. Everyone picks when they're free. Instantly see dates that work for everyone ✈️
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link to={ROUTES.CREATE}>
                <Button size="lg" className="min-w-[160px]">
                  Make a plan
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="min-w-[160px]">
                See example
              </Button>
            </div>
          </motion.div>

          <HeatmapCalendar />
        </div>
      </div>
    </div>
  )
}
