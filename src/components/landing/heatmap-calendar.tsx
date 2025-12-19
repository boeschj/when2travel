import { motion } from 'motion/react'
import { Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

const MOCK_USERS = [
  { initials: 'JS', color: 'bg-purple-500' },
  { initials: 'AK', color: 'bg-blue-500' },
  { initials: 'MR', color: 'bg-orange-500' },
]

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function HeatmapCalendar() {
  return (
    <motion.div
      className="flex-1 w-full max-w-[500px] lg:max-w-none"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-card-foreground font-bold text-lg">Trip to Japan 🇯🇵</h3>
            <p className="text-muted-foreground text-xs">Best time: Oct 12-19</p>
          </div>
          <div className="flex -space-x-2">
            {MOCK_USERS.map((user, i) => (
              <Avatar key={i} className={`size-8 ${user.color} border-2 border-card`}>
                <AvatarFallback className="text-[10px] font-bold">{user.initials}</AvatarFallback>
              </Avatar>
            ))}
            <Avatar className="size-8 bg-muted border-2 border-card">
              <AvatarFallback className="text-[10px] font-bold">+2</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className="text-muted-foreground text-xs font-bold uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square rounded-md bg-muted/20" />
          ))}
          {[20, 40, 60, 60].map((opacity, i) => (
            <motion.div
              key={i}
              className={`aspect-square rounded-md bg-primary/${opacity} border border-primary/${opacity + 10}`}
              whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(70, 236, 19, 0.4)' }}
            />
          ))}

          <motion.div
            className="aspect-square rounded-md bg-primary/80 border border-primary/50 flex items-center justify-center text-primary-foreground font-bold text-xs relative group cursor-pointer"
            whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(70, 236, 19, 0.5)' }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
              5/5 Free
            </div>
          </motion.div>

          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="aspect-square rounded-md bg-primary shadow-[0_0_15px_rgba(70,236,19,0.5)] flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              {i === 0 && <Star className="w-4 h-4 fill-current text-primary-foreground" />}
            </motion.div>
          ))}

          {[80, 60, 40, 20].map((opacity, i) => (
            <motion.div
              key={i}
              className={`aspect-square rounded-md bg-primary/${opacity}`}
              whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(70, 236, 19, 0.4)' }}
            />
          ))}

          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-md bg-muted/20" />
          ))}
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-[60px] rounded-full pointer-events-none" aria-hidden="true" />
      </Card>
    </motion.div>
  )
}
