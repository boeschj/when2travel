import { motion } from 'motion/react'
import { CalendarRange, Share, Hand, BarChart, LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: CalendarRange,
    title: 'Pick your dates',
    description: 'Choose specific dates or entire months. Like "anytime in July" or "first two weeks of December."',
  },
  {
    icon: Share,
    title: 'Drop the link',
    description: 'Copy it into your group chat. Works on phones, laptops, whatever people have.',
  },
  {
    icon: Hand,
    title: 'Wait for responses',
    description: 'Everyone taps the days they can go. Takes like 30 seconds. No account needed.',
  },
  {
    icon: BarChart,
    title: 'Check the results',
    description: 'Green days are when people are free. Darker green means more people said yes.',
  },
]

export function FeaturesSection() {
  return (
    <div className="relative z-10 w-full py-20 bg-background border-t border-border" id="how-it-works">
      <div className="max-w-[1120px] mx-auto px-5 md:px-10">
        <div className="flex flex-col gap-12">
          <motion.div
            className="flex flex-col gap-4 text-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-foreground text-3xl md:text-5xl font-black tracking-tight max-w-[720px]">
              Here's how it works
            </h2>
            <p className="text-muted-foreground text-lg max-w-[600px]">
              Takes about two minutes. Way easier than going back and forth in the group chat.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Card className="flex flex-col gap-5 p-6 hover:border-primary/30 transition-colors duration-300 group h-full">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="size-6" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-card-foreground text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
