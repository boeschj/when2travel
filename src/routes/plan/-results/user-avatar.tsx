import { cn, generateColorFromString } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface UserAvatarProps {
  name: string
  className?: string
  colorId?: string
}

export function UserAvatar({ name, className, colorId }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const generatedColor = colorId ? generateColorFromString(colorId) : null

  const fallbackClassName = cn(
    'font-bold text-xs',
    !generatedColor && 'bg-surface-darker text-text-secondary'
  )

  const fallbackStyle = generatedColor
    ? { backgroundColor: generatedColor.hex, color: '#1a1a1a' }
    : undefined

  return (
    <Avatar className={cn('size-8', className)}>
      <AvatarFallback className={fallbackClassName} style={fallbackStyle}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function getRespondentColor(id: string) {
  return generateColorFromString(id)
}