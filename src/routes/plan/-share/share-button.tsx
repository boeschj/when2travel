import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Mail, MessageCircle, Send, Copy, type LucideIcon } from 'lucide-react'

type Platform = 'email' | 'whatsapp' | 'telegram' | 'copy'

interface ShareButtonProps extends React.ComponentProps<typeof Button> {
  platform: Platform
}

const platformConfig: Record<Platform, { icon: LucideIcon; bgColor: string; title: string }> = {
  email: {
    icon: Mail,
    bgColor: 'hover:bg-[#25D366] hover:text-white',
    title: 'Share via Email'
  },
  whatsapp: {
    icon: MessageCircle,
    bgColor: 'hover:bg-[#25D366] hover:text-white',
    title: 'Share on WhatsApp'
  },
  telegram: {
    icon: Send,
    bgColor: 'hover:bg-[#0088cc] hover:text-white',
    title: 'Share on Telegram'
  },
  copy: {
    icon: Copy,
    bgColor: 'hover:bg-primary hover:text-primary-foreground',
    title: 'Copy Link'
  }
}

export function ShareButton({
  platform,
  className,
  ...props
}: ShareButtonProps) {
  const config = platformConfig[platform]
  const Icon = config.icon

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'size-12 rounded-full bg-secondary text-secondary-foreground',
        'flex items-center justify-center transition-all duration-300 group',
        config.bgColor,
        className
      )}
      title={config.title}
      {...props}
    >
      <Icon className="size-5 group-hover:scale-110 transition-transform" />
    </Button>
  )
}